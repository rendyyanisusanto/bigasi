<template>
  <div class="register-page min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-body p-4">
              <div class="text-center mb-4">
                <AppLogo size="lg" />
                <h4 class="mt-3">Parent Registration</h4>
                <p class="text-muted">Create an account to view your athlete's progress</p>
              </div>
              
              <form @submit.prevent="handleRegister">
                <BaseInput
                  v-model="form.fullName"
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  required
                  :error="errors.fullName"
                />
                
                <BaseInput
                  v-model="form.email"
                  type="email"
                  label="Email"
                  placeholder="Enter your email"
                  required
                  :error="errors.email"
                />
                
                <BaseInput
                  v-model="form.password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password (min. 6 characters)"
                  required
                  :error="errors.password"
                />
                
                <BaseInput
                  v-model="form.confirmPassword"
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  required
                  :error="errors.confirmPassword"
                />
                
                <BaseInput
                  v-model="form.athleteNumber"
                  type="text"
                  label="Athlete Number (Optional)"
                  placeholder="Enter athlete number to link"
                  hint="If you have an athlete, enter their number to link your account"
                  :error="errors.athleteNumber"
                />
                
                <div v-if="errors.general" class="alert alert-danger" role="alert">
                  {{ errors.general }}
                </div>
                
                <div v-if="success" class="alert alert-success" role="alert">
                  <strong>Registration successful!</strong>
                  <p class="mb-1 mt-2">Please check your email and click the confirmation link to activate your account.</p>
                  <small class="text-muted">Redirecting to login page...</small>
                </div>
                
                <BaseButton
                  type="submit"
                  variant="primary"
                  block
                  :loading="loading"
                  class="mb-3"
                >
                  Register
                </BaseButton>
                
                <div class="text-center">
                  <p class="text-muted mb-0">
                    Already have an account?
                    <router-link to="/login" class="text-primary">Sign In</router-link>
                  </p>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { supabase } from '../../lib/supabase'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import AppLogo from '../../components/common/AppLogo.vue'

const router = useRouter()
const { register } = useAuth()

const form = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  athleteNumber: ''
})

const errors = ref({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  athleteNumber: '',
  general: ''
})

const loading = ref(false)
const success = ref(false)

const handleRegister = async () => {
  // Reset errors
  errors.value = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    athleteNumber: '',
    general: ''
  }
  success.value = false
  
  // Validate
  if (!form.value.fullName) {
    errors.value.fullName = 'Full name is required'
    return
  }
  
  if (!form.value.email) {
    errors.value.email = 'Email is required'
    return
  }
  
  if (!form.value.password) {
    errors.value.password = 'Password is required'
    return
  }
  
  if (form.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    return
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
    return
  }
  
  loading.value = true
  
  try {
    // Find athlete by number if provided
    let athleteId = null
    if (form.value.athleteNumber) {
      const { data: athlete, error: athleteError } = await supabase
        .from('athletes')
        .select('id, full_name, parent_user_id')
        .eq('athlete_number', form.value.athleteNumber)
        .maybeSingle()
      
      if (athleteError) {
        console.error('Error finding athlete:', athleteError)
        errors.value.athleteNumber = 'Error searching for athlete'
        loading.value = false
        return
      }
      
      if (!athlete) {
        errors.value.athleteNumber = 'Athlete number not found'
        loading.value = false
        return
      }
      
      // Check if athlete already has a parent linked
      if (athlete.parent_user_id) {
        errors.value.athleteNumber = 'This athlete is already linked to another parent'
        loading.value = false
        return
      }
      
      athleteId = athlete.id
      console.log('Found athlete:', athlete.full_name, '- will link to parent')
    }
    
    const result = await register(
      form.value.email,
      form.value.password,
      form.value.fullName,
      athleteId
    )
    
    if (result.success) {
      success.value = true
      
      // Clear form
      form.value = {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        athleteNumber: ''
      }
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errors.value.general = result.error || 'Registration failed'
    }
  } catch (error) {
    console.error('Registration error:', error)
    errors.value.general = error.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}

.card {
  border: none;
  border-radius: 1rem;
}
</style>
