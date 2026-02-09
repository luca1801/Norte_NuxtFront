<template>
  <dialog :id="id" class="modal" :class="{ 'modal-open': isOpen }">
    <div class="modal-box" :class="sizeClass">
      <h3 v-if="title" class="font-bold text-lg mb-4">{{ title }}</h3>
      
      <div class="py-4">
        <slot />
      </div>
      
      <div class="modal-action">
        <slot name="actions">
          <button @click="close" class="btn">Fechar</button>
        </slot>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="close">
      <button type="button">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  modelValue?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const isOpen = computed({
  get: () => props.modelValue ?? false,
  set: (value) => emit('update:modelValue', value)
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'max-w-sm'
    case 'lg': return 'max-w-3xl'
    case 'xl': return 'max-w-5xl'
    default: return 'max-w-2xl'
  }
})

const close = () => {
  isOpen.value = false
  emit('close')
}

defineExpose({ close })
</script>
