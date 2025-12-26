<template>
  <div class="parent-profile-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-3">
      <h4 class="fw-bold mb-0">My Profile</h4>
    </div>
    
    <div class="row g-4">
      <div class="col-12 col-lg-8 mx-auto">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-4">Edit Profile</h5>
            
            <div v-if="message" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-danger', 'alert-dismissible', 'fade', 'show']" role="alert">
              <i :class="['bi', messageType === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle', 'me-2']"></i>
              {{ message }}
              <button type="button" class="btn-close" @click="message = ''"></button>
            </div>

            <form @submit.prevent="updateProfile">
              <!-- Full Name -->
              <div class="mb-3">
                <label class="form-label fw-medium">Full Name</label>
                <input 
                  v-model="form.full_name" 
                  type="text" 
                  class="form-control" 
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <!-- Email (disabled) -->
              <div class="mb-3">
                <label class="form-label fw-medium">Email</label>
                <input 
                  v-model="form.email" 
                  type="email" 
                  class="form-control" 
                  disabled
                />
                <div class="form-text">
                  <i class="bi bi-info-circle me-1"></i>
                  Email cannot be changed
                </div>
              </div>
              
              <!-- Role (disabled) -->
              <div class="mb-3">
                <label class="form-label fw-medium">Role</label>
                <input 
                  v-model="form.role" 
                  type="text" 
                  class="form-control" 
                  disabled
                />
              </div>
              
              <hr class="my-4">
              <h6 class="fw-bold mb-3">Change Password</h6>
              
              <!-- New Password -->
              <div class="mb-3">
                <label class="form-label fw-medium">New Password</label>
                <input 
                  v-model="form.password" 
                  type="password" 
                  class="form-control" 
                  placeholder="Leave blank to keep current password"
                />
                <div class="form-text">Minimum 6 characters</div>
              </div>
              
              <!-- Confirm Password -->
              <div class="mb-3">
                <label class="form-label fw-medium">Confirm New Password</label>
                <input 
                  v-model="form.confirmPassword" 
                  type="password" 
                  class="form-control" 
                  placeholder="Confirm new password"
                />
              </div>
              
              <div class="mt-4 d-flex justify-content-end gap-2">
                <button 
                  type="button" 
                  @click="$router.push('/parent/dashboard')" 
                  class="btn btn-light rounded-pill px-4"
                  :disabled="saving"
                >
                  <i class="bi bi-x-circle me-2"></i>Cancel
                </button>
                <button 
                  type="submit" 
                  class="btn btn-primary rounded-pill px-4"
                  :disabled="saving"
                >
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-save me-2"></i>
                  {{ saving ? 'Saving...' : 'Save Changes' }}
                </button>
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
    form.value.full_name = profile.value.full_name || ''
    form.value.email = profile.value.email || user.value?.email || ''
    form.value.role = profile.value.role || 'PARENT'
  }
})

const updateProfile = async () => {
  try {
    message.value = ''
    saving.value = true
    
    let profileUpdated = false
    let passwordChanged = false
    let errors = []
    
    // Validate password if provided
    if (form.value.password) {
      if (form.value.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
      if (form.value.password !== form.value.confirmPassword) {
        throw new Error('Passwords do not match')
      }
    }
    
    // 1. Try to update profile data in app_users
    try {
      const { error: profileError } = await supabase
        .from('app_users')
        .update({
          full_name: form.value.full_name
        })
        .eq('id', user.value.id)
        
      if (profileError) {
        console.error('Profile update error:', profileError)
        errors.push('Could not update profile name (RLS issue)')
      } else {
        profileUpdated = true
      }
    } catch (err) {
      console.error('Profile update exception:', err)
      errors.push('Profile update failed')
    }
    
    // 2. Update password if provided (independent of profile update)
    if (form.value.password) {
      try {
        const { error: authError } = await supabase.auth.updateUser({
          password: form.value.password
        })
        
        if (authError) {
          console.error('Password update error:', authError)
          errors.push('Could not update password')
        } else {
          passwordChanged = true
        }
      } catch (err) {
        console.error('Password update exception:', err)
        errors.push('Password update failed')
      }
    }
    
    // 3. ALWAYS stop loading, regardless of what happened
    saving.value = false
    
    // 4. Show appropriate message
    if (errors.length > 0) {
      // Some updates failed
      if (passwordChanged && !profileUpdated) {
        message.value = 'Password updated successfully, but profile name update failed. Please contact administrator to fix RLS policy.'
        messageType.value = 'warning'
      } else if (profileUpdated && !passwordChanged && form.value.password) {
        message.value = 'Profile updated but password change failed: ' + errors.join(', ')
        messageType.value = 'warning'
      } else {
        message.value = 'Update failed: ' + errors.join(', ')
        messageType.value = 'danger'
      }
    } else {
      // All updates succeeded
      if (passwordChanged && profileUpdated) {
        message.value = 'Profile and password updated successfully!'
        messageType.value = 'success'
      } else if (passwordChanged) {
        message.value = 'Password updated successfully!'
        messageType.value = 'success'
      } else if (profileUpdated) {
        message.value = 'Profile updated successfully!'
        messageType.value = 'success'
      } else {
        message.value = 'No changes made'
        messageType.value = 'info'
      }
    }
    
    // Clear password fields
    form.value.password = ''
    form.value.confirmPassword = ''

    // 5. Do background operations without blocking UI
    setTimeout(() => {
      // Try to refresh profile, but don't block if it fails
      if (fetchProfile && profileUpdated) {
        fetchProfile().catch(err => {
          console.warn('Could not refresh profile in background:', err)
        })
      }
      
      // If password changed, check session after a delay
      if (passwordChanged) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            // Session lost, redirect to login
            setTimeout(() => {
              window.location.href = '/login'
            }, 1000)
          }
        }).catch(err => {
          console.warn('Session check failed:', err)
        })
      }
    }, 100)
    
  } catch (error) {
    console.error('Error updating profile:', error)
    message.value = error.message || 'Failed to update profile'
    messageType.value = 'danger'
    saving.value = false
  }
}
</script>

<style scoped>
.parent-profile-page {
  padding-bottom: 80px; /* Space for bottom nav on mobile */
}

@media (min-width: 768px) {
  .parent-profile-page {
    padding-bottom: 0;
  }
}
</style>
