# Testing Checklist

## Basic Functionality Tests

### Task CRUD Operations
- [ ] Add a new task
- [ ] Edit a task (double-click or edit button)
- [ ] Complete a task (checkbox)
- [ ] Delete a task (delete button with confirmation)
- [ ] Verify task count updates correctly

### Categories
- [ ] Select category when adding task
- [ ] Filter tasks by category
- [ ] Click category buttons to filter
- [ ] Verify category colors display correctly
- [ ] Add custom category (if implemented)

### Due Dates
- [ ] Set due date when adding task
- [ ] Verify due date displays correctly
- [ ] Verify overdue tasks are highlighted
- [ ] Verify today's tasks are highlighted
- [ ] Test date formatting (Today, Tomorrow, etc.)
- [ ] Filter by overdue tasks

### Search and Filter
- [ ] Search tasks by text
- [ ] Verify search highlighting works
- [ ] Filter by category
- [ ] Filter by status (all, active, completed, overdue)
- [ ] Combine search and filter
- [ ] Clear search and filters

### Drag and Drop
- [ ] Drag a task to reorder
- [ ] Verify order persists after refresh
- [ ] Test drag and drop with filtered tasks
- [ ] Test drag and drop on mobile (touch)

### Progress Tracking
- [ ] Verify progress bar updates
- [ ] Verify progress percentage displays
- [ ] Verify task counts (total, completed, remaining)
- [ ] Test progress with different task states

### Theme Toggle
- [ ] Toggle between light and dark theme
- [ ] Verify theme persists after refresh
- [ ] Verify all UI elements have proper contrast
- [ ] Test theme toggle button icon

### Keyboard Shortcuts
- [ ] Ctrl/Cmd + N: Focus new task input
- [ ] Ctrl/Cmd + F: Focus search input
- [ ] Enter: Save task (when editing or adding)
- [ ] Escape: Cancel editing or close modals
- [ ] Verify shortcut help modal displays

### Export/Import
- [ ] Export data to JSON file
- [ ] Verify exported file contains all tasks and settings
- [ ] Import data from JSON file
- [ ] Verify imported tasks display correctly
- [ ] Test import with invalid file format
- [ ] Test import with corrupted data

### Browser Notifications
- [ ] Request notification permission
- [ ] Verify notification displays for tasks due today
- [ ] Verify notification displays when adding task due today
- [ ] Test notification click (should focus window)
- [ ] Test notification auto-close after 5 seconds

### Data Persistence
- [ ] Add tasks and refresh page
- [ ] Verify tasks persist
- [ ] Verify theme preference persists
- [ ] Verify task order persists
- [ ] Verify category preferences persist

### Responsive Design
- [ ] Test on mobile device (phone)
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Verify touch-friendly interface elements
- [ ] Verify layout adapts to screen size
- [ ] Test in landscape orientation

### Accessibility
- [ ] Test with screen reader
- [ ] Verify keyboard navigation works
- [ ] Verify ARIA labels are present
- [ ] Verify color contrast meets WCAG standards
- [ ] Test with reduced motion preferences

## Edge Cases

### Empty States
- [ ] Verify empty state displays when no tasks
- [ ] Verify empty state updates when tasks are added
- [ ] Verify empty state updates when all tasks are deleted

### Error Handling
- [ ] Test with localStorage disabled
- [ ] Test with storage quota exceeded
- [ ] Test with invalid JSON import
- [ ] Test with corrupted data in localStorage

### Performance
- [ ] Test with 100+ tasks
- [ ] Test search performance with many tasks
- [ ] Test filter performance with many tasks
- [ ] Test drag and drop performance

### Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Test in Edge
- [ ] Verify localStorage works in all browsers
- [ ] Verify notifications work in all browsers (if supported)

## Known Issues

- Custom categories don't appear in category bar (only in dropdown)
- Drag and drop reordering only affects visible (filtered) tasks
- Browser notifications require user permission (expected behavior)

## Testing Instructions

1. Open the app in a browser
2. Go through each test case
3. Mark tests as passed/failed
4. Document any bugs or issues found
5. Test on multiple browsers and devices
6. Test with different data sets (empty, few tasks, many tasks)

## Test Data

### Sample Tasks
1. "Buy groceries" - Personal - Due today
2. "Finish project" - Work - Due tomorrow
3. "Study for exam" - School - Due in 3 days
4. "Buy birthday gift" - Shopping - Due in 1 week
5. "Call dentist" - Personal - No due date
6. "Write report" - Work - Overdue
7. "Complete homework" - School - Due today

### Test Scenarios
- Add multiple tasks with different categories
- Add tasks with and without due dates
- Complete some tasks
- Delete some tasks
- Filter by different criteria
- Search for specific tasks
- Reorder tasks
- Export and import data
- Toggle theme
- Test on different screen sizes

