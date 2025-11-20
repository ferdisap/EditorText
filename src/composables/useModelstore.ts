import { ModelStore } from "@/core/ModelStore";
import { MapModelEditor } from "@/types/model.type";

const modelStore = ModelStore();
// top.ws.ms = modelStore;

export function useModelStore() {
  return {
    modelStore
  };
}
