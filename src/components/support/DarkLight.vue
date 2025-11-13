<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import { HTMLAttributes } from 'vue';

const { applyLightTheme, applyDarkTheme, isDark, toggleTheme } = useTheme();

const props = withDefaults(
  defineProps<{
    as?: string
    class?: HTMLAttributes["class"]
    asChild?: boolean
  }>(),
  {
    as: "div", // default jadi <div>
  }
)
</script>

<template>
  <button @click.stop="toggleTheme">
    {{ isDark ? 'light' : 'dark' }}
  </button>
</template>