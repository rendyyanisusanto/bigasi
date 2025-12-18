<template>
  <div class="sports-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Sports</h4>
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
                type="text" 
                class="form-control bg-light border-0 shadow-none ps-1" 
                placeholder="Search sports..."
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
    
    <!-- Sports List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else-if="sports.length === 0" class="text-center py-5">
      <i class="bi bi-trophy display-1 text-muted opacity-25"></i>
      <p class="mt-3 text-muted">No sports found</p>
    </div>
    
    <div v-else class="row g-3">
      <div v-for="sport in sports" :key="sport.id" class="col-12 col-md-6 col-xl-4 athlete-card-wrapper">
        <div class="card h-100 border-0 shadow-custom rounded-4 card-hover-effect">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <!-- Icon Section -->
              <div class="flex-shrink-0">
                <div class="avatar-md rounded-circle bg-soft-success text-success d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm">
                  <i class="bi bi-trophy"></i>
                </div>
              </div>
              
              <!-- Info Section -->
              <div class="flex-grow-1 ms-3 min-w-0">
                <h6 class="fw-bold mb-1 text-dark text-truncate">{{ sport.name }}</h6>
                <div class="d-flex flex-column gap-1">
                  <small class="text-muted text-truncate" v-if="sport.coach_id">
                    <i class="bi bi-person-badge me-1"></i>{{ getCoachName(sport.coach_id) }}
                  </small>
                  <small class="text-muted text-truncate" v-if="sport.schedule">
                    <i class="bi bi-clock me-1"></i>{{ sport.schedule }}
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
                      <button class="dropdown-item py-2 px-3 small fw-medium" @click="editSport(sport)">
                        <i class="bi bi-pencil me-2 text-primary"></i>Edit Details
                      </button>
                    </li>
                    <li><hr class="dropdown-divider my-0"></li>
                    <li>
                      <button class="dropdown-item py-2 px-3 small fw-medium text-danger" @click="deleteSport(sport.id)">
                        <i class="bi bi-trash me-2"></i>Delete Sport
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
            <h5 class="modal-title">{{ editMode ? 'Edit' : 'Add' }} Sport</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <BaseInput v-model="form.name" label="Sport Name" required />
            <BaseInput 
              v-model="form.coach_id" 
              type="select" 
              label="Coach"
              :options="coachOptions"
            />
            <BaseInput v-model="form.schedule" label="Schedule" placeholder="e.g., Mon-Wed-Fri 15:00-17:00" />
            <BaseInput v-model="form.description" type="textarea" label="Description" />
          </div>
          <div class="modal-footer">
            <BaseButton variant="secondary" @click="closeModal">Cancel</BaseButton>
            <BaseButton variant="primary" :loading="saving" @click="saveSport">
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
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const sports = ref([])
const coaches = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editMode = ref(false)

const form = ref({
  id: null,
  name: '',
  coach_id: '',
  schedule: '',
  description: ''
})

const coachOptions = computed(() => {
  return coaches.value.map(c => ({ value: c.id, label: c.full_name }))
})

const getCoachName = (coachId) => {
  const coach = coaches.value.find(c => c.id === coachId)
  return coach ? coach.full_name : '-'
}

const fetchSports = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.from('sports').select('*').order('name')
    if (error) throw error
    sports.value = data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const fetchCoaches = async () => {
  try {
    const { data, error } = await supabase.from('coaches').select('id, full_name').eq('is_active', true)
    if (error) throw error
    coaches.value = data || []
  } catch (error) {
    console.error('Error:', error)
  }
}

const editSport = (sport) => {
  form.value = { ...sport }
  editMode.value = true
  showModal.value = true
}

const saveSport = async () => {
  try {
    saving.value = true
    const payload = {
      name: form.value.name,
      coach_id: form.value.coach_id || null,
      schedule: form.value.schedule,
      description: form.value.description
    }
    
    if (editMode.value) {
      const { error } = await supabase.from('sports').update(payload).eq('id', form.value.id)
      if (error) throw error
      alert('Sport updated successfully!')
    } else {
      const { error } = await supabase.from('sports').insert(payload)
      if (error) throw error
      alert('Sport created successfully!')
    }
    
    await fetchSports()
    closeModal()
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to save sport: ' + error.message)
  } finally {
    saving.value = false
  }
}

const deleteSport = async (id) => {
  if (!confirm('Delete this sport?')) return
  try {
    const { error } = await supabase.from('sports').delete().eq('id', id)
    if (error) throw error
    await fetchSports()
  } catch (error) {
    console.error('Error:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editMode.value = false
  form.value = { id: null, name: '', coach_id: '', schedule: '', description: '' }
}

onMounted(async () => {
  await Promise.all([fetchSports(), fetchCoaches()])
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

.bg-soft-success {
  background-color: rgba(25, 135, 84, 0.1);
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
