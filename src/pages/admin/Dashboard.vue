<template>
  <div class="admin-dashboard">
    <!-- Account Card -->
    <div class="card border-0 shadow-sm bg-gradient-primary text-white mb-4 overflow-hidden position-relative">
      <div class="card-body p-4 position-relative z-1">
        <div class="d-flex align-items-center">
          <div class="avatar-lg bg-white text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm me-3">
            {{ userInitial }}
          </div>
          <div>
            <h5 class="mb-0 fw-bold">{{ profile?.full_name || 'Admin' }}</h5>
            <p class="mb-0 text-white-50 small">{{ userRole }}</p>
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
import { computed } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { profile, user } = useAuth()

const userInitial = computed(() => {
  if (profile.value?.full_name) {
    return profile.value.full_name.charAt(0).toUpperCase()
  }
  return 'A'
})

const userRole = computed(() => {
  if (profile.value?.role) {
    return profile.value.role.charAt(0).toUpperCase() + profile.value.role.slice(1)
  }
  return 'Administrator'
})

const menuItems = [
  { label: 'Athletes', path: '/admin/athletes', icon: 'bi-people', color: 'primary' },
  { label: 'Coaches', path: '/admin/coaches', icon: 'bi-person-badge', color: 'secondary' },
  { label: 'Sports', path: '/admin/sports', icon: 'bi-trophy', color: 'success' },
  { label: 'Events', path: '/admin/events', icon: 'bi-calendar-event', color: 'info' },
  { label: 'Payments', path: '/admin/payments', icon: 'bi-credit-card', color: 'warning' },
  { label: 'Registrations', path: '/admin/registrations', icon: 'bi-person-plus', color: 'danger' },
  { label: 'Settings', path: '/admin/settings', icon: 'bi-gear', color: 'dark' }
]
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, var(--bs-primary) 0%, #2a5298 100%);
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
</style>
