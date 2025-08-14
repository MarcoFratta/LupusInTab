<script setup>
const props = defineProps({
	label: { type: String, required: true },
	leftItems: { type: Array, required: true }, // Array<{ label: string, color?: string, variant?: 'wolf'|'village'|'violet'|'emerald'|'yellow'|'neutral' }>
	rightItems: { type: Array, required: true }, // Array<{ label: string, color?: string, variant?: 'wolf'|'village'|'violet'|'emerald'|'yellow'|'neutral' }>
	dense: { type: Boolean, default: true },
});

const baseChip = 'rounded font-medium border';
const denseChip = 'px-1.5 py-0.5 text-[10px]';
const normalChip = 'px-2 py-0.5 text-[11px]';

function chipClass(variant) {
	const tone = String(variant || 'neutral');
	if (tone === 'wolf') return `${baseChip} ${props.dense ? denseChip : normalChip} bg-red-500/20 text-red-300 border-red-500/30`;
	if (tone === 'village' || tone === 'emerald') return `${baseChip} ${props.dense ? denseChip : normalChip} bg-emerald-500/20 text-emerald-300 border-emerald-500/30`;
	if (tone === 'yellow') return `${baseChip} ${props.dense ? denseChip : normalChip} bg-yellow-500/20 text-yellow-300 border-yellow-500/30`;
	if (tone === 'violet') return `${baseChip} ${props.dense ? denseChip : normalChip} bg-violet-500/20 text-violet-300 border-violet-500/30`;
	return `${baseChip} ${props.dense ? denseChip : normalChip} text-neutral-200 border-neutral-600/40`;
}

function hexToRgba(hex, alpha) {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
	if (!m) return null;
	const r = parseInt(m[1], 16);
	const g = parseInt(m[2], 16);
	const b = parseInt(m[3], 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function chipStyle(item) {
	if (item && typeof item.color === 'string' && item.color) {
		return {
			backgroundColor: hexToRgba(item.color, 0.18) || undefined,
			color: item.color,
			borderColor: hexToRgba(item.color, 0.35) || undefined,
		};
	}
	return undefined;
}
</script>

<template>
  <div class="flex items-center justify-between gap-2 w-full">
    <!-- Left side -->
    <div class="flex flex-wrap items-center gap-1 min-w-0 flex-1">
      <span v-for="(i, idx) in leftItems" :key="'l-' + idx" :class="chipClass(i.variant)" :style="chipStyle(i)">{{ i.label }}</span>
    </div>
    <!-- Arrow with label above -->
    <div class="flex flex-col items-center mx-2 shrink-0">
      <span class="text-[10px] text-neutral-400 leading-none">{{ label }}</span>
      <svg width="22" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-neutral-400">
        <path d="M3 12h15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M14 7l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <!-- Right side -->
    <div class="flex flex-wrap items-center gap-1 min-w-0 flex-1 justify-end">
      <span v-for="(i, idx) in rightItems" :key="'r-' + idx" :class="chipClass(i.variant)" :style="chipStyle(i)">{{ i.label }}</span>
    </div>
  </div>
</template>



