<template>
  <div id="app">
    <template v-if="isAuthenticated">
      <!-- Admin & Coach Layout -->
      <template v-if="!isParent">
        <AppHeader />
        <div class="app-container">
          <AppSidebar ref="sidebar" />
          <main class="main-content" :class="{ 'pb-5 mb-5': isAdmin || isCoach }">
            <div class="container-fluid py-4">
              <router-view :key="$route.fullPath" />
            </div>
          </main>
        </div>
        <AdminBottomNav v-if="isAdmin" />
        <CoachBottomNav v-if="isCoach" />
      </template>
      
      <!-- Parent Layout -->
      <template v-else>
        <main class="parent-content pb-5 mb-4">
          <div class="container-fluid py-3 px-3">
             <router-view :key="$route.fullPath" />
          </div>
        </main>
        <ParentBottomNav />
      </template>
    </template>
    
    <!-- Public Layout -->
    <template v-else>
      <router-view :key="$route.fullPath" />
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import { useSettings } from './composables/useSettings'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import ParentBottomNav from './components/layout/ParentBottomNav.vue'
import AdminBottomNav from './components/layout/AdminBottomNav.vue'
import CoachBottomNav from './components/layout/CoachBottomNav.vue'

const { isAuthenticated, initAuth, isParent, isAdmin, isCoach } = useAuth()
const { fetchSettings } = useSettings()

onMounted(async () => {
  await initAuth()
  await fetchSettings()
})
</script>

<style>
#app {
  min-height: 100vh;
}

/* Admin/Coach Layout Styles */
.app-container {
  display: flex;
  min-height: calc(100vh - 56px);
}

.main-content {
  flex: 1;
  margin-left: 0;
  transition: margin-left 0.3s ease-in-out;
}

@media (min-width: 992px) {
  .main-content {
    margin-left: 250px;
  }
}

/* Parent Layout Styles */
.parent-content {
  min-height: 100vh;
  background-color: #f8f9fa; /* Light background for parent view */
}
</style>
