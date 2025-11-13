let xmllintInstance: any | null = null;

export async function loadXmllint(): Promise<any> {
  if (xmllintInstance) return xmllintInstance;

  // Load script JS
  const script = document.createElement("script");
  script.src = "/xmllint/xmllint.js";
  document.body.appendChild(script);

  await new Promise((resolve) => {
    script.onload = resolve;
  });

  // @ts-ignore (karena window.xmllint berasal dari script global)
  xmllintInstance = await window.xmllint({
    locateFile: () => "/xmllint/xmllint.wasm",
  });

  return xmllintInstance;
}
