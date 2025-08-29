import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RoleReseeCard from '../components/game/RoleReseeCard.vue';

describe('RoleReseeCard', () => {
  const mockState = {
    players: [
      { id: 1, name: 'Player 1', roleId: 'villico', alive: true },
      { id: 2, name: 'Player 2', roleId: 'lupo', alive: true },
      { id: 3, name: 'Player 3', roleId: 'veggente', alive: false }
    ]
  };

  it('renders player selection initially', () => {
    const wrapper = mount(RoleReseeCard, {
      props: {
        state: mockState,
        onBack: () => {}
      }
    });

    expect(wrapper.text()).toContain('Rivela di nuovo un ruolo');
    expect(wrapper.text()).toContain('Player 1');
    expect(wrapper.text()).toContain('Player 2');
  });

  it('shows only alive players in selection', () => {
    const wrapper = mount(RoleReseeCard, {
      props: {
        state: mockState,
        onBack: () => {}
      }
    });

    const playerOptions = wrapper.findAll('option');
    expect(playerOptions).toHaveLength(3); // placeholder + 2 alive players
    expect(wrapper.text()).toContain('Player 1');
    expect(wrapper.text()).toContain('Player 2');
    expect(wrapper.text()).not.toContain('Player 3'); // dead player
  });
});
