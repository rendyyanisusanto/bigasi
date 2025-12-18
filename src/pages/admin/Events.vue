<template>
  <div class="events-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Events</h4>
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
                placeholder="Search events..."
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
    
    <!-- Events List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else-if="events.length === 0" class="text-center py-5">
      <i class="bi bi-calendar-event display-1 text-muted opacity-25"></i>
      <p class="mt-3 text-muted">No events found</p>
    </div>
    
    <div v-else class="row g-3">
      <div v-for="event in events" :key="event.id" class="col-12 col-md-6 col-xl-4 athlete-card-wrapper">
        <div class="card h-100 border-0 shadow-custom rounded-4 card-hover-effect">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <!-- Icon Section -->
              <div class="flex-shrink-0">
                <div class="avatar-md rounded-circle bg-soft-info text-info d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm">
                  <i class="bi bi-calendar-check"></i>
                </div>
              </div>
              
              <!-- Info Section -->
              <div class="flex-grow-1 ms-3 min-w-0">
                <h6 class="fw-bold mb-1 text-dark text-truncate">{{ event.name }}</h6>
                <div class="d-flex flex-column gap-1">
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-light text-dark border rounded-pill fw-normal px-2 small">
                      {{ event.event_type || 'Event' }}
                    </span>
                  </div>
                  <small class="text-muted text-truncate" v-if="event.event_date">
                    <i class="bi bi-calendar me-1"></i>{{ formatDate(event.event_date) }}
                  </small>
                  <small class="text-muted text-truncate" v-if="event.location">
                    <i class="bi bi-geo-alt me-1"></i>{{ event.location }}
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
                      <button class="dropdown-item py-2 px-3 small fw-medium" @click="editEvent(event)">
                        <i class="bi bi-pencil me-2 text-primary"></i>Edit Details
                      </button>
                    </li>
                    <li><hr class="dropdown-divider my-0"></li>
                    <li>
                      <button class="dropdown-item py-2 px-3 small fw-medium text-danger" @click="deleteEvent(event.id)">
                        <i class="bi bi-trash me-2"></i>Delete Event
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
            <h5 class="modal-title">{{ editMode ? 'Edit' : 'Add' }} Event</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <BaseInput v-model="form.name" label="Event Name" required />
            <BaseInput v-model="form.event_type" label="Event Type" placeholder="e.g., Competition, Training Camp" required />
            <BaseInput v-model="form.event_date" type="date" label="Event Date" required />
            <BaseInput v-model="form.location" label="Location" required />
            <BaseInput 
              v-model="form.sport_id" 
              type="select" 
              label="Sport"
              :options="sportOptions"
            />
            <BaseInput v-model="form.description" type="textarea" label="Description" />
          </div>
          <div class="modal-footer">
            <BaseButton variant="secondary" @click="closeModal">Cancel</BaseButton>
            <BaseButton variant="primary" :loading="saving" @click="saveEvent">
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
import { format } from 'date-fns'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const events = ref([])
const sports = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editMode = ref(false)

const form = ref({
  id: null,
  name: '',
  event_type: '',
  event_date: '',
  location: '',
  sport_id: '',
  description: ''
})

const sportOptions = computed(() => {
  return sports.value.map(s => ({ value: s.id, label: s.name }))
})

const formatDate = (date) => {
  if (!date) return '-'
  return format(new Date(date), 'MMM dd, yyyy')
}

const fetchEvents = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: false })
    if (error) throw error
    events.value = data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const fetchSports = async () => {
  try {
    const { data, error } = await supabase.from('sports').select('id, name')
    if (error) throw error
    sports.value = data || []
  } catch (error) {
    console.error('Error:', error)
  }
}

const editEvent = (event) => {
  form.value = { ...event }
  editMode.value = true
  showModal.value = true
}

const saveEvent = async () => {
  try {
    saving.value = true
    const payload = {
      name: form.value.name,
      event_type: form.value.event_type,
      event_date: form.value.event_date,
      location: form.value.location,
      sport_id: form.value.sport_id || null,
      description: form.value.description
    }
    
    if (editMode.value) {
      const { error } = await supabase.from('events').update(payload).eq('id', form.value.id)
      if (error) throw error
      alert('Event updated successfully!')
    } else {
      const { error } = await supabase.from('events').insert(payload)
      if (error) throw error
      alert('Event created successfully!')
    }
    
    await fetchEvents()
    closeModal()
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to save event')
  } finally {
    saving.value = false
  }
}

const deleteEvent = async (id) => {
  if (!confirm('Delete this event?')) return
  try {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) throw error
    await fetchEvents()
  } catch (error) {
    console.error('Error:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editMode.value = false
  form.value = { id: null, name: '', event_type: '', event_date: '', location: '', sport_id: '', description: '' }
}

onMounted(async () => {
  await Promise.all([fetchEvents(), fetchSports()])
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

.bg-soft-info {
  background-color: rgba(13, 202, 240, 0.1);
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
