import { ValidationErrorInfo } from "@/types/xml.type";
import { loadXmllint } from "./xmllintLoader";

/**
 * Validasi Well-Formed XML (tanpa schema)
 */
export async function validateFormXml(
  xmlText: string
): Promise<ValidationErrorInfo[]> {
  const xmllint = await loadXmllint();
  const result = xmllint.validateXML({ xml: xmlText });

  if (!result.errors) return [];

  return parseErrors(result.errors);
}

/**
 * Validasi XML terhadap XSD schema
 */
export async function validateSchemaXml(
  xmlText: string,
  schemaText: string
): Promise<ValidationErrorInfo[]> {
  const xmllint = await loadXmllint();
  const result = xmllint.validateXML({ xml: xmlText, schema: schemaText });

  if (!result.errors) return [];

  return parseErrors(result.errors);
}

/**
 * Parsing error string ke posisi baris/kolom
 */
function parseErrors(errors: string[]): ValidationErrorInfo[] {
  return errors.map((err) => {
    const match = err.match(/:(\d+):(\d+):\s*(.*)/);
    return {
      startLineNumber: match ? parseInt(match[1]) : 1,
      startColumn: match ? parseInt(match[2]) : 1,
      endLineNumber: match ? parseInt(match[1]) : 1,
      endColumn: match ? parseInt(match[2]) + 1 : 1,
      message: match ? match[3].trim() : err,
    };
  });
}
