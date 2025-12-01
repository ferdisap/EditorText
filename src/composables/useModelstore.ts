import { ModelStore } from "@js-editor/core/ModelStore";
import { type MapModelEditor } from "@js-editor/types/model.type";

const modelStore = ModelStore();
// top.ws.ms = modelStore;

export function useModelStore() {
  return {
    modelStore
  };
}
