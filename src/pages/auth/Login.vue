<template>
  <div class="login-page min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card shadow">
            <div class="card-body p-4">
              <div class="text-center mb-4">
                <AppLogo size="lg" />
                <h4 class="mt-3">Welcome Back</h4>
                <p class="text-muted">Sign in to your account</p>
              </div>
              
              <form @submit.prevent="handleLogin">
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
                  placeholder="Enter your password"
                  required
                  :error="errors.password"
                />
                
                <div v-if="errors.general" class="alert alert-danger" role="alert">
                  {{ errors.general }}
                </div>
                
                <BaseButton
                  type="submit"
                  variant="primary"
                  block
                  :loading="loading"
                  class="mb-3"
                >
                  Sign In
                </BaseButton>
                
                <div class="text-center">
                  <p class="text-muted mb-0">
                    Don't have an account?
                    <router-link to="/register" class="text-primary">Register as Parent</router-link>
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
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import AppLogo from '../../components/common/AppLogo.vue'

const router = useRouter()
const { login, userRole } = useAuth()

const form = ref({
  email: '',
  password: ''
})

const errors = ref({
  email: '',
  password: '',
  general: ''
})

const loading = ref(false)

const handleLogin = async () => {
  // Reset errors
  errors.value = {
    email: '',
    password: '',
    general: ''
  }
  
  // Validate
  if (!form.value.email) {
    errors.value.email = 'Email is required'
    return
  }
  
  if (!form.value.password) {
    errors.value.password = 'Password is required'
    return
  }
  
  loading.value = true
  
  const result = await login(form.value.email, form.value.password)
  
  loading.value = false
  
  if (result.success) {
    // Wait a bit for profile to load
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Redirect based on role
    if (userRole.value === 'ADMIN') {
      router.push('/admin/dashboard')
    } else if (userRole.value === 'COACH') {
      router.push('/coach/dashboard')
    } else if (userRole.value === 'PARENT') {
      router.push('/parent/dashboard')
    } else {
      // If no role found, show error
      errors.value.general = 'User profile not found. Please contact administrator.'
    }
  } else {
    errors.value.general = result.error || 'Invalid email or password'
  }
}
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
}

.card {
  border: none;
  border-radius: 1rem;
}
</style>
