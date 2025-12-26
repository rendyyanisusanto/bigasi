<template>
  <div class="coach-dashboard">
    <!-- Profile Card -->
    <div class="card border-0 shadow-sm bg-gradient-primary text-white mb-4 overflow-hidden position-relative">
      <div class="card-body p-4 position-relative z-1">
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border text-white" role="status"></div>
        </div>
        
        <div v-else class="d-flex align-items-center">
          <!-- Avatar -->
          <div class="position-relative me-3">
            <img 
              v-if="coachData?.photo_url" 
              :src="coachData.photo_url" 
              class="avatar-lg rounded-circle border border-2 border-white shadow-sm object-fit-cover"
            />
            <div v-else class="avatar-lg bg-white text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm">
              {{ (coachData?.full_name || profile?.full_name || 'C').charAt(0) }}
            </div>
          </div>
          
          <!-- Info -->
          <div class="flex-grow-1 min-w-0">
            <h5 class="mb-1 fw-bold text-truncate">{{ coachData?.full_name || profile?.full_name || 'Coach' }}</h5>
            <p class="mb-1 text-white-50 small text-truncate" v-if="coachData?.phone">
              <i class="bi bi-telephone me-1"></i>{{ coachData.phone }}
            </p>
            <p class="mb-0 text-white-50 small text-truncate" v-if="coachData?.email">
              <i class="bi bi-envelope me-1"></i>{{ coachData.email }}
            </p>
            <!-- Sports Coached -->
            <div class="mt-2" v-if="coachSports.length > 0">
              <small class="text-white-50 d-block mb-1">Sports:</small>
              <div class="d-flex flex-wrap gap-1">
                <span 
                  v-for="sport in coachSports" 
                  :key="sport.id"
                  class="badge bg-white bg-opacity-25 text-white"
                  style="font-size: 0.7rem;"
                >
                  <i class="bi bi-trophy me-1"></i>{{ sport.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Decorative circles -->
      <div class="position-absolute top-0 end-0 p-5 rounded-circle bg-white opacity-10 mt-n4 me-n4"></div>
      <div class="position-absolute bottom-0 start-0 p-4 rounded-circle bg-white opacity-10 mb-n3 ms-n3"></div>
    </div>

    <!-- Stats Cards -->
    <h6 class="text-uppercase text-muted fw-bold small mb-3 ps-1">Statistics</h6>
    <div class="row g-3 mb-4">
      <div class="col-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-3 text-center">
            <div class="icon-box mb-2 rounded-circle bg-primary-subtle text-primary mx-auto">
              <i class="bi bi-people fs-5"></i>
            </div>
            <h5 class="mb-0 fw-bold">{{ stats.athletes }}</h5>
            <small class="text-muted">Athletes</small>
          </div>
        </div>
      </div>
      
      <div class="col-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-3 text-center">
            <div class="icon-box mb-2 rounded-circle bg-success-subtle text-success mx-auto">
              <i class="bi bi-journal-check fs-5"></i>
            </div>
            <h5 class="mb-0 fw-bold">{{ stats.trainingNotes }}</h5>
            <small class="text-muted">Notes</small>
          </div>
        </div>
      </div>
      
      <div class="col-4">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-3 text-center">
            <div class="icon-box mb-2 rounded-circle bg-danger-subtle text-danger mx-auto">
              <i class="bi bi-file-text fs-5"></i>
            </div>
            <h5 class="mb-0 fw-bold">{{ stats.reports }}</h5>
            <small class="text-muted">Reports</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Events Slider -->
    <div class="mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3 ps-1">
        <h6 class="text-uppercase text-muted fw-bold small mb-0">Upcoming Events</h6>
        <router-link to="/coach/events" class="text-decoration-none text-primary small fw-medium">
          View All <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>
      
      <!-- Loading State -->
      <div v-if="loadingEvents" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="upcomingEvents.length === 0" class="text-center py-4">
        <i class="bi bi-calendar-x text-muted opacity-50 fs-3"></i>
        <p class="text-muted small mt-2 mb-0">No upcoming events</p>
      </div>
      
      <!-- Events Slider -->
      <div v-else class="events-slider-container">
        <div class="events-slider d-flex gap-3 pb-2" style="overflow-x: auto; scroll-snap-type: x mandatory;">
          <router-link 
            v-for="event in upcomingEvents" 
            :key="event.id" 
            to="/coach/events"
            class="event-card flex-shrink-0 text-decoration-none"
            style="scroll-snap-align: start; width: 280px;"
          >
            <div class="card border-0 shadow-sm h-100 hover-scale">
              <div class="card-body p-3">
                <div class="d-flex align-items-start gap-2">
                  <div class="flex-shrink-0 text-center bg-light rounded-3 p-2 border" style="min-width: 50px;">
                    <div class="small fw-bold text-uppercase text-info mb-0" style="font-size: 0.6rem; line-height: 1;">
                      {{ formatEventMonth(event.event_date) }}
                    </div>
                    <div class="h5 mb-0 fw-bold text-dark" style="line-height: 1.1;">
                      {{ formatEventDay(event.event_date) }}
                    </div>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <h6 class="fw-bold text-dark mb-1 text-truncate" style="font-size: 0.9rem;">{{ event.name }}</h6>
                    <span class="badge rounded-pill bg-soft-info text-info mb-2" style="font-size: 0.65rem;">
                      {{ event.event_type || 'Event' }}
                    </span>
                    <div class="d-flex align-items-center text-muted" style="font-size: 0.75rem;">
                      <i class="bi bi-geo-alt me-1"></i>
                      <span class="text-truncate">{{ event.location || 'TBA' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Menu Grid -->
    <h6 class="text-uppercase text-muted fw-bold small mb-3 ps-1">Menu</h6>
    
    <div class="row g-3">
      <div v-for="item in menuItems" :key="item.path" class="col-6 col-md-4 col-lg-3">
        <router-link :to="item.path" class="text-decoration-none">
          <div class="card h-100 border-0 shadow-sm hover-scale menu-card">
            <div class="card-body text-center py-4 d-flex flex-column align-items-center justify-content-center">
              <div :class="`icon-box mb-3 rounded-circle bg-${item.color}-subtle text-${item.color}`">
                <i :class="`bi ${item.icon} fs-4`"></i>
              </div>
              <h6 class="card-title text-dark mb-0 small fw-semibold">{{ item.label }}</h6>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'

const { user, profile } = useAuth()

const stats = ref({
  athletes: 0,
  trainingNotes: 0,
  reports: 0
})

const loading = ref(true)
const loadingEvents = ref(false)
const coachData = ref(null)
const coachSports = ref([])
const upcomingEvents = ref([])

const menuItems = [
  { label: 'My Athletes', path: '/coach/athletes', icon: 'bi-people', color: 'primary' },
  { label: 'Training Notes', path: '/coach/training-notes', icon: 'bi-journal-check', color: 'success' },
  { label: 'Reports', path: '/coach/reports', icon: 'bi-file-text', color: 'danger' },
  { label: 'Events', path: '/coach/events', icon: 'bi-calendar-event', color: 'info' }
]

const fetchCoachData = async () => {
  try {
    console.log('Fetching coach data for user:', user.value.id)
    
    // Get coach data from coaches table
    const { data: coach, error } = await supabase
      .from('coaches')
      .select('*')
      .eq('user_id', user.value.id)
      .single()
    
    if (error) {
      console.error('Error fetching coach data:', error)
      return null
    }
    
    console.log('Coach data:', coach)
    coachData.value = coach
    
    // Get sports coached by this coach
    if (coach) {
      console.log('Fetching sports for coach_id:', coach.id)
      
      // First, try to count all sports (to check RLS)
      const { count, error: countError } = await supabase
        .from('sports')
        .select('*', { count: 'exact', head: true })
      
      console.log('Total sports count (RLS check):', { count, error: countError })
      
      // Now try the actual query
      const { data: sports, error: sportsError } = await supabase
        .from('sports')
        .select('id, name, coach_id')
        .eq('coach_id', coach.id)
        .order('name')
      
      console.log('Sports query result:', { sports, error: sportsError })
      console.log('Query details - looking for coach_id:', coach.id)
      
      if (!sportsError && sports) {
        coachSports.value = sports
        console.log('Coach sports set to:', sports)
      } else {
        console.log('No sports found or error:', sportsError)
        
        // Try without filter to see all sports (RLS permitting)
        const { data: allSports } = await supabase
          .from('sports')
          .select('id, name, coach_id')
        console.log('All sports (unfiltered):', allSports)
      }
    }
    
    return coach
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

const fetchUpcomingEvents = async () => {
  try {
    loadingEvents.value = true
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(5)
    
    if (error) {
      console.error('Error fetching events:', error)
      return
    }
    
    upcomingEvents.value = data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loadingEvents.value = false
  }
}

const formatEventMonth = (date) => {
  return new Date(date).toLocaleString('default', { month: 'short' })
}

const formatEventDay = (date) => {
  return new Date(date).getDate()
}

const fetchStats = async () => {
  try {
    // Get coach record
    const coach = coachData.value || await fetchCoachData()
    
    if (!coach) {
      loading.value = false
      return
    }
    
    // Get sports coached by this coach
    const { data: sports } = await supabase
      .from('sports')
      .select('id')
      .eq('coach_id', coach.id)
    
    const sportIds = sports?.map(s => s.id) || []
    
    // Count athletes in these sports
    if (sportIds.length > 0) {
      const { count: athletesCount } = await supabase
        .from('athlete_sports')
        .select('*', { count: 'exact', head: true })
        .in('sport_id', sportIds)
      
      stats.value.athletes = athletesCount || 0
    }
    
    // Count training notes
    const { count: notesCount } = await supabase
      .from('training_notes')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', coach.id)
    
    // Count reports
    if (sportIds.length > 0) {
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .in('sport_id', sportIds)
      
      stats.value.reports = reportsCount || 0
    }
    
    stats.value.trainingNotes = notesCount || 0
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchCoachData()
  await Promise.all([fetchStats(), fetchUpcomingEvents()])
})
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #2a5298 100%);
}

.avatar-lg {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.icon-box {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.menu-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-scale:active {
  transform: scale(0.98);
}

.opacity-10 {
  opacity: 0.1;
}

/* Custom colors for backgrounds */
.bg-primary-subtle { background-color: rgba(13, 110, 253, 0.1); }
.bg-secondary-subtle { background-color: rgba(108, 117, 125, 0.1); }
.bg-success-subtle { background-color: rgba(25, 135, 84, 0.1); }
.bg-info-subtle { background-color: rgba(13, 202, 240, 0.1); }
.bg-warning-subtle { background-color: rgba(255, 193, 7, 0.1); }
.bg-danger-subtle { background-color: rgba(220, 53, 69, 0.1); }
.bg-dark-subtle { background-color: rgba(33, 37, 41, 0.1); }
.bg-soft-info { background-color: rgba(13, 202, 240, 0.1); }

/* Events Slider */
.events-slider-container {
  margin: 0 -0.5rem;
}

.events-slider {
  padding: 0 0.5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.events-slider::-webkit-scrollbar {
  height: 6px;
}

.events-slider::-webkit-scrollbar-track {
  background: transparent;
  margin: 0 0.5rem;
}

.events-slider::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.events-slider::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.event-card .card {
  transition: all 0.2s ease;
}

.event-card:hover .card {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.min-w-0 {
  min-width: 0;
}
</style>
