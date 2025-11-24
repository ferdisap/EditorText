<script setup lang="ts">
	import { defineProps, defineEmits, ref, computed, nextTick } from "vue";
	import ContextMenuItem from "./ContextMenuItem.vue";
	import { searchMenuItemNested, useMenu, useMenuPosition } from "@/composables/navigation/useMenu";

	const props = defineProps<{
		menuNs: string;
	}>();

	const container = ref<HTMLElement | null>(null);

	const { MenuList, visible } = useMenu(props.menuNs);
	const { position, set } = useMenuPosition(props.menuNs);

	function onSelect(e:PointerEvent, id: string) {
		visible.value = false;

    const menuItem = searchMenuItemNested(id, MenuList.value);
    if(menuItem?.action){
      menuItem.action(e);
    }
	}

	const top = computed(() => {
		nextTick(() => {
			const containerHeight = container.value!.clientHeight;
			const documentHeight = document.documentElement.clientHeight;
      if(position.value.y + containerHeight > documentHeight){
        set({
          x: position.value.x,
          y: position.value.y + (-containerHeight),
        });
      }
		});
		return position.value.y + "px";
	});
	const left = computed(() => {
		return position.value.x + "px";
	});
</script>

<template>
	<div
		ref="container"
		v-if="visible"
		class="context-menu"
		:style="{ top, left }"
		@contextmenu.prevent
	>
		<ContextMenuItem
			v-for="(item, idx) in MenuList"
			:key="idx"
			:item="item"
			@select="onSelect($event, item.id)"
		/>
	</div>
</template>
