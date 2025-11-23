import { type AttributeInfo } from "@/types/xml.type";

/**
 * Matching the line content by regex
 * untuk deteksi nama atribut dan posisi ketika cursor berada di dalam value-nya.
 * Mendukung:
 * - Value belum lengkap (tanpa penutup kutip)
 * - Posisi kursor di tengah value
 * - nama Attribute tanpa namespace (contoh: xsi:noNamespaceLocation -> noNamespaceLocation saja)
 */
export function matchingAttrInfo(params: {lineContent:string, cursorIndex:number}) :AttributeInfo | null {
  const lineContent = params.lineContent;
  const cursorIndex = params.cursorIndex;
  const beforeCursor = lineContent.slice(0, cursorIndex);
  // regex kuat untuk mendeteksi attribute, dengan atau tanpa namespace
  const attrRegex = /([:\w-]+)\s*=\s*(?:"([^"]*)"?|'([^']*)'?|([^\s>]*))/g;

  let match: RegExpExecArray | null;
  let found: AttributeInfo | null = null;

  while ((match = attrRegex.exec(lineContent))) {
    const fullName = match[1];
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;

    const valueStartIndex = lineContent.indexOf("=", startIndex) + 1;
    const valueEndIndex = endIndex;

    const insideValue = cursorIndex >= valueStartIndex && cursorIndex <= valueEndIndex;

    if (insideValue) {
      // ambil nama tanpa prefix namespace
      const name = fullName.includes(":") ? fullName.split(":").pop()! : fullName;

      found = { name, value, insideValue: true };
      break;
    }
  }

  // fallback: mungkin baru mengetik nama attribute
  if (!found) {
    const nameMatch = beforeCursor.match(/([:\w-]+)$/);
    if (nameMatch) {
      const fullName = nameMatch[1];
      const name = fullName.includes(":") ? fullName.split(":").pop()! : fullName;
      found = { name, value: null, insideValue: false };
    }
  }

  return found;
}