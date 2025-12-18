<template>
  <div class="sidebar bg-light border-end" :class="{ 'show': isOpen }">
    <div class="sidebar-header p-3 border-bottom d-lg-none">
      <button class="btn-close" @click="closeSidebar"></button>
    </div>
    
    <nav class="sidebar-nav p-3">
      <ul class="nav flex-column">
        <!-- Admin Menu -->
        <template v-if="isAdmin">
          <li class="nav-item">
            <router-link to="/admin/dashboard" class="nav-link" @click="closeSidebar">
              <i class="bi bi-speedometer2 me-2"></i>Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/athletes" class="nav-link" @click="closeSidebar">
              <i class="bi bi-people me-2"></i>Athletes
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/coaches" class="nav-link" @click="closeSidebar">
              <i class="bi bi-person-badge me-2"></i>Coaches
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/sports" class="nav-link" @click="closeSidebar">
              <i class="bi bi-trophy me-2"></i>Sports
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/payments" class="nav-link" @click="closeSidebar">
              <i class="bi bi-cash-coin me-2"></i>Payments
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/events" class="nav-link" @click="closeSidebar">
              <i class="bi bi-calendar-event me-2"></i>Events
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/registrations" class="nav-link" @click="closeSidebar">
              <i class="bi bi-person-plus me-2"></i>Registrations
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/admin/settings" class="nav-link" @click="closeSidebar">
              <i class="bi bi-gear me-2"></i>Settings
            </router-link>
          </li>
        </template>
        
        <!-- Coach Menu -->
        <template v-if="isCoach">
          <li class="nav-item">
            <router-link to="/coach/dashboard" class="nav-link" @click="closeSidebar">
              <i class="bi bi-speedometer2 me-2"></i>Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/coach/athletes" class="nav-link" @click="closeSidebar">
              <i class="bi bi-people me-2"></i>My Athletes
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/coach/training-notes" class="nav-link" @click="closeSidebar">
              <i class="bi bi-journal-text me-2"></i>Training Notes
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/coach/reports" class="nav-link" @click="closeSidebar">
              <i class="bi bi-file-earmark-text me-2"></i>Reports
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/coach/events" class="nav-link" @click="closeSidebar">
              <i class="bi bi-calendar-event me-2"></i>Events
            </router-link>
          </li>
        </template>
        
        <!-- Parent Menu -->
        <template v-if="isParent">
          <li class="nav-item">
            <router-link to="/parent/dashboard" class="nav-link" @click="closeSidebar">
              <i class="bi bi-speedometer2 me-2"></i>Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/parent/athlete" class="nav-link" @click="closeSidebar">
              <i class="bi bi-person me-2"></i>Athlete Profile
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/parent/training-notes" class="nav-link" @click="closeSidebar">
              <i class="bi bi-journal-text me-2"></i>Training Notes
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/parent/reports" class="nav-link" @click="closeSidebar">
              <i class="bi bi-file-earmark-text me-2"></i>Reports
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/parent/payments" class="nav-link" @click="closeSidebar">
              <i class="bi bi-cash-coin me-2"></i>Payment History
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/parent/events" class="nav-link" @click="closeSidebar">
              <i class="bi bi-calendar-event me-2"></i>Events
            </router-link>
          </li>
        </template>
      </ul>
    </nav>
  </div>
  
  <div v-if="isOpen" class="sidebar-overlay d-lg-none" @click="closeSidebar"></div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth'

const { isAdmin, isCoach, isParent } = useAuth()

const isOpen = ref(false)

const openSidebar = () => {
  isOpen.value = true
}

const closeSidebar = () => {
  isOpen.value = false
}

defineExpose({ openSidebar, closeSidebar })
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 56px;
  left: 0;
  bottom: 0;
  width: 250px;
  overflow-y: auto;
  z-index: 1000;
  transition: transform 0.3s ease-in-out;
}

@media (max-width: 991.98px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
}

@media (min-width: 992px) {
  .sidebar {
    transform: translateX(0);
  }
}

.sidebar-overlay {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.nav-link {
  color: #333;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--primary-color);
}

.nav-link.router-link-active {
  background-color: var(--primary-color);
  color: white;
}

.nav-link i {
  width: 20px;
}
</style>
