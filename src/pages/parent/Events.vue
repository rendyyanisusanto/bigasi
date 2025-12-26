<template>
  <div class="events-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Upcoming Events</h4>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else-if="!selectedAthlete" class="text-center py-5">
      <i class="bi bi-person-x display-1 text-muted opacity-25"></i>
      <p class="mt-3 text-muted">No athlete linked to your account</p>
    </div>
    
    <div v-else>
      <!-- Athlete Selector (for UI Grid consistency, though events might be global) -->
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

      <!-- Events List -->
      <div v-if="loadingEvents" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="events.length === 0" class="text-center py-5">
        <div class="mb-3">
          <div class="avatar-lg rounded-circle bg-soft-info text-info d-inline-flex align-items-center justify-content-center p-4">
            <i class="bi bi-calendar-x display-5"></i>
          </div>
        </div>
        <h5 class="fw-bold text-dark">No Upcoming Events</h5>
        <p class="text-muted">There are no upcoming events scheduled at this time.</p>
      </div>

      <div v-else class="row g-2">
        <div v-for="event in events" :key="event.id" class="col-12">
          <div class="card border-0 shadow-sm rounded-4 card-hover-effect">
            <div class="card-body p-3">
              <div class="d-flex align-items-start gap-3">
                <!-- Left: Compact Date -->
                <div class="flex-shrink-0 text-center bg-light rounded-3 p-2 border" style="min-width: 65px;">
                  <div class="small fw-bold text-uppercase text-danger mb-0" style="font-size: 0.7rem; line-height: 1;">
                    {{ new Date(event.event_date).toLocaleString('default', { month: 'short' }) }}
                  </div>
                  <div class="h4 mb-0 fw-bold text-dark" style="line-height: 1.1;">
                    {{ new Date(event.event_date).getDate() }}
                  </div>
                </div>

                <!-- Right: Content -->
                <div class="flex-grow-1 min-w-0 pt-1">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <h6 class="fw-bold text-dark mb-0 pe-2 text-break">
                      {{ event.name }}
                    </h6>
                    <span class="badge rounded-pill bg-soft-info text-info flex-shrink-0" style="font-size: 0.7rem;">
                      {{ event.event_type || 'Event' }}
                    </span>
                  </div>
                  
                  <div class="d-flex align-items-center text-muted small text-truncate mt-2">
                    <i class="bi bi-geo-alt me-1"></i>
                    <span class="me-2 text-truncate">{{ event.location || 'TBA' }}</span>
                  </div>
                  
                  <div class="mt-2 text-muted x-small" v-if="event.description">
                    {{ event.description }}
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
const events = ref([])
const loading = ref(true)
const loadingEvents = ref(false)
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

const fetchEvents = async () => {
  // We fetch all events since they are generally global for now
  // We re-fetch when athlete changes just to simulate the 'context' refresh or if we add filtering later
  try {
    loadingEvents.value = true
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0]) // Upcoming only
      .order('event_date', { ascending: true })
      
    if (error) throw error
    events.value = data || []
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loadingEvents.value = false
  }
}

const selectAthlete = (athlete) => {
  showDropdown.value = false
  selectedAthlete.value = athlete
}

watch(selectedAthlete, () => {
  fetchEvents()
})

onMounted(fetchAthletes)
</script>

<style scoped>
.bg-soft-primary { background-color: rgba(13, 110, 253, 0.1); }
.bg-primary-subtle { background-color: rgba(13, 110, 253, 0.1); }
.bg-soft-info { background-color: rgba(13, 202, 240, 0.1); }

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
