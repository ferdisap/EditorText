import { useModelStore } from "@js-editor/composables/useModelstore";
import { type MonacoTextModel } from "@js-editor/types/editor.type";
import { type IMarkerInfo, type IMarkerPanel } from "@js-editor/types/marker.type";
import { isProxy, toRaw } from "vue";

export const MARKER_DETAIL_NS = "marker.detail.panel.container";

export type DetailResult = {
  uri: string;
  language: string;
}

export class MarkerDetail implements IMarkerPanel<DetailResult> {
  _namespace: string;
  _map: WeakMap<MonacoTextModel, IMarkerInfo<DetailResult>>;
  _name: string = '';

  constructor(namespace: string) {
    this._namespace = namespace;
    this._map = new WeakMap();
  }

  get namespace() {
    return this._namespace;
  }

  get map() {
    return this._map;
  }

  name(name: string | null): string {
    return name ? (this._name = name) : this._name;
  }

  clear(modelId: string): void {
    const { modelStore } = useModelStore();
    const model = modelStore.getModel(modelId!);
    if (model) {
      if (isProxy(model)) {
        this._map.delete(toRaw(model));
      } else {
        this._map.delete(model);
      }
    }
  }

}