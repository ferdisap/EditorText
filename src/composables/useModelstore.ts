import { ModelStore } from "@/core/ModelStore";
import { MapModelEditor } from "@/types/model";

const modelStore = ModelStore();
top.ms = modelStore;

export function useModelStore() {
  return {
    modelStore
  };
}
