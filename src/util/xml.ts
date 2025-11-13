/**
 * Rekursif mencari semua schema XSD yang diperlukan dari XML & XSD utama.
 * Termasuk:
 * - xs:import, xs:include, xs:redefine
 * - xsi:schemaLocation
 * - xsi:noNamespaceSchemaLocation
 * 
 * Menghasilkan Promise<string[]> yang berisi daftar URL schema.
 * 
 * @deprecated, dipindah ke xml-xsd-validation-browser
 * @return Promise resolved urls
 */
export async function findRequiredSchemas(
  xmlText: string,
  mainXsdUrl: string,
  mainXsdText?: string,
  visited?: Set<string>
): Promise<string[]> {
  const urls = visited ?? new Set<string>();

  const resolveUrl = (url: string): string => {
    try {
      return new URL(url, mainXsdUrl).href;
    } catch {
      return url;
    }
  };

  // --- 1️⃣ Ambil schemaLocation di XML instance ---
  const xmlDoc = new DOMParser().parseFromString(xmlText, "application/xml");
  const xsiNs = "http://www.w3.org/2001/XMLSchema-instance";
  const schemaLocation = xmlDoc.documentElement.getAttributeNS(xsiNs, "schemaLocation");
  const noNamespace = xmlDoc.documentElement.getAttributeNS(xsiNs, "noNamespaceSchemaLocation");

  if (schemaLocation) {
    const parts = schemaLocation.trim().split(/\s+/);
    for (let i = 1; i < parts.length; i += 2) {
      urls.add(resolveUrl(parts[i]));
    }
  }
  if (noNamespace) {
    urls.add(resolveUrl(noNamespace));
  }

  // --- 2️⃣ Ambil XSD utama (kalau belum disediakan) ---
  const xsdPromise = mainXsdText
    ? Promise.resolve(mainXsdText)
    : fetch(mainXsdUrl).then(r => r.text());

  // --- 3️⃣ Parse dan cari import/include/redefine ---
  return xsdPromise.then(xsdText => {
    const xsdDoc = new DOMParser().parseFromString(xsdText, "application/xml");
    const imports = xsdDoc.querySelectorAll(
      "xs\\:import, import, xs\\:include, include, xs\\:redefine, redefine"
    );

    const nestedPromises: Promise<any>[] = [];

    imports.forEach(el => {
      const loc = el.getAttribute("schemaLocation");
      if (loc) {
        const absUrl = resolveUrl(loc);
        if (!urls.has(absUrl)) {
          urls.add(absUrl);
          // Rekursif ke XSD yang diimpor
          const p = fetch(absUrl)
            .then(r => r.text())
            .then(subXsdText =>
              findRequiredSchemas(xmlText, absUrl, subXsdText, urls)
            )
            .catch(() => null); // abaikan error fetch individu
          nestedPromises.push(p);
        }
      }
    });

    // Tunggu semua rekursi selesai
    return Promise.all(nestedPromises).then(() => Array.from(urls));
    // return Promise.all(nestedPromises).then(() => {
    //   // const urlsFlipped = Array.from(urls)
    //   // console.log(urlsFlipped, Array.from(urls))
    //   // return urlsFlipped;
    //   return [
    //     "https://ferdisap.github.io/schema/w3org/2001/xml.xsd",
    //     "https://ferdisap.github.io/schema/s1000d/S1000D_5-0/xml_schema_flat/xlink.xsd",
    //     "https://ferdisap.github.io/schema/s1000d/S1000D_5-0/xml_schema_flat/dc.xsd",
    //     "https://ferdisap.github.io/schema/s1000d/S1000D_5-0/xml_schema_flat/rdf.xsd",
    //     "https://ferdisap.github.io/schema/s1000d/S1000D_5-0/xml_schema_flat/appliccrossreftable.xsd"
    //   ];
    // });
  });
}

// contoh penggunaan
// findRequiredSchemasRecursive(xmlText, "https://ferdisap.github.io/schema/s1000d/S1000D_5-0/xml_schema_flat/appliccrossreftable.xsd")
//   .then(schemaUrls => {
//     console.log("✅ Semua schema ditemukan:");
//     console.log(schemaUrls);
//     return Promise.all(schemaUrls.map(url => fetch(url).then(r => r.text())));
//   })
//   .then(schemaTexts => {
//     console.log("📦 Jumlah schema terunduh:", schemaTexts.length);
//     // lanjutkan validasi xmllint-wasm di sini
//   })
//   .catch(err => console.error("❌ Error:", err));


// export async function fetchSchema(schemaUrls: Array<string>): Promise<{ fileName: string; contents: string }[]> {
//   // Ambil semua isi schema
//   const schemaPromises = schemaUrls.map(async (url) => {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`Gagal fetch schema: ${url}`);
//     }
//     const contents = await response.text();
//     return { fileName: url, contents };
//   });

//   return Promise.all(schemaPromises);
// }
/**
 * @deprecated
 * @param schemaUrls 
 * @returns 
 */
export async function fetchSchema(
  schemaUrls: Array<string>
): Promise<{ fileName: string; contents: string }[]> {
  const schemaPromises = schemaUrls.map(async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Gagal fetch schema: ${url}`);
    }

    const contents = await response.text();

    // ambil hanya nama file di akhir URL (tanpa query string)
    const fileName = url.split("/").pop()?.split("?")[0] || "schema.xsd";

    return { fileName, contents };
  });

  return Promise.all(schemaPromises);
}

/**
 * @deprecated
 * @param schemas 
 * @returns 
 */
export function normalizeSchemas(
  schemas: { fileName: string; contents: any }[]
): { fileName: string; contents: string | Uint8Array }[] {
  return schemas.map(s => {
    let contents = s.contents;
    if (contents instanceof ArrayBuffer) {
      contents = new Uint8Array(contents);
    } else if (contents instanceof Blob) {
      throw new Error("Blob not supported — convert to text first");
    } else if (typeof contents !== "string" && !ArrayBuffer.isView(contents)) {
      throw new Error(`Unsupported schema contents for ${s.fileName}`);
    }
    return { fileName: s.fileName, contents };
  });
}

/**
 * Rekursif mencari semua schema XSD yang diperlukan dari XML & XSD utama.
 * Termasuk:
 * - xs:import, xs:include, xs:redefine
 * - xsi:schemaLocation
 * - xsi:noNamespaceSchemaLocation
 *
 * Mengembalikan string schema utama dengan seluruh dependensi XSD di-inline.
 */
/**
 * Rekursif mencari semua schema XSD yang diperlukan dan mengganti xs:import/include dengan inline schema text.
 */
/**
 * @deprecated
 * @param xmlText 
 * @param mainXsdUrl 
 * @param mainXsdText 
 * @param visited 
 * @param cache 
 * @returns 
 */
export async function buildInlineSchema(
  xmlText: string,
  mainXsdUrl: string,
  mainXsdText?: string,
  visited = new Set<string>(),
  cache = new Map<string, Document>()
): Promise<string> {
  const resolveUrl = (url: string): string => {
    try {
      return new URL(url, mainXsdUrl).href;
    } catch {
      return url;
    }
  };

  // Hindari loop
  if (visited.has(mainXsdUrl)) {
    const cachedDoc = cache.get(mainXsdUrl);
    return cachedDoc ? new XMLSerializer().serializeToString(cachedDoc) : "";
  }
  visited.add(mainXsdUrl);

  // Ambil teks schema utama
  const xsdText =
    mainXsdText ??
    (await fetch(mainXsdUrl).then(r => r.text().catch(() => "")));

  if (!xsdText) return "";

  const parser = new DOMParser();
  const xsdDoc = parser.parseFromString(xsdText, "application/xml");

  // Tangani semua import/include/redefine
  const importEls = Array.from(
    xsdDoc.querySelectorAll(
      "xs\\:import, import, xs\\:include, include, xs\\:redefine, redefine"
    )
  );

  for (const el of importEls) {
    const loc = el.getAttribute("schemaLocation");
    if (!loc) continue;

    const absUrl = resolveUrl(loc);
    if (visited.has(absUrl)) {
      // Sudah diproses → hapus elemen import
      el.parentNode?.removeChild(el);
      continue;
    }

    try {
      // Fetch schema anak dan inline-kan
      const subText = await fetch(absUrl).then(r => r.text());
      const inlinedSchema = await buildInlineSchema(
        xmlText,
        absUrl,
        subText,
        visited,
        cache
      );

      const subDoc = parser.parseFromString(inlinedSchema, "application/xml");
      const importedNodes = Array.from(subDoc.documentElement.children);

      // Ganti elemen import dengan anak-anak dari schema target
      const parent = el.parentNode;
      if (parent) {
        const commentStart = xsdDoc.createComment(` inlined from ${absUrl} `);
        parent.insertBefore(commentStart, el);

        importedNodes.forEach(node => {
          parent.insertBefore(xsdDoc.importNode(node, true), el);
        });

        const commentEnd = xsdDoc.createComment(` end inline ${absUrl} `);
        parent.insertBefore(commentEnd, el);

        parent.removeChild(el);
      }
    } catch (err) {
      const comment = xsdDoc.createComment(` failed to fetch ${loc} `);
      el.parentNode?.replaceChild(comment, el);
    }
  }

  cache.set(mainXsdUrl, xsdDoc);
  return new XMLSerializer().serializeToString(xsdDoc);
}


// contoh penggunaan
// import xmllint from "xmllint-wasm";

// export async function validateToSchema(xmlText: string, schemaUrl: string) {
//   // 1️⃣ Bangun schema inline lengkap
//   const inlineSchema = await buildInlineSchema(xmlText, schemaUrl);

//   // 2️⃣ Validasi
//   const result = await xmllint.validateXML({
//     xml: xmlText,
//     schema: [inlineSchema],
//   });

//   // 3️⃣ Hasil validasi
//   if (!result.errors) {
//     console.log("✅ XML valid!");
//     return [];
//   }

//   console.error("❌ Validation errors:", result.errors);
//   return result.errors.map(err => ({
//     line: err.loc?.lineNumber,
//     message: err.message,
//   }));
// }


