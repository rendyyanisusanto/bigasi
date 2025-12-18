<template>
  <div class="payments-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">Payments</h4>
    </div>
    
    <!-- Actions Bar -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body p-3">
        <div class="row g-2">
          <!-- Search (Filtering by athlete name via JS filter would be ideal, but for now just placeholder or use simple match) -->
          <div class="col-12 col-md">
             <!-- Simplified Search for UI consistency, will filter filteredPayments if implemented -->
            <div class="input-group">
              <span class="input-group-text bg-light border-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control bg-light border-0 shadow-none ps-1" 
                placeholder="Search payments..."
              />
            </div>
          </div>
          
          <!-- Filter -->
          <div class="col-6 col-md-auto" style="min-width: 140px;">
            <select v-model="filterStatus" class="form-select bg-light border-0 shadow-none text-muted fw-medium">
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>
          
          <!-- Add Button -->
          <div class="col-6 col-md-auto">
            <BaseButton variant="primary" class="w-100 fw-medium" @click="showModal = true">
              <i class="bi bi-plus-lg me-2"></i>Add
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Payments List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else-if="filteredPayments.length === 0" class="text-center py-5">
      <i class="bi bi-cash-coin display-1 text-muted opacity-25"></i>
      <p class="mt-3 text-muted">No payments found</p>
    </div>
    
    <div v-else class="row g-3">
      <div v-for="payment in filteredPayments" :key="payment.id" class="col-12 col-md-6 col-xl-4 athlete-card-wrapper">
        <div class="card h-100 border-0 shadow-custom rounded-4 card-hover-effect">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <!-- Icon Section -->
              <div class="flex-shrink-0 position-relative">
                <div class="avatar-md rounded-circle bg-soft-warning text-warning d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm">
                  <i class="bi bi-cash-stack"></i>
                </div>
                <span :class="['status-indicator', payment.status === 'PAID' ? 'bg-success' : 'bg-warning']"></span>
              </div>
              
              <!-- Info Section -->
              <div class="flex-grow-1 ms-3 min-w-0">
                <div class="d-flex justify-content-between align-items-center mb-1">
                   <h6 class="fw-bold mb-0 text-dark text-truncate">{{ getAthleteName(payment.athlete_id) }}</h6>
                   <h6 class="mb-0 fw-bold text-primary small">Rp {{ formatAmount(payment.amount) }}</h6>
                </div>
                <div class="d-flex flex-column gap-1">
                  <small class="text-muted text-truncate">
                    {{ payment.payment_type }} • {{ payment.period }}
                  </small>
                  <span class="badge bg-light text-dark border rounded-pill fw-normal px-2 small align-self-start">
                    {{ payment.status }}
                  </span>
                </div>
              </div>
              
              <!-- Action Section -->
              <div class="flex-shrink-0 ms-2">
                <button class="btn btn-icon btn-light rounded-circle shadow-none" @click="editPayment(payment)">
                   <i class="bi bi-pencil text-muted"></i>
                </button>
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
            <h5 class="modal-title">{{ editMode ? 'Edit' : 'Add' }} Payment</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <BaseInput 
              v-model="form.athlete_id" 
              type="select" 
              label="Athlete"
              :options="athleteOptions"
              required
            />
            <BaseInput v-model="form.payment_type" label="Payment Type" placeholder="e.g., Monthly Fee" required />
            <BaseInput v-model="form.period" label="Period" placeholder="e.g., January 2025" required />
            <BaseInput v-model="form.amount" type="number" label="Amount" required />
            <BaseInput 
              v-model="form.status" 
              type="select" 
              label="Status"
              :options="[
                { value: 'PAID', label: 'Paid' },
                { value: 'UNPAID', label: 'Unpaid' }
              ]"
              required
            />
          </div>
          <div class="modal-footer">
            <BaseButton variant="secondary" @click="closeModal">Cancel</BaseButton>
            <BaseButton variant="primary" :loading="saving" @click="savePayment">
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
import { useAuth } from '../../composables/useAuth'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'

const { user } = useAuth()
const payments = ref([])
const athletes = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editMode = ref(false)
const filterStatus = ref('')

const form = ref({
  id: null,
  athlete_id: '',
  payment_type: '',
  period: '',
  amount: 0,
  status: 'UNPAID'
})

const athleteOptions = computed(() => {
  return athletes.value.map(a => ({ value: a.id, label: `${a.full_name} (${a.athlete_number})` }))
})

const filteredPayments = computed(() => {
  if (!filterStatus.value) return payments.value
  return payments.value.filter(p => p.status === filterStatus.value)
})

const getAthleteName = (athleteId) => {
  const athlete = athletes.value.find(a => a.id === athleteId)
  return athlete ? athlete.full_name : '-'
}

const formatAmount = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const fetchPayments = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false })
    if (error) throw error
    payments.value = data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const fetchAthletes = async () => {
  try {
    const { data, error } = await supabase.from('athletes').select('id, full_name, athlete_number').eq('is_active', true)
    if (error) throw error
    athletes.value = data || []
  } catch (error) {
    console.error('Error:', error)
  }
}

const editPayment = (payment) => {
  form.value = { ...payment }
  editMode.value = true
  showModal.value = true
}

const savePayment = async () => {
  try {
    saving.value = true
    const payload = {
      athlete_id: form.value.athlete_id,
      payment_type: form.value.payment_type,
      period: form.value.period,
      amount: parseFloat(form.value.amount),
      status: form.value.status,
      created_by: user.value.id
    }
    
    if (editMode.value) {
      const { error } = await supabase.from('payments').update(payload).eq('id', form.value.id)
      if (error) throw error
      alert('Payment updated successfully!')
    } else {
      const { error } = await supabase.from('payments').insert(payload)
      if (error) throw error
      alert('Payment created successfully!')
    }
    
    await fetchPayments()
    closeModal()
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to save payment')
  } finally {
    saving.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  editMode.value = false
  form.value = { id: null, athlete_id: '', payment_type: '', period: '', amount: 0, status: 'UNPAID' }
}

onMounted(async () => {
  await Promise.all([fetchPayments(), fetchAthletes()])
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

.bg-soft-warning {
  background-color: rgba(255, 193, 7, 0.1);
}

.status-indicator {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
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
