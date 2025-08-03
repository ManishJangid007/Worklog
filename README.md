# Worklog

A modern Progressive Web App (PWA) for organizing and tracking daily work entries with project management and time tracking features.

## Features

### Core Functionality
- **Daily Worklog Management**: Add work entries for specific dates with project organization
- **Project Management**: Create and manage projects/sections for tasks
- **Time Tracking**: Track hours spent on each project for summary reports
- **Copy Functionality**: Copy tasks in various formats for sharing on Teams

### User Interface
- **Modern Design**: Clean, responsive interface with dark/light theme support
- **Single Screen Layout**: All functionality accessible from the main screen
- **Modal Dialogs**: Intuitive task and project management through modals
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Data Management
- **IndexedDB Storage**: Local database for reliable data persistence
- **Backup & Restore**: Export/import data as JSON files
- **PWA Support**: Installable as a native app with offline capabilities

### Advanced Features
- **Date Filtering**: Filter tasks by Year-to-Date, Month-to-Date, Week-to-Date
- **Summary Reports**: Visual charts showing hours spent per project
- **Sorting**: Sort tasks by date in ascending or descending order
- **Theme Toggle**: Switch between light and dark themes

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-organizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

To create a production build:

```bash
npm run build
```

This creates a `build` folder with the optimized production files.

## Usage

### Adding Work Entries

1. Click the "Add Entry" button in the action row
2. Select a date (defaults to current date)
3. Choose an existing project or create a new one
4. Add multiple work entries under the selected project
5. Click "Save Entries" to create the daily worklog entry

### Managing Projects

- Projects are created automatically when adding tasks
- Each project can have multiple tasks
- Hours spent can be tracked per project for summary reports

### Viewing Task Details

1. Click "View Details" on any task card
2. View all tasks and projects for that date
3. Use copy buttons to copy data in different formats:
   - **Copy All**: Copies the entire day's data in Teams format
   - **Copy Block**: Copies project tasks in formatted block
   - **Copy Tasks**: Copies just the task descriptions

### Summary Reports

1. Click the "Summary" button in the action row
2. Select a date filter (YTD, MTD, WTD, All Time)
3. View visual charts showing hours spent per project
4. See total statistics for the selected period

### Data Backup

- **Export**: Click the download icon in the top bar to export all data as JSON
- **Import**: Click the upload icon to import previously exported data

### Theme Switching

Click the sun/moon icon in the top bar to toggle between light and dark themes.

## Data Format

The app exports data in the following JSON format:

```json
{
  "dailyTasks": [
    {
      "id": "uuid",
      "date": "2025-01-01",
      "projects": [
        {
          "id": "uuid",
          "name": "Project Name",
          "hoursSpent": 4.5
        }
      ],
      "tasks": [
        {
          "id": "uuid",
          "description": "Task description",
          "projectId": "uuid",
          "date": "2025-01-01"
        }
      ]
    }
  ],
  "projects": [
    {
      "id": "uuid",
      "name": "Project Name"
    }
  ],
  "version": "1.0.0",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Technical Details

### Architecture
- **Frontend**: React with TypeScript
- **State Management**: React hooks and context
- **Database**: IndexedDB for local storage
- **Styling**: CSS with CSS variables for theming
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React

### PWA Features
- **Service Worker**: Caching and offline support
- **Manifest**: App installation capabilities
- **Responsive Design**: Works on all device sizes
- **Offline First**: Data stored locally with IndexedDB

### Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── TopBar.tsx
│   ├── ActionRow.tsx
│   ├── TaskCard.tsx
│   ├── AddTaskModal.tsx
│   ├── TaskDetailModal.tsx
│   └── SummaryModal.tsx
├── contexts/           # React contexts
│   └── ThemeContext.tsx
├── services/           # Business logic
│   └── database.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx            # Main app component
├── App.css            # Styles
└── index.tsx          # App entry point
```

### Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
