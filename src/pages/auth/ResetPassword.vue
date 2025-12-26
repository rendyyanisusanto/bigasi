<template>
  <div class="reset-password-page min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body p-4">
              <div class="text-center mb-4">
                <AppLogo size="lg" />
                <h4 class="mt-3">Set New Password</h4>
                <p class="text-muted">Enter your new password below</p>
              </div>
              
              <form @submit.prevent="handleResetPassword">
                <BaseInput
                  v-model="form.password"
                  type="password"
                  label="New Password"
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  :error="errors.password"
                />
                
                <BaseInput
                  v-model="form.confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  placeholder="Re-enter your new password"
                  required
                  :error="errors.confirmPassword"
                />
                
                <div v-if="errors.general" class="alert alert-danger" role="alert">
                  {{ errors.general }}
                </div>
                
                <div v-if="success" class="alert alert-success" role="alert">
                  Password updated successfully! Redirecting to login...
                </div>
                
                <BaseButton
                  type="submit"
                  variant="primary"
                  block
                  :loading="loading"
                  class="mb-3"
                >
                  Update Password
                </BaseButton>
                
                <div class="text-center">
                  <router-link to="/login" class="text-primary">
                    Back to Login
                  </router-link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabase'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import AppLogo from '../../components/common/AppLogo.vue'

const router = useRouter()

const form = ref({
  password: '',
  confirmPassword: ''
})

const errors = ref({
  password: '',
  confirmPassword: '',
  general: ''
})

const loading = ref(false)
const success = ref(false)
const sessionValid = ref(false)

const handleResetPassword = async () => {
  // Reset errors
  errors.value = {
    password: '',
    confirmPassword: '',
    general: ''
  }
  
  // Validate
  if (!form.value.password) {
    errors.value.password = 'Password is required'
    return
  }
  
  if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    return
  }
  
  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Please confirm your password'
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    return
  }
  
  loading.value = true
  
  try {
    // Update password using Supabase
    const { error } = await supabase.auth.updateUser({
      password: form.value.password
    })
    
    if (error) throw error
    
    success.value = true
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('Error updating password:', error)
    errors.value.general = error.message || 'Failed to update password. Please try again.'
  } finally {
    loading.value = false
  }
}

// Listen for auth state changes (more reliable for recovery links)
onMounted(async () => {
  console.log('ResetPassword page mounted')
  
  // Setup auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, 'Session:', !!session)
    
    if (event === 'PASSWORD_RECOVERY') {
      console.log('Password recovery event detected')
      sessionValid.value = true
      errors.value.general = ''
    } else if (event === 'SIGNED_IN' && session) {
      console.log('User signed in via recovery link')
      sessionValid.value = true
      errors.value.general = ''
    }
  })
  
  // Also check current session
  try {
    // Wait a bit for Supabase to process the recovery token from URL
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Session error:', error)
    }
    
    if (session) {
      console.log('Valid session found')
      sessionValid.value = true
    } else {
      // Wait a bit more for auth state change event
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Check again
      const { data: { session: sessionRetry } } = await supabase.auth.getSession()
      
      if (sessionRetry) {
        console.log('Session found on retry')
        sessionValid.value = true
      } else if (!sessionValid.value) {
        console.log('No session found after retry')
        errors.value.general = 'Invalid or expired reset link. Please request a new password reset email.'
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    }
  } catch (error) {
    console.error('Error checking session:', error)
    if (!sessionValid.value) {
      errors.value.general = 'An error occurred. Please try again.'
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }
  
  // Cleanup subscription when component unmounts
  return () => {
    subscription?.unsubscribe()
  }
})
</script>

<style scoped>
.reset-password-page {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}

.card {
  border: none;
  border-radius: 1rem;
}
</style>
