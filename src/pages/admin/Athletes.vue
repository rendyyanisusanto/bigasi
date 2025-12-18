<template>
  <div class="athletes-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Athletes</h4>
    </div>
    
    <!-- Actions Bar -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-3">
        <div class="row g-2">
          <!-- Search -->
          <div class="col-12 col-md">
            <div class="input-group">
              <span class="input-group-text bg-light border-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input 
                v-model="searchQuery" 
                type="text" 
                class="form-control bg-light border-0 shadow-none ps-1" 
                placeholder="Search by name, number..."
              />
            </div>
          </div>
          
          <!-- Filter -->
          <div class="col-6 col-md-auto" style="min-width: 140px;">
            <select v-model="filterStatus" class="form-select bg-light border-0 shadow-none text-muted fw-medium">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <!-- Add Button -->
          <div class="col-6 col-md-auto">
            <BaseButton variant="primary" class="w-100 fw-medium" @click="showModal = true">
              <i class="bi bi-plus-lg me-2"></i>Add
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Athletes List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="filteredAthletes.length === 0" class="text-center py-5">
      <i class="bi bi-people display-1 text-muted opacity-25"></i>
      <p class="mt-3 text-muted">No athletes found</p>
    </div>
    
    <div v-else class="row g-3">
      <div v-for="athlete in filteredAthletes" :key="athlete.id" class="col-12 col-md-6 col-xl-4 athlete-card-wrapper">
        <div class="card h-100 border-0 shadow-custom rounded-4 card-hover-effect">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <!-- Avatar Section -->
              <div class="flex-shrink-0 position-relative">
                <img 
                  v-if="athlete.photo_url" 
                  :src="athlete.photo_url" 
                  :alt="athlete.full_name"
                  class="avatar-md rounded-circle object-fit-cover shadow-sm"
                />
                <div v-else class="avatar-md rounded-circle bg-soft-primary text-primary d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm">
                  {{ athlete.full_name.charAt(0) }}
                </div>
                <span :class="['status-indicator', athlete.is_active ? 'bg-success' : 'bg-secondary']"></span>
              </div>
              
              <!-- Info Section -->
              <div class="flex-grow-1 ms-3 min-w-0">
                <h6 class="fw-bold mb-1 text-dark text-truncate">{{ athlete.full_name }}</h6>
                <div class="d-flex align-items-center flex-wrap gap-2">
                  <span class="badge bg-light text-secondary border rounded-pill fw-normal px-2">
                    #{{ athlete.athlete_number }}
                  </span>
                  <small class="text-muted text-truncate" v-if="athlete.class_name">
                    {{ athlete.class_name }}
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
                      <button class="dropdown-item py-2 px-3 small fw-medium" @click="editAthlete(athlete)">
                        <i class="bi bi-pencil me-2 text-primary"></i>Edit Details
                      </button>
                    </li>
                    <li><hr class="dropdown-divider my-0"></li>
                    <li>
                      <button class="dropdown-item py-2 px-3 small fw-medium text-danger" @click="deleteAthlete(athlete.id)">
                        <i class="bi bi-trash me-2"></i>Delete Athlete
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
    
    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editMode ? 'Edit' : 'Add' }} Athlete</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveAthlete">
              <BaseInput
                v-model="form.full_name"
                label="Full Name"
                placeholder="Enter full name"
                required
              />
              
              <BaseInput
                v-model="form.athlete_number"
                label="Athlete Number"
                placeholder="Enter athlete number"
                required
              />
              
              <BaseInput
                v-model="form.class_name"
                label="Class"
                placeholder="Enter class"
              />
              
              <BaseInput
                v-model="form.gender"
                type="select"
                label="Gender"
                :options="[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' }
                ]"
              />
              
              <BaseInput
                v-model="photoFile"
                type="file"
                label="Photo"
                accept="image/*"
                @change="handlePhotoChange"
              />
              
              <div class="form-check mb-3">
                <input 
                  v-model="form.is_active" 
                  class="form-check-input" 
                  type="checkbox" 
                  id="isActive"
                />
                <label class="form-check-label" for="isActive">
                  Active
                </label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <BaseButton variant="secondary" @click="closeModal">Cancel</BaseButton>
            <BaseButton variant="primary" :loading="saving" @click="saveAthlete">
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { supabase } from '../../lib/supabase'
import { useUpload } from '../../composables/useUpload'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const athletes = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editMode = ref(false)
const searchQuery = ref('')
const filterStatus = ref('')
const photoFile = ref(null)

const form = ref({
  id: null,
  full_name: '',
  athlete_number: '',
  class_name: '',
  gender: '',
  photo_url: '',
  is_active: true
})

const { uploadFile } = useUpload()

const filteredAthletes = computed(() => {
  let result = athletes.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a => 
      a.full_name.toLowerCase().includes(query) ||
      a.athlete_number.toLowerCase().includes(query)
    )
  }
  
  if (filterStatus.value !== '') {
    result = result.filter(a => a.is_active === (filterStatus.value === 'true'))
  }
  
  return result
})

const fetchAthletes = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    athletes.value = data || []
  } catch (error) {
    console.error('Error fetching athletes:', error)
    alert('Failed to fetch athletes')
  } finally {
    loading.value = false
  }
}

const editAthlete = (athlete) => {
  form.value = { ...athlete }
  editMode.value = true
  showModal.value = true
}

const handlePhotoChange = (file) => {
  photoFile.value = file
}

const saveAthlete = async () => {
  try {
    saving.value = true
    console.log('Starting save athlete...')
    
    // Upload photo if selected (optional)
    if (photoFile.value) {
      console.log('Uploading photo...')
      const result = await uploadFile(photoFile.value, 'photos', 'athletes/')
      console.log('Upload result:', result)
      
      if (result.success) {
        form.value.photo_url = result.url
        console.log('Photo uploaded successfully:', result.url)
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
    
    console.log('Saving to database...')
    
    if (editMode.value) {
      // Update
      const { error } = await supabase
        .from('athletes')
        .update({
          full_name: form.value.full_name,
          athlete_number: form.value.athlete_number,
          class_name: form.value.class_name,
          gender: form.value.gender,
          photo_url: form.value.photo_url,
          is_active: form.value.is_active
        })
        .eq('id', form.value.id)
      
      if (error) throw error
      console.log('Athlete updated successfully')
    } else {
      // Insert
      const { error } = await supabase
        .from('athletes')
        .insert({
          full_name: form.value.full_name,
          athlete_number: form.value.athlete_number,
          class_name: form.value.class_name,
          gender: form.value.gender,
          photo_url: form.value.photo_url,
          is_active: form.value.is_active
        })
      
      if (error) throw error
      console.log('Athlete created successfully')
    }
    
    // Save edit mode before closing
    const wasEditMode = editMode.value
    
    // Close modal with setTimeout to avoid unmount errors
    console.log('Closing modal...')
    setTimeout(() => {
      closeModal()
      console.log('Modal closed')
    }, 100)
    
    // Fetch data after a short delay
    console.log('Fetching athletes...')
    await new Promise(resolve => setTimeout(resolve, 150))
    await fetchAthletes()
    
    // Show success alert
    await nextTick()
    alert(wasEditMode ? 'Athlete updated successfully!' : 'Athlete created successfully!')
  } catch (error) {
    console.error('Error saving athlete:', error)
    alert('Failed to save athlete: ' + error.message)
  } finally {
    saving.value = false
    console.log('Save process finished')
  }
}

const deleteAthlete = async (id) => {
  if (!confirm('Are you sure you want to delete this athlete?')) return
  
  try {
    const { error } = await supabase
      .from('athletes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    await fetchAthletes()
  } catch (error) {
    console.error('Error deleting athlete:', error)
    alert('Failed to delete athlete')
  }
}

const closeModal = () => {
  showModal.value = false
  editMode.value = false
  photoFile.value = null
  form.value = {
    id: null,
    full_name: '',
    athlete_number: '',
    class_name: '',
    gender: '',
    photo_url: '',
    is_active: true
  }
}

onMounted(() => {
  fetchAthletes()
})
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
