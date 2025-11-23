import { type ValidationInfo } from "xml-xsd-validator-browser";
import { type MonacoModel, type MonacoTextModel } from "./editor.type";

export type MarkerResult = ValidationInfo;

/**
 * @deprecated 
 * key: editor model id 
 */
export type MarkerInfo = Map<string, MarkerResult[]>

/**
 * @deprecated 
 * key: editor model id 
 */
export type MarkerData = {
  /** unique namespace */
  namespace:string;
  container: HTMLElement | null;
  action?(result:MarkerResult): void;
}

/**
 * @deprecated 
 * key: editor model id 
 */
export interface MarkerClass {
  /** key: unique namespace */
  map: Map<string, MarkerInfo>; 
  /** contain registered marker */
  list: MarkerData[];
  register(data:MarkerData):boolean;
  unregister(namespace:string):boolean;
}

// baru
export interface IMarkerInfo<T>{
  data: T;
};

/** di instance sekali saja diawal */
export interface IMarkerPanel<T> {
  // container: HTMLElement;  
  namespace: string;  
  map: WeakMap<MonacoTextModel, IMarkerInfo<T>>;
  name(name:string|null):string;
  clear(modelId:string) :void
}