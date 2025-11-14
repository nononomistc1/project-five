/**
 * Storage Module
 * Handles all localStorage operations for tasks and app settings
 */

const Storage = {
    STORAGE_KEY: 'todoAppData',
    SETTINGS_KEY: 'todoAppSettings',
    DATA_VERSION: 1,

    /**
     * Initialize storage - migrate data if needed
     */
    init() {
        const data = this.loadData();
        if (!data || data.version !== this.DATA_VERSION) {
            this.migrateData(data);
        }
    },

    /**
     * Load all tasks from localStorage
     * @returns {Array} Array of tasks
     */
    loadTasks() {
        try {
            const data = this.loadData();
            return data?.tasks || [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    },

    /**
     * Save all tasks to localStorage
     * @param {Array} tasks - Array of tasks to save
     */
    saveTasks(tasks) {
        try {
            const data = this.loadData();
            data.tasks = tasks;
            data.version = this.DATA_VERSION;
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving tasks:', error);
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                alert('Storage quota exceeded. Please delete some tasks or export your data.');
            }
        }
    },

    /**
     * Load app settings from localStorage
     * @returns {Object} Settings object
     */
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.SETTINGS_KEY);
            return settings ? JSON.parse(settings) : {
                theme: 'light',
                categories: ['work', 'personal', 'school', 'shopping'],
                notifications: true
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                theme: 'light',
                categories: ['work', 'personal', 'school', 'shopping'],
                notifications: true
            };
        }
    },

    /**
     * Save app settings to localStorage
     * @param {Object} settings - Settings object to save
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    },

    /**
     * Load raw data from localStorage
     * @returns {Object} Data object
     */
    loadData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (!data) {
                return {
                    tasks: [],
                    version: this.DATA_VERSION,
                    lastUpdated: new Date().toISOString()
                };
            }
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading data:', error);
            return {
                tasks: [],
                version: this.DATA_VERSION,
                lastUpdated: new Date().toISOString()
            };
        }
    },

    /**
     * Migrate data to current version
     * @param {Object} oldData - Old data structure
     */
    migrateData(oldData) {
        try {
            const tasks = oldData?.tasks || [];
            // Add any migration logic here
            const newData = {
                tasks: tasks.map(task => ({
                    ...task,
                    id: task.id || this.generateId(),
                    createdAt: task.createdAt || new Date().toISOString(),
                    updatedAt: task.updatedAt || new Date().toISOString()
                })),
                version: this.DATA_VERSION,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newData));
        } catch (error) {
            console.error('Error migrating data:', error);
        }
    },

    /**
     * Export all data as JSON
     * @returns {String} JSON string of all data
     */
    exportData() {
        try {
            const data = {
                tasks: this.loadTasks(),
                settings: this.loadSettings(),
                version: this.DATA_VERSION,
                exportDate: new Date().toISOString()
            };
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    },

    /**
     * Import data from JSON string
     * @param {String} jsonString - JSON string to import
     * @returns {Object} Result object with success status and message
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate data structure
            if (!data || typeof data !== 'object') {
                return { success: false, message: 'Invalid data format' };
            }

            // Import tasks if present
            if (data.tasks && Array.isArray(data.tasks)) {
                // Validate and clean tasks
                const validTasks = data.tasks
                    .filter(task => task && typeof task === 'object')
                    .map(task => ({
                        id: task.id || this.generateId(),
                        text: task.text || '',
                        completed: Boolean(task.completed),
                        category: task.category || 'personal',
                        dueDate: task.dueDate || null,
                        createdAt: task.createdAt || new Date().toISOString(),
                        updatedAt: task.updatedAt || new Date().toISOString(),
                        order: task.order || 0
                    }));
                
                this.saveTasks(validTasks);
            }

            // Import settings if present
            if (data.settings && typeof data.settings === 'object') {
                const currentSettings = this.loadSettings();
                this.saveSettings({ ...currentSettings, ...data.settings });
            }

            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, message: 'Error importing data: ' + error.message };
        }
    },

    /**
     * Clear all data
     */
    clearAll() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            // Keep settings, only clear tasks
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    },

    /**
     * Generate a unique ID
     * @returns {String} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Initialize storage on load
Storage.init();

