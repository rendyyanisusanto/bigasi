<template>
  <div class="events-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Upcoming Events</h4>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="events.length === 0" class="text-center py-5">
      <div class="mb-3">
        <div class="avatar-lg rounded-circle bg-soft-info text-info d-inline-flex align-items-center justify-content-center p-4">
          <i class="bi bi-calendar-x display-5"></i>
        </div>
      </div>
      <h5 class="fw-bold text-dark">No Upcoming Events</h5>
      <p class="text-muted">There are no upcoming events scheduled at this time.</p>
    </div>

    <!-- Events List -->
    <div v-else class="row g-3">
      <div v-for="event in events" :key="event.id" class="col-12">
        <div class="card border-0 shadow-sm rounded-4 card-hover-effect">
          <div class="card-body p-3">
            <div class="d-flex align-items-start gap-3">
              <!-- Left: Compact Date -->
              <div class="flex-shrink-0 text-center bg-light rounded-3 p-2 border" style="min-width: 65px;">
                <div class="small fw-bold text-uppercase text-info mb-0" style="font-size: 0.7rem; line-height: 1;">
                  {{ formatMonth(event.event_date) }}
                </div>
                <div class="h4 mb-0 fw-bold text-dark" style="line-height: 1.1;">
                  {{ formatDay(event.event_date) }}
                </div>
                <div class="x-small text-muted" style="font-size: 0.7rem; line-height: 1;">
                  {{ formatYear(event.event_date) }}
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
                
                <div class="d-flex align-items-center text-muted small mt-2 mb-2">
                  <i class="bi bi-geo-alt me-1"></i>
                  <span class="text-truncate">{{ event.location || 'TBA' }}</span>
                </div>
                
                <div v-if="event.description" class="text-muted small" style="line-height: 1.5;">
                  {{ event.description }}
                </div>

                <div v-if="event.sport_id" class="mt-2">
                  <span class="badge bg-primary-subtle text-primary" style="font-size: 0.7rem;">
                    <i class="bi bi-trophy me-1"></i>{{ getSportName(event.sport_id) }}
                  </span>
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

const loading = ref(true)
const events = ref([])
const sports = ref([])

const fetchEvents = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      
    if (error) throw error
    events.value = data || []
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loading.value = false
  }
}

const fetchSports = async () => {
  try {
    const { data, error } = await supabase
      .from('sports')
      .select('id, name')
    
    if (error) throw error
    sports.value = data || []
  } catch (error) {
    console.error('Error fetching sports:', error)
  }
}

const getSportName = (sportId) => {
  const sport = sports.value.find(s => s.id === sportId)
  return sport ? sport.name : 'General'
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

onMounted(async () => {
  await fetchSports()
  await fetchEvents()
})
</script>

<style scoped>
.bg-soft-info {
  background-color: rgba(13, 202, 240, 0.1);
}

.bg-primary-subtle {
  background-color: rgba(13, 110, 253, 0.1);
}

.card-hover-effect {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05) !important;
}

.avatar-lg {
  width: 80px;
  height: 80px;
}

.min-w-0 {
  min-width: 0;
}

.text-break {
  word-break: break-word;
}
</style>
