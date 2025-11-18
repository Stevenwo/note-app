# Note App - Personal Note-Taking Application

Beautiful, fast, self-hosted note-taking app with Netflix-style UI.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, TipTap
- **Backend**: Rust (Axum), SQLx, PostgreSQL
- **Database**: PostgreSQL 16
- **Deployment**: Docker, Hetzner VPS

## Local Development Setup

### Prerequisites

- Node.js 20+ and npm
- Rust 1.75+ (install from https://rustup.rs)
- Docker Desktop for Windows
- Git

### Quick Start

1. **Start the database**:
   ```bash
   docker-compose up -d
   ```

2. **Set up the backend**:
   ```bash
   cd backend
   cp .env.example .env
   cargo install sqlx-cli --no-default-features --features postgres
   sqlx migrate run
   cargo run
   ```

3. **Set up the frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Open the app**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## Project Structure

```
note-app/
├── frontend/          # Next.js application
├── backend/           # Rust API server
├── docker-compose.yml # Local development database
└── README.md
```

## Features

- ✨ Netflix-style visual card interface
- 📝 Rich text editor with markdown support
- 🖼️ Image uploads and thumbnails
- 🏷️ Tags and notebooks for organization
- ⭐ Starred notes
- 🌐 Web clipper
- 🔍 Full-text search
- 📱 PWA support (install on mobile/desktop)

## Development

### Backend (Rust)
- Framework: Axum
- Database: SQLx with compile-time query verification
- Port: 8080

### Frontend (Next.js)
- App Router with Server Components
- TipTap rich text editor
- Responsive design
- Port: 3000

## Deployment to Hetzner

Instructions coming soon...

## License

Personal use only
