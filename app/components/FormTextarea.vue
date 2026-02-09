<template>
  <div class="form-control w-full">
    <label v-if="label" class="label">
      <span class="label-text">{{ label }}</span>
      <span v-if="required" class="label-text-alt text-error">*</span>
    </label>
    <textarea
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      :class="[
        'textarea textarea-bordered w-full',
        error ? 'textarea-error' : '',
        disabled ? 'textarea-disabled' : ''
      ]"
    ></textarea>
    <label v-if="error" class="label">
      <span class="label-text-alt text-error">{{ error }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  rows?: number
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
