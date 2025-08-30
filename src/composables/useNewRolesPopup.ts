import { ref, computed, onMounted } from 'vue';
import { saveNewRolesVersionSeen, loadNewRolesVersionSeen } from '../utils/storage';
import { NEW_ROLES_CONFIG } from '../config/newRoles';

export function useNewRolesPopup() {
	const showPopup = ref(false);
	const newRoles = ref<string[]>([]);
	
	const shouldShowPopup = computed(() => {
		return newRoles.value.length > 0;
	});
	
	const checkForNewRoles = () => {
		const seenVersion = loadNewRolesVersionSeen();
		const currentVersion = NEW_ROLES_CONFIG.version;
		
		if (seenVersion !== currentVersion) {
			newRoles.value = NEW_ROLES_CONFIG.currentRoles;
			showPopup.value = true;
		} else {
			newRoles.value = [];
			showPopup.value = false;
		}
	};
	
	const closePopup = () => {
		showPopup.value = false;
		saveNewRolesVersionSeen(NEW_ROLES_CONFIG.version);
	};
	
	onMounted(() => {
		checkForNewRoles();
	});
	
	return {
		showPopup,
		newRoles,
		shouldShowPopup,
		checkForNewRoles,
		closePopup
	};
}
