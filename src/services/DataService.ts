
import { ActivityEntry } from '@/components/ActivityLog';

// This is a mock implementation that uses localStorage
// In a real application, this would connect to a backend API
class DataService {
  private STORAGE_KEY = 'platesight_activity_log';
  
  // Save activity log to localStorage
  saveActivityLog(activities: ActivityEntry[]): void {
    const data = JSON.stringify(activities);
    localStorage.setItem(this.STORAGE_KEY, data);
  }
  
  // Load activity log from localStorage
  loadActivityLog(): ActivityEntry[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return [];
    
    try {
      // Convert the stored date strings back to Date objects
      return JSON.parse(data).map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }));
    } catch (error) {
      console.error('Error loading activity log:', error);
      return [];
    }
  }
  
  // Add a new activity entry
  addActivity(plateNumber: string, region: string, isLegal: boolean, confidence: number): ActivityEntry {
    const newEntry: ActivityEntry = {
      id: this.generateId(),
      plateNumber,
      region,
      isLegal,
      timestamp: new Date(),
      confidence
    };
    
    const currentLog = this.loadActivityLog();
    const updatedLog = [newEntry, ...currentLog];
    this.saveActivityLog(updatedLog);
    
    return newEntry;
  }
  
  // Clear all activity logs
  clearActivityLog(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
  
  // Generate a simple ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

export default new DataService();
