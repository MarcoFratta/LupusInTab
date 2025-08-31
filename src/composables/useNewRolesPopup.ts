import { ref, computed, onMounted } from 'vue';
import { NEW_ROLES_CONFIG } from '../config/newRoles';
import { loadSeenRoles, saveSeenRoles, clearSeenRoles } from '../utils/storage';

export function useNewRolesPopup() {
	const showPopup = ref(false);
	const newRoles = ref<string[]>([]);
	
	const shouldShowPopup = computed(() => {
		return newRoles.value.length > 0;
	});
	
	const checkForNewRoles = () => {
		const seenRoles = loadSeenRoles();
		const currentNewRoles = NEW_ROLES_CONFIG.currentRoles;
		
		const trulyNewRoles = currentNewRoles.filter(roleId => !seenRoles.includes(roleId));
		
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
		
		const currentSeenRoles = loadSeenRoles();
		const updatedSeenRoles = [...currentSeenRoles, ...newRoles.value];
		saveSeenRoles(updatedSeenRoles);
		
		newRoles.value = [];
	};
	
	const resetSeenRoles = () => {
		clearSeenRoles();
		checkForNewRoles();
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
		closePopup,
		resetSeenRoles
	};
}
