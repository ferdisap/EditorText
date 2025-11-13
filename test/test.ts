import { validateFormXml, validateSchemaXml } from "./xmlValidator";

(async () => {
  const xml = `<root><item>abc</item></root>`;
  const xsd = `
    <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
      <xs:element name="root">
        <xs:complexType>
          <xs:sequence>
            <xs:element name="item" type="xs:string"/>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
    </xs:schema>
  `;

  console.log("Form validation:", await validateFormXml(xml));
  console.log("Schema validation:", await validateSchemaXml(xml, xsd));
})();
