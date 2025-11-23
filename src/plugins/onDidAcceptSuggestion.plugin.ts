import { type EditorClass } from "@/types/editor.type";
import { type IDisposableRecord } from "@/types/plugins.type";
import { IDisposable } from "monaco-editor";
import { isProxy, toRaw } from "vue";

/** key is string namespace */
const MapAdditionalPlugin: Map<string, (editor: EditorClass) => IDisposable | void> = new Map();
/** SHOULD EXPORT TO index.ts */
/**
 * @deprecated tidak ada lagi di monaco terbaru (saat ini)
 * @param namespace 
 * @param action 
 */
export function registerPluginOnDidAcceptSuggestion(namespace: string, action: (editor: EditorClass) => IDisposable | void) {
  if (!MapAdditionalPlugin.has(namespace)) MapAdditionalPlugin.set(namespace, action);
}
export function unregisterPluginOnDidAcceptSuggestion(namespace: string) {
  MapAdditionalPlugin.delete(namespace)
}
function getPluginOnDidAcceptSuggestion(namespace: string) {
  return MapAdditionalPlugin.get(namespace)
}

/** key is a action function, not disposable (added action), usualy contains editor.addAction() */
// const WmRegisteredPluginMarking: WeakMap<(editor: EditorClass) => IDisposable | void, boolean> = new WeakMap();
/** key is Editor Class instanced, value is ID */
const WmDisposeAbleRecord: WeakMap<EditorClass, Array<IDisposableRecord>> = new WeakMap();
/** apply action on init editor class */
export function applyPluginOnDidAcceptSuggestion(this: EditorClass) {
  const editorInstance = isProxy(this) ? toRaw(this) : this;
  if (!WmDisposeAbleRecord.has(editorInstance)) WmDisposeAbleRecord.set(editorInstance, []);
  for (const namespace of MapAdditionalPlugin.keys()) {
    // check if action has not marked, then action must be applied
    if (!WmDisposeAbleRecord.get(editorInstance)?.find(record => record.namespace === namespace)) {
      const disposeAble = getPluginOnDidAcceptSuggestion(namespace)!.apply(editorInstance, [editorInstance]);
      if (disposeAble) {
        // mapping disposeAble action
        WmDisposeAbleRecord.get(editorInstance)!.push({ namespace, disposeAble })
      }
    }
  }
}
/** dispose all applied action */
export function deApplyPluginOnDidAcceptSuggestion(this: EditorClass, namespace: string | null, unreg: boolean) {
  const editorInstance = isProxy(this) ? toRaw(this) : this;
  const disposeableRecords = WmDisposeAbleRecord.get(editorInstance);
  if (disposeableRecords) {
    const dispose = (disposeableRecord: IDisposableRecord) => {
      // 1. dispose the action
      const disposeAble = disposeableRecord.disposeAble;
      disposeAble.dispose();
      // 2. unregister the action
      const namespace = disposeableRecord.namespace;
      if (unreg) unregisterPluginOnDidAcceptSuggestion(namespace);
      // 3. remove the disposeable  the disposeable record
      // const index_disposeAble = WmDisposeAbleRecord.get(editorInstance)!.indexOf(
      //   WmDisposeAbleRecord.get(editorInstance)!.find((record) => record.namespace === namespace)!
      // );
      // WmDisposeAbleRecord.get(editorInstance)!.splice(index_disposeAble, 1);
    }
    // jika namespace tidak di state spesifik maka akan dispose semuanya
    if (!namespace) {
      for (const disposeableRecord of disposeableRecords) {
        dispose(disposeableRecord)
      }
      // remove all the disposeable  the disposeable record
      while (WmDisposeAbleRecord.get(editorInstance)!.length) {
        WmDisposeAbleRecord.get(editorInstance)!.splice(0, 1);
      }
    } else {
      const disposeableRecord = disposeableRecords.find(record => record.namespace === namespace);
      if (disposeableRecord) {
        dispose(disposeableRecord);
        // remove all the disposeable  the disposeable record
        const index_disposeAble = WmDisposeAbleRecord.get(editorInstance)!.indexOf(
          WmDisposeAbleRecord.get(editorInstance)!.find((record) => record.namespace === namespace)!
        );
        WmDisposeAbleRecord.get(editorInstance)!.splice(index_disposeAble, 1);
      }
    }
  }
}