<template>
  <div class="reports-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Semester Reports</h4>
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

      <!-- Reports List (Placeholder) -->
      <div class="text-center py-5">
        <div class="mb-3">
          <div class="avatar-lg rounded-circle bg-soft-danger text-danger d-inline-flex align-items-center justify-content-center p-4">
            <i class="bi bi-file-earmark-text display-5"></i>
          </div>
        </div>
        <h5 class="fw-bold text-dark">No Reports Available</h5>
        <p class="text-muted">Semester reports for {{ selectedAthlete.full_name }} are not yet available.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'

const { user } = useAuth()
const athletes = ref([])
const selectedAthlete = ref(null)
const loading = ref(true)
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
    
    // Select first athlete by default
    if (athletes.value.length > 0) {
      selectedAthlete.value = athletes.value[0]
    }
  } catch (error) {
    console.error('Error fetching athletes:', error)
  } finally {
    loading.value = false
  }
}

const selectAthlete = (athlete) => {
  showDropdown.value = false
  selectedAthlete.value = athlete
}

onMounted(fetchAthletes)
</script>

<style scoped>
.bg-soft-primary { background-color: rgba(13, 110, 253, 0.1); }
.bg-primary-subtle { background-color: rgba(13, 110, 253, 0.1); }
.bg-soft-danger { background-color: rgba(220, 53, 69, 0.1); }

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
