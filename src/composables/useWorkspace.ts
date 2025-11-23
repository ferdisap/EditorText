import { nextTick, reactive, toRefs } from "vue";
import { Workspace } from "@/core/Workspace";
import { type Dimension } from "@/types/editor.type";

const workspace = reactive(Workspace());
// top.ws.workspace = workspace;
export function useWorkspace() {

  function relayout(width?:Dimension, height?:Dimension){
    for(const group of workspace.groups){
      group.layout(width, height);
    }
    nextTick(() => {
      for(const group of workspace.groups){
        group.activeTab?.instance.layout();
      }
    })
  }
  return {
    workspace, relayout
  };
}
