<template>
  <div class="training-notes-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Training Notes</h4>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else-if="!selectedAthlete" class="text-center py-5">
      <i class="bi bi-person-x display-1 text-muted opacity-25"></i>
      <p class="mt-3 text-muted">No athlete linked to your account</p>
    </div>
    
    <div v-else>
      <!-- Athlete Selector (if multiple) -->
      <div v-if="athletes.length > 1" class="card border-0 shadow-sm mb-4">
        <div class="card-body p-3 d-flex align-items-center justify-content-between">
          <span class="text-muted small fw-bold">SELECT ATHLETE:</span>
          <div class="dropdown">
            <button 
              class="btn btn-light bg-light-subtle border-0 rounded-pill ps-3 pe-2 fw-medium d-flex align-items-center text-dark" 
              type="button" 
              @click="toggleDropdown"
              @blur="closeDropdown"
            >
              {{ selectedAthlete.full_name }}
              <i class="bi bi-chevron-down ms-2 small"></i>
            </button>
            <ul 
              v-if="showDropdown"
              class="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2 rounded-4 show" 
              style="min-width: 250px; position: absolute; right: 0;"
              @mousedown.prevent
            >
              <li v-for="athlete in athletes" :key="athlete.id" class="mb-1">
                <a 
                  class="dropdown-item rounded-3 py-2 px-3 d-flex align-items-center" 
                  href="#" 
                  @click.prevent="selectAthlete(athlete)"
                  :class="{ 'active bg-primary-subtle text-primary': selectedAthlete.id === athlete.id }"
                >
                  <img v-if="athlete.photo_url" :src="athlete.photo_url" class="avatar-sm rounded-circle me-2 object-fit-cover" width="32" height="32">
                  <div v-else class="avatar-sm rounded-circle bg-soft-primary text-primary d-flex align-items-center justify-content-center fw-bold me-2" style="width: 32px; height: 32px;">
                    {{ athlete.full_name.charAt(0) }}
                  </div>
                  <div class="d-flex flex-column">
                    <span class="fw-bold small">{{ athlete.full_name }}</span>
                    <span class="x-small opacity-75" style="font-size: 0.75rem;">{{ athlete.class_name }}</span>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Notes List -->
      <div v-if="loadingNotes" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="notes.length === 0" class="text-center py-5">
        <div class="mb-3">
          <div class="avatar-lg rounded-circle bg-soft-primary text-primary d-inline-flex align-items-center justify-content-center p-4">
            <i class="bi bi-journal-x display-5"></i>
          </div>
        </div>
        <h5 class="fw-bold text-dark">No Training Notes</h5>
        <p class="text-muted">There are no training records for {{ selectedAthlete.full_name }} yet.</p>
      </div>

      <div v-else class="row g-2">
        <div v-for="note in notes" :key="note.id" class="col-12">
          <div class="card border-0 shadow-sm rounded-4 card-hover-effect">
            <div class="card-body p-3">
              <div class="d-flex align-items-start gap-3">
                <!-- Left: Compact Date -->
                <div class="flex-shrink-0 text-center bg-light rounded-3 p-2 border" style="min-width: 65px;">
                  <div class="small fw-bold text-uppercase text-danger mb-0" style="font-size: 0.7rem; line-height: 1;">
                    {{ new Date(note.training_date).toLocaleString('default', { month: 'short' }) }}
                  </div>
                  <div class="h4 mb-0 fw-bold text-dark" style="line-height: 1.1;">
                    {{ new Date(note.training_date).getDate() }}
                  </div>
                </div>

                <!-- Right: Content -->
                <div class="flex-grow-1 min-w-0 pt-1">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <h6 class="fw-bold text-dark mb-0 pe-2 text-break">
                      {{ note.note || 'Training Session' }}
                    </h6>
                    <span :class="['badge rounded-pill flex-shrink-0', note.attendance ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger']" style="font-size: 0.7rem;">
                      {{ note.attendance ? 'Present' : 'Absent' }}
                    </span>
                  </div>
                  
                  <div class="d-flex align-items-center text-muted small text-truncate mt-2">
                    <span class="fw-medium text-dark">{{ selectedAthlete.class_name }}</span>
                    <span class="mx-2">•</span>
                    <i class="bi bi-person-badge me-1"></i>
                    <span class="text-truncate">{{ note.coaches?.full_name || 'Unknown Coach' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'

const { user } = useAuth()
const athletes = ref([])
const selectedAthlete = ref(null)
const notes = ref([])
const loading = ref(true)
const loadingNotes = ref(false)
const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const fetchAthletes = async () => {
  try {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('parent_user_id', user.value.id)
    
    if (error) throw error
    
    athletes.value = data || []
    
    if (athletes.value.length > 0) {
      selectedAthlete.value = athletes.value[0]
    }
  } catch (error) {
    console.error('Error fetching athletes:', error)
  } finally {
    loading.value = false
  }
}

const fetchNotes = async () => {
  if (!selectedAthlete.value) return
  
  try {
    loadingNotes.value = true
    const { data, error } = await supabase
      .from('training_notes')
      .select('*, coaches(full_name)')
      .eq('athlete_id', selectedAthlete.value.id)
      .order('training_date', { ascending: false })
      
    if (error) throw error
    notes.value = data || []
  } catch (error) {
    console.error('Error fetching notes:', error)
    // Fallback if join fails (e.g., if relation name is different or missing permissions, though unexpected)
    // We could retry without join, but let's assume it works or just leave notes empty/warn.
    // To be safe, if we get error about relation, maybe fallback?
    // But typically simple join works.
  } finally {
    loadingNotes.value = false
  }
}

const selectAthlete = (athlete) => {
  showDropdown.value = false
  selectedAthlete.value = athlete
}

watch(selectedAthlete, () => {
  fetchNotes()
})

onMounted(fetchAthletes)
</script>

<style scoped>
.bg-soft-primary { background-color: rgba(13, 110, 253, 0.1); }
.bg-primary-subtle { background-color: rgba(13, 110, 253, 0.1); }
.bg-soft-success { background-color: rgba(25, 135, 84, 0.1); }
.bg-soft-danger { background-color: rgba(220, 53, 69, 0.1); }

.card-hover-effect {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05) !important;
}

/* Ensure card content with dropdown is above decorative circles */
.card-body:has(.dropdown-menu.show) {
  z-index: 10 !important;
}

/* Ensure the card itself is above others when dropdown is open */
.card:has(.dropdown-menu.show) {
  z-index: 100 !important;
  overflow: visible !important;
}
</style>
