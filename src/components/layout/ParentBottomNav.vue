<template>
  <div class="parent-bottom-nav fixed-bottom bg-white border-top shadow-lg pb-safe">
    <div class="container-fluid">
      <div class="row gx-0 text-center">
        <!-- Profile (Left) -->
        <div class="col-4">
          <router-link 
            to="/parent/profile" 
            class="nav-item d-flex flex-column align-items-center justify-content-center py-2 text-decoration-none"
            :class="{ 'active': isActive('/parent/profile') }"
          >
            <div class="icon-wrapper mb-1">
              <i class="bi bi-person-circle fs-4"></i>
            </div>
            <span class="small fw-medium">Profile</span>
          </router-link>
        </div>

        <!-- Home (Center) -->
        <div class="col-4">
          <router-link 
            to="/parent/dashboard" 
            class="nav-item d-flex flex-column align-items-center justify-content-center py-2 text-decoration-none"
            :class="{ 'active': isActive('/parent/dashboard') }"
          >
            <div class="icon-wrapper home-icon mb-1">
              <i class="bi bi-house-door-fill fs-3"></i>
            </div>
            <span class="small fw-medium">Home</span>
          </router-link>
        </div>

        <!-- Logout (Right) -->
        <div class="col-4">
          <button 
            @click="handleLogout" 
            class="nav-item w-100 bg-transparent border-0 d-flex flex-column align-items-center justify-content-center py-2 text-decoration-none text-muted"
          >
            <div class="icon-wrapper mb-1">
              <i class="bi bi-box-arrow-right fs-4"></i>
            </div>
            <span class="small fw-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { logout } = useAuth()

const isActive = (path) => {
  return route.path === path
}

const handleLogout = async () => {
  if (!confirm('Are you sure you want to log out?')) return
  
  await logout()
  router.push('/login')
}
</script>

<style scoped>
.parent-bottom-nav {
  z-index: 1040;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.nav-item {
  color: #adb5bd; /* Text muted color default */
  transition: all 0.2s ease;
  height: 100%;
}

.nav-item:hover {
  color: var(--primary-color);
  background-color: rgba(var(--primary-rgb), 0.02);
}

.nav-item.active {
  color: var(--primary-color);
}

.icon-wrapper {
  position: relative;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.nav-item.active .icon-wrapper {
  transform: translateY(-2px);
}

/* Special styling for Home icon to make it pop */
.home-icon {
  background: linear-gradient(135deg, var(--primary-color, #2563eb), #60a5fa);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-top: -24px; /* Move up to float partially */
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
  border: 4px solid white; /* Spacing from nav bar bg */
}

/* Adjust active logic for floating home button if needed
   Currently, we made it always blue-ish floating.
   Let's toggle style if not active? 
   Actually, usually floating button is always prominent. */

.nav-item:not(.active) .home-icon {
  background: #f8f9fa;
  color: #adb5bd;
  box-shadow: none;
  border-color: #f8f9fa;
}

/* Restore the floated look when active */
.nav-item.active .home-icon {
   background: linear-gradient(135deg, var(--primary-color, #2563eb), #60a5fa);
   color: white;
   box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
   border-color: white;
}
</style>
