import { EditorClass } from "@/types/editor";
import { IDisposableRecord } from "@/types/plugins.type";
import { IDisposable } from "monaco-editor";
import { isProxy, toRaw } from "vue";

/** key is string namespace */
const MapAdditionalAction: Map<string, (editor: EditorClass) => IDisposable | void> = new Map();
/** SHOULD EXPORT TO index.ts */
export function registerAction(namespace: string, action: (editor: EditorClass) => IDisposable | void) {
  if (!(MapAdditionalAction.has(namespace))) MapAdditionalAction.set(namespace, action);
}
export function unregisterAction(namespace: string) {
  MapAdditionalAction.delete(namespace)
}
function getAction(namespace: string) {
  return MapAdditionalAction.get(namespace)
}

/** key is Editor Class instanced, value is ID */
const WmDisposeAbleActionRecord: WeakMap<EditorClass, Array<IDisposableRecord>> = new WeakMap();
/** apply action on init editor class */

top.WmDisposeAbleActionRecord = WmDisposeAbleActionRecord

export function applyAction(this: EditorClass) {
  const editorInstance = isProxy(this) ? toRaw(this) : this;  
  if (!WmDisposeAbleActionRecord.has(editorInstance)) WmDisposeAbleActionRecord.set(editorInstance, []);
  for (const namespace of MapAdditionalAction.keys()) {
    // check if action has not marked, then action must be applied
    if (!WmDisposeAbleActionRecord.get(editorInstance)?.find(record => record.namespace === namespace)) {
      const disposeAble = getAction(namespace)!.apply(editorInstance, [editorInstance]);
      if (disposeAble) {
        // mapping disposeAble action
        WmDisposeAbleActionRecord.get(editorInstance)!.push({ namespace, disposeAble })
      }
    }
  }
}
/** dispose all applied action */
export function deApplyAction(this: EditorClass, namespace: string | null, unreg: boolean) {
  const editorInstance = isProxy(this) ? toRaw(this) : this;
  const disposeableRecords = WmDisposeAbleActionRecord.get(editorInstance);
  if (disposeableRecords) {
    const dispose = (disposeableRecord: IDisposableRecord) => {
      // 1. dispose the action
      const disposeAble = disposeableRecord.disposeAble;
      disposeAble.dispose();
      // 2. unregister the action
      const namespace = disposeableRecord.namespace;
      if (unreg) unregisterAction(namespace);
      // 3. remove the disposeable  the disposeable record
      // const index_disposeAble = WmDisposeAbleActionRecord.get(editorInstance)!.indexOf(
      //   WmDisposeAbleActionRecord.get(editorInstance)!.find((record) => record.namespace === namespace)!
      // );
      // WmDisposeAbleActionRecord.get(editorInstance)!.splice(index_disposeAble, 1);
    }
    // jika namespace tidak di state spesifik maka akan dispose semuanya
    if (!namespace) {
      for (const disposeableRecord of disposeableRecords) {
        dispose(disposeableRecord)
      }
      // remove all the disposeable  the disposeable record
      while (WmDisposeAbleActionRecord.get(editorInstance)!.length) {
        WmDisposeAbleActionRecord.get(editorInstance)!.splice(0, 1);
      }
    } else {
      const disposeableRecord = disposeableRecords.find(record => record.namespace === namespace);
      if (disposeableRecord) {
        dispose(disposeableRecord);
        // remove all the disposeable  the disposeable record
        const index_disposeAble = WmDisposeAbleActionRecord.get(editorInstance)!.indexOf(
          WmDisposeAbleActionRecord.get(editorInstance)!.find((record) => record.namespace === namespace)!
        );
        WmDisposeAbleActionRecord.get(editorInstance)!.splice(index_disposeAble, 1);
      }
    }
  }
}

// import { EditorClass } from "@/types/editor";
// import { IDisposableRecord } from "@/types/plugins.type";
// import { IDisposable } from "monaco-editor";

// /** key is string namespace */
// const MapAdditionalAction: Map<string, (editor: EditorClass) => IDisposable | void> = new Map();
// /** SHOULD EXPORT TO index.ts */
// export function registerAction(namespace: string, action: (editor: EditorClass) => IDisposable | void) {
//   // if(!(MapAdditionalAction.has(namespace)))
//     MapAdditionalAction.set(namespace, action);
// }
// export function unregisterAction(namespace: string) {
//   MapAdditionalAction.delete(namespace)
// }
// function getAction(namespace: string) {
//   return MapAdditionalAction.get(namespace)
// }


// /** key is a action function, not disposable (added action), usualy contains editor.addAction() */
// const WmRegisteredActionMarking: WeakMap<(editor: EditorClass) => IDisposable | void, boolean> = new WeakMap();
// /** key is Editor Class instanced, value is ID */
// const WmDisposeAbleActionRecord: WeakMap<EditorClass, Array<IDisposableRecord>> = new WeakMap();
// /** apply action on init editor class */
// export function applyAction(this: EditorClass) {
//   for (const namespace of MapAdditionalAction.keys()) {
//     // check if action has not marked, then action must be applied
//     if (MapAdditionalAction.has(namespace) && !WmRegisteredActionMarking.has(MapAdditionalAction.get(namespace)!)) {
//       // apply action
//       // const disposeAble = (MapAdditionalAction.get(namespace)!)(this);
//       const disposeAble = (MapAdditionalAction.get(namespace)!).apply(this, [this]);
//       if (disposeAble) {
//         // mapping disposeAble action
//         if (!WmDisposeAbleActionRecord.has(this)) WmDisposeAbleActionRecord.set(this, []);
//         WmDisposeAbleActionRecord.get(this)!.push({ namespace, disposeAble })
//         // mark if action has applied
//         WmRegisteredActionMarking.set(MapAdditionalAction.get(namespace)!, true);
//       }
//       // if action not success, then delte from the map
//       else {
//         unregisterAction(namespace);
//       }
//     }
//   }
// }
// /** dispose all applied action */
// export function deApplyAction(this: EditorClass, namespace: string | null, unreg: boolean) {
//   const disposeableRecords = WmDisposeAbleActionRecord.get(this);
//   if (disposeableRecords) {
//     const dispose = (disposeableRecord: IDisposableRecord) => {
//       // 1. dispose the action
//       const disposeAble = disposeableRecord.disposeAble;
//       disposeAble.dispose();
//       // 2. unregister the action
//       const namespace = disposeableRecord.namespace;
//       if (unreg) unregisterAction(namespace);
//       // 3. delete the marking action, so if applyAction() again, it will be applied
//       const action = getAction(namespace)!;
//       WmRegisteredActionMarking.delete(action);
//       // 4. remove the disposeable  the disposeable record
//       const index_disposeAble = WmDisposeAbleActionRecord.get(this)!.indexOf(
//         WmDisposeAbleActionRecord.get(this)!.find((record) => record.namespace === namespace)!
//       );
//       WmDisposeAbleActionRecord.get(this)!.splice(index_disposeAble, 1);
//     }
//     // jika namespace tidak di state spesifik maka akan dispose semuanya
//     if (!namespace) {
//       for (const disposeableRecord of disposeableRecords) dispose(disposeableRecord)
//     } else {
//       const disposeableRecord = disposeableRecords.find(record => record.namespace === namespace);
//       if(disposeableRecord) dispose(disposeableRecord)
//     }
//   }
// }