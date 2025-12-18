<template>
  <div class="parent-dashboard">
    <!-- Account/Athlete Card -->
    <div class="card border-0 shadow-sm bg-gradient-primary text-white mb-4 overflow-hidden position-relative">
      <div class="card-body p-4 position-relative z-1">
        <div v-if="loading" class="text-center py-3">
          <div class="spinner-border text-white" role="status"></div>
        </div>
        
        <div v-else class="d-flex align-items-center">
          <!-- Avatar -->
          <div class="position-relative me-3">
            <img 
              v-if="selectedAthlete?.photo_url" 
              :src="selectedAthlete.photo_url" 
              class="avatar-lg rounded-circle border border-2 border-white shadow-sm object-fit-cover"
            />
            <div v-else class="avatar-lg bg-white text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm">
              {{ (selectedAthlete?.full_name || user?.user_metadata?.full_name || 'P').charAt(0) }}
            </div>
            <!-- Multi-athlete indicator -->
            <span v-if="athletes.length > 1" class="position-absolute bottom-0 end-0 p-1 bg-warning border border-2 border-white rounded-circle"></span>
          </div>
          
          <!-- Info -->
          <div class="flex-grow-1 min-w-0">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h5 class="mb-0 fw-bold text-truncate">{{ selectedAthlete?.full_name || user?.user_metadata?.full_name || 'Parent' }}</h5>
                <p class="mb-0 text-white-50 small text-truncate">
                  {{ selectedAthlete ? `${selectedAthlete.class_name || 'Athlete'} • #${selectedAthlete.athlete_number}` : 'No Athlete Linked' }}
                </p>
              </div>
              
              <!-- Athlete Switcher (only if multiple) -->
              <div v-if="athletes.length > 1" class="dropdown">
                <button class="btn btn-sm btn-white-soft rounded-pill ps-3 pe-2 py-1 d-flex align-items-center" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <span class="small fw-bold me-2">Switch</span>
                  <i class="bi bi-chevron-down small"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg animate slideIn">
                  <li v-for="athlete in athletes" :key="athlete.id">
                    <button 
                      class="dropdown-item d-flex align-items-center py-2" 
                      @click="selectAthlete(athlete)"
                      :class="{ 'active': selectedAthlete?.id === athlete.id }"
                    >
                      <div class="avatar-sm rounded-circle bg-light text-primary d-flex align-items-center justify-content-center fw-bold me-2" style="width: 32px; height: 32px;">
                         <img v-if="athlete.photo_url" :src="athlete.photo_url" class="w-100 h-100 rounded-circle object-fit-cover">
                         <span v-else>{{ athlete.full_name.charAt(0) }}</span>
                      </div>
                      <div>
                        <div class="fw-bold small">{{ athlete.full_name }}</div>
                        <div class="text-muted x-small" style="font-size: 0.75rem;">{{ athlete.class_name }}</div>
                      </div>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Decorative circles -->
      <div class="position-absolute top-0 end-0 p-5 rounded-circle bg-white opacity-10 mt-n4 me-n4"></div>
      <div class="position-absolute bottom-0 start-0 p-4 rounded-circle bg-white opacity-10 mb-n3 ms-n3"></div>
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
import { ref, onMounted, watch } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'

const { user } = useAuth()
const athletes = ref([])
const selectedAthlete = ref(null)
const loading = ref(true)

const menuItems = [
  { label: 'My Athlete', path: '/parent/athlete', icon: 'bi-person-badge', color: 'primary' },
  { label: 'Training', path: '/parent/training-notes', icon: 'bi-journal-check', color: 'success' },
  { label: 'Reports', path: '/parent/reports', icon: 'bi-file-text', color: 'danger' },
  { label: 'Payments', path: '/parent/payments', icon: 'bi-wallet2', color: 'warning' },
  { label: 'Events', path: '/parent/events', icon: 'bi-calendar-event', color: 'info' }
]

const fetchAthletes = async () => {
  try {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('parent_user_id', user.value.id)
    
    if (error) throw error
    
    athletes.value = data || []
    
    // Select first athlete by default if none selected
    if (athletes.value.length > 0 && !selectedAthlete.value) {
      selectedAthlete.value = athletes.value[0]
    }
  } catch (error) {
    console.error('Error fetching athletes:', error)
  } finally {
    loading.value = false
  }
}

const selectAthlete = (athlete) => {
  selectedAthlete.value = athlete
  // Ideally, save this preference or emit an event
  // For now, it just updates the local view context
}

// Watch for selection change to potentially update other components or fetches if we had them on dashboard
// (Currently dashboard menu links are static, but if widgets were here, we'd refetch)

onMounted(fetchAthletes)
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #2a5298 100%);
}

.bg-white-soft {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.bg-white-soft:hover {
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
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

/* Ensure card content with dropdown is above decorative circles */
.card-body.z-1:has(.dropdown-menu.show) {
  z-index: 10 !important;
}

/* Ensure the card itself is above others when dropdown is open */
.card:has(.dropdown-menu.show) {
  z-index: 100 !important;
  overflow: visible !important; /* Allow dropdown to overflow card */
}

/* Override overflow-hidden only when needed or remove it if safe */
.overflow-hidden:has(.dropdown-menu.show) {
  overflow: visible !important;
}
</style>
