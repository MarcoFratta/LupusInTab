


<script setup lang="ts">
interface Props {
  reason: string;
  player: any;
}

const props = defineProps<Props>();

const getReasonText = (reason: string) => {
  switch (reason) {
    case 'blocked':
      return 'Qualcuno ha bloccato il suo ruolo';
    case 'dead':
      return 'Non può usare il ruolo';
    case 'alive':
      return 'Deve essere morto per agire';
    case 'startNight':
      return `Puoi usare il tuo ruolo a partire dalla notte ${props.player?.roleState?.startNight || 2}`;
    case 'usageLimit':
      return 'Hai già usato questo ruolo il massimo numero di volte';
    default:
      return 'Non può usare il ruolo questa notte';
  }
};
</script>

<template>
  <div class="text-center p-2 space-y-1">
    <div class="text-amber-400 text-lg">🚫</div>
    <div>
      <div class="text-neutral-100 font-medium text-xs truncate max-w-full" :title="props.player?.name || 'Giocatore'">{{ props.player?.name || 'Giocatore' }} {{ reason === 'alive' ? 'vivo' : 'bloccato' }}</div>
      <div class="text-neutral-400 text-xs mt-0">
        {{ getReasonText(reason) }}
      </div>
    </div>
  </div>
</template>
