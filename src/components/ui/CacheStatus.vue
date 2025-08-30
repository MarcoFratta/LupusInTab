<template>
  <div class="cache-status" v-if="isInitialized">
    <div class="cache-info">
      <div class="cache-version">
        <span class="label">Cache Version:</span>
        <span class="value">{{ cacheInfo?.version || 'Unknown' }}</span>
      </div>
      <div class="cache-timestamp">
        <span class="label">Last Updated:</span>
        <span class="value">{{ formatTimestamp(cacheInfo?.timestamp) }}</span>
      </div>
      <div class="cache-assets">
        <span class="label">Cached Assets:</span>
        <span class="value">{{ cacheInfo?.assetCount || 0 }}</span>
      </div>
    </div>
    
    <div class="cache-actions">
      <button 
        @click="checkForUpdates" 
        :disabled="isUpdating"
        class="update-btn"
        :class="{ 'updating': isUpdating }"
      >
        <span v-if="isUpdating">Updating...</span>
        <span v-else>Check for Updates</span>
      </button>
      
      <button 
        @click="clearCache" 
        class="clear-btn"
        title="Clear all cached content"
      >
        Clear Cache
      </button>
    </div>
    
    <div v-if="lastUpdate" class="last-check">
      Last check: {{ formatTimestamp(lastUpdate.getTime()) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCache } from '../../composables/useCache';

const {
  isInitialized,
  isUpdating,
  lastUpdate,
  cacheInfo,
  checkForUpdates,
  clearCache
} = useCache();

const formatTimestamp = (timestamp: number | undefined): string => {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  
  return date.toLocaleDateString();
};
</script>

<style scoped>
.cache-status {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-size: 14px;
}

.cache-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.cache-version,
.cache-timestamp,
.cache-assets {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-weight: 600;
  color: #495057;
}

.value {
  color: #6c757d;
}

.cache-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.update-btn,
.clear-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.update-btn {
  background: #007bff;
  color: white;
}

.update-btn:hover:not(:disabled) {
  background: #0056b3;
}

.update-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.update-btn.updating {
  background: #28a745;
}

.clear-btn {
  background: #dc3545;
  color: white;
}

.clear-btn:hover {
  background: #c82333;
}

.last-check {
  font-size: 12px;
  color: #6c757d;
  text-align: center;
  font-style: italic;
}
</style>
