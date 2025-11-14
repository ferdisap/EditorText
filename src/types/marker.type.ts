import { ValidationInfo } from "xml-xsd-validator-browser";

export type MarkerResult = ValidationInfo;

/** key: editor model id */
export type MarkerInfo = Map<string, MarkerResult[]>

export type MarkerData = {
  /** unique namespace */
  namespace:string;
  container: HTMLElement | null;
  action?(result:MarkerResult): void;
}

export type MarkerClass = {
  /** key: unique namespace */
  map: Map<string, MarkerInfo>; 
  /** contain registered marker */
  list: MarkerData[];
  register(data:MarkerData):boolean;
  unregister(namespace:string):boolean;
}