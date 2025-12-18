<template>
  <div class="settings-page">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center py-3 mb-2">
      <h4 class="fw-bold mb-0">App Settings</h4>
    </div>
    
    <div class="row g-4">
      <div class="col-12 col-lg-8">
        <div class="card border-0 shadow-sm rounded-4">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-4">General Configuration</h5>
            <form @submit.prevent="saveSettings">
              <BaseInput
                v-model="form.app_name"
                label="App Name"
                placeholder="Enter app name"
                required
              />
              
              <BaseInput
                v-model="logoFile"
                type="file"
                label="App Logo"
                accept="image/*"
                @change="handleLogoChange"
                hint="Upload a logo image (recommended: 200x200px)"
              />
              
              <div v-if="form.logo_url" class="mb-3">
                <label class="form-label small text-muted">Current Logo</label>
                <div class="p-3 bg-light rounded text-center">
                  <img :src="form.logo_url" alt="Current logo" style="max-height: 80px;" class="img-fluid" />
                </div>
              </div>
              
              <div class="row">
                <div class="col-12 col-md-6">
                  <BaseInput
                    v-model="form.primary_color"
                    type="color"
                    label="Primary Color"
                    required
                  />
                </div>
                <div class="col-12 col-md-6">
                  <BaseInput
                    v-model="form.secondary_color"
                    type="color"
                    label="Secondary Color"
                    required
                  />
                </div>
              </div>
              
              <div class="mt-4 d-flex justify-content-end">
                <BaseButton
                  type="submit"
                  variant="primary"
                  :loading="saving"
                  class="px-4"
                >
                  <i class="bi bi-save me-2"></i>Save Changes
                </BaseButton>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <div class="col-12 col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100">
          <div class="card-body p-4">
            <h5 class="card-title fw-bold mb-4">Preview</h5>
            <div class="text-center mb-4 p-4 bg-light rounded-3">
              <AppLogo size="lg" />
            </div>
            <div class="d-flex gap-2 mb-3">
              <div class="flex-fill p-3 rounded text-white shadow-sm text-center small" :style="{ backgroundColor: form.primary_color }">
                Primary
              </div>
              <div class="flex-fill p-3 rounded text-white shadow-sm text-center small" :style="{ backgroundColor: form.secondary_color }">
                Secondary
              </div>
            </div>
            <div class="alert alert-info border-0 bg-soft-info text-info small" role="alert">
              <i class="bi bi-info-circle me-2"></i>Changes will be applied immediately after saving.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSettings } from '../../composables/useSettings'
import { useUpload } from '../../composables/useUpload'
import BaseInput from '../../components/base/BaseInput.vue'
import BaseButton from '../../components/base/BaseButton.vue'
import AppLogo from '../../components/common/AppLogo.vue'

const { settings, updateSettings } = useSettings()
const { uploadFile } = useUpload()

const saving = ref(false)
const logoFile = ref(null)

const form = ref({
  app_name: 'BIGASI',
  logo_url: '',
  primary_color: '#2563eb',
  secondary_color: '#22c55e'
})

const handleLogoChange = (file) => {
  logoFile.value = file
}

const saveSettings = async () => {
  try {
    saving.value = true
    
    // Upload logo if selected
    if (logoFile.value) {
      const result = await uploadFile(logoFile.value, 'photos', 'logo/')
      if (result.success) {
        form.value.logo_url = result.url
      }
    }
    
    const result = await updateSettings(form.value)
    
    if (result.success) {
      alert('Settings saved successfully!')
    } else {
      alert('Failed to save settings: ' + result.error)
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to save settings')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (settings.value) {
    form.value = { ...settings.value }
  }
})
</script>
