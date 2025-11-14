/**
 * Utils Module
 * Utility functions for the todo app
 */

const Utils = {
    /**
     * Format date for display
     * @param {String} dateString - ISO date string
     * @returns {String} Formatted date string
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateOnly = new Date(date);
        dateOnly.setHours(0, 0, 0, 0);
        
        const diffTime = dateOnly - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Tomorrow';
        } else if (diffDays === -1) {
            return 'Yesterday';
        } else if (diffDays < -1) {
            return `${Math.abs(diffDays)} days overdue`;
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    },

    /**
     * Check if a date is overdue
     * @param {String} dateString - ISO date string
     * @returns {Boolean} True if overdue
     */
    isOverdue(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);
        return date < today;
    },

    /**
     * Check if a date is today
     * @param {String} dateString - ISO date string
     * @returns {Boolean} True if today
     */
    isToday(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },

    /**
     * Sanitize HTML input
     * @param {String} input - Input string
     * @returns {String} Sanitized string
     */
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML.trim();
    },

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {Number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Get category color
     * @param {String} category - Category name
     * @returns {String} Color hex code
     */
    getCategoryColor(category) {
        const colors = {
            work: '#2196F3',
            personal: '#4CAF50',
            school: '#FF9800',
            shopping: '#9C27B0',
            default: '#757575'
        };
        return colors[category] || colors.default;
    },

    /**
     * Get category display name
     * @param {String} category - Category name
     * @returns {String} Display name
     */
    getCategoryName(category) {
        return category.charAt(0).toUpperCase() + category.slice(1);
    },

    /**
     * Calculate completion percentage
     * @param {Array} tasks - Array of tasks
     * @returns {Number} Completion percentage
     */
    calculateProgress(tasks) {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(task => task.completed).length;
        return Math.round((completed / tasks.length) * 100);
    },

    /**
     * Request browser notification permission
     * @returns {Promise<Boolean>} True if permission granted
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    },

    /**
     * Show browser notification
     * @param {String} title - Notification title
     * @param {Object} options - Notification options
     */
    showNotification(title, options = {}) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        const notification = new Notification(title, {
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    },

    /**
     * Download JSON file
     * @param {String} data - JSON string
     * @param {String} filename - Filename
     */
    downloadJSON(data, filename) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Read file as text
     * @param {File} file - File object
     * @returns {Promise<String>} File content as string
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
};

