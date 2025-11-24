
<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  item: any;
}>();

const emit = defineEmits(["select"]);

const submenuOpen = ref(false);

const hasChildren = computed(() => !!props.item.children);

function handleClick() {
  if (props.item.disabled) return;
  if (hasChildren.value) return; // open via hover
  emitSelect();
}

function emitSelect() {
  emit("select", props.item.action);
}

function openSubmenu() {
  if (hasChildren.value) submenuOpen.value = true;
}

function closeSubmenu() {
  submenuOpen.value = false;
}
</script>

<template>
  <div>
    <!-- Divider -->
    <div 
      v-if="item.id === 'divider'"
      class="context-divider"
    ></div>

    <!-- Normal Item -->
    <div 
      v-else
      class="context-item"
      :class="{ disabled: item.disabled }"
      @click.stop="handleClick"
      @mouseenter="openSubmenu"
      @mouseleave="closeSubmenu"
    >
      <!-- Icon -->
      <i v-if="item.icon" :class="[item.icon, 'mr-2']"></i>

      <!-- Label -->
      <span class="label">{{ item.label }}</span>

      <!-- Arrow if has children -->
      <span v-if="hasChildren" class="submenu-arrow codicon codicon-chevron-right"></span>

      <!-- Submenu -->
      <div 
        v-if="submenuOpen && hasChildren" 
        class="context-submenu"
        ref="submenuEl"
      >
        <ContextMenuItem 
          v-for="(child, idx) in item.children" 
          :key="idx" 
          :item="child"
          @select="emitSelect"
        />
      </div>
    </div>
  </div>
</template>