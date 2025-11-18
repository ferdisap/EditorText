import { reactive, toRefs } from "vue";
import { Workspace } from "@/core/Workspace";
import { Dimension } from "@/types/editor";

const workspace = reactive(Workspace());
top.ws = workspace;
export function useWorkspace() {

  function relayout(width?:Dimension, height?:Dimension){
    for(const group of workspace.groups){
      group.layout(width, height);
    }
    for(const group of workspace.groups){
      group.activeTab?.instance.layout();
    }
  }
  return {
    workspace, relayout
  };
}
