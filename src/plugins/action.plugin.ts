import { EditorClass } from "@/types/editor.type";
import { IDisposableRecord } from "@/types/plugins.type";
import { IDisposable } from "monaco-editor";
import { isProxy, toRaw } from "vue";

/** key is string namespace */
const MapAdditionalAction: Map<string, (editor: EditorClass) => IDisposable | void> = new Map();

/** SHOULD EXPORT TO index.ts */
/**
 * 
 * 🧩 id: "toggle-theme"
 * ➡️ Ini adalah identifier unik untuk action tersebut.
 * Monaco menggunakan id ini sebagai referensi internal (misalnya saat memanggil editor.trigger('source', 'toggle-theme') secara manual).
 * Harus unik per editor instance.
 * Tidak tampil di UI, tapi digunakan untuk logika internal.
 * 📘 Analogi VSCode
 * Sama seperti command ID di VSCode (editor.action.commentLine misalnya).
 
 * 🧩 contextMenuGroupId: "navigation"
 * ➡️ Menentukan kelompok (group) tempat item ini muncul di context menu Monaco.
 * Monaco memecah menu jadi beberapa grup bawaan:
 * "navigation" →	biasanya bagian atas (misal: Go to Definition, Peek, dll). Perintah navigasi seperti Go to Definition, Go to References, Peek Definition, dsb.	Paling atas
 * "1_modification" →	bagian tengah (Copy, Cut, Paste). Aksi edit ringan seperti Change All Occurrences, Rename Symbol, dll.	Setelah navigation
 * "2_cutcopypaste" →	Aksi standar clipboard: Cut, Copy, Paste, Copy Path, dsb.	Tengah
 * "3_reveal" →	Aksi terkait tampilan seperti Reveal in Explorer, Open Containing Folder, dsb.	Tengah bawah
 * "4_compare" →	Aksi diff / compare (tergantung ekstensi Monaco).	Bawah
 * "5_correction" →	Quick Fix, Code Actions (ikon lampu kuning).	Biasanya muncul jika ada masalah (lint error).
 * "6_configuration" →	Aksi konfigurasi editor seperti Command Palette, Format Document, Toggle Word Wrap.	Paling bawah
 * "9_cutcopypaste" → bagian bawah
 * Kamu bisa juga pakai nama custom (misal "custom" atau "theme") untuk membuat grup sendiri.
 * 🧠 Gunanya: Menjaga posisi action di menu biar tidak campur dengan built-in actions.
 
 * 🧩 contextMenuOrder: 1.5
 * ➡️ Menentukan urutan action di dalam grup contextMenuGroupId.
 * Semakin kecil angkanya, semakin atas posisinya.
 * Kamu bisa pakai pecahan (1.1, 1.2, dst) untuk sisip di tengah-tengah action lain.
 * @param namespace 
 * @param action 
 */
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

// top.ws.WmDisposeAbleActionRecord = WmDisposeAbleActionRecord

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