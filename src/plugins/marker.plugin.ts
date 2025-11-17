import { IMarkerInfo, IMarkerPanel } from "@/types/marker.type";
import { Reactive, reactive, ref, Ref } from "vue";

/** 
 * key:string is namespace 
 * registered marker panel
*/
export const mapMarkerPanel = reactive(
  new Map<string, IMarkerPanel<any>>()
);

/** untuk di EXPOR ke index.ts */
export function registerMarkerPanel<T>(panel: IMarkerPanel<T>){
  mapMarkerPanel.set(panel.namespace, panel);
}
