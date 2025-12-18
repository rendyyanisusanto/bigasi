<template>
  <div class="mb-3">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    
    <input
      v-if="type !== 'textarea' && type !== 'select'"
      :id="inputId"
      :type="type"
      :class="inputClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :accept="accept"
      @input="handleInput"
      @change="handleChange"
    />
    
    <textarea
      v-else-if="type === 'textarea'"
      :id="inputId"
      :class="inputClasses"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      @input="handleInput"
    ></textarea>
    
    <select
      v-else-if="type === 'select'"
      :id="inputId"
      :class="inputClasses"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      @change="handleChange"
    >
      <option value="" disabled>{{ placeholder || 'Select...' }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    
    <div v-if="error" class="invalid-feedback d-block">
      {{ error }}
    </div>
    
    <div v-if="hint" class="form-text">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, File],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 3
  },
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const inputId = computed(() => {
  return `input-${Math.random().toString(36).substring(7)}`
})

const inputClasses = computed(() => {
  const classes = ['form-control']
  if (props.error) classes.push('is-invalid')
  return classes.join(' ')
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleChange = (event) => {
  if (props.type === 'file') {
    const file = event.target.files?.[0] || null
    emit('update:modelValue', file)
    emit('change', file)
  } else {
    const value = event.target.value
    emit('update:modelValue', value)
    emit('change', value)
  }
}
</script>
