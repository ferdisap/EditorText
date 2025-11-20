import { ref, onMounted } from "vue";
import * as monaco from "monaco-editor";
import { useStorage } from "./useStorage";

const {get, set} = useStorage("theme");
const isDark = ref(get() === "dark");
export function useTheme() {

  function toggleTheme() {
    isDark.value = !isDark.value
    set("theme", isDark.value ? "dark" : "light");
    applyTheme()
  }

  function applyDarkTheme(){
    isDark.value = true;
    set("theme", isDark.value ? "dark" : "light");
    applyTheme();
  }

  function applyLightTheme(){
    isDark.value = false;
    set("theme", isDark.value ? "dark" : "light");
    applyTheme();
  }

  function applyTheme() {
    if (isDark.value) {
      document.documentElement.classList.add("dark")
      monaco.editor.setTheme("vs-dark"); // or "vs"
    } else {
      document.documentElement.classList.remove("dark")
      monaco.editor.setTheme("vs"); // or "vs"
    }
  }

  return { isDark, applyTheme, toggleTheme, applyDarkTheme, applyLightTheme }
}
