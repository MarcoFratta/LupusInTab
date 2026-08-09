import { createPinia, defineStore, setActivePinia } from 'pinia';
import { reactive } from 'vue';

const useStore = defineStore('game', () => {
    const state = reactive({
        players: [],
        night: { context: null }
    });
    return { state };
});

setActivePinia(createPinia());
const store = useStore();

const mockGameState = {
    players: [
        { id: 1, name: 'A' },
        { id: 3, name: 'B' }
    ]
};

store.$patch(mockGameState);

console.log('store players length:', store.state.players.length);
console.log('store players:', store.state.players);
