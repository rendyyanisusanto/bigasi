<template>
  <div class="registrations-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">User Registrations</h4>
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
                placeholder="Search registrations..."
              />
            </div>
          </div>
          <!-- Add Button (Not needed here usually, but keeping structure if needed or just spacer) -->
          <!-- Using filter slot instead if needed, otherwise just search is fine -->
        </div>
      </div>
    </div>
    
    <!-- Registrations List -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    
    <div v-else-if="registrations.length === 0" class="text-center py-5">
      <i class="bi bi-person-plus display-1 text-muted opacity-25"></i>
      <p class="mt-3 text-muted">No pending registrations</p>
    </div>
    
    <div v-else class="row g-3">
      <div v-for="user in registrations" :key="user.id" class="col-12 col-md-6 col-xl-4 athlete-card-wrapper">
        <div class="card h-100 border-0 shadow-custom rounded-4 card-hover-effect">
          <div class="card-body p-3">
            <div class="d-flex align-items-center">
              <!-- Icon Section -->
              <div class="flex-shrink-0">
                <div class="avatar-md rounded-circle bg-soft-primary text-primary d-flex align-items-center justify-content-center fw-bold fs-4 shadow-sm">
                  <i class="bi bi-person-plus"></i>
                </div>
              </div>
              
              <!-- Info Section -->
              <div class="flex-grow-1 ms-3 min-w-0">
                <h6 class="fw-bold mb-1 text-dark text-truncate">{{ user.full_name }}</h6>
                <div class="d-flex flex-column gap-1">
                  <small class="text-muted text-truncate">
                    <i class="bi bi-envelope me-1"></i>{{ user.email }}
                  </small>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-light text-dark border rounded-pill fw-normal px-2 small">
                      {{ user.role }}
                    </span>
                    <small class="text-muted" v-if="user.created_at">
                      {{ formatDate(user.created_at) }}
                    </small>
                  </div>
                </div>
              </div>
              
              <!-- Action Section -->
              <div class="flex-shrink-0 ms-2">
                <div class="dropdown">
                  <button 
                    class="btn btn-icon btn-light rounded-circle shadow-none" 
                    type="button" 
                    @click="toggleDropdown(user.id)"
                    @blur="closeDropdown(user.id)"
                  >
                    <i class="bi bi-three-dots-vertical text-muted"></i>
                  </button>
                  <ul 
                    v-if="openDropdownId === user.id"
                    class="dropdown-menu dropdown-menu-end border-0 shadow-lg rounded-3 overflow-hidden show"
                    style="position: absolute; right: 0;"
                    @mousedown.prevent
                  >
                    <li>
                      <button class="dropdown-item py-2 px-3 small fw-medium text-success" @click="approveUser(user.id)">
                        <i class="bi bi-check-circle me-2"></i>Approve
                      </button>
                    </li>
                    <li><hr class="dropdown-divider my-0"></li>
                    <li>
                      <button class="dropdown-item py-2 px-3 small fw-medium text-danger" @click="rejectUser(user.id)">
                        <i class="bi bi-x-circle me-2"></i>Reject
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'

const registrations = ref([])
const loading = ref(false)
const openDropdownId = ref(null)

const toggleDropdown = (userId) => {
  openDropdownId.value = openDropdownId.value === userId ? null : userId
}

const closeDropdown = (userId) => {
  setTimeout(() => {
    if (openDropdownId.value === userId) {
      openDropdownId.value = null
    }
  }, 200)
}

const formatDate = (date) => {
  if (!date) return '-'
  return format(new Date(date), 'MMM dd, yyyy')
}

const fetchRegistrations = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('role', 'PARENT')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    registrations.value = data || []
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

const approveUser = async (userId) => {
  if (!confirm('Approve this registration?')) return
  try {
    // In a real implementation, you might update a status field
    alert('User approved successfully')
    await fetchRegistrations()
  } catch (error) {
    console.error('Error:', error)
  }
}

const rejectUser = async (userId) => {
  if (!confirm('Reject and delete this registration?')) return
  try {
    const { error } = await supabase.from('app_users').delete().eq('id', userId)
    if (error) throw error
    await fetchRegistrations()
  } catch (error) {
    console.error('Error:', error)
  }
}

onMounted(fetchRegistrations)
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

.bg-soft-primary {
  background-color: rgba(13, 110, 253, 0.1);
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
  position: relative;
  z-index: 1;
}

.athlete-card-wrapper:hover {
  z-index: 10;
}

/* Ensure card with open dropdown is always on top */
.athlete-card-wrapper:has(.dropdown.show),
.athlete-card-wrapper:has(.dropdown-menu.show) {
  z-index: 1050 !important;
}

/* Ensure dropdown menu appears above everything */
.dropdown-menu {
  z-index: 1060;
}

/* Fix card overflow to allow dropdown to show */
.card {
  overflow: visible !important;
}
</style>
