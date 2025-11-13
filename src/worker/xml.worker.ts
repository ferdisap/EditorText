import { ExtractSchemaLocationPayload, MatchingAttrInfoPayload, ReadyPayload, SchemaUrl, ValidatePayload, WorkerResponse, WorkerResult } from "@/composables/useWorker";
import { AttributeInfo } from "@/types/xml";
import { extractSchemaLocation, validateXml, ValidationInfo } from "xml-xsd-validator-browser";
import { matchingAttrInfo } from "./fn_attribute";

const payloadReady: ReadyPayload = {
  "ready": true
}
const responseReady: WorkerResponse = {
  "id": "",
  "type": "init",
  "payload": payloadReady,
  "status": "done",
}
self.postMessage(responseReady);
self.onmessage = async (e: MessageEvent<WorkerResponse>) => {
  const data = e.data as WorkerResponse;
  switch (data.type) {
    case "extract-schema-location":
      const schemas = extractSchemaLocation((data.payload as ExtractSchemaLocationPayload).xmlText);
      data.result = schemas[0] ? schemas[0].filename as SchemaUrl : null;
      self.postMessage(data);
      break;
    case "match-attr-info":
      data.result = matchingAttrInfo(data.payload as MatchingAttrInfoPayload);
      self.postMessage(data);
      break;
    case "validate":
      // data.result = (await validate((e.data.payload as ValidatePayload).xmlText, (e.data.payload as ValidatePayload).schemaUrl)) ;
      try {
        await validateXml((e.data.payload as ValidatePayload).xmlText, (e.data.payload as ValidatePayload).schemaUrl)
        data.result = null;
      }
      catch (v) {
        data.result = v as ValidationInfo[];
      }
      self.postMessage(data);
      break;
    case "suggest":
      self.postMessage("suggesting not available");
      break;
  }
};