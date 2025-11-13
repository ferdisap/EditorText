import { useMarker } from "@/composables/useMarker";
import { useModelStore } from "@/composables/useModelstore";
import { useTheme } from "@/composables/useTheme";
import { EditorClass, EditorXMLClass, MonacoCodeEditor, MonacoDiffEditor, MonacoEditor, MonacoEditorDiff, MonacoEditorOptions, MonacoModel, MonacoTextModel } from "@/types/editor";
import * as monaco from "monaco-editor"
import { init as initGeneral } from "./traits/editor/general.trait";
import { init as initXml } from "./traits/editor/xml.trait";
import { ModelLanguage } from "@/types/model";
import { applyTraitOnInstanced } from "./traits/apply";
import { hasMethod } from "@/util/function";
import { getEditorContainer } from "@/composables/useEditorContainer";
import { delay } from "@/util/time";
import { isNumberInRange } from "@/util/number";

// 🧩 id: "toggle-theme"
// ➡️ Ini adalah identifier unik untuk action tersebut.
// Monaco menggunakan id ini sebagai referensi internal (misalnya saat memanggil editor.trigger('source', 'toggle-theme') secara manual).
// Harus unik per editor instance.
// Tidak tampil di UI, tapi digunakan untuk logika internal.
// 📘 Analogi VSCode
// Sama seperti command ID di VSCode (editor.action.commentLine misalnya).

// 🧩 contextMenuGroupId: "navigation"
// ➡️ Menentukan kelompok (group) tempat item ini muncul di context menu Monaco.
// Monaco memecah menu jadi beberapa grup bawaan:
// "navigation" →	biasanya bagian atas (misal: Go to Definition, Peek, dll). Perintah navigasi seperti Go to Definition, Go to References, Peek Definition, dsb.	Paling atas
// "1_modification" →	bagian tengah (Copy, Cut, Paste). Aksi edit ringan seperti Change All Occurrences, Rename Symbol, dll.	Setelah navigation
// "2_cutcopypaste" →	Aksi standar clipboard: Cut, Copy, Paste, Copy Path, dsb.	Tengah
// "3_reveal" →	Aksi terkait tampilan seperti Reveal in Explorer, Open Containing Folder, dsb.	Tengah bawah
// "4_compare" →	Aksi diff / compare (tergantung ekstensi Monaco).	Bawah
// "5_correction" →	Quick Fix, Code Actions (ikon lampu kuning).	Biasanya muncul jika ada masalah (lint error).
// "6_configuration" →	Aksi konfigurasi editor seperti Command Palette, Format Document, Toggle Word Wrap.	Paling bawah
// "9_cutcopypaste" → bagian bawah
// Kamu bisa juga pakai nama custom (misal "custom" atau "theme") untuk membuat grup sendiri.
// 🧠 Gunanya: Menjaga posisi action di menu biar tidak campur dengan built-in actions.

// 🧩 contextMenuOrder: 1.5
// ➡️ Menentukan urutan action di dalam grup contextMenuGroupId.
// Semakin kecil angkanya, semakin atas posisinya.
// Kamu bisa pakai pecahan (1.1, 1.2, dst) untuk sisip di tengah-tengah action lain.

export function getLineContentAndCursorIndex(editorInstance: EditorClass) {
  const editor = editorInstance.editor;
  const position = editor.getPosition()!;
  const model = (editor.getModel()! as monaco.editor.ITextModel);
  const lineContent = model.getLineContent(position.lineNumber);
  const cursorIndex = position.column - 1;
  return { lineContent, cursorIndex }
}

export function defOptionCreateEditor(): MonacoEditorOptions {
  const { isDark } = useTheme();
  const theme = isDark.value ? 'vs-dark' : 'vs';
  return { theme }
}

export function createEditor(container: HTMLDivElement, model: MonacoTextModel) {
  const { theme } = defOptionCreateEditor();
  return monaco.editor.create(container as HTMLDivElement, {
    model,
    theme,
    // automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
  });
}

// function watchEditorResize(container: HTMLElement, editor: MonacoCodeEditor) {
//   let frame: number;

//   const { simpleDebounce } = delay();

//   const relayout = () => {
//     simpleDebounce(() => {
//       console.log('aa');
//       cancelAnimationFrame(frame);
//       // Delay satu frame agar ukuran DOM benar-benar final
//       frame = requestAnimationFrame(() => {
//         const width = container.clientWidth;
//         const height = container.clientHeight;

//         // Deteksi kalau width berubah, lalu paksa layout
//         if (width && height) {
//           editor.layout({ width, height });
//           // Paksa render ulang internal agar scrollbar muncul
//           (editor as any)._configuration?.observeContainer?.();
//           editor.render(true);
//         }
//         // const { clientWidth, clientHeight } = container;
//         // editor.layout({ width: clientWidth, height: clientHeight });
//         console.log(top.edly = editor.getLayoutInfo());
//       });
//     },100);
//   };

//   const observer = new ResizeObserver(() => relayout());
//   observer.observe(container);

//   window.addEventListener("resize", relayout);

//   return () => {
//     observer.disconnect();
//     window.removeEventListener("resize", relayout);
//     cancelAnimationFrame(frame);
//   };
// }

function watchEditorResize(container: HTMLElement, editor: MonacoCodeEditor) {
  const { simpleDebounce } = delay();

  let prevWidth:number;
  let prevHeight:number;

  const { clientWidth, clientHeight } = container;
  prevWidth = clientWidth
  prevHeight = clientHeight;
  const relayout = () => simpleDebounce(() => {
    // console.log('aa');
    const { clientWidth, clientHeight } = container;
    // console.log(container, clientWidth);
    // console.log(clientWidth);
    // console.log(prevWidth, clientWidth, isNumberInRange(clientWidth, prevWidth - 5, prevWidth + 5));
    if(
      (!isNumberInRange(clientWidth, prevWidth - 5, prevWidth + 5)) || 
      (!isNumberInRange(clientHeight, prevHeight - 5, prevHeight + 5))
    ){
      // console.log(clientWidth, clientHeight);
      // console.log(prevHeight, clientHeight);
      // console.log('client width-height change');
      prevWidth = clientWidth
      prevHeight = clientHeight;
      editor.layout({ width: clientWidth, height: clientHeight });
    }
    // console.log(clientWidth, clientHeight);
    // console.log(container, clientWidth, clientHeight);
    // editor.layout({ width: clientWidth, height: clientHeight });
    // editor.render(true);
  }, 100)

  const observer = new ResizeObserver(() => relayout());
  observer.observe(container);
  return () => {
    observer.disconnect();
  }
}

export function Editor(id: string, name: string, model: string | MonacoTextModel | undefined, container: HTMLDivElement): EditorClass {
  const _id: string = id;
  const _name: string = name;
  let _modelId: string;
  const _container: HTMLDivElement = container;
  let _editor: MonacoEditor;
  // let _dewatch: () => void;

  const { modelStore } = useModelStore();
  // jika string
  if (typeof model === 'string') {
    // jika uri
    if(monaco.Uri.isUri(model)){
      model = modelStore.getModel(model);
      // jika tidak didapatkan maka model dibikin baru
      if(!model) {
        _modelId = modelStore.createModel()
        model = modelStore.getModel(_modelId);
      } else {
        _modelId = (model as MonacoTextModel).id;
      }
    } 
    // jika bukan uri alias id
    else {
      _modelId = model;
      model = modelStore.getModel(model);
      if(!model) {
        _modelId = modelStore.createModel()
        model = modelStore.getModel(_modelId);
      } else {
        _modelId = (model as MonacoTextModel).id;
      }
    }
  } 
  // jika MonacoTextModel
  else {
    _modelId = (model as MonacoTextModel).id;
  }
  _editor = createEditor(container, model as MonacoTextModel);

  // _dewatch = watchEditorResize(container, _editor)

  return {
    get id() {
      return _id;
    },
    get name() {
      return _name;
    },
    get modelId() {
      return _modelId;
    },
    get container() {
      return _container;
    },
    get editor() {
      return _editor;
    },
    get isCodeEditor() {
      return !(hasMethod(_editor, 'getOriginalEditor'));
    },
    get language() {
      return ((_editor.getModel() as MonacoTextModel)?.getLanguageId() || '') as ModelLanguage;
    },
    init() {
      if (!this.isCodeEditor) return;
      const lang = (_editor.getModel() as MonacoTextModel)?.getLanguageId();
      if (!lang) return;
      applyTraitOnInstanced(this);
      switch (lang) {
        case 'xml':
          initXml.apply(this as EditorXMLClass);
        default:
          initGeneral.apply(this);
          break;
      }
    },
    changeLanguage(lang: ModelLanguage) {
      if (!this.isCodeEditor) return;
      const container = getEditorContainer(this);
      let editor = _editor;

      // change language model
      const model: MonacoTextModel = editor.getModel() as MonacoTextModel;
      monaco.editor.setModelLanguage(model!, lang);

      // save old config
      const previousViewState = editor?.saveViewState() ?? null;
      const cursor = editor.getPosition(); // Simpan posisi kursor
      const options = (editor as MonacoCodeEditor).getRawOptions();
      // options.theme = 'vs-dark'

      // dispose only monaco editor
      editor.dispose();

      // re create monaco editor
      editor = monaco.editor.create(container as HTMLDivElement, options);
      editor.setModel(model);

      // restoring view editor
      if (previousViewState) {
        editor.restoreViewState(previousViewState as monaco.editor.ICodeEditorViewState);
      }

      // set last cursor position
      if (cursor) {
        editor.setPosition(cursor);
      }

      // layouting and make editor focus again
      editor.layout();
      editor.focus();

      _editor = editor;
    },
    /**
     * tidak seharusnya container di hapus karena desain applikasi satu container untuk semua editor di group yang sama
     * @deprecated
     */
    destroy() {
      if (this.isCodeEditor) {
        const domNode = (this.editor as monaco.editor.IStandaloneCodeEditor).getDomNode()!;
        if (domNode) domNode.remove();
        this.disposeModel;
        this.disposeEditor();
      } else {
        // dispose original 
        const originalEditor: MonacoCodeEditor = (_editor as MonacoDiffEditor).getOriginalEditor() as MonacoCodeEditor;
        const originalModel: MonacoTextModel = originalEditor.getModel() as MonacoTextModel;
        const originalDomNode = (originalEditor as monaco.editor.IStandaloneCodeEditor).getDomNode()!;
        if (originalDomNode) originalDomNode.remove();
        originalModel.dispose();
        originalEditor.dispose();
        // dispose modified
        const modifiedEditor: MonacoCodeEditor = (_editor as MonacoDiffEditor).getModifiedEditor() as MonacoCodeEditor;
        const modifiedModel: MonacoTextModel = modifiedEditor.getModel() as MonacoTextModel;
        const modifiedDomNode = (originalEditor as monaco.editor.IStandaloneCodeEditor).getDomNode()!;
        if (modifiedDomNode) modifiedDomNode.remove();
        modifiedModel.dispose();
        modifiedEditor.dispose();
      }
      _dewatch();
    },

    disposeEditor(): void {
      if (this.isCodeEditor) {
        _editor.dispose();
      } else {
        // dispose original editor
        const originalEditor: MonacoCodeEditor = (_editor as MonacoDiffEditor).getOriginalEditor() as MonacoCodeEditor;
        originalEditor.dispose();
        // dispose modified editor
        const modifiedEditor: MonacoCodeEditor = (_editor as MonacoDiffEditor).getModifiedEditor() as MonacoCodeEditor;
        modifiedEditor.dispose();
      }
      _dewatch();
    },

    disposeModel(): void {
      if (this.isCodeEditor) {
        const model: MonacoTextModel = _editor.getModel() as MonacoTextModel;
        if (model) {
          // hapus marker
          const { markerInfoMap } = useMarker();
          const modelId = model.id
          markerInfoMap.value.delete(modelId);
          // dispose model
          model.dispose();
        }
      } else {
        // dispose original model
        const originalEditor: MonacoCodeEditor = (_editor as MonacoDiffEditor).getOriginalEditor() as MonacoCodeEditor;
        const originalModel: MonacoTextModel = originalEditor.getModel() as MonacoTextModel;
        originalModel.dispose();
        // dispose modified model
        const modifiedEditor: MonacoCodeEditor = (_editor as MonacoDiffEditor).getModifiedEditor() as MonacoCodeEditor;
        const modifiedModel: MonacoTextModel = modifiedEditor.getModel() as MonacoTextModel;
        modifiedModel.dispose();
      }
    },
  }
}