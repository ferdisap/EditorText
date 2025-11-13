import { reactive, toRefs } from "vue";
import { Workspace } from "@/core/Workspace";

const workspace = reactive(Workspace());
top.ws = workspace;
export function useWorkspace() {
  return {
    workspace
  };
}
