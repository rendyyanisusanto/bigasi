<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow-sm">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <AppLogo size="sm" />
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        @click="toggleMenu"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" :class="{ 'show': showMenu }">
        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li v-if="profile" class="nav-item dropdown">
            <a 
              class="nav-link dropdown-toggle d-flex align-items-center" 
              href="#" 
              role="button" 
              @click.prevent="toggleUserMenu"
            >
              <div class="user-avatar me-2">
                <img 
                  v-if="profile.photo_url" 
                  :src="profile.photo_url" 
                  :alt="profile.full_name"
                  class="rounded-circle"
                  width="32"
                  height="32"
                />
                <div v-else class="avatar-placeholder">
                  {{ profile.full_name.charAt(0).toUpperCase() }}
                </div>
              </div>
              <span>{{ profile.full_name }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" :class="{ 'show': showUserMenu }">
              <li><span class="dropdown-item-text small text-muted">{{ profile.role }}</span></li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i>Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import AppLogo from '../common/AppLogo.vue'

const router = useRouter()
const { profile, logout } = useAuth()

const showMenu = ref(false)
const showUserMenu = ref(false)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

// Close menus when clicking outside
if (typeof window !== 'undefined') {
  window.addEventListener('click', (e) => {
    if (e.target && e.target.closest && !e.target.closest('.navbar')) {
      showMenu.value = false
      showUserMenu.value = false
    }
  })
}
</script>

<style scoped>
.navbar {
  background-color: var(--primary-color) !important;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
</style>
