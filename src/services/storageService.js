const LOCAL_STORAGE_KEY = 'meditime_app_data';

class StorageService {
  constructor() {
    console.log('Using localStorage for data storage');
  }

  // User Management
  async createUser(userName) {
    return this.createUserLocal(userName);
  }

  createUserLocal(userName) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    let appData = {};
    if (data) {
      appData = JSON.parse(data);
    }
    
    if (!appData.users) appData.users = [];
    if (!appData.users.includes(userName)) {
      appData.users.push(userName);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
      return { id: userName, name: userName };
    }
    throw new Error('User already exists');
  }

  async getUsers() {
    return this.getUsersLocal();
  }

  getUsersLocal() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const appData = JSON.parse(data);
      return (appData.users || []).map(name => ({ id: name, name }));
    }
    return [];
  }

  async deleteUser(userId) {
    this.deleteUserLocal(userId);
  }

  deleteUserLocal(userId) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const appData = JSON.parse(data);
      appData.users = appData.users.filter(u => u !== userId);
      if (appData.schedules) delete appData.schedules[userId];
      if (appData.formDataByUser) delete appData.formDataByUser[userId];
      if (appData.lastActiveUser === userId) {
        appData.lastActiveUser = appData.users.length > 0 ? appData.users[0] : null;
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
    }
  }

  // Schedule Management
  async saveSchedule(userId, scheduleData) {
    return this.saveScheduleLocal(userId, scheduleData);
  }

  saveScheduleLocal(userId, scheduleData) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    let appData = {};
    if (data) {
      appData = JSON.parse(data);
    }
    
    if (!appData.schedules) appData.schedules = {};
    if (!appData.schedules[userId]) appData.schedules[userId] = [];
    
    const newSchedule = { ...scheduleData, id: Date.now().toString() };
    appData.schedules[userId].push(newSchedule);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
    
    return newSchedule;
  }

  async getSchedules(userId) {
    return this.getSchedulesLocal(userId);
  }

  getSchedulesLocal(userId) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const appData = JSON.parse(data);
      return appData.schedules?.[userId] || [];
    }
    return [];
  }

  async deleteSchedule(scheduleId, userId) {
    this.deleteScheduleLocal(scheduleId, userId);
  }

  deleteScheduleLocal(scheduleId, userId) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const appData = JSON.parse(data);
      if (appData.schedules && appData.schedules[userId]) {
        appData.schedules[userId] = appData.schedules[userId].filter(
          schedule => schedule.id !== scheduleId
        );
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
      }
    }
  }

  async deleteAllSchedules(userId) {
    this.deleteAllSchedulesLocal(userId);
  }

  deleteAllSchedulesLocal(userId) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const appData = JSON.parse(data);
      if (appData.schedules) {
        delete appData.schedules[userId];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
      }
    }
  }

  // Form Data Management
  async saveFormData(userId, formData) {
    this.saveFormDataLocal(userId, formData);
  }

  saveFormDataLocal(userId, formData) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    let appData = {};
    if (data) {
      appData = JSON.parse(data);
    }
    
    if (!appData.formDataByUser) appData.formDataByUser = {};
    appData.formDataByUser[userId] = formData;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
  }

  async getFormData(userId) {
    return this.getFormDataLocal(userId);
  }

  getFormDataLocal(userId) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const appData = JSON.parse(data);
      return appData.formDataByUser?.[userId] || null;
    }
    return null;
  }

  async deleteFormData(userId) {
    this.deleteFormDataLocal(userId);
  }

  deleteFormDataLocal(userId) {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const appData = JSON.parse(data);
      if (appData.formDataByUser) {
        delete appData.formDataByUser[userId];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
      }
    }
  }

  // Real-time subscriptions (localStorage polling)
  subscribeToSchedules(userId, callback) {
    // For localStorage, use polling
    const interval = setInterval(() => {
      callback(this.getSchedulesLocal(userId));
    }, 5000);
    return () => clearInterval(interval);
  }

  subscribeToUsers(callback) {
    // For localStorage, use polling
    const interval = setInterval(() => {
      callback(this.getUsersLocal());
    }, 5000);
    return () => clearInterval(interval);
  }

  // Utility methods
  clearAllData() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

  exportData() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  importData(data) {
    if (data && typeof data === 'object') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return true;
    }
    return false;
  }
}

const storageService = new StorageService();
export default storageService; 