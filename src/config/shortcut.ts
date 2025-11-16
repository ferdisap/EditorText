import * as monaco from "monaco-editor";

/** key:string is id */
type ShortCut = Record<string, number[]>;

const sc :ShortCut = {
  "new.file": [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD]
}

export function getShortCut(id:string, shortcut: any){
  return sc[id] ?? shortcut;
}