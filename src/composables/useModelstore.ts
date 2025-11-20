import { ModelStore } from "@/core/ModelStore";
import { MapModelEditor } from "@/types/model";

const modelStore = ModelStore();
// top.ws.ms = modelStore;

export function useModelStore() {
  return {
    modelStore
  };
}
