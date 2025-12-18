<template>
  <div v-if="settings">
    <img 
      v-if="settings.logo_url" 
      :src="settings.logo_url" 
      :alt="settings.app_name"
      :class="sizeClass"
      class="app-logo"
    />
    <span v-else class="fw-bold" :class="textSizeClass">
      {{ settings.app_name }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettings } from '../../composables/useSettings'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const { settings } = useSettings()

const sizeClass = computed(() => {
  const sizes = {
    sm: 'logo-sm',
    md: 'logo-md',
    lg: 'logo-lg'
  }
  return sizes[props.size]
})

const textSizeClass = computed(() => {
  const sizes = {
    sm: 'fs-6',
    md: 'fs-5',
    lg: 'fs-4'
  }
  return sizes[props.size]
})
</script>

<style scoped>
.app-logo {
  object-fit: contain;
}

.logo-sm {
  height: 30px;
}

.logo-md {
  height: 40px;
}

.logo-lg {
  height: 60px;
}
</style>
