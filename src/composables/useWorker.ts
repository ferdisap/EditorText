import { reactive, onBeforeUnmount } from "vue";
import * as monaco from "monaco-editor";

// ===== Worker bawaan Monaco =====
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

// ===== Worker custom XML =====
import xmlWorker from "../worker/xml.worker?worker";
import { AttributeInfo, ValidationErrorInfo } from "@/types/xml";
import { ValidationInfo } from "xml-xsd-validator-browser";

/* ---------------------------------------------------------
   0️⃣ DEFINISI INTERFACE DAN TYPE
---------------------------------------------------------- */

export type WorkerMessageType = "validate" | "suggest" | "match-attr-info" | 'detect-schema-location' | "init" | "other";

// if error, there are any wrong or faultness in worker process
export type WorkerStatus = "working" | "done" | "error"

export interface BasePayload {
  uri?:string;
}

export interface ValidatePayload extends BasePayload{
  xmlText: string;
  schemaUrl: string;
}

export interface SuggestPayload extends BasePayload{
  context: string;
}

export interface MatchingAttrInfoPayload extends BasePayload{
  lineContent: string; // monaco, Get the text for a certain line.
  cursorIndex: number; // monaco, editor.getPosition().column - 1
}

export interface DetectSchemaLocationPayload extends BasePayload{
  xmlText: string;
}

export interface ReadyPayload extends BasePayload{
  ready: boolean;
}

/** Format balasan dari worker */
export interface WorkerResponse {
  id: string,
  type: WorkerMessageType,
  status: WorkerStatus;
  message?: string;
  payload: ValidatePayload | SuggestPayload | ReadyPayload | MatchingAttrInfoPayload | DetectSchemaLocationPayload;
  // payload: TPayload
  result?: WorkerResult | null;
}

// export type WorkerResult = ValidationInfo[] | monaco.languages.CompletionItem[] | AttributeInfo;
export type SchemaUrl = string;
export type WorkerResult = ValidationInfo[] | AttributeInfo | SchemaUrl;

/* ---------------------------------------------------------
   1️⃣ GLOBAL WORKER MANAGEMENT
---------------------------------------------------------- */

const workers: Partial<Record<string, Worker>> = {};
const workerReadiness: WeakMap<Worker, boolean> = new WeakMap();
const workerHandlers: WeakMap<Worker, Record<string, () => void>> = new WeakMap();
const pendingRequests = new Map<string,
  { resolve: (res: WorkerResponse) => void; reject: (err?: any) => void }
>();
const defWorkerResponseTimeout = 5000;


/** Buat instance worker baru berdasarkan bahasa */
function createWorker(label: string): Worker {
  switch (label) {
    case "json":
      return new jsonWorker();
    case "css":
    case "scss":
    case "less":
      return new cssWorker();
    case "html":
    case "handlebars":
    case "razor":
      return new htmlWorker();
    case "typescript":
    case "javascript":
      return new tsWorker();
    case "xml":
      return new xmlWorker();
    default:
      return new editorWorker();
  }
}

/** Gunakan worker bersama (shared singleton) */
function getOrCreateSharedWorker(label: string): Worker {
  if (!workers[label]) workers[label] = createWorker(label);
  return workers[label]!;
}

/** Hentikan dan hapus worker dari daftar shared */
export function terminateWorker(label: string | null) {
  if (label && typeof label === 'string' && workers[label]) {
    workers[label]!.terminate();
    delete workers[label];
  } else {
    for (const [lbl, wk] of Object.entries(workers)) {
      if (wk) {
        wk.terminate();
        delete workers[lbl];
      }
    }
  }
}

/* ---------------------------------------------------------
   2️⃣ GLOBAL REACTIVE STATE
---------------------------------------------------------- */

// export const WorkerState = reactive({
//   xml: {} as Partial<WorkerResponse>,
// });

/* ---------------------------------------------------------
   3️⃣ MONACO ENVIRONMENT SETUP
---------------------------------------------------------- */

function installWorkerEnvironment(mode: "shared" | "isolated" = "shared") {
  // Cegah override jika sudah diinisialisasi
  if (!(self as any).MonacoEnvironment?.getWorker) {
    (self as any).MonacoEnvironment = {
      getWorker(_: string, label: string) {
        return mode === "shared"
          ? getOrCreateSharedWorker(label)
          : createWorker(label);
      },
    };
  }
}

/* ---------------------------------------------------------
   4️⃣ COMPOSABLE: useWorker
---------------------------------------------------------- */

/**
 * @param language 
 * @param mode if isolated, terminate function will not affected to worker
 * @returns 
 */
export function useWorker(
  language: string,
  mode: "shared" | "isolated" = "shared"
) {
  installWorkerEnvironment(mode);

  const worker =
    mode === "shared"
      ? getOrCreateSharedWorker(language)
      : createWorker(language);

  const isReady = () => workerReadiness.has(worker) && workerReadiness.get(worker);

  registerHandler();

  /**
   * 🔹 Kirim pesan ke worker dan tunggu respons-nya
   */
  function postToWorker(
    type: WorkerMessageType,
    payload: WorkerResponse["payload"]
  ): Promise<WorkerResponse> {
    const id = crypto.randomUUID();
    // console.trace(id, isReady);
    return new Promise(async (resolve, reject) => {
      pendingRequests.set(id, { resolve, reject });

      if (isReady()) {
        const status: WorkerStatus = "working";
        if(!payload.uri) payload.uri = window.location.href;
        const message: WorkerResponse = { id, status, type, payload };
        worker.postMessage(message);
        const timer = setTimeout(() => {
          if (!pendingRequests.has(id)) {
            const response: WorkerResponse = {
              id,
              type: "init",
              message: "Worker response timeout",
              status: "error",
              payload: {
                ready: false
              } as ReadyPayload
            };
            console.error("[xml-xsd-validator-browser] Worker response timeout ⚠️ ");
            return reject(response);
          }
          clearTimeout(timer);
        }, defWorkerResponseTimeout)
      } else {
        const response: WorkerResponse = {
          id,
          type: "init",
          message: "Worker not ready",
          status: "error",
          payload: {
            ready: false
          } as ReadyPayload
        };
        console.error("[xml-xsd-validator-browser] Worker not ready ⚠️ ");
        return reject(response);
      }
    });
  }

  /**
   * 🔹 adding default handlers
   * @returning object that used to stop the handler
   */
  function registerHandler(
    handlers?: Record<string, (e: MessageEvent<WorkerResponse>) => void>
  ): { default: () => void } & Record<string, () => void> {

    // Ensure we have a properly typed handler map (fall back as an empty map)
    const registeredHandlers = (workerHandlers.get(worker) ?? {}) as Record<string, () => void>;

    // If default handler is not registered yet, add it
    if (!registeredHandlers["default"]) {
      const defaultHandler = (e: MessageEvent<WorkerResponse>) => {
        const { id, type, payload } = e.data;
        if (type === "init") {
          if ((payload as ReadyPayload).ready) {
            console.log(`[editor-${language}] Worker is ready ✅`);
            workerReadiness.set(worker, true);
            return;
          }
        }

        // Resolve promise bila id cocok
        if (pendingRequests.has(id)) {
          const { resolve } = pendingRequests.get(id)!;
          const data = e.data;
          if (data.status === "working") {
            data.status = "done";
            resolve(data);
            setTimeout(() => pendingRequests.delete(data.id), defWorkerResponseTimeout)
          } else if (data.status === "error") {
            const { reject } = pendingRequests.get(id)!;
            const response: WorkerResponse = {
              id,
              type,
              message: "Error during work.",
              status: data.status,
              payload,
            };
            console.error("[editor] Worker cannot process payload ⚠️ ");
            reject(response);
          }
        }
      };
      worker.addEventListener("message", defaultHandler);
      registeredHandlers["default"] = () => worker.removeEventListener("message", defaultHandler);
      workerHandlers.set(worker, registeredHandlers);
    }

    // Register any additional handlers provided and record their removers
    if (handlers) {
      for (const [name, handler] of Object.entries(handlers)) {
        worker.addEventListener("message", handler);
        registeredHandlers[name] = () => worker.removeEventListener("message", handler);
      }
      workerHandlers.set(worker, registeredHandlers);
    }

    return registeredHandlers as { default: () => void } & Record<string, () => void>;
  }

  /**
   * 🔹 Terminasi worker (manual)
   */
  function terminate() {
    if (mode === "shared") terminateWorker(language);
    else worker.terminate();
  }

  return {
    worker,
    postToWorker,
    registerHandler,
    terminate,
  };
}
