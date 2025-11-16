import { MarkerClass, MarkerData, MarkerInfo } from "@/types/marker.type";
import { reactive } from "vue";

export const MARKER_VALIDATION_NS = "marker.validate.panel.container";

export function Marker() :MarkerClass {
  const state = reactive({
    /** key:string is namespace. value MarkerInfo is a Map<modelId, Result[]> */
    map: new Map<string, MarkerInfo>(),
    list: new Array<MarkerData>(),
  })

  const register = (data:MarkerData) :boolean => {
    if(state.list.find((d) => d.namespace === data.namespace)){
      return false
    } 
    state.list.push(data);
    state.map.set(data.namespace, new Map());
    return true;
  }

  const unregister = (namespace:string) :boolean => {
    const data = state.list.find((d) => d.namespace === namespace)
    if(data){
      const index = state.list.indexOf(data);
      state.list.splice(index, 1);
      return true;
    }
    return false
  }

  return {
    get map() {
      return state.map;
    },
    get list() {
      return state.list
    },
    register,
    unregister,
  }
}