import { IDisposable } from "monaco-editor";

export interface IDisposableRecord {
  namespace: string,
  disposeAble: IDisposable,
}