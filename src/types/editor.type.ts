import * as monaco from "monaco-editor";
import { ParseContext } from "xsd-parser";
import { ModelLanguage } from "./model.type";
import { SchemaUrl } from "@/composables/useWorker";
import { Ref } from "vue";

export type Dimension = {
  unit: string,
  size: number
}

export type GroupClass = {
  id: string;
  name: string;
  tabs: TabClass[];
  activeTabId: string | undefined;
  activeTab: TabClass | undefined;
  container: Ref<HTMLElement | null>;
  dimension: {
    width: Dimension;
    height: Dimension;
  }

  addTab(tab: TabClass): void
  setActiveTab(tabId: string): void
  closeTab(tabId: string): void
  layout(width?:Dimension, height?:Dimension): void

  newFile(value?: string, language?: string, uri?: string): TabClass | void;
  splitFile(uri: string): TabClass | void;
  compareFile(originalUri: string, modifiedUri: string): TabClass | void
  disposeAll(): void
}

export type TabClass = {
  id: string;
  instance: EditorClass;
  name: string;
  close(): void
}

export type EditorClass = {
  id: string;
  name: string;
  /**
   * @returns string id or modified id if DiffEditor
   */
  modelId: string;
  /**
   * @returns string | undefined modified id if DiffEditor
   */
  originalModelId: string | undefined;
  editor: MonacoEditor; // untuk MonacoTextModel, bukan DiffEditor
  container: HTMLDivElement;
  language: ModelLanguage;
  isCodeEditor: boolean,
  model: MonacoTextModel; // untuk MonacoTextModel, bukan DiffEditor
  originalModel: MonacoTextModel | undefined; // untuk MonacoTextModel, nukan DiffEditor
  originalEditor: MonacoCodeEditor | undefined;
  modifiedEditor: MonacoCodeEditor;
  init(): void;
  deInit(): void;
  changeLanguage(language: ModelLanguage): void
  focus(): void;
  layout(): void;
  goto(position: monaco.IPosition): void;
  destroy(): void;
  disposeEditor(): void
  disposeModel(): void
}

export interface EditorXMLClass extends EditorClass {
  schemaUrl: SchemaUrl;
  root: string;
  schema: ParseContext["schema"];
  setSchemaByUrl(url: string): void
}

export type EditorTheme = monaco.editor.BuiltinTheme

export type MonacoEditor = MonacoCodeEditor | MonacoDiffEditor;

export type MonacoCodeEditor = monaco.editor.IStandaloneCodeEditor;

export type MonacoDiffEditor = monaco.editor.IStandaloneDiffEditor;

export type MonacoModel = monaco.editor.ITextModel | monaco.editor.IDiffEditorModel;

export type MonacoTextModel = monaco.editor.ITextModel;

export type MonacoDiffModel = monaco.editor.IDiffEditorModel;

export type MonacoEditorOptions = {
  theme?: EditorTheme,
  automaticLayout?: boolean
  minimap?: {
    enabled: boolean
  },
  scrollBeyondLastLine?: boolean,
  autoDetectHighContrast?: boolean,
}

export type MonacoDiffEditorOptions = {
  theme?: EditorTheme,
  automaticLayout?: boolean
  scrollBeyondLastLine?: boolean,
  autoDetectHighContrast?: boolean,
  minimap?: {
    enabled: boolean
  },
  renderSideBySide?: boolean,
}