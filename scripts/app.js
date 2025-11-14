/**
 * Main Application Module
 * Coordinates all app functionality
 */

const App = {
    tasks: [],
    filters: {
        category: 'all',
        status: 'all',
        search: ''
    },
    currentCategory: 'all',

    /**
     * Initialize the application
     */
    async init() {
        // Initialize UI
        UI.init();
        
        // Load tasks from storage
        this.tasks = Storage.loadTasks();
        
        // Load settings
        const settings = Storage.loadSettings();
        this.applyTheme(settings.theme);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Request notification permission
        await Utils.requestNotificationPermission();
        
        // Initialize category UI with any saved custom categories
        this.updateCategoryOptions();
        this.updateCategoryFilter();
        this.updateCategoryBar();
        
        // Render tasks
        this.render();
        
        // Check for due date notifications
        this.checkDueDateNotifications();
        
        // Set up periodic notification checks
        setInterval(() => this.checkDueDateNotifications(), 60000); // Check every minute
    },

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Task form submission
        UI.elements.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Search input
        UI.elements.searchInput.addEventListener('input', Utils.debounce((e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.render();
        }, 300));

        // Category filter
        UI.elements.categoryFilter.addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.render();
        });

        // Status filter
        UI.elements.statusFilter.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.render();
        });

        // Category buttons - use the setup function
        this.setupCategoryButtonListeners();

        // Theme toggle
        UI.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Help modal
        UI.elements.helpToggle.addEventListener('click', () => {
            UI.showModal('help-modal');
        });
        UI.elements.closeHelpModal.addEventListener('click', () => {
            UI.hideModal('help-modal');
        });

        // Export button
        UI.elements.exportBtn.addEventListener('click', () => {
            this.exportData();
        });

        // Import input
        UI.elements.importInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.importData(file);
            }
        });

        // Clear all button
        UI.elements.clearAllBtn.addEventListener('click', async () => {
            const confirmed = await UI.showConfirmation(
                'Clear All Tasks',
                'Are you sure you want to delete all tasks? This action cannot be undone.'
            );
            if (confirmed) {
                this.clearAllTasks();
            }
        });

        // Add category button
        UI.elements.addCategoryBtn.addEventListener('click', () => {
            UI.showModal('category-modal');
        });
        UI.elements.closeCategoryModal.addEventListener('click', () => {
            UI.hideModal('category-modal');
        });
        UI.elements.cancelCategory.addEventListener('click', () => {
            UI.hideModal('category-modal');
        });
        UI.elements.saveCategory.addEventListener('click', () => {
            this.addCategory();
        });

        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    UI.hideModal(modal.id);
                }
            });
        });

        // Keyboard shortcuts
        if (!this.boundHandleShortcuts) {
            this.boundHandleShortcuts = this.handleKeyboardShortcuts.bind(this);
            document.addEventListener('keydown', this.boundHandleShortcuts, true);
        }
    },

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        const key = (e.key || '').toLowerCase();
        const ctrlOrMeta = e.ctrlKey || e.metaKey;

        // Ctrl/Cmd + N: New task
        if (ctrlOrMeta && key === 'n') {
            e.preventDefault();
            UI.elements.taskInput.focus();
            UI.elements.taskInput.select();
            return;
        }

        // Ctrl/Cmd + F: Focus search
        if (ctrlOrMeta && key === 'f') {
            e.preventDefault();
            UI.focusSearch();
            return;
        }

        // Enter: Save current inline edit (if any)
        if (!ctrlOrMeta && key === 'enter') {
            const editingInput = document.querySelector('.task-edit-input');
            if (editingInput) {
                e.preventDefault();
                editingInput.blur();
                return;
            }
        }

        // Escape: Cancel editing or close modals
        if (!ctrlOrMeta && key === 'escape') {
            e.preventDefault();
            if (UI.currentEditId) {
                UI.cancelEditing();
            }
            document.querySelectorAll('.modal.active').forEach(modal => {
                UI.hideModal(modal.id);
            });
        }
    },

    /**
     * Add a new task
     */
    addTask() {
        const text = UI.elements.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: Storage.generateId(),
            text: Utils.sanitizeInput(text),
            completed: false,
            category: UI.elements.taskCategory.value,
            dueDate: UI.elements.taskDueDate.value || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            order: this.tasks.length
        };

        this.tasks.push(task);
        this.saveTasks();
        UI.clearTaskInput();
        this.render();
        
        // Check if due date is today and show notification
        if (task.dueDate && Utils.isToday(task.dueDate)) {
            Utils.showNotification('New task due today!', {
                body: task.text
            });
        }
    },

    /**
     * Toggle task completion status
     * @param {String} taskId - Task ID
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
        }
    },

    /**
     * Update a task
     * @param {String} taskId - Task ID
     * @param {Object} updates - Task updates
     */
    updateTask(taskId, updates) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            Object.assign(task, updates);
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.render();
        }
    },

    /**
     * Delete a task
     * @param {String} taskId - Task ID
     */
    async deleteTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const confirmed = await UI.showConfirmation(
            'Delete Task',
            `Are you sure you want to delete "${task.text}"?`
        );

        if (confirmed) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.render();
        }
    },

    /**
     * Reorder tasks
     * @param {Array} newOrder - Array of task IDs in new order
     */
    reorderTasks(newOrder) {
        // Create a map of all tasks
        const taskMap = new Map(this.tasks.map(t => [t.id, t]));
        
        // Get currently visible (filtered) task IDs
        const filteredTaskIds = new Set(this.getFilteredTasks().map(t => t.id));
        
        // Separate visible and hidden tasks
        const visibleTasks = newOrder
            .filter(id => taskMap.has(id))
            .map((id, index) => {
                const task = taskMap.get(id);
                task.order = index;
                return task;
            });
        
        // Get hidden tasks (not in current view)
        const hiddenTasks = this.tasks
            .filter(t => !filteredTaskIds.has(t.id))
            .sort((a, b) => a.order - b.order);
        
        // Combine: visible tasks first (in new order), then hidden tasks
        // Adjust hidden task orders to come after visible tasks
        hiddenTasks.forEach((task, index) => {
            task.order = visibleTasks.length + index;
        });
        
        // Reconstruct tasks array
        this.tasks = [...visibleTasks, ...hiddenTasks].sort((a, b) => a.order - b.order);
        this.saveTasks();
        this.render();
    },

    /**
     * Get filtered tasks
     * @returns {Array} Filtered tasks
     */
    getFilteredTasks() {
        let filtered = [...this.tasks];

        // Filter by category
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(task => task.category === this.filters.category);
        }

        // Filter by status
        if (this.filters.status === 'all') {
            // Show all
        } else if (this.filters.status === 'active') {
            filtered = filtered.filter(task => !task.completed);
        } else if (this.filters.status === 'completed') {
            filtered = filtered.filter(task => task.completed);
        } else if (this.filters.status === 'overdue') {
            filtered = filtered.filter(task => 
                task.dueDate && 
                Utils.isOverdue(task.dueDate) && 
                !task.completed
            );
        }

        // Filter by search term
        if (this.filters.search) {
            filtered = filtered.filter(task => 
                task.text.toLowerCase().includes(this.filters.search)
            );
        }

        // Sort by order
        filtered.sort((a, b) => a.order - b.order);

        return filtered;
    },

    /**
     * Render all tasks and update UI
     */
    render() {
        const filteredTasks = this.getFilteredTasks();
        UI.renderTasks(filteredTasks, this.filters.search);
        
        // Update statistics
        const stats = this.calculateStats();
        UI.updateStats(stats);
    },

    /**
     * Calculate task statistics
     * @returns {Object} Statistics object
     */
    calculateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const remaining = total - completed;

        return { total, completed, remaining };
    },

    /**
     * Save tasks to storage
     */
    saveTasks() {
        Storage.saveTasks(this.tasks);
    },

    /**
     * Clear all tasks
     */
    async clearAllTasks() {
        this.tasks = [];
        this.saveTasks();
        this.render();
    },

    /**
     * Apply theme
     * @param {String} theme - Theme name ('light' or 'dark')
     */
    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
        const settings = Storage.loadSettings();
        settings.theme = theme;
        Storage.saveSettings(settings);
        
        // Update theme toggle icon
        const themeIcon = UI.elements.themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    },

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    },

    /**
     * Export data
     */
    exportData() {
        const data = Storage.exportData();
        if (data) {
            const filename = `todo-app-backup-${new Date().toISOString().split('T')[0]}.json`;
            Utils.downloadJSON(data, filename);
        }
    },

    /**
     * Import data
     * @param {File} file - File to import
     */
    async importData(file) {
        try {
            const text = await Utils.readFileAsText(file);
            const result = Storage.importData(text);
            
            if (result.success) {
                // Reload tasks
                this.tasks = Storage.loadTasks();
                this.render();
                alert('Data imported successfully!');
            } else {
                alert(`Error importing data: ${result.message}`);
            }
        } catch (error) {
            console.error('Error importing data:', error);
            alert('Error importing data. Please check the file format.');
        }
    },

    /**
     * Add new category
     */
    addCategory() {
        const name = UI.elements.newCategoryName.value.trim().toLowerCase();
        const color = UI.elements.newCategoryColor.value;
        
        if (!name) {
            alert('Please enter a category name');
            return;
        }

        if (this.isValidCategory(name)) {
            alert('Category already exists');
            return;
        }

        // Add category to settings
        const settings = Storage.loadSettings();
        if (!settings.customCategories) {
            settings.customCategories = [];
        }
        settings.customCategories.push({ name, color });
        Storage.saveSettings(settings);

        // Update category options in all UI elements
        this.updateCategoryOptions();
        this.updateCategoryBar();
        this.updateCategoryFilter();

        // Clear and close modal
        UI.elements.newCategoryName.value = '';
        UI.elements.newCategoryColor.value = '#4CAF50';
        UI.hideModal('category-modal');
    },

    /**
     * Update category options in UI
     */
    updateCategoryOptions() {
        const settings = Storage.loadSettings();
        const categories = [...(settings.categories || []), ...(settings.customCategories || [])];
        
        // Update task category select dropdown
        const categorySelect = UI.elements.taskCategory;
        categorySelect.innerHTML = categories.map(cat => {
            const name = typeof cat === 'string' ? cat : cat.name;
            return `<option value="${name}">${Utils.getCategoryName(name)}</option>`;
        }).join('');
    },

    /**
     * Update category filter dropdown
     */
    updateCategoryFilter() {
        const settings = Storage.loadSettings();
        const categories = [...(settings.categories || []), ...(settings.customCategories || [])];
        
        // Update category filter dropdown
        const categoryFilter = UI.elements.categoryFilter;
        const currentValue = categoryFilter.value;
        
        categoryFilter.innerHTML = '<option value="all">All Categories</option>' + 
            categories.map(cat => {
                const name = typeof cat === 'string' ? cat : cat.name;
                return `<option value="${name}">${Utils.getCategoryName(name)}</option>`;
            }).join('');
        
        // Restore selected value if it still exists
        if (currentValue && Array.from(categoryFilter.options).some(opt => opt.value === currentValue)) {
            categoryFilter.value = currentValue;
        }
    },

    /**
     * Update category bar buttons
     */
    updateCategoryBar() {
        const settings = Storage.loadSettings();
        const categories = [...(settings.categories || []), ...(settings.customCategories || [])];
        const categoryBar = document.querySelector('.category-bar');
        
        if (!categoryBar) return;
        
        // Get the add category button to preserve it
        const addCategoryBtn = document.getElementById('add-category-btn');
        
        // Clear existing category buttons (except "All" which we'll keep)
        const allBtn = categoryBar.querySelector('[data-category="all"]');
        categoryBar.innerHTML = '';
        
        // Add "All" button back
        if (allBtn) {
            allBtn.classList.add('active');
            categoryBar.appendChild(allBtn);
        } else {
            const allButton = document.createElement('button');
            allButton.className = 'category-btn active';
            allButton.dataset.category = 'all';
            allButton.textContent = 'All';
            categoryBar.appendChild(allButton);
        }
        
        // Add all category buttons
        categories.forEach(cat => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            const catColor = typeof cat === 'object' && cat.color ? cat.color : Utils.getCategoryColor(catName);
            const isCustomCategory = typeof cat === 'object' && cat.name;
            
            // Create container for category button and delete button
            const btnContainer = document.createElement('div');
            btnContainer.className = 'category-btn-container';
            btnContainer.style.position = 'relative';
            btnContainer.style.display = 'inline-flex';
            btnContainer.style.alignItems = 'center';
            
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = catName;
            btn.textContent = Utils.getCategoryName(catName);
            btnContainer.appendChild(btn);
            
            // Add delete button for custom categories only (not default ones)
            if (isCustomCategory) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'category-delete-btn';
                deleteBtn.innerHTML = '×';
                deleteBtn.setAttribute('aria-label', `Delete category ${catName}`);
                deleteBtn.dataset.category = catName;
                deleteBtn.title = 'Delete category';
                deleteBtn.type = 'button';
                
                // Store reference to App for the event handler
                const appInstance = App;
                deleteBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    const category = this.dataset.category;
                    if (category) {
                        appInstance.removeCategory(category).catch(err => {
                            console.error('Error removing category:', err);
                        });
                    }
                });
                btnContainer.appendChild(deleteBtn);
            }
            
            categoryBar.appendChild(btnContainer);
        });
        
        // Add the add category button back
        if (addCategoryBtn) {
            categoryBar.appendChild(addCategoryBtn);
        } else {
            const addBtn = document.createElement('button');
            addBtn.className = 'category-btn add-category';
            addBtn.id = 'add-category-btn';
            addBtn.setAttribute('aria-label', 'Add new category');
            addBtn.textContent = '+ Add Category';
            categoryBar.appendChild(addBtn);
        }
        
        // Re-attach event listeners to new buttons
        UI.elements.categoryButtons = document.querySelectorAll('.category-btn');
        this.setupCategoryButtonListeners();
    },

    /**
     * Set up event listeners for category buttons
     */
    setupCategoryButtonListeners() {
        UI.elements.categoryButtons.forEach(btn => {
            // Skip if button is inside a container (already has listeners)
            if (btn.closest('.category-btn-container')) {
                return;
            }
            
            // Remove existing listeners by cloning the button
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                // Don't trigger if clicking delete button
                if (e.target.classList.contains('category-delete-btn')) {
                    return;
                }
                
                // Check if this is the add category button
                if (newBtn.id === 'add-category-btn' || newBtn.classList.contains('add-category')) {
                    e.stopPropagation();
                    UI.showModal('category-modal');
                    return;
                }
                
                const category = newBtn.dataset.category;
                if (category === 'all' || this.isValidCategory(category)) {
                    this.currentCategory = category;
                    this.filters.category = category === 'all' ? 'all' : category;
                    UI.updateActiveCategory(category);
                    this.render();
                }
            });
        });
        
        // Also set up listeners for buttons in containers
        document.querySelectorAll('.category-btn-container .category-btn').forEach(btn => {
            // Remove any existing listeners first
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                // Don't trigger if clicking delete button or if delete button was clicked
                if (e.target.classList.contains('category-delete-btn') || 
                    e.target.closest('.category-delete-btn')) {
                    return;
                }
                
                // Don't trigger if event came from delete button
                const deleteBtn = e.target.parentElement?.querySelector('.category-delete-btn');
                if (deleteBtn && (deleteBtn === e.relatedTarget || deleteBtn.contains(e.target))) {
                    return;
                }
                
                const category = newBtn.dataset.category;
                if (category === 'all' || this.isValidCategory(category)) {
                    this.currentCategory = category;
                    this.filters.category = category === 'all' ? 'all' : category;
                    UI.updateActiveCategory(category);
                    this.render();
                }
            });
        });
        
        // Update the UI.elements reference
        UI.elements.categoryButtons = document.querySelectorAll('.category-btn');
        UI.elements.addCategoryBtn = document.getElementById('add-category-btn');
    },

    /**
     * Remove a category
     * @param {String} categoryName - Category name to remove
     */
    async removeCategory(categoryName) {
        // Check if it's a default category (cannot be removed)
        const settings = Storage.loadSettings();
        const defaultCategories = settings.categories || [];
        if (defaultCategories.includes(categoryName)) {
            alert('Default categories cannot be removed.');
            return;
        }
        
        // Check if any tasks use this category
        const tasksWithCategory = this.tasks.filter(task => task.category === categoryName);
        
        if (tasksWithCategory.length > 0) {
            const confirmed = await UI.showConfirmation(
                'Delete Category',
                `This category is used by ${tasksWithCategory.length} task(s). ` +
                `Tasks will be reassigned to "Personal". Do you want to continue?`
            );
            
            if (!confirmed) {
                return;
            }
            
            // Reassign tasks to "Personal"
            tasksWithCategory.forEach(task => {
                task.category = 'personal';
                task.updatedAt = new Date().toISOString();
            });
            this.saveTasks();
        } else {
            const confirmed = await UI.showConfirmation(
                'Delete Category',
                `Are you sure you want to delete the category "${Utils.getCategoryName(categoryName)}"?`
            );
            
            if (!confirmed) {
                return;
            }
        }
        
        // Remove category from settings
        if (settings.customCategories) {
            settings.customCategories = settings.customCategories.filter(
                cat => cat.name !== categoryName
            );
            Storage.saveSettings(settings);
        }
        
        // Update all UI elements
        this.updateCategoryOptions();
        this.updateCategoryBar();
        this.updateCategoryFilter();
        
        // If this category was active, switch to "All"
        if (this.filters.category === categoryName || this.currentCategory === categoryName) {
            this.currentCategory = 'all';
            this.filters.category = 'all';
            UI.updateActiveCategory('all');
        }
        
        // Re-render tasks
        this.render();
    },

    /**
     * Check if category is valid
     * @param {String} category - Category name
     * @returns {Boolean} True if valid
     */
    isValidCategory(category) {
        const settings = Storage.loadSettings();
        const allCategories = [
            ...(settings.categories || []),
            ...(settings.customCategories || []).map(c => c.name)
        ];
        return allCategories.includes(category);
    },

    /**
     * Check for due date notifications
     */
    checkDueDateNotifications() {
        const settings = Storage.loadSettings();
        if (!settings.notifications) return;

        const now = new Date();
        const tasksDueToday = this.tasks.filter(task => 
            task.dueDate && 
            Utils.isToday(task.dueDate) && 
            !task.completed
        );

        tasksDueToday.forEach(task => {
            Utils.showNotification('Task due today!', {
                body: task.text,
                tag: `task-${task.id}`
            });
        });
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

