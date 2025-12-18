<template>
  <div class="coach-dashboard">
    <h2 class="mb-4">Coach Dashboard</h2>
    
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-4">
        <div class="card stats-card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">My Athletes</p>
                <h3 class="mb-0">{{ stats.athletes }}</h3>
              </div>
              <i class="bi bi-people fs-1 text-primary opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-6 col-md-4">
        <div class="card stats-card secondary">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">Training Notes</p>
                <h3 class="mb-0">{{ stats.trainingNotes }}</h3>
              </div>
              <i class="bi bi-journal-text fs-1 text-secondary opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-6 col-md-4">
        <div class="card stats-card success">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <p class="text-muted mb-1 small">Reports</p>
                <h3 class="mb-0">{{ stats.reports }}</h3>
              </div>
              <i class="bi bi-file-earmark-text fs-1 text-success opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row g-3 mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Quick Actions</h5>
            <div class="row g-2">
              <div class="col-6 col-md-3">
                <router-link to="/coach/training-notes" class="btn btn-outline-primary w-100">
                  <i class="bi bi-plus-circle me-2"></i>Add Training Note
                </router-link>
              </div>
              <div class="col-6 col-md-3">
                <router-link to="/coach/reports" class="btn btn-outline-secondary w-100">
                  <i class="bi bi-plus-circle me-2"></i>Add Report
                </router-link>
              </div>
              <div class="col-6 col-md-3">
                <router-link to="/coach/athletes" class="btn btn-outline-success w-100">
                  <i class="bi bi-people me-2"></i>View Athletes
                </router-link>
              </div>
              <div class="col-6 col-md-3">
                <router-link to="/coach/events" class="btn btn-outline-info w-100">
                  <i class="bi bi-calendar-event me-2"></i>View Events
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row g-3">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-3">Upcoming Events</h5>
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else-if="upcomingEvents.length === 0" class="empty-state">
              <i class="bi bi-calendar-event"></i>
              <p>No upcoming events</p>
            </div>
            <div v-else class="list-group list-group-flush">
              <div v-for="event in upcomingEvents" :key="event.id" class="list-group-item px-0">
                <div class="d-flex align-items-start">
                  <div class="flex-grow-1">
                    <h6 class="mb-1">{{ event.name }}</h6>
                    <small class="text-muted">
                      <i class="bi bi-calendar me-1"></i>{{ formatDate(event.event_date) }}
                    </small>
                    <br>
                    <small class="text-muted">
                      <i class="bi bi-geo-alt me-1"></i>{{ event.location }}
                    </small>
                  </div>
                  <span class="badge bg-info">{{ event.event_type }}</span>
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
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'
import { format } from 'date-fns'

const { user } = useAuth()

const stats = ref({
  athletes: 0,
  trainingNotes: 0,
  reports: 0
})

const upcomingEvents = ref([])
const loading = ref(true)

const formatDate = (date) => {
  if (!date) return '-'
  return format(new Date(date), 'MMM dd, yyyy')
}

const fetchStats = async () => {
  try {
    // Get coach record
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.value.id)
      .single()
    
    if (!coach) return
    
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
    const { count: reportsCount } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .in('sport_id', sportIds)
    
    stats.value.trainingNotes = notesCount || 0
    stats.value.reports = reportsCount || 0
  } catch (error) {
    console.error('Error:', error)
  }
}

const fetchUpcomingEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(5)
    
    if (error) throw error
    upcomingEvents.value = data || []
  } catch (error) {
    console.error('Error:', error)
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchStats(), fetchUpcomingEvents()])
  loading.value = false
})
</script>
