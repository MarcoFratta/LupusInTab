<script setup>
import PlayerRoleCard from './PlayerRoleCard.vue';

const props = defineProps({
    gameState: { type: Object, required: true },
    leftPlayer: { type: Object, required: true },
    rightPlayer: { type: Object, required: true },
    leftLabel: { type: String, required: true },
    rightLabel: { type: String, required: true },
    centerContent: { type: Object, required: true }
});

const centerContent = props.centerContent;
</script>

<template>
    <div class="space-y-2 text-sm">
        <div class="text-center mb-2">
            <span class="text-xs text-neutral-400">{{ centerContent.action }}</span>
        </div>
        
        <!-- Mobile: Stack vertically with center content below -->
        <div class="flex flex-col items-center gap-3 sm:hidden">
            <div class="flex items-stretch gap-3 justify-center w-full">
                <PlayerRoleCard 
                    :game-state="gameState" 
                    :player="leftPlayer" 
                    :label="leftLabel" 
                    align="left"
                />
                
                <PlayerRoleCard 
                    :game-state="gameState" 
                    :player="rightPlayer" 
                    :label="rightLabel" 
                    align="right"
                />
            </div>
            
            <!-- Center content below on mobile -->
            <div class="flex flex-col items-center gap-2">
                <div v-if="centerContent.declaredRole" class="px-1.5 py-1.5 rounded text-sm font-medium text-center inline-block"
                     :style="{ color: centerContent.declaredRole.color || '#9ca3af' }">
                    {{ centerContent.declaredRole.name }}
                </div>
                <div v-if="centerContent.status" class="flex items-center gap-2">
                    <svg v-if="centerContent.status.isCorrect" width="16" height="16" viewBox="0 0 24 24" class="text-green-400">
                        <path d="M20 7L9 18l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" class="text-red-400">
                        <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span :class="centerContent.status.isCorrect ? 'text-green-400 text-xs' : 'text-red-400 text-xs'">
                        {{ centerContent.status.text }}
                    </span>
                </div>
            </div>
        </div>
        
        <!-- Desktop: Keep original horizontal layout with center content in middle -->
        <div class="hidden sm:flex items-stretch gap-3 justify-center">
            <PlayerRoleCard 
                :game-state="gameState" 
                :player="leftPlayer" 
                :label="leftLabel" 
                align="left"
            />
            
            <div class="flex-1 flex flex-col items-center gap-2">
                <div v-if="centerContent.declaredRole" class="px-1.5 py-1.5 rounded text-sm font-medium text-center inline-block"
                     :style="{ color: centerContent.declaredRole.color || '#9ca3af' }">
                    {{ centerContent.declaredRole.name }}
                </div>
                <div v-if="centerContent.status" class="flex items-center gap-2">
                    <svg v-if="centerContent.status.isCorrect" width="16" height="16" viewBox="0 0 24 24" class="text-green-400">
                        <path d="M20 7L9 18l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" class="text-red-400">
                        <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span :class="centerContent.status.isCorrect ? 'text-green-400 text-xs' : 'text-red-400 text-xs'">
                        {{ centerContent.status.text }}
                    </span>
                </div>
            </div>
            
            <PlayerRoleCard 
                :game-state="gameState" 
                :player="rightPlayer" 
                :label="rightLabel" 
                align="right"
            />
        </div>
    </div>
</template>
