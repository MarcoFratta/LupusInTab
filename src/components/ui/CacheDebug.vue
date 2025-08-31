<template>
  <div class="cache-debug">
    <h3>Cache Debug Info</h3>
    
    <div class="debug-section">
      <h4>Status</h4>
      <p><strong>Initialized:</strong> {{ isInitialized ? 'Yes' : 'No' }}</p>
      <p><strong>Updating:</strong> {{ isUpdating ? 'Yes' : 'No' }}</p>
      <p><strong>Current Cache Version:</strong> {{ currentVersion || 'None' }}</p>
      <p><strong>Server Version:</strong> {{ newVersion || 'Unknown' }}</p>
    </div>

    <div class="debug-section">
      <h4>Actions</h4>
      <button @click="forceUpdate" :disabled="isUpdating" class="debug-button">
        {{ isUpdating ? 'Updating...' : 'Force Update' }}
      </button>
      <button @click="clearCache" class="debug-button">Clear Cache</button>
      <button @click="refreshInfo" class="debug-button">Refresh Info</button>
    </div>

    <div class="debug-section" v-if="updateProgress">
      <h4>Update Progress</h4>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(updateProgress.current / updateProgress.total) * 100}%` }"></div>
      </div>
      <p>{{ updateProgress.status }}</p>
      <p>{{ updateProgress.current }} / {{ updateProgress.total }}</p>
    </div>

    <div class="debug-section" v-if="cacheInfo">
      <h4>Cache Details</h4>
      <p><strong>Version:</strong> {{ cacheInfo.version }}</p>
      <p><strong>Timestamp:</strong> {{ new Date(cacheInfo.timestamp).toLocaleString() }}</p>
      <p><strong>Asset Count:</strong> {{ cacheInfo.assetCount }}</p>
    </div>

    <div class="debug-section">
      <h4>Logs</h4>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCache } from '../../composables/useCache';

const {
  isInitialized,
  isUpdating,
  cacheInfo,
  updateProgress,
  currentVersion,
  newVersion,
  forceUpdate: cacheForceUpdate,
  clearCache: cacheClearCache,
  updateCacheInfo
} = useCache();

const logs = ref<Array<{ time: string; message: string }>>([]);

const addLog = (message: string) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message
  });
  if (logs.value.length > 20) {
    logs.value = logs.value.slice(0, 20);
  }
};

const forceUpdate = async () => {
  try {
    addLog('Force update requested');
    await cacheForceUpdate();
    addLog('Force update completed successfully');
  } catch (error) {
    addLog(`Force update failed: ${error}`);
  }
};

const clearCache = async () => {
  try {
    addLog('Cache clear requested');
    await cacheClearCache();
    addLog('Cache cleared successfully');
  } catch (error) {
    addLog(`Cache clear failed: ${error}`);
  }
};

const refreshInfo = async () => {
  try {
    addLog('Refreshing cache info');
    await updateCacheInfo();
    addLog('Cache info refreshed');
  } catch (error) {
    addLog(`Cache info refresh failed: ${error}`);
  }
};

onMounted(() => {
  addLog('Cache debug component mounted');
});
</script>

<style scoped>
.cache-debug {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9f9f9;
  margin: 1rem 0;
}

.debug-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #eee;
}

.debug-section h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.debug-button {
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.debug-button:hover {
  background: #0056b3;
}

.debug-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem;
}

.log-entry {
  display: flex;
  margin-bottom: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.log-time {
  color: #6c757d;
  margin-right: 0.5rem;
  min-width: 80px;
}

.log-message {
  color: #333;
}
</style>
