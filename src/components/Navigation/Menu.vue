<script setup lang="ts">
import { useMenu } from '@js-editor/composables/navigation/useMenu';

	const props = defineProps<{ active?: string }>();
	const emits = defineEmits(["select"]);

  let { MenuList } = useMenu("nav.menu.top");
  const TopMenus = MenuList;

  ({ MenuList } = useMenu("nav.menu.bottom"));
  const BottomMenus = MenuList;

  const onclick = (e:PointerEvent, id:string) => {
    const item = (TopMenus.value.find((it) => it.id === id) || BottomMenus.value.find((it) => it.id === id))!;
    if(item.action){
      item.action(e)
    } else {
      emits('select', item.id);
    }

  }
</script>

<template>
	<div class="nav-menu relative">
		<div class="nav-menu-wrapper-top">
			<button
				v-for="item in TopMenus"
				:key="item.id"
				:class="['nav-menu-item', { active: item.id === active }]"
				@click.stop="onclick($event, item.id)"
				:title="item.label"
			>
				<i :class="['codicon', item.icon]"></i>
			</button>
		</div>
		<div class="nav-menu-wrapper-bottom" v-if="BottomMenus.length">
			<button
				v-for="item in BottomMenus"
				:key="item.id"
				:class="['nav-menu-item', { active: item.id === active }]"
				@click.stop="onclick($event, item.id)"
				:title="item.label"
			>
				<i :class="['codicon', item.icon]"></i>
			</button>
		</div>
	</div>
</template>
