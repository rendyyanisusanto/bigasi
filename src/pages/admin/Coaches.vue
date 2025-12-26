<template>
  <div class="coaches-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Coaches</h4>
    </div>
    
    <!-- Actions Bar -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-3">
        <div class="row g-2">
          <!-- Search (Placeholder for future implementation) -->
          <div class="col-12 col-md">
            <div class="input-group">
              <span class="input-group-text bg-light border-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control bg-light border-0 shadow-none ps-1" 
                placeholder="Search coaches..."
              />
            </div>
          </div>
          <!-- Add Button -->
          <div class="col-6 col-md-auto ms-auto">
            <BaseButton variant="primary" class="w-100 fw-medium" @click="showModal = true">
              <i class="bi bi-plus-lg me-2"></i>Add
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Coaches List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else-if="coaches.length === 0" class="text-center py-5">
      <i class="bi bi-person-badge display-1 text-muted opacity-25"></i>
      <p class="mt-3 text-muted">No coaches found</p>
    </div>
    
    <div v-else class="row g-3">
      <div v-for="coach in coaches" :key="coach.id" class="col-12 col-md-6 col-xl-4 athlete-card-wrapper">
        <div class="card h-100 border-0 shadow-custom rounded-4 card-hover-effect">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <!-- Avatar Section -->
              <div class="flex-shrink-0 position-relative">
                <img 
                  v-if="coach.photo_url" 
                  :src="coach.photo_url" 
                  :alt="coach.full_name"
                  class="avatar-md rounded-circle object-fit-cover shadow-sm"
                />
                <div v-else class="avatar-md rounded-circle bg-soft-secondary text-secondary d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm">
                  {{ coach.full_name.charAt(0) }}
                </div>
                <span :class="['status-indicator', coach.is_active ? 'bg-success' : 'bg-secondary']"></span>
              </div>
              
              <!-- Info Section -->
              <div class="flex-grow-1 ms-3 min-w-0">
                <div class="d-flex align-items-start gap-2 mb-1 flex-wrap">
                  <h6 class="fw-bold mb-0 text-dark text-truncate">{{ coach.full_name }}</h6>
                  <span v-if="coach.user_id" class="badge bg-success-subtle text-success border border-success-subtle" style="font-size: 0.6rem; padding: 0.15rem 0.4rem; white-space: nowrap;">
                    <i class="bi bi-check-circle-fill" style="font-size: 0.55rem;"></i> Account
                  </span>
                  <span v-else class="badge bg-secondary-subtle text-secondary border border-secondary-subtle" style="font-size: 0.6rem; padding: 0.15rem 0.4rem; white-space: nowrap;">
                    <i class="bi bi-x-circle-fill" style="font-size: 0.55rem;"></i> No Account
                  </span>
                </div>
                <div class="d-flex flex-column gap-1">
                  <small class="text-muted text-truncate" v-if="coach.phone">
                    <i class="bi bi-telephone me-1"></i>{{ coach.phone }}
                  </small>
                  <small class="text-muted text-truncate" v-if="coach.email">
                    <i class="bi bi-envelope me-1"></i>{{ coach.email }}
                  </small>
                </div>
              </div>
              
              <!-- Action Section -->
              <div class="flex-shrink-0 ms-2">
                <div class="dropdown">
                  <button 
                    class="btn btn-icon btn-light rounded-circle shadow-none" 
                    type="button" 
                    @click="toggleDropdown(coach.id)"
                    @blur="closeDropdown(coach.id)"
                  >
                    <i class="bi bi-three-dots-vertical text-muted"></i>
                  </button>
                  <ul 
                    v-if="openDropdownId === coach.id"
                    class="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-3 overflow-hidden show"
                    style="position: absolute; right: 0;"
                    @mousedown.prevent
                  >
                    <li>
                      <button class="dropdown-item py-2 px-3 small fw-medium" @click="editCoach(coach)">
                        <i class="bi bi-pencil me-2 text-primary"></i>Edit Details
                      </button>
                    </li>
                    <li><hr class="dropdown-divider my-0"></li>
                    <!-- Account Management -->
                    <li v-if="!coach.user_id">
                      <button class="dropdown-item py-2 px-3 small fw-medium text-success" @click="createAccount(coach)">
                        <i class="bi bi-person-plus me-2"></i>Create Account
                      </button>
                    </li>
                    <li v-if="coach.user_id">
                      <button class="dropdown-item py-2 px-3 small fw-medium text-warning" @click="resetPassword(coach)">
                        <i class="bi bi-key me-2"></i>Reset Password
                      </button>
                    </li>
                    <li v-if="coach.user_id || !coach.user_id"><hr class="dropdown-divider my-0"></li>
                    <li>
                      <button class="dropdown-item py-2 px-3 small fw-medium text-danger" @click="deleteCoach(coach.id)">
                        <i class="bi bi-trash me-2"></i>Delete Coach
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal -->
    <div v-if="showModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Edit' : 'Add' }} Coach</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <BaseInput v-model="form.full_name" label="Full Name" required />
            <BaseInput v-model="form.phone" label="Phone" type="tel" />
            <BaseInput v-model="form.email" label="Email" type="email" />
            <BaseInput v-model="photoFile" type="file" label="Photo" accept="image/*" @change="handlePhotoChange" />
            <div class="form-check mb-3">
              <input v-model="form.is_active" class="form-check-input" type="checkbox" id="isActive" />
              <label class="form-check-label" for="isActive">Active</label>
            </div>
          </div>
          <div class="modal-footer">
            <BaseButton variant="secondary" @click="closeModal">Cancel</BaseButton>
            <BaseButton variant="primary" :loading="saving" @click="saveCoach">
              {{ editMode ? 'Update' : 'Create' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop show"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useUpload } from '../../composables/useUpload'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const coaches = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editMode = ref(false)
const photoFile = ref(null)
const openDropdownId = ref(null)

const form = ref({
  id: null,
  full_name: '',
  phone: '',
  email: '',
  photo_url: '',
  is_active: true
})

const toggleDropdown = (coachId) => {
  openDropdownId.value = openDropdownId.value === coachId ? null : coachId
}

const closeDropdown = (coachId) => {
  setTimeout(() => {
    if (openDropdownId.value === coachId) {
      openDropdownId.value = null
    }
  }, 200)
}

const { uploadFile } = useUpload()

const fetchCoaches = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    coaches.value = data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const editCoach = (coach) => {
  openDropdownId.value = null
  form.value = { ...coach }
  editMode.value = true
  showModal.value = true
}

const handlePhotoChange = (file) => {
  photoFile.value = file
}

const saveCoach = async () => {
  try {
    saving.value = true
    
    // Upload photo if selected (optional)
    if (photoFile.value) {
      const result = await uploadFile(photoFile.value, 'photos', 'coaches/')
      if (result.success) {
        form.value.photo_url = result.url
      } else {
        // Show warning but continue saving
        console.warn('Photo upload failed:', result.error)
        const continueWithoutPhoto = confirm(`Photo upload failed: ${result.error}\n\nDo you want to continue saving without the photo?`)
        if (!continueWithoutPhoto) {
          saving.value = false
          return
        }
      }
    }
    
    const payload = {
      full_name: form.value.full_name,
      phone: form.value.phone,
      email: form.value.email,
      photo_url: form.value.photo_url,
      is_active: form.value.is_active
    }
    
    if (editMode.value) {
      const { error } = await supabase.from('coaches').update(payload).eq('id', form.value.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('coaches').insert(payload)
      if (error) throw error
    }
    
    // Save edit mode before closing
    const wasEditMode = editMode.value
    
    // Refresh coaches list
    await fetchCoaches()
    
    // Reset saving state BEFORE closing modal
    saving.value = false
    
    // Close modal
    closeModal()
    
    // Small delay before showing alert
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Show success alert
    alert(wasEditMode ? 'Coach updated successfully!' : 'Coach created successfully!')
  } catch (error) {
    console.error('Error:', error)
    saving.value = false
    alert('Failed to save coach: ' + error.message)
  }
}

const deleteCoach = async (id) => {
  if (!confirm('Delete this coach?')) return
  try {
    const { error } = await supabase.from('coaches').delete().eq('id', id)
    if (error) throw error
    await fetchCoaches()
  } catch (error) {
    console.error('Error:', error)
  }
}

const createAccount = async (coach) => {
  // Check if email exists
  if (!coach.email || !coach.email.trim()) {
    alert('Cannot create account: Coach must have an email address. Please edit the coach and add an email first.')
    return
  }
  
  if (!confirm(`Create account for ${coach.full_name}?\n\nAn account will be created with email: ${coach.email}\nA password reset email will be sent to this address.`)) {
    return
  }
  
  try {
    loading.value = true
    
    // Generate random password (8 characters)
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()
    
    console.log('Creating auth user for:', coach.email)
    
    // Create auth user via Supabase Auth signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: coach.email,
      password: tempPassword,
      options: {
        emailRedirectTo: window.location.origin + '/reset-password'
      }
    })
    
    if (authError) throw authError
    
    if (!authData.user) {
      throw new Error('Failed to create user')
    }
    
    console.log('Auth user created:', authData.user.id)
    
    // Create app_users record
    const { error: profileError } = await supabase
      .from('app_users')
      .insert({
        id: authData.user.id,
        email: coach.email,
        full_name: coach.full_name,
        role: 'COACH',
        photo_url: coach.photo_url
      })
    
    if (profileError) throw profileError
    
    console.log('App user profile created')
    
    // Update coach's user_id
    const { error: updateError } = await supabase
      .from('coaches')
      .update({ user_id: authData.user.id })
      .eq('id', coach.id)
    
    if (updateError) throw updateError
    
    console.log('Coach user_id updated')
    
    // Trigger password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(coach.email, {
      redirectTo: window.location.origin + '/reset-password'
    })
    
    if (resetError) {
      console.warn('Password reset email failed:', resetError)
    }
    
    // Refresh coaches list
    await fetchCoaches()
    
    alert(`Account created successfully for ${coach.full_name}!\n\nA password reset email has been sent to ${coach.email}.\nThe coach can use this email to set their password and login.`)
  } catch (error) {
    console.error('Error creating account:', error)
    alert('Failed to create account: ' + error.message)
  } finally {
    loading.value = false
  }
}

const resetPassword = async (coach) => {
  if (!coach.email || !coach.email.trim()) {
    alert('Cannot reset password: No email address found for this coach.')
    return
  }
  
  if (!confirm(`Send password reset email to ${coach.full_name}?\n\nEmail: ${coach.email}`)) {
    return
  }
  
  try {
    loading.value = true
    
    const { error } = await supabase.auth.resetPasswordForEmail(coach.email, {
      redirectTo: window.location.origin + '/reset-password'
    })
    
    if (error) throw error
    
    alert(`Password reset email sent successfully to ${coach.email}!\n\nThe coach will receive an email with instructions to reset their password.`)
  } catch (error) {
    console.error('Error sending reset password email:', error)
    alert('Failed to send password reset email: ' + error.message)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editMode.value = false
  photoFile.value = null
  form.value = { id: null, full_name: '', phone: '', email: '', photo_url: '', is_active: true }
}

onMounted(fetchCoaches)
</script>

<style scoped>
.avatar-md {
  width: 50px;
  height: 50px;
}

.shadow-custom {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.card-hover-effect {
  transition: all 0.2s ease-in-out;
}

.card-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.bg-soft-primary {
  background-color: rgba(13, 110, 253, 0.1);
}

.bg-soft-secondary {
  background-color: rgba(108, 117, 125, 0.1);
}

.status-indicator {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.text-truncate {
  max-width: 100%;
}

/* Fix z-index stacking context */
.athlete-card-wrapper {
  position: relative;
  z-index: 1;
}

.athlete-card-wrapper:hover {
  z-index: 10;
}

/* Ensure card with open dropdown is always on top */
.athlete-card-wrapper:has(.dropdown.show),
.athlete-card-wrapper:has(.dropdown-menu.show) {
  z-index: 1050 !important;
}

/* Ensure dropdown menu appears above everything */
.dropdown-menu {
  z-index: 1060;
}

/* Fix card overflow to allow dropdown to show */
.card {
  overflow: visible !important;
}
</style>
