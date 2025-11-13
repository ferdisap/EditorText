import type * as monaco from "monaco-editor";
import { MonacoTextModel } from "./editor";

export type MapModelEditor = { id: string, editorsInstancesId: string[] };

export type ModelStoreClass = {
  createModel(value?: string, language?: string, uri?: string | null): string;
  getModel(idOrUri: string): MonacoTextModel | undefined;
  disposeModel(id: string): void;
  clear(): void;

  models: MonacoTextModel[];
  // modelAndEditorRelation: Map<string, string[]>;
  hasUriUsed(uri: string): string | undefined;
  mapModelAndEditor: (modelId: string | null, editorIds: string[] | null) => Array<MapModelEditor> ;
}

export type ModelLanguage = "xml" | "plaintext" | "";