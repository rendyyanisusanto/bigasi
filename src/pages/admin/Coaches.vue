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
                <h6 class="fw-bold mb-1 text-dark text-truncate">{{ coach.full_name }}</h6>
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
                  <button class="btn btn-icon btn-light rounded-circle shadow-none" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots-vertical text-muted"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-3 overflow-hidden">
                    <li>
                      <button class="dropdown-item py-2 px-3 small fw-medium" @click="editCoach(coach)">
                        <i class="bi bi-pencil me-2 text-primary"></i>Edit Details
                      </button>
                    </li>
                    <li><hr class="dropdown-divider my-0"></li>
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
import { ref, onMounted, nextTick } from 'vue'
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

const form = ref({
  id: null,
  full_name: '',
  phone: '',
  email: '',
  photo_url: '',
  is_active: true
})

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
    
    // Close modal with setTimeout
    setTimeout(() => {
      closeModal()
    }, 100)
    
    // Fetch data after delay
    await new Promise(resolve => setTimeout(resolve, 150))
    await fetchCoaches()
    await nextTick()
    alert(wasEditMode ? 'Coach updated successfully!' : 'Coach created successfully!')
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to save coach: ' + error.message)
  } finally {
    saving.value = false
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
  transition: z-index 0s;
}

.athlete-card-wrapper:hover {
  z-index: 20;
  position: relative;
}

/* Ensure card with open dropdown is always on top */
.athlete-card-wrapper:has(.show) {
  z-index: 100 !important;
  position: relative;
}
</style>
