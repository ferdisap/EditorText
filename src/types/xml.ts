export interface AttributeInfo {
  name: string,
  value: string | boolean | number | null,
  insideValue: boolean,
};

/**
 * @deprecated pakai ValidationInfo xml-xsd-validation-browser
 */
export interface ValidationErrorInfo {
  message: string;
  startLine: number,
  startColumn: number,
  endLine?: number,
  endColumn?: number,
}