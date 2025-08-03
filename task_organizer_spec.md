
# Worklog Web App Specification

## Problem
Currently, our organization logs daily tasks in a notepad and shares them on Teams chat in this format:
```
1/1/2025
    - Project Name / Section
        - Task1
        - Task2

    - Project Name 2 / Section 2
        - Task3
        - Task4
```
Tracking and managing tasks this way is messy and inefficient.

---

## Solution
Build a **single-screen web app (PWA)** to organize daily tasks with easy tracking, summaries, and backup options.

---

## Screen Layout

### Top Bar
- App name
- Backup button

### Action Row
- **Add Task** button (opens modal)
- **Add Project/Section** (enum)
- **Sort tasks by date**
- **Summary button** (shows circular charts displaying hours spent per project/section for the selected period)
- **Date filter** (YTD, MTD, WTD calendar picker)

### Task Cards
- Each card shows date and associated projects.
- "View Details" button for detailed view.

---

## Add Task Modal

### Fields
- **Date** (preselected to current date, unique - no duplicates)
- **Project/Section** (select existing or create new enum)
- Add multiple tasks under each project/section (no duplicates)

### After Save
- A new date card appears on the home screen.

---

## Card Detail Modal

### Header
- Date (top-left)
- Copy button (top-right) → Copies data in this format:
```
1/1/2025
    - Project Name
        - Task1
        - Task2

    - Project Name
        - Task3
        - Task4
```

### Project Sections
- Each project shows:
  - Project name
  - Hours spent input field (for summary)
  - **Copy Block** button → Copies:
    ```
    Tasks (or Task if only one)
        - Task1
        - Task2
    ```
  - **Copy Tasks** button → Copies:
    ```
    Task1, Task2
    ```

### Edit/Delete
- All fields editable except date.
- Projects and tasks can be deleted.

---

## Theme
- Support both **dark** and **light** modes.
- Theme toggle on the top bar.

---

## Technical Requirements
- Use **IndexedDB** or **LocalStorage** as the database.
- Must be a **PWA**.
- Use a **modern front-end framework** (React, Vue, or Svelte) for a modern look.
- **Backup functionality**:
  - Backup data from IndexedDB to LocalStorage.
  - Export all data as a JSON file.
  - Import JSON to restore data (full import/export support).

---
