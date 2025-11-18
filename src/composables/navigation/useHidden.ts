import { ref } from "vue";

const hide = ref(false);

const navContent = ref<HTMLElement | null>(null);

export function useHidden() {
  function toggle() {
    hide.value = !hide.value
  }
  return {
    isHidden:hide,
    navContent,
    toggle,
  }
}