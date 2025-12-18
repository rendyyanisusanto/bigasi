<template>
  <div class="admin-profile-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Admin Profile</h4>
    </div>
    
    <div class="row g-4">
      <div class="col-12 col-lg-8 mx-auto">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-4">Edit Profile</h5>
            
            <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-danger']" role="alert">
              {{ message }}
            </div>

            <form @submit.prevent="updateProfile">
              <BaseInput
                v-model="form.full_name"
                label="Full Name"
                placeholder="Enter full name"
                required
                class="mb-3"
              />
              
              <BaseInput
                v-model="form.email"
                label="Email"
                type="email"
                disabled
                class="mb-3"
                hint="Email cannot be changed"
              />
              
              <BaseInput
                v-model="form.role"
                label="Role"
                disabled
                class="mb-3"
              />
              
              <hr class="my-4">
              <h6 class="fw-bold mb-3">Change Password</h6>
              
              <BaseInput
                v-model="form.password"
                type="password"
                label="New Password"
                placeholder="Leave blank to keep current password"
                class="mb-3"
              />
              
              <BaseInput
                v-model="form.confirmPassword"
                type="password"
                label="Confirm New Password"
                placeholder="Confirm new password"
                class="mb-3"
              />
              
              <div class="mt-4 d-flex justify-content-end">
                <BaseButton
                  type="submit"
                  variant="primary"
                  :loading="saving"
                  class="px-4"
                >
                  <i class="bi bi-save me-2"></i>Save Changes
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const { user, profile, fetchProfile } = useAuth()
const saving = ref(false)
const message = ref('')
const messageType = ref('success')

const form = ref({
  full_name: '',
  email: '',
  role: '',
  password: '',
  confirmPassword: ''
})

onMounted(() => {
  if (profile.value) {
    form.value.full_name = profile.value.full_name
    form.value.email = profile.value.email
    form.value.role = profile.value.role
  }
})

const updateProfile = async () => {
  try {
    message.value = ''
    saving.value = true
    
    // Validate password if provided
    if (form.value.password) {
      if (form.value.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      if (form.value.password !== form.value.confirmPassword) {
        throw new Error('Passwords do not match')
      }
    }
    
    // 1. Update profile data in app_users
    const { error: profileError } = await supabase
      .from('app_users')
      .update({
        full_name: form.value.full_name
      })
      .eq('id', user.value.id)
      
    if (profileError) throw profileError
    
    // 2. Update password if provided
    let passwordChanged = false
    if (form.value.password) {
      const { error: authError } = await supabase.auth.updateUser({
        password: form.value.password
      })
      
      if (authError) throw authError
      passwordChanged = true
    }
    
    // 3. Handle success
    message.value = 'Profile updated successfully'
    messageType.value = 'success'
    saving.value = false // Stop loading immediately
    
    // Clear password fields
    form.value.password = ''
    form.value.confirmPassword = ''

    // Attempt to refresh profile in background
    fetchProfile().catch(err => console.error('Background profile fetch failed:', err))

    // If password changed, check session
    if (passwordChanged) {
        // Simple check without blocking UI state
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                window.location.href = '/login'
            }
        })
    }
    
  } catch (error) {
    console.error('Error updating profile:', error)
    message.value = error.message || 'Failed to update profile'
    messageType.value = 'danger'
    saving.value = false
  }
}
</script>
