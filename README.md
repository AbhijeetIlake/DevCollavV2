# DevCollab

A web-based collaborative coding platform for streamlined code snippet management and real-time workspace collaboration.

## Features

### Snippet Management
- Create, edit, and delete code snippets
- Support for multiple programming languages
- Public and private snippet visibility
- Search and filter snippets
- Copy code to clipboard
- Monaco Editor integration

### Workspace Collaboration
- Create collaborative workspaces with UUID identification
- Real-time code editing with Socket.io
- Invite collaborators to workspaces
- Save and manage workspace snippets
- Live user presence indicators
- Multiple language support in the editor

### Dashboard
- View statistics (total snippets, public/private counts)
- Track workspace ownership and collaborations
- Quick access to recent snippets and workspaces
- User-specific data insights

### Authentication
- Secure authentication with Clerk
- User profile management
- Protected routes

## Tech Stack

**Frontend:**
- React.js
- Vite
- React Router
- Monaco Editor
- Socket.io Client
- Clerk Authentication
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB (Atlas)
- Socket.io
- Mongoose
- UUID

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Clerk account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd devcollab
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=3001
CLIENT_URL=http://localhost:5173
```

### Setting up MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with read/write access
4. Get your connection string and add it to the `.env` file

### Setting up Clerk Authentication

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Get your publishable key from the dashboard
4. Add it to the `.env` file as `VITE_CLERK_PUBLISHABLE_KEY`

### Running the Application

Development mode:
```bash
npm run dev
```

This will start both the frontend (port 5173) and backend (port 3001) servers concurrently.

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Project Structure

```
devcollab/
├── server/
│   ├── index.js              # Express server & Socket.io setup
│   ├── models/
│   │   ├── Snippet.js        # Snippet schema
│   │   └── Workspace.js      # Workspace schema
│   └── routes/
│       ├── snippets.js       # Snippet CRUD endpoints
│       ├── workspaces.js     # Workspace CRUD endpoints
│       └── dashboard.js      # Dashboard statistics
├── src/
│   ├── components/
│   │   └── Layout.jsx        # Main layout with navigation
│   ├── pages/
│   │   ├── Dashboard.jsx     # Dashboard page
│   │   ├── Snippets.jsx      # Snippets management page
│   │   ├── Workspaces.jsx    # Workspaces list page
│   │   └── WorkspaceEditor.jsx # Real-time collaborative editor
│   ├── App.jsx               # Main app component with routing
│   ├── main.jsx              # App entry point
│   └── index.css             # Global styles
├── .env                      # Environment variables
├── .env.example              # Example environment variables
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies and scripts
```

## Features in Detail

### Snippet Management
- **Create Snippets**: Add new code snippets with title, description, code, and language selection
- **Edit Snippets**: Modify existing snippets with full editing capabilities
- **Delete Snippets**: Remove unwanted snippets (only owner can delete)
- **Public/Private**: Control snippet visibility
- **Search & Filter**: Find snippets by title, description, or language
- **Copy Code**: One-click copy to clipboard

### Workspace Collaboration
- **Real-time Editing**: Multiple users can edit code simultaneously
- **Live Presence**: See who's currently in the workspace
- **Save Snippets**: Save current code as workspace snippets
- **Load Snippets**: Load previously saved snippets
- **Language Selection**: Choose from multiple programming languages
- **Member Management**: View workspace owner and collaborators
- **UUID-based**: Secure workspace identification

### Dashboard
- **Statistics**: View total snippets, public/private counts, workspace counts
- **Recent Activity**: Quick access to recent snippets and workspaces
- **User Insights**: Track owned vs collaborating workspaces

## API Endpoints

### Snippets
- `GET /api/snippets` - Get all snippets
- `GET /api/snippets/:id` - Get snippet by ID
- `POST /api/snippets` - Create new snippet
- `PUT /api/snippets/:id` - Update snippet
- `DELETE /api/snippets/:id` - Delete snippet

### Workspaces
- `GET /api/workspaces` - Get all workspaces
- `GET /api/workspaces/:workspaceId` - Get workspace by ID
- `POST /api/workspaces` - Create new workspace
- `PUT /api/workspaces/:workspaceId` - Update workspace
- `DELETE /api/workspaces/:workspaceId` - Delete workspace (owner only)
- `POST /api/workspaces/:workspaceId/collaborators` - Add collaborator
- `DELETE /api/workspaces/:workspaceId/collaborators/:userId` - Remove collaborator
- `POST /api/workspaces/:workspaceId/snippets` - Add snippet to workspace
- `DELETE /api/workspaces/:workspaceId/snippets/:snippetId` - Remove snippet from workspace

### Dashboard
- `GET /api/dashboard` - Get user statistics and recent activity

## Socket.io Events

### Client to Server
- `join-workspace` - Join a workspace room
- `leave-workspace` - Leave a workspace room
- `code-change` - Send code changes to other users
- `cursor-move` - Send cursor position updates

### Server to Client
- `users-update` - Receive updated list of connected users
- `content-update` - Receive code changes from other users
- `cursor-update` - Receive cursor position from other users

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## License

MIT
