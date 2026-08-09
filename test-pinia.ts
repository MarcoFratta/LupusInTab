import { createPinia, defineStore, setActivePinia } from 'pinia';
import { reactive } from 'vue';

const useStore = defineStore('game', () => {
    const state = reactive({
        night: { context: null }
    });
    return { state };
});

setActivePinia(createPinia());
const store = useStore();

const mockGameState = {
    night: {
        context: {
            checks: []
        }
    }
};

// Ensure night context is properly initialized
if (mockGameState.night?.context && !store.state.night.context) {
    store.state.night.context = mockGameState.night.context as any;
}

store.$patch(mockGameState);

// Simulate addCheck
store.state.night.context.checks.push({ by: 1, target: 3, team: 'villaggio' });

console.log('mockGameState checks length:', mockGameState.night.context.checks.length);
console.log('store checks length:', store.state.night.context.checks.length);
