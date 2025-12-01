import { type IMarkerPanel } from "@js-editor/types/marker.type";
import { mapMarkerPanel } from "@js-editor/plugins/marker.plugin";

export function useMarkerPanel<
  TData = unknown,
  TImpl extends IMarkerPanel<TData> = IMarkerPanel<TData>
>() {
  function panel(namespace: string): TImpl {
    return mapMarkerPanel.get(namespace)! as TImpl;
  }

  function clear(modelId:string) :void{
    for(const markerPanel of mapMarkerPanel.values()){
      markerPanel.clear(modelId);
    }
  }

  return { panel, clear };
}