import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const user = ref(null)
const profile = ref(null)
const loading = ref(false)
const initialized = ref(false)

export function useAuth() {
    const isAuthenticated = computed(() => !!user.value)
    const userRole = computed(() => profile.value?.role || null)
    const isAdmin = computed(() => userRole.value === 'ADMIN')
    const isCoach = computed(() => userRole.value === 'COACH')
    const isParent = computed(() => userRole.value === 'PARENT')

    // Initialize auth state
    const initAuth = async () => {
        if (initialized.value) return

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                user.value = session.user
                await fetchProfile()
            }

            // Listen for auth changes (only once)
            supabase.auth.onAuthStateChange(async (event, session) => {
                user.value = session?.user || null
                if (session?.user) {
                    await fetchProfile()
                } else {
                    profile.value = null
                }
            })

            initialized.value = true
        } catch (error) {
            console.error('Error initializing auth:', error)
        }
    }

    // Fetch user profile
    const fetchProfile = async () => {
        if (!user.value) return

        try {
            const { data, error } = await supabase
                .from('app_users')
                .select('*')
                .eq('id', user.value.id)
                .maybeSingle()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error)
                return
            }

            profile.value = data
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    // Login
    const login = async (email, password) => {
        try {
            loading.value = true
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error
            user.value = data.user
            await fetchProfile()
            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    // Logout
    const logout = async () => {
        try {
            loading.value = true

            // Try to sign out from Supabase
            // If session is already missing, this will fail but that's okay
            const { error } = await supabase.auth.signOut()

            // Only log error if it's NOT a session missing error
            if (error && error.message !== 'Auth session missing!') {
                console.error('Logout error:', error)
            }

            // Always clear local state regardless of signOut result
            user.value = null
            profile.value = null

            return { success: true }
        } catch (error) {
            // Handle any unexpected errors
            console.error('Logout error:', error)

            // Still clear local state even if logout fails
            user.value = null
            profile.value = null

            // Return success since local state was cleared
            return { success: true }
        } finally {
            loading.value = false
        }
    }

    // Register (for parents)
    const register = async (email, password, fullName, athleteId) => {
        try {
            loading.value = true

            // Get the redirect URL (works in both dev and production)
            const redirectUrl = `${window.location.origin}/auth/callback`

            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: redirectUrl
                }
            })

            if (authError) throw authError

            // Create profile
            const { error: profileError } = await supabase
                .from('app_users')
                .insert({
                    id: authData.user.id,
                    email,
                    full_name: fullName,
                    role: 'PARENT'
                })

            if (profileError) throw profileError

            // Link to athlete
            if (athleteId) {
                const { error: athleteError } = await supabase
                    .from('athletes')
                    .update({ parent_user_id: authData.user.id })
                    .eq('id', athleteId)

                if (athleteError) throw athleteError
            }

            return { success: true }
        } catch (error) {
            console.error('Registration error:', error)
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    // Ensure valid session before data operations
    const ensureValidSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Session error:', error)
                return false
            }

            if (!session) {
                console.warn('No active session')
                return false
            }

            return true
        } catch (error) {
            console.error('Error checking session:', error)
            return false
        }
    }

    return {
        user,
        profile,
        loading,
        isAuthenticated,
        userRole,
        isAdmin,
        isCoach,
        isParent,
        initAuth,
        login,
        logout,
        register,
        fetchProfile,
        ensureValidSession
    }
}
