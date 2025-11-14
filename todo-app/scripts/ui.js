/**
 * UI Module
 * Handles all DOM manipulation and UI interactions
 */

const UI = {
    elements: {},
    currentEditId: null,
    draggedElement: null,
    dragListenersAttached: false,

    /**
     * Initialize UI elements
     */
    init() {
        this.elements = {
            // Forms and inputs
            taskForm: document.getElementById('task-form'),
            taskInput: document.getElementById('task-input'),
            taskCategory: document.getElementById('task-category'),
            taskDueDate: document.getElementById('task-due-date'),
            
            // Containers
            tasksContainer: document.getElementById('tasks-container'),
            emptyState: document.getElementById('empty-state'),
            
            // Filters
            searchInput: document.getElementById('search-input'),
            categoryFilter: document.getElementById('category-filter'),
            statusFilter: document.getElementById('status-filter'),
            categoryButtons: document.querySelectorAll('.category-btn'),
            
            // Stats
            totalCount: document.getElementById('total-count'),
            completedCount: document.getElementById('completed-count'),
            remainingCount: document.getElementById('remaining-count'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            
            // Actions
            themeToggle: document.getElementById('theme-toggle'),
            helpToggle: document.getElementById('help-toggle'),
            exportBtn: document.getElementById('export-btn'),
            importInput: document.getElementById('import-input'),
            clearAllBtn: document.getElementById('clear-all-btn'),
            addCategoryBtn: document.getElementById('add-category-btn'),
            
            // Modals
            helpModal: document.getElementById('help-modal'),
            confirmModal: document.getElementById('confirm-modal'),
            categoryModal: document.getElementById('category-modal'),
            closeHelpModal: document.getElementById('close-help-modal'),
            closeCategoryModal: document.getElementById('close-category-modal'),
            confirmCancel: document.getElementById('confirm-cancel'),
            confirmOk: document.getElementById('confirm-ok'),
            cancelCategory: document.getElementById('cancel-category'),
            saveCategory: document.getElementById('save-category'),
            
            // Category modal inputs
            newCategoryName: document.getElementById('new-category-name'),
            newCategoryColor: document.getElementById('new-category-color')
        };
    },

    /**
     * Render all tasks
     * @param {Array} tasks - Array of tasks to render
     * @param {String} searchTerm - Search term for highlighting
     */
    renderTasks(tasks, searchTerm = '') {
        if (tasks.length === 0) {
            this.elements.emptyState.style.display = 'block';
            this.elements.tasksContainer.innerHTML = '';
            return;
        }

        this.elements.emptyState.style.display = 'none';
        
        const tasksHTML = tasks.map((task, index) => {
            return this.createTaskHTML(task, index, searchTerm);
        }).join('');

        this.elements.tasksContainer.innerHTML = tasksHTML;
        this.attachTaskEventListeners();
    },

    /**
     * Create HTML for a single task
     * @param {Object} task - Task object
     * @param {Number} index - Task index
     * @param {String} searchTerm - Search term for highlighting
     * @returns {String} HTML string
     */
    createTaskHTML(task, index, searchTerm = '') {
        const isOverdue = task.dueDate && Utils.isOverdue(task.dueDate) && !task.completed;
        const isToday = task.dueDate && Utils.isToday(task.dueDate);
        const categoryColor = Utils.getCategoryColor(task.category);
        const categoryName = Utils.getCategoryName(task.category);
        const formattedDate = Utils.formatDate(task.dueDate);
        
        // Highlight search term
        let taskText = Utils.sanitizeInput(task.text);
        if (searchTerm) {
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            taskText = taskText.replace(regex, '<mark>$1</mark>');
        }

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" 
                 data-id="${task.id}" 
                 data-index="${index}"
                 draggable="true">
                <div class="task-content">
                    <div class="task-checkbox-container">
                        <input 
                            type="checkbox" 
                            class="task-checkbox" 
                            ${task.completed ? 'checked' : ''}
                            aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}"
                        >
                        <span class="checkmark"></span>
                    </div>
                    <div class="task-drag-handle" aria-label="Drag to reorder">
                        <span>☰</span>
                    </div>
                    <div class="task-text-container">
                        <div class="task-text" data-task-id="${task.id}">${taskText}</div>
                        <div class="task-meta">
                            <span class="task-category-badge" style="background-color: ${categoryColor}">
                                ${categoryName}
                            </span>
                            ${task.dueDate ? `
                                <span class="task-due-date ${isOverdue ? 'overdue' : ''} ${isToday ? 'today' : ''}">
                                    📅 ${formattedDate}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="btn-icon task-edit" data-task-id="${task.id}" aria-label="Edit task">
                            ✏️
                        </button>
                        <button class="btn-icon task-delete" data-task-id="${task.id}" aria-label="Delete task">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Attach event listeners to task elements
     */
    attachTaskEventListeners() {
        // Checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskItem = e.target.closest('.task-item');
                const taskId = taskItem.dataset.id;
                App.toggleTask(taskId);
            });
        });

        // Edit buttons
        document.querySelectorAll('.task-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-edit').dataset.taskId;
                this.startEditing(taskId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.task-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-delete').dataset.taskId;
                App.deleteTask(taskId);
            });
        });

        // Inline editing
        document.querySelectorAll('.task-text').forEach(textElement => {
            textElement.addEventListener('dblclick', (e) => {
                const taskId = e.target.dataset.taskId;
                this.startEditing(taskId);
            });
        });

        // Drag and drop
        this.attachDragAndDropListeners();
    },

    /**
     * Start editing a task inline
     * @param {String} taskId - Task ID
     */
    startEditing(taskId) {
        if (this.currentEditId) {
            this.cancelEditing();
        }

        const taskItem = document.querySelector(`[data-id="${taskId}"]`);
        if (!taskItem) return;

        const taskTextElement = taskItem.querySelector('.task-text');
        const currentText = taskTextElement.textContent.trim();
        
        this.currentEditId = taskId;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-edit-input';
        input.value = currentText;
        
        taskTextElement.style.display = 'none';
        taskTextElement.parentNode.insertBefore(input, taskTextElement);
        input.focus();
        input.select();

        const finishEditing = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                App.updateTask(taskId, { text: newText });
            } else {
                this.cancelEditing();
            }
        };

        const cancelEditing = () => {
            input.remove();
            taskTextElement.style.display = '';
            this.currentEditId = null;
        };

        input.addEventListener('blur', finishEditing);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEditing();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEditing();
            }
        });
    },

    /**
     * Cancel current editing
     */
    cancelEditing() {
        const input = document.querySelector('.task-edit-input');
        if (input) {
            const taskTextElement = input.nextElementSibling;
            input.remove();
            if (taskTextElement) {
                taskTextElement.style.display = '';
            }
            this.currentEditId = null;
        }
    },

    /**
     * Update task statistics
     * @param {Object} stats - Statistics object
     */
    updateStats(stats) {
        this.elements.totalCount.textContent = stats.total;
        this.elements.completedCount.textContent = stats.completed;
        this.elements.remainingCount.textContent = stats.remaining;
        
        const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        this.elements.progressFill.style.width = `${percentage}%`;
        this.elements.progressText.textContent = `${percentage}%`;
    },

    /**
     * Clear task input form
     */
    clearTaskInput() {
        this.elements.taskInput.value = '';
        this.elements.taskCategory.value = 'work';
        this.elements.taskDueDate.value = '';
        this.elements.taskInput.focus();
    },

    /**
     * Show modal
     * @param {String} modalId - Modal element ID
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Hide modal
     * @param {String} modalId - Modal element ID
     */
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * Show confirmation dialog
     * @param {String} title - Dialog title
     * @param {String} message - Dialog message
     * @returns {Promise<Boolean>} True if confirmed
     */
    showConfirmation(title, message) {
        return new Promise((resolve) => {
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;
            
            const handleConfirm = () => {
                this.elements.confirmOk.removeEventListener('click', handleConfirm);
                this.elements.confirmCancel.removeEventListener('click', handleCancel);
                this.hideModal('confirm-modal');
                resolve(true);
            };

            const handleCancel = () => {
                this.elements.confirmOk.removeEventListener('click', handleConfirm);
                this.elements.confirmCancel.removeEventListener('click', handleCancel);
                this.hideModal('confirm-modal');
                resolve(false);
            };

            this.elements.confirmOk.addEventListener('click', handleConfirm);
            this.elements.confirmCancel.addEventListener('click', handleCancel);
            this.showModal('confirm-modal');
        });
    },

    /**
     * Attach drag and drop listeners
     */
    attachDragAndDropListeners() {
        const taskItems = document.querySelectorAll('.task-item');
        
        // Only attach container listeners once
        if (!this.dragListenersAttached) {
            // Handle dragover and drop on the container
            const handleDragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                const dragging = document.querySelector('.dragging');
                if (!dragging) return;
                
                const afterElement = this.getDragAfterElement(this.elements.tasksContainer, e.clientY);
                
                if (afterElement == null) {
                    this.elements.tasksContainer.appendChild(dragging);
                } else {
                    this.elements.tasksContainer.insertBefore(dragging, afterElement);
                }
            };

            const handleDrop = (e) => {
                e.preventDefault();
                const draggedId = e.dataTransfer.getData('text/plain');
                const taskItems = Array.from(this.elements.tasksContainer.querySelectorAll('.task-item'));
                const newOrder = taskItems.map((item) => item.dataset.id);
                App.reorderTasks(newOrder);
            };

            this.elements.tasksContainer.addEventListener('dragover', handleDragover);
            this.elements.tasksContainer.addEventListener('drop', handleDrop);
            
            // Store references for potential cleanup
            this.elements.tasksContainer._handleDragover = handleDragover;
            this.elements.tasksContainer._handleDrop = handleDrop;
            
            this.dragListenersAttached = true;
        }
        
        // Attach dragstart and dragend to each task item
        // Since renderTasks replaces HTML, we can attach to all items each time
        taskItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.draggedElement = item;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', item.dataset.id);
                item.classList.add('dragging');
                item.style.opacity = '0.5';
            });

            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                item.style.opacity = '';
                this.draggedElement = null;
            });
        });
    },

    /**
     * Get element after which to insert dragged element
     * @param {HTMLElement} container - Container element
     * @param {Number} y - Y coordinate
     * @returns {HTMLElement} Element after which to insert
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    },

    /**
     * Update active category button
     * @param {String} category - Category name
     */
    updateActiveCategory(category) {
        this.elements.categoryButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
    },

    /**
     * Focus search input
     */
    focusSearch() {
        this.elements.searchInput.focus();
        this.elements.searchInput.select();
    }
};

