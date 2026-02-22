<template>
  <div class="stats shadow" :class="containerClass">
    <div class="stat">
      <div v-if="icon" class="stat-figure" :class="iconColor">
        <component :is="icon" class="w-8 h-8" />
      </div>
      <div class="stat-title">{{ title }}</div>
      <div class="stat-value" :class="valueColor">{{ value }}</div>
      <div v-if="description" class="stat-desc">{{ description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  description?: string
  icon?: any
  iconColor?: string
  valueColor?: string
  containerClass?: string
}>()
</script>
