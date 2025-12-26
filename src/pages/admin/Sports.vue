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
                <div class="d-flex align-items-center gap-2 mb-1">
                  <h6 class="fw-bold mb-0 text-dark text-truncate">{{ sport.name }}</h6>
                  <span class="badge bg-primary-subtle text-primary" style="font-size: 0.7rem;">
                    <i class="bi bi-people me-1"></i>{{ getAthleteCount(sport.id) }}
                  </span>
                </div>
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
                    <li>
                      <button class="dropdown-item py-2 px-3 small fw-medium text-success" @click="manageAthletes(sport)">
                        <i class="bi bi-people me-2"></i>Manage Athletes
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
    
    <!-- Athletes Management Modal -->
    <div v-if="showAthletesModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-people me-2"></i>{{ selectedSport?.name }} - Athletes
            </h5>
            <button type="button" class="btn-close" @click="closeAthletesModal"></button>
          </div>
          <div class="modal-body p-0">
            <!-- Search -->
            <div class="p-3 border-bottom bg-light">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  v-model="athleteSearch" 
                  type="text" 
                  class="form-control border-start-0 shadow-none" 
                  placeholder="Search athletes..."
                />
              </div>
            </div>
            
            <!-- Tabs (Mobile friendly) -->
            <ul class="nav nav-tabs px-3 pt-2" role="tablist">
              <li class="nav-item" role="presentation">
                <button 
                  class="nav-link" 
                  :class="{ active: activeTab === 'assigned' }"
                  @click="activeTab = 'assigned'"
                  type="button"
                >
                  <i class="bi bi-check-circle me-1"></i>Assigned ({{ assignedAthletes.length }})
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button 
                  class="nav-link" 
                  :class="{ active: activeTab === 'available' }"
                  @click="activeTab = 'available'"
                  type="button"
                >
                  <i class="bi bi-person-plus me-1"></i>Available ({{ availableAthletes.length }})
                </button>
              </li>
            </ul>
            
            <!-- Tab Content -->
            <div class="tab-content">
              <!-- Assigned Athletes Tab -->
              <div v-show="activeTab === 'assigned'" class="p-3">
                <div v-if="filteredAssignedAthletes.length === 0" class="text-center text-muted py-4">
                  <i class="bi bi-inbox display-4 opacity-25"></i>
                  <p class="mt-2">No athletes assigned</p>
                </div>
                <div v-else class="list-group list-group-flush">
                  <div 
                    v-for="athlete in filteredAssignedAthletes" 
                    :key="athlete.id"
                    class="list-group-item d-flex align-items-center px-0 py-2"
                  >
                    <div class="flex-grow-1 min-w-0">
                      <div class="fw-medium text-truncate">{{ athlete.full_name }}</div>
                      <small class="text-muted">#{{ athlete.athlete_number }}</small>
                    </div>
                    <button 
                      class="btn btn-sm btn-outline-danger rounded-circle ms-2"
                      style="width: 32px; height: 32px; padding: 0;"
                      @click="unassignAthlete(athlete.id)"
                      :disabled="assignLoading"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Available Athletes Tab -->
              <div v-show="activeTab === 'available'" class="p-3">
                <div v-if="filteredAvailableAthletes.length === 0" class="text-center text-muted py-4">
                  <i class="bi bi-inbox display-4 opacity-25"></i>
                  <p class="mt-2">No available athletes</p>
                </div>
                <div v-else class="list-group list-group-flush">
                  <div 
                    v-for="athlete in filteredAvailableAthletes" 
                    :key="athlete.id"
                    class="list-group-item d-flex align-items-center px-0 py-2"
                  >
                    <div class="flex-grow-1 min-w-0">
                      <div class="fw-medium text-truncate">{{ athlete.full_name }}</div>
                      <small class="text-muted">#{{ athlete.athlete_number }}</small>
                    </div>
                    <button 
                      class="btn btn-sm btn-success rounded-circle ms-2"
                      style="width: 32px; height: 32px; padding: 0;"
                      @click="assignAthlete(athlete.id)"
                      :disabled="assignLoading"
                    >
                      <i class="bi bi-plus-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAthletesModal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showAthletesModal" class="modal-backdrop show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const sports = ref([])
const coaches = ref([])
const athletes = ref([])
const athleteSports = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editMode = ref(false)
const showAthletesModal = ref(false)
const selectedSport = ref(null)
const activeTab = ref('assigned')
const athleteSearch = ref('')
const assignLoading = ref(false)

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

const assignedAthletes = computed(() => {
  if (!selectedSport.value) return []
  const assignedIds = athleteSports.value
    .filter(as => as.sport_id === selectedSport.value.id)
    .map(as => as.athlete_id)
  return athletes.value.filter(a => assignedIds.includes(a.id))
})

const availableAthletes = computed(() => {
  if (!selectedSport.value) return []
  const assignedIds = athleteSports.value
    .filter(as => as.sport_id === selectedSport.value.id)
    .map(as => as.athlete_id)
  return athletes.value.filter(a => !assignedIds.includes(a.id) && a.is_active)
})

const filteredAssignedAthletes = computed(() => {
  if (!athleteSearch.value) return assignedAthletes.value
  const search = athleteSearch.value.toLowerCase()
  return assignedAthletes.value.filter(a => 
    a.full_name.toLowerCase().includes(search) ||
    a.athlete_number.toLowerCase().includes(search)
  )
})

const filteredAvailableAthletes = computed(() => {
  if (!athleteSearch.value) return availableAthletes.value
  const search = athleteSearch.value.toLowerCase()
  return availableAthletes.value.filter(a => 
    a.full_name.toLowerCase().includes(search) ||
    a.athlete_number.toLowerCase().includes(search)
  )
})

const getCoachName = (coachId) => {
  const coach = coaches.value.find(c => c.id === coachId)
  return coach ? coach.full_name : '-'
}

const getAthleteCount = (sportId) => {
  return athleteSports.value.filter(as => as.sport_id === sportId).length
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

const fetchAthletes = async () => {
  try {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .order('full_name')
    if (error) throw error
    athletes.value = data || []
  } catch (error) {
    console.error('Error:', error)
  }
}

const fetchAthleteSports = async () => {
  try {
    const { data, error } = await supabase
      .from('athlete_sports')
      .select('*')
    if (error) throw error
    athleteSports.value = data || []
  } catch (error) {
    console.error('Error:', error)
  }
}

const manageAthletes = (sport) => {
  selectedSport.value = sport
  activeTab.value = 'assigned'
  athleteSearch.value = ''
  showAthletesModal.value = true
}

const assignAthlete = async (athleteId) => {
  try {
    assignLoading.value = true
    
    const { error } = await supabase
      .from('athlete_sports')
      .insert({
        athlete_id: athleteId,
        sport_id: selectedSport.value.id
      })
    
    if (error) {
      if (error.code === '23505') {
        alert('Athlete already assigned to this sport')
      } else {
        throw error
      }
    } else {
      await fetchAthleteSports()
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to assign athlete: ' + error.message)
  } finally {
    assignLoading.value = false
  }
}

const unassignAthlete = async (athleteId) => {
  try {
    assignLoading.value = true
    
    const { error } = await supabase
      .from('athlete_sports')
      .delete()
      .eq('athlete_id', athleteId)
      .eq('sport_id', selectedSport.value.id)
    
    if (error) throw error
    
    await fetchAthleteSports()
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to unassign athlete: ' + error.message)
  } finally {
    assignLoading.value = false
  }
}

const closeAthletesModal = () => {
  showAthletesModal.value = false
  selectedSport.value = null
  athleteSearch.value = ''
}

onMounted(async () => {
  await Promise.all([fetchSports(), fetchCoaches(), fetchAthletes(), fetchAthleteSports()])
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
