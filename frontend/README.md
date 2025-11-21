# Facebook Post AI Agent - Frontend

Modern React-based web interface for the Facebook Post AI Agent.

## Features

- 📊 **Dashboard** - System status and queue statistics
- 📄 **Pages** - Discover and manage Facebook pages
- ✍️ **Create Post** - Generate and schedule posts with AI
- ⏰ **Jobs** - Monitor scheduled and active posting jobs
- 🔍 **Audit Logs** - View system activity and audit trail

## Tech Stack

- React 18
- React Router DOM
- Vite
- Axios
- Lucide React (icons)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## API Configuration

The frontend is configured to proxy API requests to `http://localhost:3002` by default. This can be changed in `vite.config.js` or by setting the `VITE_API_URL` environment variable.

## Pages

### Dashboard
- System health status
- Queue statistics (waiting, active, completed, failed)
- Quick action buttons

### Pages
- List all discovered Facebook pages
- View page permissions and tasks
- Refresh page list

### Create Post
- Select target page
- Configure post type (text, image, video, link)
- Set language, tone, and key messages
- Schedule publish time
- Dry-run mode for testing
- AI-powered content generation

### Jobs
- Real-time queue statistics
- Job status monitoring
- Queue management

### Audit Logs
- Filterable audit trail
- View all system activities
- Search by request ID, page ID, or type

## Styling

The frontend uses a modern, clean design with:
- Responsive layout
- Dark sidebar navigation
- Card-based content sections
- Color-coded status badges
- Smooth animations and transitions

