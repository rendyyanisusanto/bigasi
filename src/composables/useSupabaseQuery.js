import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSupabaseQuery() {
    const { ensureValidSession } = useAuth()
    const error = ref(null)

    /**
     * Execute a Supabase query with automatic session validation and error handling
     * @param {Function} queryFn - Function that returns a Supabase query
     * @param {Object} options - Options for retry and error handling
     * @returns {Promise} Query result
     */
    const executeQuery = async (queryFn, options = {}) => {
        const {
            retryOnSessionError = true,
            redirectOnError = true,
            maxRetries = 1
        } = options

        error.value = null
        let attempts = 0

        while (attempts <= maxRetries) {
            try {
                // Validate session before query
                const hasValidSession = await ensureValidSession()

                if (!hasValidSession) {
                    console.warn('Invalid session detected, redirecting to login...')
                    if (redirectOnError) {
                        await supabase.auth.signOut()
                        window.location.href = '/login'
                    }
                    throw new Error('Session expired. Please login again.')
                }

                // Execute the query
                const result = await queryFn()

                // Check for errors
                if (result.error) {
                    // Handle specific Supabase errors
                    if (result.error.message?.includes('JWT') ||
                        result.error.message?.includes('session') ||
                        result.error.code === 'PGRST301') {

                        if (retryOnSessionError && attempts < maxRetries) {
                            console.log('Session error detected, retrying...')
                            attempts++
                            await new Promise(resolve => setTimeout(resolve, 500))
                            continue
                        }

                        console.error('Session error:', result.error)
                        if (redirectOnError) {
                            await supabase.auth.signOut()
                            window.location.href = '/login'
                        }
                        throw new Error('Session expired. Please login again.')
                    }

                    throw result.error
                }

                return result
            } catch (err) {
                error.value = err

                // If we've exhausted retries, throw the error
                if (attempts >= maxRetries) {
                    console.error('Query failed after retries:', err)
                    throw err
                }

                attempts++
            }
        }
    }

    return {
        executeQuery,
        error
    }
}
