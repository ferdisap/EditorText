<script setup lang="ts">
	import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
	import { useWorkspace } from "@js-editor/composables/useWorkspace";
	import Group from "./Group.vue";
	import { registerCompletionItemProvider } from "@js-editor/languages/xml/init";
	import { useTheme } from "@js-editor/composables/useTheme";
	import { terminateWorker } from "@js-editor/composables/useWorker";
	import Marker from "./Marker.vue";
	import Prompt from "./Prompt.vue";
	import { usePrompt } from "@js-editor/composables/usePrompt";
	import Sidebar from "./Navigation/Sidebar.vue";
	import { useHidden } from "@js-editor/composables/navigation/useHidden";
	import {
		onNavContentResized,
		onNavContentToggled,
	} from "@js-editor/plugins/sidebar.plugin";
	import { type WSpaceDataProp } from "@js-editor/core/Workspace";
	import { type GroupClass } from "@js-editor/types/editor.type";
	import { unregisterAction } from "@js-editor/plugins/action.plugin";
	import { type WorkspaceClass } from "@js-editor/types/workspace.type";
	import ContextMenu from "./ContextMenu/ContextMenu.vue";
  import { MenuItemNested, useMenu, useMenuPosition } from "@js-editor/composables/navigation/useMenu";

	const props = defineProps<{
		data: WSpaceDataProp,
    menuNs?: string,
	}>();

	const { workspace, relayout } = useWorkspace();
	registerCompletionItemProvider(workspace as unknown as WorkspaceClass);

	const { applyTheme } = useTheme();
	applyTheme();

	const groups = computed(() => workspace.groups as unknown as GroupClass[]);

	const editorGroupWrapper = ref<HTMLElement | null>(null);

	const { isHidden } = useHidden();

	onBeforeUnmount(() => {
		terminateWorker(null);
	});

	const { navContent } = useHidden();

	const onNavToggled = () => {
		const currentWidth = editorGroupWrapper.value?.clientWidth; // 1112
		nextTick(() => {
			// jika nav content hidden maka set 100%
			if (isHidden.value) {
				editorGroupWrapper.value!.style.width = "100%";
				relayout();
			} else {
				const navContentWidth = navContent.value!.clientWidth; // 253
				const finalWidth = currentWidth! - navContentWidth;
				editorGroupWrapper.value!.style.width = finalWidth + "px";
				console.log(currentWidth, editorGroupWrapper.value?.clientWidth);
				relayout({ size: finalWidth, unit: "px" });
			}
		});
	};

	const onFirstRendered = () => {
		if (navContent.value) {
			const navContentWidth = navContent.value!.clientWidth; // 253
			const sideBarWidth = navContentWidth + 48;
			editorGroupWrapper.value!.style.width = `calc(100vw - ${sideBarWidth}px)`;
		}
	};

	onMounted(() => {
		onNavContentToggled(onNavToggled);

		onNavContentResized((delta: number) => {
			nextTick(() => {
				editorGroupWrapper.value!.style.width = `calc(100% - ${delta}px)`;
				relayout();
			});
		});
	});

	// top.ws.relayout = relayout;
	// top.ws.onFirstRendered = onFirstRendered;

	onMounted(() => {
		for (const group of props.data.groups) {
			const addedGroup = workspace.addGroup();
			nextTick(() => {
				for (const editor of group.editors) {
					if (editor.type === "compare") {
						addedGroup.compareFile(editor.originalUri!, editor.uri!);
					} else {
						addedGroup.newFile("", "", editor.uri || "");
					}
				}
			});
		}
		onFirstRendered();
	});

	onBeforeUnmount(() => {
		unregisterAction("new.tab");
		unregisterAction("toggle.theme");
		unregisterAction("split.tab");
		unregisterAction("compare.model");
	});
	// onMounted(() => {
	//   if (workspace.groups.length === 0) {
	//     const group1 = workspace.addGroup("Main Group");
	//     // const group2 = workspace.addGroup("Second Group");
	//     workspace.setActiveGroup(group1.id);

	//     setTimeout(() => {
	//       group1.newFile(
	//         "",
	//         "xml",
	//         "http://localhost:5173/test/DMC-BRAKE-AAA-DA1-00-00-00AA-041A-A_003-00_EN-US.XML"
	//       );
	//       onFirstRendered();
	//     }, 1000);
	//   }
	// });

	const { isOpenPrompt } = usePrompt();

	
</script>

<template>
	<div class="workspace">
		<!-- LEFT NAVIGATION -->
		<Sidebar/>

		<!-- EDITOR AREA -->
		<div class="workspace-editor">
			<div ref="editorGroupWrapper" class="editor-group-wrapper">
				<Group v-for="group in groups" :key="group.id" :group="group" />
			</div>
			<Marker />
		</div>

		<Prompt v-if="isOpenPrompt" />
    <ContextMenu :menu-ns="menuNs ?? 'ctx.menu'"/>
	</div>
</template>
