<template>
  <div class="training-notes-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center py-3 mb-2 gap-2">
      <h4 class="fw-bold mb-0">Training Notes</h4>
      <button @click="openCreateModal" class="btn btn-primary rounded-pill px-4 shadow-sm">
        <i class="bi bi-plus-circle me-2"></i>Add Note
      </button>
    </div>

    <!-- Filters Card -->
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
                placeholder="Search by athlete name or note..."
              />
            </div>
          </div>
          
          <!-- Filter by Athlete -->
          <div class="col-6 col-md-auto" style="min-width: 140px;">
            <select v-model="filterAthlete" class="form-select bg-light border-0 shadow-none text-muted fw-medium">
              <option value="">All Athletes</option>
              <option v-for="athlete in myAthletes" :key="athlete.id" :value="athlete.id">
                {{ athlete.full_name }}
              </option>
            </select>
          </div>
          
          <!-- Filter by Sport -->
          <div class="col-6 col-md-auto" style="min-width: 140px;">
            <select v-model="filterSport" class="form-select bg-light border-0 shadow-none text-muted fw-medium">
              <option value="">All Sports</option>
              <option v-for="sport in coachSports" :key="sport.id" :value="sport.id">
                {{ sport.name }}
              </option>
            </select>
          </div>

          <!-- Filter by Attendance -->
          <div class="col-6 col-md-auto" style="min-width: 140px;">
            <select v-model="filterAttendance" class="form-select bg-light border-0 shadow-none text-muted fw-medium">
              <option value="">All Status</option>
              <option value="true">Present</option>
              <option value="false">Absent</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredNotes.length === 0" class="text-center py-5">
      <div class="mb-3">
        <div class="avatar-lg rounded-circle bg-soft-primary text-primary d-inline-flex align-items-center justify-content-center p-4">
          <i class="bi bi-journal-x display-5"></i>
        </div>
      </div>
      <h5 class="fw-bold text-dark">No Training Notes</h5>
      <p class="text-muted">{{ searchQuery || filterAthlete || filterSport ? 'No notes match your filters.' : 'Start by adding your first training note.' }}</p>
    </div>

    <!-- Notes List -->
    <div v-else class="row g-3">
      <div v-for="note in filteredNotes" :key="note.id" class="col-12 note-card-wrapper">
        <div class="card border-0 shadow-sm rounded-4 card-hover-effect">
          <div class="card-body p-3">
            <div class="d-flex align-items-start gap-3">
              <!-- Left: Compact Date -->
              <div class="flex-shrink-0 text-center bg-light rounded-3 p-2 border" style="min-width: 65px;">
                <div class="small fw-bold text-uppercase text-primary mb-0" style="font-size: 0.7rem; line-height: 1;">
                  {{ formatMonth(note.training_date) }}
                </div>
                <div class="h4 mb-0 fw-bold text-dark" style="line-height: 1.1;">
                  {{ formatDay(note.training_date) }}
                </div>
                <div class="x-small text-muted" style="font-size: 0.7rem; line-height: 1;">
                  {{ formatYear(note.training_date) }}
                </div>
              </div>

              <!-- Right: Content -->
              <div class="flex-grow-1 min-w-0 pt-1">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="flex-grow-1 pe-2">
                    <h6 class="fw-bold text-dark mb-1">
                      {{ getAthleteName(note.athlete_id) }}
                    </h6>
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                      <span :class="['badge rounded-pill', note.attendance ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger']" style="font-size: 0.7rem;">
                        <i :class="['bi', note.attendance ? 'bi-check-circle' : 'bi-x-circle', 'me-1']"></i>
                        {{ note.attendance ? 'Present' : 'Absent' }}
                      </span>
                      <span v-if="note.sport_id" class="badge bg-primary-subtle text-primary" style="font-size: 0.7rem;">
                        <i class="bi bi-trophy me-1"></i>{{ getSportName(note.sport_id) }}
                      </span>
                    </div>
                  </div>
                  <!-- Actions -->
                  <div class="flex-shrink-0 ms-2 position-relative">
                    <button 
                      class="btn btn-icon btn-light rounded-circle shadow-none" 
                      type="button" 
                      @click="toggleDropdown(note.id)"
                    >
                      <i class="bi bi-three-dots-vertical text-muted"></i>
                    </button>
                    <div 
                      v-if="activeDropdown === note.id" 
                      class="dropdown-menu dropdown-menu-end border-0 shadow show position-absolute"
                      style="top: 100%; right: 0; margin-top: 4px;"
                    >
                      <a class="dropdown-item" href="#" @click.prevent="handleEdit(note)">
                        <i class="bi bi-pencil me-2"></i>Edit
                      </a>
                      <hr class="dropdown-divider">
                      <a class="dropdown-item text-danger" href="#" @click.prevent="handleDelete(note)">
                        <i class="bi bi-trash me-2"></i>Delete
                      </a>
                    </div>
                  </div>
                </div>
                
                <p class="text-muted small mb-0 text-break" style="line-height: 1.5;">
                  {{ note.note }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" id="noteModal" tabindex="-1" ref="modalElement">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">{{ isEditMode ? 'Edit Training Note' : 'Add Training Note' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body pt-2">
            <form @submit.prevent="saveNote">
              <!-- Athlete Selection -->
              <div class="mb-3">
                <label class="form-label fw-bold small">Athlete <span class="text-danger">*</span></label>
                <select v-model="form.athlete_id" class="form-select" required @change="onAthleteChange">
                  <option value="">Select Athlete</option>
                  <option v-for="athlete in myAthletes" :key="athlete.id" :value="athlete.id">
                    {{ athlete.full_name }} - #{{ athlete.athlete_number }}
                  </option>
                </select>
              </div>

              <!-- Sport Selection -->
              <div class="mb-3">
                <label class="form-label fw-bold small">Sport <span class="text-danger">*</span></label>
                <select v-model="form.sport_id" class="form-select" required :disabled="!form.athlete_id || athleteSportOptions.length === 0">
                  <option value="">Select Sport</option>
                  <option v-for="sport in athleteSportOptions" :key="sport.id" :value="sport.id">
                    {{ sport.name }}
                  </option>
                </select>
                <small v-if="form.athlete_id && athleteSportOptions.length === 0" class="text-muted">
                  This athlete has no sports assigned
                </small>
              </div>

              <!-- Training Date -->
              <div class="mb-3">
                <label class="form-label fw-bold small">Training Date <span class="text-danger">*</span></label>
                <input v-model="form.training_date" type="date" class="form-control" required />
              </div>

              <!-- Attendance -->
              <div class="mb-3">
                <div class="form-check form-switch">
                  <input v-model="form.attendance" class="form-check-input" type="checkbox" id="attendanceSwitch">
                  <label class="form-check-label fw-bold small" for="attendanceSwitch">
                    Attended Training
                  </label>
                </div>
              </div>

              <!-- Note -->
              <div class="mb-3">
                <label class="form-label fw-bold small">Note <span class="text-danger">*</span></label>
                <textarea 
                  v-model="form.note" 
                  class="form-control" 
                  rows="4" 
                  placeholder="Write training notes, performance observations, recommendations..."
                  required
                ></textarea>
              </div>

              <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary rounded-pill px-4" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isEditMode ? 'Update' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" ref="deleteModalElement">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-body text-center p-4">
            <div class="mb-3">
              <div class="avatar-md rounded-circle bg-soft-danger text-danger d-inline-flex align-items-center justify-content-center">
                <i class="bi bi-trash display-6"></i>
              </div>
            </div>
            <h5 class="fw-bold mb-2">Delete Note?</h5>
            <p class="text-muted small mb-4">This action cannot be undone.</p>
            <div class="d-flex gap-2 justify-content-center">
              <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="button" class="btn btn-danger rounded-pill px-4" @click="deleteNote" :disabled="deleting">
                <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'
import { Modal } from 'bootstrap'

const { user } = useAuth()

// Data
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const notes = ref([])
const myAthletes = ref([])
const coachSports = ref([])
const athleteSports = ref([])
const coachData = ref(null)
const activeDropdown = ref(null)

// Filters
const searchQuery = ref('')
const filterAthlete = ref('')
const filterSport = ref('')
const filterAttendance = ref('')

// Modal
const modalElement = ref(null)
const deleteModalElement = ref(null)
let modalInstance = null
let deleteModalInstance = null

// Form
const isEditMode = ref(false)
const editingNote = ref(null)
const form = ref({
  athlete_id: '',
  sport_id: '',
  training_date: new Date().toISOString().split('T')[0],
  attendance: true,
  note: ''
})

// Computed
const athleteSportOptions = computed(() => {
  if (!form.value.athlete_id) return []
  
  const athleteSportIds = athleteSports.value
    .filter(as => as.athlete_id === form.value.athlete_id)
    .map(as => as.sport_id)
  
  return coachSports.value.filter(sport => athleteSportIds.includes(sport.id))
})

const filteredNotes = computed(() => {
  let result = notes.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(note => {
      const athleteName = getAthleteName(note.athlete_id).toLowerCase()
      const noteText = note.note.toLowerCase()
      return athleteName.includes(query) || noteText.includes(query)
    })
  }

  // Athlete filter
  if (filterAthlete.value) {
    result = result.filter(note => note.athlete_id === filterAthlete.value)
  }

  // Sport filter
  if (filterSport.value) {
    result = result.filter(note => note.sport_id === filterSport.value)
  }

  // Attendance filter
  if (filterAttendance.value !== '') {
    const isPresent = filterAttendance.value === 'true'
    result = result.filter(note => note.attendance === isPresent)
  }

  return result
})

// Methods
const fetchCoachData = async () => {
  try {
    const { data: coach, error } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.value.id)
      .single()
    
    if (error || !coach) {
      console.error('Coach not found:', error)
      return null
    }
    
    coachData.value = coach
    return coach
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

const fetchCoachSports = async (coachId) => {
  try {
    const { data: sports, error } = await supabase
      .from('sports')
      .select('id, name')
      .eq('coach_id', coachId)
      .order('name')
    
    if (error) {
      console.error('Error fetching sports:', error)
      return []
    }
    
    coachSports.value = sports || []
    return sports || []
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}

const fetchMyAthletes = async (sportIds) => {
  try {
    if (sportIds.length === 0) return

    // Get athlete_sports
    const { data: athleteSportsData, error: asError } = await supabase
      .from('athlete_sports')
      .select('athlete_id, sport_id')
      .in('sport_id', sportIds)
    
    if (asError) {
      console.error('Error fetching athlete_sports:', asError)
      return
    }
    
    athleteSports.value = athleteSportsData || []
    
    const athleteIds = [...new Set(athleteSportsData?.map(as => as.athlete_id) || [])]
    
    if (athleteIds.length === 0) return

    // Get athletes
    const { data: athletesData, error: athletesError } = await supabase
      .from('athletes')
      .select('*')
      .in('id', athleteIds)
      .order('full_name')
    
    if (athletesError) {
      console.error('Error fetching athletes:', athletesError)
      return
    }
    
    myAthletes.value = athletesData || []
  } catch (error) {
    console.error('Error:', error)
  }
}

const fetchNotes = async () => {
  try {
    if (!coachData.value) return

    const { data, error } = await supabase
      .from('training_notes')
      .select('*')
      .eq('coach_id', coachData.value.id)
      .order('training_date', { ascending: false })
    
    if (error) throw error
    
    notes.value = data || []
  } catch (error) {
    console.error('Error fetching notes:', error)
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const coach = await fetchCoachData()
    if (coach) {
      const sports = await fetchCoachSports(coach.id)
      const sportIds = sports.map(s => s.id)
      await fetchMyAthletes(sportIds)
      await fetchNotes()
    }
  } finally {
    loading.value = false
  }
}

const getAthleteName = (athleteId) => {
  const athlete = myAthletes.value.find(a => a.id === athleteId)
  return athlete ? athlete.full_name : 'Unknown Athlete'
}

const getSportName = (sportId) => {
  const sport = coachSports.value.find(s => s.id === sportId)
  return sport ? sport.name : 'Unknown Sport'
}

const formatMonth = (date) => {
  return new Date(date).toLocaleString('default', { month: 'short' })
}

const formatDay = (date) => {
  return new Date(date).getDate()
}

const formatYear = (date) => {
  return new Date(date).getFullYear()
}

const onAthleteChange = () => {
  // Reset sport when athlete changes
  form.value.sport_id = ''
}

const openCreateModal = () => {
  isEditMode.value = false
  editingNote.value = null
  form.value = {
    athlete_id: '',
    sport_id: '',
    training_date: new Date().toISOString().split('T')[0],
    attendance: true,
    note: ''
  }
  modalInstance.show()
}

const openEditModal = (note) => {
  isEditMode.value = true
  editingNote.value = note
  form.value = {
    athlete_id: note.athlete_id,
    sport_id: note.sport_id,
    training_date: note.training_date,
    attendance: note.attendance,
    note: note.note
  }
  modalInstance.show()
}

const saveNote = async () => {
  try {
    saving.value = true

    const noteData = {
      athlete_id: form.value.athlete_id,
      sport_id: form.value.sport_id,
      coach_id: coachData.value.id,
      training_date: form.value.training_date,
      attendance: form.value.attendance,
      note: form.value.note
    }

    if (isEditMode.value && editingNote.value) {
      // Update
      const { error } = await supabase
        .from('training_notes')
        .update(noteData)
        .eq('id', editingNote.value.id)
      
      if (error) throw error
    } else {
      // Create
      const { error } = await supabase
        .from('training_notes')
        .insert([noteData])
      
      if (error) throw error
    }

    await fetchNotes()
    modalInstance.hide()
  } catch (error) {
    console.error('Error saving note:', error)
    alert('Failed to save note. Please try again.')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (note) => {
  editingNote.value = note
  deleteModalInstance.show()
}

const deleteNote = async () => {
  try {
    deleting.value = true

    const { error } = await supabase
      .from('training_notes')
      .delete()
      .eq('id', editingNote.value.id)
    
    if (error) throw error

    await fetchNotes()
    deleteModalInstance.hide()
  } catch (error) {
    console.error('Error deleting note:', error)
    alert('Failed to delete note. Please try again.')
  } finally {
    deleting.value = false
  }
}

// Dropdown Management
const toggleDropdown = (noteId) => {
  if (activeDropdown.value === noteId) {
    activeDropdown.value = null
  } else {
    activeDropdown.value = noteId
  }
}

const closeDropdown = () => {
  activeDropdown.value = null
}

const handleEdit = (note) => {
  closeDropdown()
  openEditModal(note)
}

const handleDelete = (note) => {
  closeDropdown()
  confirmDelete(note)
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (activeDropdown.value && !event.target.closest('.position-relative')) {
    closeDropdown()
  }
}

onMounted(async () => {
  await loadData()
  
  // Initialize modals
  modalInstance = new Modal(modalElement.value)
  deleteModalInstance = new Modal(deleteModalElement.value)
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Clean up event listener
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.bg-soft-primary {
  background-color: rgba(13, 110, 253, 0.1);
}

.bg-primary-subtle {
  background-color: rgba(13, 110, 253, 0.1);
}

.bg-soft-success {
  background-color: rgba(25, 135, 84, 0.1);
}

.bg-soft-danger {
  background-color: rgba(220, 53, 69, 0.1);
}

.card-hover-effect {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08) !important;
}

.avatar-lg {
  width: 80px;
  height: 80px;
}

.avatar-md {
  width: 50px;
  height: 50px;
}

.min-w-0 {
  min-width: 0;
}

.text-break {
  word-break: break-word;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 !important;
}

.btn-icon:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Fix z-index stacking context */
.note-card-wrapper {
  transition: z-index 0s;
}

.note-card-wrapper:hover {
  z-index: 20;
  position: relative;
}

/* Ensure card with open dropdown is always on top */
.note-card-wrapper:has(.dropdown-menu.show) {
  z-index: 100 !important;
  position: relative;
}

/* Dropdown positioning */
.dropdown-menu {
  display: block;
  min-width: 150px;
  padding: 0.5rem 0;
  z-index: 1000;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dropdown-divider {
  height: 0;
  margin: 0.5rem 0;
  overflow: hidden;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
