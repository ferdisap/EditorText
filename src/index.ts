
// component
export { default as Workspace } from "./components/Workspace.vue";
export { default as Group } from "./components/Group.vue";
export { default as Editor } from "./components/Editor.vue";
export { default as Marker } from "./components/Marker.vue";
export { default as Prompt } from "./components/Prompt.vue";
export { default as Tab } from "./components/Tab.vue";
export { default as Path } from "./components/Path.vue";
export { default as Detail } from "./components/Marker/Detail.vue";
export { default as Problem } from "./components/Marker/Problem.vue";
export { default as TabDetail } from "./components/Marker/TabDetail.vue";
export { default as TabProblem } from "./components/Marker/TabProblem.vue";

// composeable
export * from "./composables/useEditorContainer";
export * from "./composables/useMarkerPanel";
export * from "./composables/useModelstore";
export * from "./composables/usePrompt";
export * from "./composables/useResizePanel";
export * from "./composables/useSearch";
export * from "./composables/useStorage";
export * from "./composables/useTheme";
export * from "./composables/useWorker";
export * from "./composables/useWorkspace";
export * from "./composables/navigation/useHidden";
export * from "./composables/navigation/useTreeFolder";

// config
export * from "./config/shortcut";

// core
export * from "./core/Editor";
export * from "./core/Group";
export * from "./core/Marker";
export * from "./core/ModelStore";
export * from "./core/Tab";
export * from "./core/Workspace";
export * from "./core/panel/Detail";
export * from "./core/panel/Problem";
export * from "./core/traits/apply";
export * from "./core/traits/editor/general.trait";
export { init as initXml, deInit as deInitXml } from "./core/traits/editor/xml.trait";

// language
export * from "./languages/detection";
export * from "./languages/xml/attribute";
export * from "./languages/xml/element";
export * from "./languages/xml/init";
export * from "./languages/xml/schema";
export * from "./languages/xml/tooltip";

// plugins
export * from "./plugins/action.plugin";
export * from "./plugins/editor.plugin";
export * from "./plugins/marker.plugin";
export * from "./plugins/model.plugin";
export * from "./plugins/onDidChangeCursorSelection.plugin";
export * from "./plugins/onDidChangeModelContent.plugin";
export * from "./plugins/sidebar.plugin";
export * from "./plugins/tree.plugin";

// type
export * from "./types/editor.type";
export * from "./types/marker.type";
export * from "./types/model.type";
export * from "./types/plugins.type";
export * from "./types/tree.type";
export * from "./types/workspace.type";
export * from "./types/xml.type";

// util
export * from "./util/function";
export * from "./util/htmlElement";
export * from "./util/number";
export * from "./util/string";
export * from "./util/time";
export * from "./util/xml";

// worker
// export * from "./worker/index";
export * from "./worker/fn_attribute";
export * from "./worker/xml.worker";