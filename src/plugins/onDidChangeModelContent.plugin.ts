import { EditorClass } from "@/types/editor";
import { IDisposableRecord } from "@/types/plugins.type";
import { IDisposable } from "monaco-editor";

/** key is string namespace */
const MapAdditionalPlugin: Map<string, (editor: EditorClass) => IDisposable | void> = new Map();
/** SHOULD EXPORT TO index.ts */
export function registerPluginOnDidChangeModelContent(namespace: string, action: (editor: EditorClass) => IDisposable | void) {
  MapAdditionalPlugin.set(namespace, action);
}
export function unregisterPluginOnDidChangeModelContent(namespace: string) {
  MapAdditionalPlugin.delete(namespace)
}
function getPluginOnDidChangeModelContent(namespace: string) {
  return MapAdditionalPlugin.get(namespace)
}

/** key is a action function, not disposable (added action), usualy contains editor.addAction() */
const WmRegisteredPluginMarking: WeakMap<(editor: EditorClass) => IDisposable | void, boolean> = new WeakMap();
/** key is Editor Class instanced, value is ID */
const WmDisposeAbleRecord: WeakMap<EditorClass, Array<IDisposableRecord>> = new WeakMap();
/** apply action on init editor class */
export function applyPluginOnDidChangeModelContent(this: EditorClass) {
  for (const namespace of MapAdditionalPlugin.keys()) {
    // check if action has not marked, then action must be applied
    if (MapAdditionalPlugin.has(namespace) && !WmRegisteredPluginMarking.has(MapAdditionalPlugin.get(namespace)!)) {
      // apply action
      const disposeAble = (MapAdditionalPlugin.get(namespace)!)(this);
      if (disposeAble) {
        // mapping disposeAble action
        if (!WmDisposeAbleRecord.has(this)) WmDisposeAbleRecord.set(this, []);
        WmDisposeAbleRecord.get(this)!.push({ namespace, disposeAble })
        // mark if action has applied
        WmRegisteredPluginMarking.set(MapAdditionalPlugin.get(namespace)!, true);
      }
      // if action not success, then delte from the map
      else {
        unregisterPluginOnDidChangeModelContent(namespace);
      }
    }
  }
}
/** dispose all applied action */
export function deApplyPluginOnDidChangeModelContent(this: EditorClass, namespace: string | null, unreg: boolean) {
  const disposeableRecords = WmDisposeAbleRecord.get(this);
  if (disposeableRecords) {
    const dispose = (disposeableRecord: IDisposableRecord) => {
      // 1. dispose the action
      const disposeAble = disposeableRecord.disposeAble;
      disposeAble.dispose();
      // 2. unregister the action
      const namespace = disposeableRecord.namespace;
      if (unreg) unregisterPluginOnDidChangeModelContent(namespace);
      // 3. delete the marking action, so if applyAction() again, it will be applied
      const action = getPluginOnDidChangeModelContent(namespace)!;
      WmRegisteredPluginMarking.delete(action);
      // 4. remove the disposeable  the disposeable record
      const index_disposeAble = WmDisposeAbleRecord.get(this)!.indexOf(
        WmDisposeAbleRecord.get(this)!.find((record) => record.namespace === namespace)!
      );
      WmDisposeAbleRecord.get(this)!.splice(index_disposeAble, 1);
    }

    // jika namespace tidak di state spesifik maka akan dispose semuanya
    if (!namespace) {
      for (const disposeableRecord of disposeableRecords) dispose(disposeableRecord)
    } else {
      const disposeableRecord = disposeableRecords.find(record => record.namespace === namespace);
      if(disposeableRecord) dispose(disposeableRecord)
    }
  }
}