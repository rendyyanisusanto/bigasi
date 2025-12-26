<template>
  <div class="my-athletes-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">My Athletes</h4>
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
                v-model="searchQuery" 
                type="text" 
                class="form-control bg-light border-0 shadow-none ps-1" 
                placeholder="Search by name, number..."
              />
            </div>
          </div>
          
          <!-- Filter by Status -->
          <div class="col-6 col-md-auto" style="min-width: 140px;">
            <select v-model="filterStatus" class="form-select bg-light border-0 shadow-none text-muted fw-medium">
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
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
        </div>
      </div>
    </div>
    
    <!-- Athletes List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <div v-else-if="filteredAthletes.length === 0" class="text-center py-5">
      <i class="bi bi-people display-1 text-muted opacity-25"></i>
      <p class="mt-3 text-muted">No athletes found</p>
    </div>
    
    <div v-else class="row g-3">
      <div v-for="athlete in filteredAthletes" :key="athlete.id" class="col-12 col-md-6 col-xl-4">
        <div class="card h-100 border-0 shadow-custom rounded-4 card-hover-effect">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <!-- Avatar Section -->
              <div class="flex-shrink-0 position-relative">
                <img 
                  v-if="athlete.photo_url" 
                  :src="athlete.photo_url" 
                  :alt="athlete.full_name"
                  class="avatar-md rounded-circle object-fit-cover shadow-sm"
                />
                <div v-else class="avatar-md rounded-circle bg-soft-primary text-primary d-flex align-items-center justify-content-center fw-bold fs-5 shadow-sm">
                  {{ athlete.full_name.charAt(0) }}
                </div>
                <span :class="['status-indicator', athlete.is_active ? 'bg-success' : 'bg-secondary']"></span>
              </div>
              
              <!-- Info Section -->
              <div class="flex-grow-1 ms-3 min-w-0">
                <h6 class="fw-bold mb-1 text-dark text-truncate">{{ athlete.full_name }}</h6>
                <div class="d-flex align-items-center flex-wrap gap-2 mb-1">
                  <span class="badge bg-light text-secondary border rounded-pill fw-normal px-2">
                    #{{ athlete.athlete_number }}
                  </span>
                  <small class="text-muted text-truncate" v-if="athlete.class_name">
                    {{ athlete.class_name }}
                  </small>
                </div>
                <!-- Sports Badges -->
                <div class="d-flex flex-wrap gap-1 mt-1">
                  <span 
                    v-for="sport in getAthleteSports(athlete.id)" 
                    :key="sport.id"
                    class="badge bg-primary-subtle text-primary"
                    style="font-size: 0.65rem;"
                  >
                    <i class="bi bi-trophy me-1"></i>{{ sport.name }}
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
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'

const { user } = useAuth()

const loading = ref(true)
const athletes = ref([])
const coachSports = ref([])
const athleteSports = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterSport = ref('')

const fetchMyAthletes = async () => {
  try {
    loading.value = true
    
    // 1. Get coach record
    const { data: coach, error: coachError } = await supabase
      .from('coaches')
      .select('id')
      .eq('user_id', user.value.id)
      .single()
    
    if (coachError || !coach) {
      console.error('Coach not found:', coachError)
      loading.value = false
      return
    }
    
    // 2. Get sports coached by this coach
    const { data: sports, error: sportsError } = await supabase
      .from('sports')
      .select('id, name')
      .eq('coach_id', coach.id)
      .order('name')
    
    if (sportsError) {
      console.error('Error fetching sports:', sportsError)
      loading.value = false
      return
    }
    
    coachSports.value = sports || []
    const sportIds = sports?.map(s => s.id) || []
    
    if (sportIds.length === 0) {
      loading.value = false
      return
    }
    
    // 3. Get athlete_sports for these sports
    const { data: athleteSportsData, error: asError } = await supabase
      .from('athlete_sports')
      .select('athlete_id, sport_id')
      .in('sport_id', sportIds)
    
    if (asError) {
      console.error('Error fetching athlete_sports:', asError)
    }
    
    athleteSports.value = athleteSportsData || []
    
    // 4. Get unique athlete IDs
    const athleteIds = [...new Set(athleteSportsData?.map(as => as.athlete_id) || [])]
    
    if (athleteIds.length === 0) {
      loading.value = false
      return
    }
    
    // 5. Get athletes
    const { data: athletesData, error: athletesError } = await supabase
      .from('athletes')
      .select('*')
      .in('id', athleteIds)
      .order('full_name')
    
    if (athletesError) {
      console.error('Error fetching athletes:', athletesError)
    }
    
    athletes.value = athletesData || []
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const getAthleteSports = (athleteId) => {
  const sportIds = athleteSports.value
    .filter(as => as.athlete_id === athleteId)
    .map(as => as.sport_id)
  return coachSports.value.filter(s => sportIds.includes(s.id))
}

const filteredAthletes = computed(() => {
  let result = athletes.value
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a => 
      a.full_name.toLowerCase().includes(query) ||
      a.athlete_number.toLowerCase().includes(query) ||
      (a.class_name && a.class_name.toLowerCase().includes(query))
    )
  }
  
  // Filter by status
  if (filterStatus.value !== '') {
    const isActive = filterStatus.value === 'true'
    result = result.filter(a => a.is_active === isActive)
  }
  
  // Filter by sport
  if (filterSport.value) {
    const athleteIdsInSport = athleteSports.value
      .filter(as => as.sport_id === filterSport.value)
      .map(as => as.athlete_id)
    result = result.filter(a => athleteIdsInSport.includes(a.id))
  }
  
  return result
})

onMounted(fetchMyAthletes)
</script>

<style scoped>
.avatar-md {
  width: 50px;
  height: 50px;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
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

.bg-soft-primary {
  background-color: rgba(13, 110, 253, 0.1);
}

.text-truncate {
  max-width: 100%;
}

.bg-primary-subtle {
  background-color: rgba(13, 110, 253, 0.1);
}
</style>
