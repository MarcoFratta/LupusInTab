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

store.state = mockGameState; // Direct assignment?

console.log('store players length (direct assign):', store.state.players.length);

store.$patch({ state: mockGameState });
console.log('store players length (patch state):', store.state.players.length);

store.$state = { state: mockGameState };
console.log('store players length (patch $state):', store.state.players.length);
