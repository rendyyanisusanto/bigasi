import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const settings = ref(null)
const loading = ref(false)

export function useSettings() {
    // Fetch app settings
    const fetchSettings = async () => {
        try {
            loading.value = true
            const { data, error } = await supabase
                .from('app_settings')
                .select('*')
                .limit(1)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            // If no settings exist, use defaults
            settings.value = data || {
                app_name: 'BIGASI',
                logo_url: null,
                primary_color: '#2563eb',
                secondary_color: '#22c55e'
            }

            applyTheme()
        } catch (error) {
            console.error('Error fetching settings:', error)
            // Use defaults on error
            settings.value = {
                app_name: 'BIGASI',
                logo_url: null,
                primary_color: '#2563eb',
                secondary_color: '#22c55e'
            }
            applyTheme()
        } finally {
            loading.value = false
        }
    }

    // Apply theme to CSS variables
    const applyTheme = () => {
        if (!settings.value) return

        const root = document.documentElement
        root.style.setProperty('--primary-color', settings.value.primary_color)
        root.style.setProperty('--secondary-color', settings.value.secondary_color)

        // Update document title
        document.title = settings.value.app_name
    }

    // Update settings (admin only)
    const updateSettings = async (newSettings) => {
        try {
            loading.value = true

            // Check if settings exist
            const { data: existing } = await supabase
                .from('app_settings')
                .select('id')
                .limit(1)
                .single()

            let result
            if (existing) {
                // Update existing
                result = await supabase
                    .from('app_settings')
                    .update({
                        ...newSettings,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existing.id)
                    .select()
                    .single()
            } else {
                // Insert new
                result = await supabase
                    .from('app_settings')
                    .insert(newSettings)
                    .select()
                    .single()
            }

            if (result.error) throw result.error

            settings.value = result.data
            applyTheme()
            return { success: true }
        } catch (error) {
            console.error('Error updating settings:', error)
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    return {
        settings,
        loading,
        fetchSettings,
        updateSettings,
        applyTheme
    }
}
