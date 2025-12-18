<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'outline-primary', 'outline-secondary'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const classes = ['btn', `btn-${props.variant}`]
  
  if (props.size === 'sm') classes.push('btn-sm')
  if (props.size === 'lg') classes.push('btn-lg')
  if (props.block) classes.push('w-100')
  
  return classes.join(' ')
})
</script>
