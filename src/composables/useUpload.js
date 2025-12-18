import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export function useUpload() {
    const uploading = ref(false)
    const progress = ref(0)

    // Upload file to Supabase Storage
    const uploadFile = async (file, bucket = 'photos', folder = '') => {
        try {
            uploading.value = true
            progress.value = 0

            // Generate unique filename
            const fileExt = file.name.split('.').pop()
            const fileName = `${folder}${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`

            // Upload file
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) {
                // Check if bucket doesn't exist
                if (error.message.includes('Bucket not found')) {
                    throw new Error('Storage bucket not configured. Please create a "photos" bucket in Supabase Storage first.')
                }
                throw error
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName)

            progress.value = 100
            return { success: true, url: publicUrl, path: data.path }
        } catch (error) {
            console.error('Upload error:', error)
            return { success: false, error: error.message }
        } finally {
            uploading.value = false
            setTimeout(() => {
                progress.value = 0
            }, 1000)
        }
    }

    // Delete file from Supabase Storage
    const deleteFile = async (path, bucket = 'photos') => {
        try {
            const { error } = await supabase.storage
                .from(bucket)
                .remove([path])

            if (error) throw error
            return { success: true }
        } catch (error) {
            console.error('Delete error:', error)
            return { success: false, error: error.message }
        }
    }

    return {
        uploading,
        progress,
        uploadFile,
        deleteFile
    }
}
