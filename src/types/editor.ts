import * as monaco from "monaco-editor";
import { ParseContext } from "xsd-parser";
import { ModelLanguage } from "./model";
import { SchemaUrl } from "@/composables/useWorker";

export type GroupClass = {
  id: string;
  name: string;
  tabs: TabClass[];
  activeTabId: string | null;
  activeTab: TabClass;

  addTab(tab: TabClass): void
  setActiveTab(tabId: string): void
  closeTab(tabId: string): void

  newFile(value?: string, language?: string, uri?: string): TabClass | void;
  splitFile(uri:string):TabClass | void;
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
  modelId: string;
  editor: MonacoEditor;
  container: HTMLDivElement;
  language: ModelLanguage;
  isCodeEditor: boolean,
  init(): void;
  // changeMonacoEditor(editor:MonacoEditor):void;
  changeLanguage(language:ModelLanguage):void
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

export type MonacoEditor = monaco.editor.IStandaloneCodeEditor | monaco.editor.IStandaloneDiffEditor;

export type MonacoCodeEditor = monaco.editor.IStandaloneCodeEditor;

export type MonacoDiffEditor = monaco.editor.IStandaloneDiffEditor;

export type MonacoModel = monaco.editor.ITextModel | monaco.editor.IDiffEditorModel;

export type MonacoTextModel = monaco.editor.ITextModel;

export type MonacoDiffModel = monaco.editor.IDiffEditorModel;

export type MonacoEditorOptions = {
  theme?: EditorTheme,
  automaticLayout?: boolean
}