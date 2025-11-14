import * as monaco from "monaco-editor";
import { ref } from "vue";
import { ValidationInfo } from "xml-xsd-validator-browser";
import { useModelStore } from "./useModelstore";
import { useWorkspace } from "./useWorkspace";
import { Marker } from "@/core/Marker";
import { Ref } from 'vue';
import { MarkerData, MarkerInfo, MarkerResult } from "@/types/marker.type";

const marker = Marker();

export function getMarkerClass(){
  return marker;
}


// key string = namespace;
const containerMap :Map<string, Ref<HTMLElement | null>> = new Map();
// key Marker info yang tidak ada ref nya (bisa kosong size nya karena yang ref dipakai di vue);
const infoMap :WeakMap<MarkerInfo, Ref<MarkerInfo>> = new WeakMap();

export function registerMarker(data:MarkerData){
  return marker.register(data);
}

export function unregisterMarker(namespace:string){
  return marker.unregister(namespace);
}

export function useMarker(namespace:string){
  const markerdata = marker.list.find(data => data.namespace == namespace);
  const markerInfo :MarkerInfo = marker.map.get(namespace) as MarkerInfo;
  console.log(namespace);
  if((!markerdata) || (!markerInfo)) throw new Error('There is no such marker with namespace: ' + namespace);

  // set container map. Jika markerdata container nya null, maka diisi null
  let container :Ref<HTMLElement | null>;
  if(!markerdata.container) {
    container = ref(null);
    containerMap.set(markerdata.namespace, container);
  }
  else {
    container = containerMap.has(markerdata.namespace) ? containerMap.get(markerdata.namespace)! : ref(markerdata.container);
    if(!containerMap.has(markerdata.namespace)) containerMap.set(markerdata.namespace, container);
  }

  // set info map
  let map :Ref<MarkerInfo> = infoMap.has(markerInfo) ? infoMap.get(markerInfo)!: ref(markerInfo);
  if(!infoMap.has(markerInfo)) infoMap.set(markerInfo, map);

  // clear function
  const clear = () => {
    markerInfo.clear();
    infoMap.delete(markerInfo);
    containerMap.delete(markerdata.namespace);
  }

  // return 
  return {
    markerContainer: container,
    markerInfoMap: map,
    clear,
  }
}

export function goto(modelId: string, line: number, col: number) {
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
