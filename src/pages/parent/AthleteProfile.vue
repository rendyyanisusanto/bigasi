<template>
  <div class="athlete-profile-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">My Athlete</h4>
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
            <button class="btn btn-light bg-light-subtle border-0 rounded-pill ps-3 pe-2 fw-medium d-flex align-items-center text-dark" type="button" data-bs-toggle="dropdown">
              {{ selectedAthlete.full_name }}
              <i class="bi bi-chevron-down ms-2 small"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end border-0 shadow-lg p-2 rounded-4" style="min-width: 250px;">
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

      <!-- Profile Card -->
      <div class="card border-0 shadow-custom rounded-4 overflow-hidden mb-4">
        <!-- Cover / Header Background -->
        <div class="bg-gradient-primary h-px-150 position-relative">
          <div class="position-absolute top-0 end-0 p-5 rounded-circle bg-white opacity-10 mt-n4 me-n4"></div>
          <div class="position-absolute bottom-0 start-0 p-4 rounded-circle bg-white opacity-10 mb-n3 ms-n3"></div>
        </div>
        
        <div class="card-body pt-0 px-4 pb-4 mt-n5">
          <div class="d-flex flex-column align-items-center text-center">
            <!-- Avatar -->
            <div class="position-relative mb-3">
              <img 
                v-if="selectedAthlete.photo_url" 
                :src="selectedAthlete.photo_url" 
                class="avatar-xl rounded-circle border border-4 border-white shadow bg-white object-fit-cover"
              />
              <div v-else class="avatar-xl rounded-circle bg-primary text-white border border-4 border-white shadow d-flex align-items-center justify-content-center fw-bold display-4">
                {{ selectedAthlete.full_name.charAt(0) }}
              </div>
              <span class="position-absolute bottom-0 end-0 p-2 bg-success border border-4 border-white rounded-circle indicator-lg"></span>
            </div>
            
            <h3 class="fw-bold mb-1">{{ selectedAthlete.full_name }}</h3>
            <p class="text-muted mb-3">{{ selectedAthlete.class_name }} • {{ selectedAthlete.athlete_number }}</p>
            
            <div class="d-flex gap-2 mb-4">
              <span class="badge bg-soft-primary text-primary rounded-pill px-3 py-2 fw-normal">
                <i class="bi bi-geo-alt me-1"></i>Active Student
              </span>
              <span class="badge bg-soft-warning text-warning rounded-pill px-3 py-2 fw-normal">
                <i class="bi bi-star me-1"></i>{{ selectedAthlete.gender === 'Female' ? 'Female' : 'Male' }}
              </span>
            </div>
            
            <!-- Stats/Info Grid -->
            <div class="row g-3 w-100 mt-2">
              <div class="col-6 col-md-3">
                <div class="p-3 bg-light rounded-4 text-center h-100">
                  <div class="text-muted small mb-1">Gender</div>
                  <div class="fw-bold text-dark">{{ selectedAthlete.gender || '-' }}</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-3 bg-light rounded-4 text-center h-100">
                  <div class="text-muted small mb-1">Class</div>
                  <div class="fw-bold text-dark">{{ selectedAthlete.class_name || '-' }}</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                <div class="p-3 bg-light rounded-4 text-center h-100">
                   <div class="text-muted small mb-1">Athlete No</div>
                   <div class="fw-bold text-dark">{{ selectedAthlete.athlete_number || '-' }}</div>
                </div>
              </div>
              <div class="col-6 col-md-3">
                 <div class="p-3 bg-light rounded-4 text-center h-100">
                   <div class="text-muted small mb-1">Status</div>
                   <div class="fw-bold text-success">Active</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional Sections could go here (e.g., Assigned Sports) -->
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
  selectedAthlete.value = athlete
}

onMounted(fetchAthletes)
</script>

<style scoped>
.h-px-150 {
  height: 150px;
}

.avatar-xl {
  width: 120px;
  height: 120px;
}

.indicator-lg {
  width: 24px;
  height: 24px;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #2a5298 100%);
}

.shadow-custom {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.opacity-10 {
  opacity: 0.1;
}

.bg-soft-primary { background-color: rgba(13, 110, 253, 0.1); }
.bg-soft-warning { background-color: rgba(255, 193, 7, 0.1); }

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
