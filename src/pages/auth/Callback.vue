<template>
  <div class="auth-callback-page min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="text-center">
      <div v-if="loading" class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Processing...</span>
      </div>
      <h5 v-if="loading" class="text-muted">{{ loadingMessage }}</h5>
      <div v-if="error" class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { fetchProfile, userRole } = useAuth()
const loading = ref(true)
const loadingMessage = ref('Processing authentication...')
const error = ref(null)

onMounted(async () => {
  try {
    // Get hash params from URL (Supabase sends token in hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    
    // Check if this is an error callback
    const errorParam = hashParams.get('error')
    const errorDescription = hashParams.get('error_description')
    
    if (errorParam) {
      error.value = errorDescription || 'Authentication failed. Please try again.'
      loading.value = false
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      return
    }

    // Check for access token (email verification, password reset, or signup confirmation)
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')
    
    if (accessToken) {
      console.log('Auth callback - type:', type)
      
      // Update loading message based on type
      if (type === 'signup') {
        loadingMessage.value = 'Welcome! Setting up your account...'
      } else if (type === 'recovery') {
        loadingMessage.value = 'Resetting your password...'
      } else {
        loadingMessage.value = 'Verifying your email...'
      }
      
      // Session is already set by Supabase client
      // Just fetch the user profile
      await new Promise(resolve => setTimeout(resolve, 500)) // Small delay for session to be set
      await fetchProfile()
      
      // Wait for profile to load
      let attempts = 0
      while (!userRole.value && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        attempts++
      }
      
      // Redirect to profile page based on role
      if (userRole.value === 'ADMIN') {
        router.push('/admin/profile')
      } else if (userRole.value === 'COACH') {
        router.push('/coach/profile')
      } else if (userRole.value === 'PARENT') {
        router.push('/parent/profile')
      } else {
        // Fallback to login if role not found
        console.warn('User role not found, redirecting to login')
        router.push('/login')
      }
    } else {
      // No token found, redirect to login
      console.log('No access token found, redirecting to login')
      router.push('/login')
    }
  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = 'An error occurred. Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.auth-callback-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
