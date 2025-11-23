import { useModelStore } from "@/composables/useModelstore";
import { useWorkspace } from "@/composables/useWorkspace";
import { type MonacoTextModel } from "@/types/editor.type";
import { type IMarkerInfo, type IMarkerPanel } from "@/types/marker.type";
import { isProxy, toRaw } from "vue";
import { ValidationInfo } from "xml-xsd-validator-browser";

export const MARKER_VALIDATION_NS = "marker.validate.panel.container";

export type ProblemResult = ValidationInfo[];

export interface IMarkerProblem extends IMarkerPanel<ProblemResult>{
  goto(modelId: string, line: number, col: number):void
}

export class MarkerProblem implements IMarkerProblem{
  _namespace: string;
  _map: WeakMap<MonacoTextModel, IMarkerInfo<ProblemResult>>;
  _name:string = '';

  constructor(namespace:string) {
    this._namespace = namespace;
    this._map = new WeakMap();
  }

  get namespace() {
    return this._namespace
  }

  get map() {
    return this._map;
  }

  name(name:string | null){
    return name ? (this._name = name) : this._name;
  }

  clear(modelId: string): void {
    // delete specific namespace and spesific modelId
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

  goto(modelId: string, line: number, col: number) {
    const { modelStore } = useModelStore();
    const map = modelStore.mapModelAndEditor(modelId, null)[0];
    let editorId: string;
    editorId = map.editorsInstancesId[0];
    const { workspace } = useWorkspace();
    const group = workspace.groups.filter(group => {
      return group.tabs.filter(tab => {
        return tab.instance.id === editorId;
      })
    })[0];
    if (group) {
      const tab = group.tabs.find(tab => tab.instance.id === editorId);
      if (tab) {
        // activate tab and group
        group.setActiveTab(tab.id);
        workspace.setActiveGroup(group.id);
        // position and goto line
        setTimeout(() => {
          tab.instance.goto({ lineNumber: line, column: col });
        }, 100)
      }
    }
  }
}