<template>
  <div class="parent-athletes-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-3">
      <div>
        <h4 class="fw-bold mb-0">My Athletes</h4>
        <p class="text-muted small mb-0 mt-1">All athletes linked to your account</p>
      </div>
      <button 
        @click="showLinkModal = true" 
        class="btn btn-primary btn-sm rounded-pill mt-2 mt-md-0"
      >
        <i class="bi bi-plus-circle me-1"></i>
        Link Athlete
      </button>
    </div>
    
    <!-- Link Athlete Modal -->
    <div v-if="showLinkModal" class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Link New Athlete</h5>
            <button type="button" class="btn-close" @click="closeLinkModal"></button>
          </div>
          <div class="modal-body pt-2">
            <p class="text-muted small mb-3">Enter the athlete number to link them to your account</p>
            
            <div v-if="linkError" class="alert alert-danger alert-dismissible fade show" role="alert">
              <i class="bi bi-exclamation-circle me-2"></i>
              {{ linkError }}
              <button type="button" class="btn-close" @click="linkError = ''"></button>
            </div>
            
            <div v-if="linkSuccess" class="alert alert-success alert-dismissible fade show" role="alert">
              <i class="bi bi-check-circle me-2"></i>
              {{ linkSuccess }}
              <button type="button" class="btn-close" @click="linkSuccess = ''"></button>
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-medium">Athlete Number</label>
              <input 
                v-model="athleteNumber" 
                type="text" 
                class="form-control form-control-lg" 
                placeholder="Enter athlete number"
                @keyup.enter="linkAthlete"
                :disabled="linking"
              />
              <div class="form-text">
                <i class="bi bi-info-circle me-1"></i>
                Ask the athlete for their unique athlete number
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light rounded-pill" @click="closeLinkModal" :disabled="linking">
              Cancel
            </button>
            <button type="button" class="btn btn-primary rounded-pill" @click="linkAthlete" :disabled="linking || !athleteNumber">
              <span v-if="linking" class="spinner-border spinner-border-sm me-2"></span>
              {{ linking ? 'Linking...' : 'Link Athlete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-3">Loading athletes...</p>
    </div>
    
    <div v-else-if="athletes.length === 0" class="text-center py-5">
      <div class="empty-state">
        <i class="bi bi-people display-1 text-muted opacity-25"></i>
        <h5 class="mt-4 text-muted">No Athletes Linked</h5>
        <p class="text-muted small">You don't have any athletes linked to your account yet.</p>
      </div>
    </div>
    
    <div v-else>
      <!-- Athletes Grid -->
      <div class="row g-3 g-md-4">
        <div v-for="athlete in athletes" :key="athlete.id" class="col-12 col-sm-6 col-lg-4">
          <div class="card border-0 shadow-sm h-100 hover-card">
            <div class="card-body p-4">
              <!-- Athlete Header -->
              <div class="d-flex align-items-center mb-3">
                <div class="position-relative me-3">
                  <img 
                    v-if="athlete.photo_url" 
                    :src="athlete.photo_url" 
                    class="avatar-md rounded-circle border border-2 border-light shadow-sm object-fit-cover"
                  />
                  <div v-else class="avatar-md bg-gradient-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm">
                    {{ athlete.full_name?.charAt(0) || 'A' }}
                  </div>
                  <span class="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle"></span>
                </div>
                <div class="flex-grow-1 min-w-0">
                  <h6 class="fw-bold mb-0 text-truncate">{{ athlete.full_name }}</h6>
                  <p class="text-muted small mb-0 text-truncate">#{{ athlete.athlete_number }}</p>
                </div>
              </div>
              
              <!-- Athlete Info -->
              <div class="athlete-info">
                <div class="info-item d-flex align-items-center mb-2">
                  <i class="bi bi-book text-primary me-2"></i>
                  <span class="small text-muted">Class:</span>
                  <span class="small fw-medium ms-auto">{{ athlete.class_name || '-' }}</span>
                </div>
                <div class="info-item d-flex align-items-center mb-2">
                  <i class="bi bi-gender-ambiguous text-primary me-2"></i>
                  <span class="small text-muted">Gender:</span>
                  <span class="small fw-medium ms-auto">{{ athlete.gender || '-' }}</span>
                </div>
                <div class="info-item d-flex align-items-center mb-3">
                  <i class="bi bi-calendar-event text-primary me-2"></i>
                  <span class="small text-muted">Birth Date:</span>
                  <span class="small fw-medium ms-auto">{{ formatDate(athlete.birth_date) }}</span>
                </div>
              </div>
              
              <!-- Sports Badges -->
              <div v-if="athleteSports[athlete.id] && athleteSports[athlete.id].length > 0" class="mb-3">
                <div class="small text-muted mb-2 fw-bold text-uppercase" style="font-size: 0.7rem;">Sports:</div>
                <div class="d-flex flex-wrap gap-1">
                  <span 
                    v-for="sport in athleteSports[athlete.id]" 
                    :key="sport.id"
                    class="badge bg-soft-info text-info rounded-pill px-2 py-1"
                    style="font-size: 0.7rem;"
                  >
                    {{ sport.sport_name }}
                  </span>
                </div>
              </div>
              
              <!-- Action Button -->
              <router-link 
                to="/parent/athlete" 
                @click="setSelectedAthlete(athlete)"
                class="btn btn-primary btn-sm w-100 mt-2 rounded-pill"
              >
                <i class="bi bi-eye me-1"></i>
                View Profile
              </router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Summary Card -->
      <div class="card border-0 shadow-sm bg-gradient-light mt-4">
        <div class="card-body p-4 text-center">
          <div class="row g-3">
            <div class="col-6 col-md-3">
              <div class="stat-item">
                <div class="stat-value text-primary fw-bold h4 mb-0">{{ athletes.length }}</div>
                <div class="stat-label text-muted small">Total Athletes</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-item">
                <div class="stat-value text-success fw-bold h4 mb-0">{{ maleCount }}</div>
                <div class="stat-label text-muted small">Male</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-item">
                <div class="stat-value text-warning fw-bold h4 mb-0">{{ femaleCount }}</div>
                <div class="stat-label text-muted small">Female</div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="stat-item">
                <div class="stat-value text-info fw-bold h4 mb-0">{{ totalSports }}</div>
                <div class="stat-label text-muted small">Total Sports</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../composables/useAuth'

const { user } = useAuth()
const athletes = ref([])
const athleteSports = ref({})
const loading = ref(true)
const showLinkModal = ref(false)
const athleteNumber = ref('')
const linking = ref(false)
const linkError = ref('')
const linkSuccess = ref('')

const fetchAthletes = async () => {
  try {
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .eq('parent_user_id', user.value.id)
      .order('full_name', { ascending: true })
    
    if (error) throw error
    
    athletes.value = data || []
    
    // Fetch sports for each athlete
    if (athletes.value.length > 0) {
      await fetchAthleteSports()
    }
  } catch (error) {
    console.error('Error fetching athletes:', error)
  } finally {
    loading.value = false
  }
}

const fetchAthleteSports = async () => {
  try {
    const athleteIds = athletes.value.map(a => a.id)
    
    const { data, error } = await supabase
      .from('athlete_sports')
      .select(`
        athlete_id,
        sports (
          id,
          name
        )
      `)
      .in('athlete_id', athleteIds)
    
    if (error) throw error
    
    // Organize sports by athlete_id
    const sportsMap = {}
    data.forEach(item => {
      if (!sportsMap[item.athlete_id]) {
        sportsMap[item.athlete_id] = []
      }
      if (item.sports) {
        sportsMap[item.athlete_id].push({
          id: item.sports.id,
          sport_name: item.sports.name
        })
      }
    })
    
    athleteSports.value = sportsMap
  } catch (error) {
    console.error('Error fetching athlete sports:', error)
  }
}

const linkAthlete = async () => {
  if (!athleteNumber.value.trim()) {
    linkError.value = 'Please enter an athlete number'
    return
  }

  linking.value = true
  linkError.value = ''
  linkSuccess.value = ''

  try {
    // Find athlete by athlete_number
    const { data: athlete, error: findError } = await supabase
      .from('athletes')
      .select('*')
      .eq('athlete_number', athleteNumber.value.trim())
      .single()

    if (findError || !athlete) {
      linkError.value = 'Athlete not found. Please check the athlete number.'
      return
    }

    // Check if already linked to another parent
    if (athlete.parent_user_id && athlete.parent_user_id !== user.value.id) {
      linkError.value = 'This athlete is already linked to another parent account.'
      return
    }

    // Check if already linked to this parent
    if (athlete.parent_user_id === user.value.id) {
      linkError.value = 'This athlete is already linked to your account.'
      return
    }

    // Link the athlete to this parent
    const { error: updateError } = await supabase
      .from('athletes')
      .update({ parent_user_id: user.value.id })
      .eq('id', athlete.id)

    if (updateError) throw updateError

    linkSuccess.value = `Successfully linked ${athlete.full_name}!`
    athleteNumber.value = ''
    
    // Refresh athletes list
    setTimeout(async () => {
      await fetchAthletes()
      setTimeout(() => {
        closeLinkModal()
      }, 1500)
    }, 1000)
  } catch (error) {
    console.error('Error linking athlete:', error)
    linkError.value = 'An error occurred while linking the athlete. Please try again.'
  } finally {
    linking.value = false
  }
}

const closeLinkModal = () => {
  showLinkModal.value = false
  athleteNumber.value = ''
  linkError.value = ''
  linkSuccess.value = ''
}

const setSelectedAthlete = (athlete) => {
  // Store selected athlete in localStorage for AthleteProfile page
  localStorage.setItem('selectedAthleteId', athlete.id)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Computed statistics
const maleCount = computed(() => {
  return athletes.value.filter(a => a.gender === 'Male').length
})

const femaleCount = computed(() => {
  return athletes.value.filter(a => a.gender === 'Female').length
})

const totalSports = computed(() => {
  const uniqueSports = new Set()
  Object.values(athleteSports.value).forEach(sports => {
    sports.forEach(sport => uniqueSports.add(sport.id))
  })
  return uniqueSports.size
})

onMounted(fetchAthletes)
</script>

<style scoped>
.avatar-md {
  width: 56px;
  height: 56px;
  font-size: 1.25rem;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #2a5298 100%);
}

.bg-gradient-light {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.hover-card {
  transition: all 0.3s ease;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
}

.min-w-0 {
  min-width: 0;
}

.info-item {
  padding: 0.25rem 0;
}

.bg-soft-info {
  background-color: rgba(13, 202, 240, 0.1);
}

.empty-state {
  padding: 2rem 1rem;
}

/* Mobile optimizations */
@media (max-width: 576px) {
  .parent-athletes-page {
    padding-bottom: 80px; /* Space for bottom nav */
  }
  
  .card-body {
    padding: 1rem !important;
  }
  
  .avatar-md {
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
}

/* Ensure smooth transitions */
.card {
  will-change: transform;
}
</style>
