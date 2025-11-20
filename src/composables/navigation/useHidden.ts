import { executeOnNavContentToggled } from "@/plugins/sidebar.plugin";
import { ref } from "vue";

const hide = ref(true);

const navContent = ref<HTMLElement | null>(null);

export function useHidden() {
  function toggle(value:boolean | null = null) {
    hide.value = (value === null) ? !hide.value : value;
    executeOnNavContentToggled();
  }
  return {
    isHidden:hide,
    navContent,
    toggle,
  }
}