# To Doo

To Doo is a feature-rich, vanilla JavaScript todo list application with categories, due dates, drag & drop reordering, themes, and more.

## Features

### Core Features
- ✅ Add, edit, delete, and complete tasks
- ✅ Task categories (Work, Personal, School, Shopping)
- ✅ Due dates with visual indicators
- ✅ Drag & drop reordering
- ✅ Progress tracking with visual progress bar
- ✅ Search and filter functionality
- ✅ Dark/Light theme toggle
- ✅ Keyboard shortcuts
- ✅ Export/Import data (JSON)
- ✅ Browser notifications for due dates
- ✅ Local storage persistence

### Advanced Features
- Real-time search with highlighting
- Multiple filter combinations
- Custom category management
- Task statistics (total, completed, remaining)
- Responsive mobile-first design
- Smooth animations and transitions
- Accessibility features

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in a web browser
3. Or use a local server:
   ```bash
   cd todo-app
   python3 -m http.server 8000
   # Then open http://localhost:8000 in your browser
   ```

### Usage

#### Adding Tasks
1. Enter task text in the input field
2. Select a category (optional)
3. Set a due date (optional)
4. Click "Add Task" or press Enter

#### Editing Tasks
- Double-click on a task text to edit inline
- Or click the edit button (✏️)
- Press Enter to save, Escape to cancel

#### Completing Tasks
- Click the checkbox next to a task
- Completed tasks are crossed out and dimmed

#### Deleting Tasks
- Click the delete button (🗑️)
- Confirm deletion in the modal

#### Reordering Tasks
- Drag and drop tasks using the drag handle (☰) or the task itself
- Tasks maintain their order across sessions

#### Filtering Tasks
- Use the search box to search by text
- Use category filter to filter by category
- Use status filter to filter by completion status
- Click category buttons for quick filtering

#### Themes
- Click the theme toggle button (🌙/☀️) in the header
- Theme preference is saved and persists across sessions

#### Keyboard Shortcuts
- `Ctrl/Cmd + N`: Focus new task input
- `Ctrl/Cmd + F`: Focus search input
- `Enter`: Save task (when editing or adding)
- `Escape`: Cancel editing or close modals

#### Export/Import
- Click "Export Data" to download all tasks and settings as JSON
- Click "Import Data" to import tasks from a JSON file
- Useful for backups and data migration

## File Structure

```
todo-app/
├── index.html          # Main HTML file
├── styles/
│   ├── main.css        # Base styles
│   ├── themes.css      # Theme styles (dark/light)
│   └── responsive.css  # Responsive design
├── scripts/
│   ├── app.js          # Main application logic
│   ├── storage.js      # LocalStorage management
│   ├── ui.js           # UI interactions and DOM manipulation
│   └── utils.js        # Utility functions
└── assets/
    ├── icons/
    └── sounds/
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Requires:
- Local Storage API
- Notification API (optional, with fallbacks)
- Drag and Drop API

## Data Storage

All data is stored in the browser's localStorage:
- Tasks: `todoAppData`
- Settings: `todoAppSettings`

Data persists across browser sessions and page refreshes.

## Development

### Code Structure

The app uses a modular architecture:
- **app.js**: Main application logic and coordination
- **storage.js**: Data persistence (localStorage)
- **ui.js**: DOM manipulation and UI interactions
- **utils.js**: Utility functions and helpers

### Adding Features

1. Add UI elements to `index.html`
2. Add styles to CSS files
3. Add logic to appropriate JavaScript module
4. Update event listeners in `app.js`

## Testing

To test the application:

1. Open the app in a browser
2. Test basic CRUD operations:
   - Add a task
   - Edit a task
   - Complete a task
   - Delete a task
3. Test advanced features:
   - Filter by category
   - Search tasks
   - Drag and drop reordering
   - Theme toggle
   - Export/Import
4. Test responsiveness:
   - Resize browser window
   - Test on mobile device
5. Test data persistence:
   - Add tasks
   - Refresh page
   - Verify tasks persist

## Known Issues

- Custom categories don't appear in the category bar (only in dropdown)
- Drag and drop reordering only affects visible (filtered) tasks
- Browser notifications require user permission

## License

This project is open source and available for educational purposes.

## Credits

Built with vanilla JavaScript, HTML, and CSS.
No external dependencies or frameworks.

