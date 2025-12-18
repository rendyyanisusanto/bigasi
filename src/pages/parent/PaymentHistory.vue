<template>
  <div class="payment-history-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Payment History</h4>
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

      <!-- Payments List -->
      <div v-if="loadingPayments" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else-if="payments.length === 0" class="text-center py-5">
        <div class="mb-3">
          <div class="avatar-lg rounded-circle bg-soft-warning text-warning d-inline-flex align-items-center justify-content-center p-4">
            <i class="bi bi-wallet2 display-5"></i>
          </div>
        </div>
        <h5 class="fw-bold text-dark">No Payment History</h5>
        <p class="text-muted">There are no payment records for {{ selectedAthlete.full_name }} yet.</p>
      </div>

      <div v-else class="row g-2">
        <div v-for="payment in payments" :key="payment.id" class="col-12">
          <div class="card border-0 shadow-sm rounded-4 card-hover-effect">
            <div class="card-body p-3">
              <div class="d-flex align-items-center gap-3">
                <!-- Left: Status Icon -->
                <div class="flex-shrink-0">
                   <div :class="`avatar-md rounded-circle d-flex align-items-center justify-content-center ${getStatusColor(payment.status)}`">
                    <i :class="`bi ${getStatusIcon(payment.status)} fs-4`"></i>
                  </div>
                </div>

                <!-- Right: Content -->
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <h6 class="fw-bold text-dark mb-0 text-truncate">
                        {{ formatCurrency(payment.amount) }}
                      </h6>
                      <small class="text-muted text-uppercase fw-bold" style="font-size: 0.65rem;">
                        {{ payment.payment_type }}
                      </small>
                    </div>
                    <span :class="`badge rounded-pill flex-shrink-0 ${getStatusBadge(payment.status)}`" style="font-size: 0.7rem;">
                      {{ payment.status }}
                    </span>
                  </div>
                  
                  <div class="d-flex align-items-center text-muted small mt-2">
                    <i class="bi bi-calendar3 me-1"></i>
                    <span class="me-2">{{ payment.payment_period }}</span>
                    <span class="text-muted mx-1">•</span>
                    <span class="text-truncate">{{ new Date(payment.payment_date).toLocaleDateString() }}</span>
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
const payments = ref([])
const loading = ref(true)
const loadingPayments = ref(false)

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

const fetchPayments = async () => {
  if (!selectedAthlete.value) return
  
  try {
    loadingPayments.value = true
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('athlete_id', selectedAthlete.value.id)
      .order('payment_date', { ascending: false })
      
    if (error) throw error
    payments.value = data || []
  } catch (error) {
    console.error('Error fetching payments:', error)
  } finally {
    loadingPayments.value = false
  }
}

const selectAthlete = (athlete) => {
  selectedAthlete.value = athlete
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'bg-soft-success text-success'
    case 'pending': return 'bg-soft-warning text-warning'
    case 'overdue': return 'bg-soft-danger text-danger'
    default: return 'bg-soft-secondary text-secondary'
  }
}

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'bg-soft-success text-success'
    case 'pending': return 'bg-soft-warning text-warning'
    case 'overdue': return 'bg-soft-danger text-danger'
    default: return 'bg-soft-secondary text-secondary'
  }
}

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'bi-check-circle-fill'
    case 'pending': return 'bi-clock-history'
    case 'overdue': return 'bi-exclamation-circle-fill'
    default: return 'bi-circle'
  }
}

watch(selectedAthlete, () => {
  fetchPayments()
})

onMounted(fetchAthletes)
</script>

<style scoped>
.bg-soft-primary { background-color: rgba(13, 110, 253, 0.1); }
.bg-primary-subtle { background-color: rgba(13, 110, 253, 0.1); }
.bg-soft-success { background-color: rgba(25, 135, 84, 0.1); }
.bg-soft-warning { background-color: rgba(255, 193, 7, 0.1); }
.bg-soft-danger { background-color: rgba(220, 53, 69, 0.1); }
.bg-soft-secondary { background-color: rgba(108, 117, 125, 0.1); }

.avatar-md {
  width: 48px;
  height: 48px;
}

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
