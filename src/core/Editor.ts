// import { useMarker } from "@/composables/useMarker";
import { useModelStore } from "@/composables/useModelstore";
import { useTheme } from "@/composables/useTheme";
import { EditorClass, EditorXMLClass, MonacoCodeEditor, MonacoDiffEditor, MonacoDiffEditorOptions, MonacoEditor, MonacoEditorOptions, MonacoModel, MonacoTextModel } from "@/types/editor";
import * as monaco from "monaco-editor"
import { init as initGeneral, deInit as deInitGeneral } from "./traits/editor/general.trait";
import { init as initXml, deInit as deInitXml } from "./traits/editor/xml.trait";
import { ModelLanguage } from "@/types/model";
import { applyTraitOnInstanced, deApplyTraitOnInstanced } from "./traits/apply";
import { hasMethod } from "@/util/function";
import { isValidUri } from "@/util/string";
import { useMarkerPanel } from "@/composables/useMarkerPanel";
import { MARKER_VALIDATION_NS } from "./panel/Problem";
import { executeOnBeforeDisposeModel } from "@/plugins/model.plugin";

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
  const editor = editorInstance.modifiedEditor || editorInstance.editor;
  const position = editor.getPosition()!;
  const model = (editor.getModel()! as monaco.editor.ITextModel);
  const lineContent = model.getLineContent(position.lineNumber);
  const cursorIndex = position.column - 1;
  return { lineContent, cursorIndex }
}

function defOptionCreateEditor(): MonacoEditorOptions {
  const { isDark } = useTheme();
  const theme = isDark.value ? 'vs-dark' : 'vs';
  const minimap = { enabled: false };
  const automaticLayout = false;
  const scrollBeyondLastLine = false;
  return { theme, minimap, automaticLayout, scrollBeyondLastLine }
}

function defOptionCreateDiffEditor(): MonacoDiffEditorOptions {
  const { isDark } = useTheme();
  const theme = isDark.value ? 'vs-dark' : 'vs';
  const minimap = { enabled: false };
  const automaticLayout = false;
  const scrollBeyondLastLine = false;
  const renderSideBySide = true;
  return { theme, minimap, automaticLayout, scrollBeyondLastLine, renderSideBySide }
}

function createEditor(container: HTMLDivElement, model: MonacoTextModel) {
  const { theme, minimap, automaticLayout, scrollBeyondLastLine } = defOptionCreateEditor();
  const editor = monaco.editor.create(container as HTMLDivElement, {
    model, theme, minimap, automaticLayout, scrollBeyondLastLine
  });
  return editor;
}

function createDiffEditor(container: HTMLDivElement, originalModel: MonacoTextModel | string, modifiedModel: MonacoTextModel | string) {
  const { theme, minimap, automaticLayout, scrollBeyondLastLine, renderSideBySide } = defOptionCreateDiffEditor();
  const diffEditor = monaco.editor.createDiffEditor(container, {
    theme, minimap, automaticLayout, scrollBeyondLastLine, renderSideBySide
  });
  originalModel = getModel(originalModel) as MonacoTextModel;
  modifiedModel = getModel(modifiedModel) as MonacoTextModel;
  diffEditor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });
  return diffEditor;
}

/**
 * @param model id, uri, or model it self
 */
function getModel(model: string | MonacoTextModel | undefined): MonacoModel {
  const { modelStore } = useModelStore();
  let _modelId: string;
  // jika string
  if (typeof model === 'string') {
    // jika uri
    if (isValidUri(model)) {
      const uri = model;
      model = modelStore.getModel(model);
      // jika tidak didapatkan maka model dibikin baru
      if (!model) {
        _modelId = modelStore.createModel('', '', uri)
        model = modelStore.getModel(_modelId);
      } else {
        _modelId = (model as MonacoTextModel).id;
      }
    }
    // jika bukan uri alias id
    else {
      _modelId = model;
      model = modelStore.getModel(model);
      if (!model) {
        _modelId = modelStore.createModel()
        model = modelStore.getModel(_modelId);
      } else {
        _modelId = (model as MonacoTextModel).id;
      }
    }
  }
  return model as MonacoModel;
}

export function Editor(id: string, name: string, model: string | MonacoTextModel | [original: MonacoTextModel | string, modified: MonacoTextModel | string] | undefined, container: HTMLDivElement): EditorClass {
  const _id: string = id;
  const _name: string = name;
  let _modelId: string;
  let _originalModelId: string | undefined = undefined;
  const _container: HTMLDivElement = container;
  let _editor: MonacoEditor;
  // let _dewatch: () => void;

  const { modelStore } = useModelStore();
  if (!Array.isArray(model)) {
    model = getModel(model) as MonacoTextModel;
    _modelId = (model as MonacoTextModel).id;
    _editor = createEditor(container, model as MonacoTextModel);
    modelStore.mapModelAndEditor(_modelId, [_id]);
  } else {
    const [original, modified] = model;
    _editor = createDiffEditor(container, original, modified);
    _originalModelId = _editor.getOriginalEditor().getModel()?.id
    _modelId = _editor.getModifiedEditor().getModel()?.id!
    modelStore.mapModelAndEditor(_originalModelId!, [_id]);
    modelStore.mapModelAndEditor(_modelId, [_id]);
  }

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
    get model() {
      return getModel(_modelId) as MonacoTextModel;
    },
    get originalModelId() {
      return _originalModelId;
    },
    get originalModel() {
      return _originalModelId ? (getModel(_originalModelId) as MonacoTextModel) : undefined;
    },
    get container() {
      return _container;
    },
    get editor() {
      return _editor;
    },
    get originalEditor() {
      return (hasMethod(_editor, 'getOriginalEditor')) ? (_editor as MonacoDiffEditor).getOriginalEditor() : undefined;
    },
    get modifiedEditor() {
      return ((hasMethod(_editor, 'getModifiedEditor')) ? (_editor as MonacoDiffEditor).getModifiedEditor() : _editor) as MonacoCodeEditor;
    },
    get isCodeEditor() {
      return !(hasMethod(_editor, 'getOriginalEditor'));
    },
    get language() {
      return (this.isCodeEditor ?
        (((_editor.getModel() as MonacoTextModel)?.getLanguageId() || '') as ModelLanguage) :
        ((this.originalModel as MonacoTextModel)?.getLanguageId() || '' as ModelLanguage)) as ModelLanguage;
    },
    init() {
      if (!this.isCodeEditor) {
        initGeneral.apply(this);

        const modifiedModel = getModel(_modelId);
        applyTraitOnInstanced(this);
        const lang = (modifiedModel as MonacoTextModel).getLanguageId()!;
        switch (lang) {
          case 'xml':
            initXml.apply(this);
          default:
            initGeneral.apply(this);
            break;
        }
        // const originalModel = getModel(_originalModelId);
        // const lang = (_editor.getModel() as MonacoTextModel)?.getLanguageId();
      }
      else {
        applyTraitOnInstanced(this);
        const lang = (_editor.getModel() as MonacoTextModel)?.getLanguageId();
        switch (lang) {
          case 'xml':
            initXml.apply(this);
          default:
            initGeneral.apply(this);
            break;
        }
      }
    },
    deInit() {
      if (!this.isCodeEditor) {
        deInitGeneral.apply(this);
      }
      else {
        const lang = (_editor.getModel() as MonacoTextModel)?.getLanguageId();
        if (!lang) return;
        deApplyTraitOnInstanced(this);
        switch (lang) {
          case 'xml':
            deInitXml.apply(this);
          default:
            deInitGeneral.apply(this);
            break;
        }
      }
    },
    changeLanguage(lang: ModelLanguage) {
      if (!this.isCodeEditor) return;
      // remove old trait
      deApplyTraitOnInstanced(this);

      let editor = _editor;

      // remove all applied listener
      this.deInit();

      // change language model
      const model: MonacoTextModel = editor.getModel() as MonacoTextModel;
      monaco.editor.setModelLanguage(model!, lang);

      // remove marker map if any
      const { clear } = useMarkerPanel();
      clear(this.modelId)

      // install new listener
      this.init();

      // layouting and make editor focus again
      editor.layout();
      editor.focus();

      // apply new trait
      applyTraitOnInstanced(this);
    },
    focus() {
      _editor.focus();
    },
    layout() {
      _editor.layout();
      // console.log('fufuaa');
    },
    goto(position: monaco.IPosition) {
      _editor.revealPositionInCenter(position);
      _editor.setPosition(position);
    },
    /**
     * tidak seharusnya container di hapus karena desain applikasi satu container untuk semua editor di group yang sama
     */
    destroy() {
      const container = (this.editor).getContainerDomNode()!;
      if (this.isCodeEditor) {
        executeOnBeforeDisposeModel(this.model);
        this.disposeModel();
        this.disposeEditor();
      } else {
        // const domNode = (this.editor as MonacoEditor).getDomNode()!;
        // dispose original 
        executeOnBeforeDisposeModel(this.originalModel!);
        const originalEditor: MonacoCodeEditor = (_editor as MonacoDiffEditor).getOriginalEditor() as MonacoCodeEditor;
        const originalModel: MonacoTextModel = originalEditor.getModel() as MonacoTextModel;
        const originalDomNode = (originalEditor as monaco.editor.IStandaloneCodeEditor).getDomNode()!;
        if (originalDomNode) originalDomNode.remove();
        originalModel.dispose();
        originalEditor.dispose();
        // dispose modified
        executeOnBeforeDisposeModel(this.model);
        const modifiedEditor: MonacoCodeEditor = (_editor as MonacoDiffEditor).getModifiedEditor() as MonacoCodeEditor;
        const modifiedModel: MonacoTextModel = modifiedEditor.getModel() as MonacoTextModel;
        const modifiedDomNode = (originalEditor as monaco.editor.IStandaloneCodeEditor).getDomNode()!;
        if (modifiedDomNode) modifiedDomNode.remove();
        modifiedModel.dispose();
        modifiedEditor.dispose();
      }
      container.remove();
      // _dewatch();
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
      // _dewatch();
    },

    disposeModel(): void {
      if (this.isCodeEditor) {
        const model: MonacoTextModel = _editor.getModel() as MonacoTextModel;
        if (model) {
          // hapus marker
          const { clear } = useMarkerPanel();
          clear(model.id)
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