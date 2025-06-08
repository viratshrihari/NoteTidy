// Local storage utilities for offline support
export interface StorageStats {
  used: number;
  total: number;
  percentage: number;
}

export function getStorageStats(): StorageStats {
  try {
    const total = 10 * 1024 * 1024; // 10MB estimate for localStorage
    let used = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    return {
      used,
      total,
      percentage: (used / total) * 100
    };
  } catch (error) {
    return { used: 0, total: 0, percentage: 0 };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function clearAllData(): void {
  const keysToKeep = ["noteflow-theme", "noteflow-settings"];
  const keys = Object.keys(localStorage);
  
  keys.forEach(key => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });
}

export function exportNotesToJSON(notes: any[]): string {
  return JSON.stringify({
    exportDate: new Date().toISOString(),
    notes,
    version: "1.0.0"
  }, null, 2);
}
