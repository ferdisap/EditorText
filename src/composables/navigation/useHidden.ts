import { executeOnNavContentToggled } from "@js-editor/plugins/sidebar.plugin";
import { ref } from "vue";
import { useStorage } from "../useStorage";

const {get, set} = useStorage("navigation");
const hide = ref(get<boolean>("bool"));
const navContent = ref<HTMLElement | null>(null);

export function useHidden() {
  function toggle(value:boolean | null = null) {
    hide.value = (value === null) ? !hide.value : value;
    set("navigation", hide.value);
    executeOnNavContentToggled();
  }
  return {
    isHidden:hide,
    navContent,
    toggle,
  }
}