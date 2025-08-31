import { ref, computed, onMounted } from 'vue';
import { loadPlayersSetup } from '../utils/storage';
import { NEW_ROLES_CONFIG } from '../config/newRoles';

export function useNewRolesPopup() {
	const showPopup = ref(false);
	const newRoles = ref<string[]>([]);
	
	const shouldShowPopup = computed(() => {
		return newRoles.value.length > 0;
	});
	
	const checkForNewRoles = () => {
		const localSetup = loadPlayersSetup();
		const localRoles = localSetup?.rolesEnabled ? Object.keys(localSetup.rolesEnabled) : [];
		const currentNewRoles = NEW_ROLES_CONFIG.currentRoles;
		
		const trulyNewRoles = currentNewRoles.filter(roleId => !localRoles.includes(roleId));
		
		if (trulyNewRoles.length > 0) {
			newRoles.value = trulyNewRoles;
			showPopup.value = true;
		} else {
			newRoles.value = [];
			showPopup.value = false;
		}
	};
	
	const forceCheckForNewRoles = () => {
		checkForNewRoles();
	};
	
	const closePopup = () => {
		showPopup.value = false;
		const localSetup = loadPlayersSetup();
		if (localSetup) {
			const updatedRolesEnabled = { ...localSetup.rolesEnabled };
			newRoles.value.forEach(roleId => {
				updatedRolesEnabled[roleId] = false;
			});
			
			const updatedSetup = {
				...localSetup,
				rolesEnabled: updatedRolesEnabled,
				rolesCounts: localSetup.rolesCounts || {}
			};
			
			import('../utils/storage').then(({ savePlayersSetup }) => {
				savePlayersSetup(updatedSetup);
			});
		}
	};
	
	onMounted(() => {
		checkForNewRoles();
	});
	
	return {
		showPopup,
		newRoles,
		shouldShowPopup,
		checkForNewRoles,
		forceCheckForNewRoles,
		closePopup
	};
}
