# Quick Start Guide - Windows

## What's Been Built ✅

### Backend (Rust)
- ✅ Axum web server
- ✅ PostgreSQL database schema
- ✅ Notes, Notebooks, Tags APIs
- ✅ Full-text search support

### Frontend (Next.js)
- ✅ Netflix-style UI with beautiful cards
- ✅ Responsive grid layout
- ✅ Dark theme with glassmorphism
- ✅ Card hover effects and animations

### Database
- ✅ Docker Compose for PostgreSQL

---

## Setup Steps

### 1. Start the Database

Open PowerShell and run:

```powershell
cd C:\dev\note-app
docker-compose up -d
```

Wait for "database system is ready to accept connections"

### 2. Setup Backend (Rust)

```powershell
cd backend
cp .env.example .env
```

Install SQLx CLI:
```powershell
cargo install sqlx-cli --no-default-features --features postgres
```

Run database migrations:
```powershell
sqlx migrate run
```

Start the backend server:
```powershell
cargo run
```

Backend will be running at: **http://localhost:8080**

### 3. Setup Frontend (Next.js)

Open a NEW PowerShell window:

```powershell
cd C:\dev\note-app\frontend
npm install
```

Wait for installation to complete, then:

```powershell
npm run dev
```

Frontend will be running at: **http://localhost:3000**

### 4. Open Your App

Open your browser to **http://localhost:3000**

You should see the beautiful Netflix-style notes interface!

---

## Troubleshooting

**Docker not starting?**
- Make sure Docker Desktop is running
- Check ports 5432 isn't already in use

**Rust compile errors?**
- Install Rust from: https://rustup.rs
- Make sure you're using Rust 1.75+

**Next.js errors?**
- Make sure Node.js 20+ is installed
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Database connection errors?**
- Check Docker container is running: `docker ps`
- Verify DATABASE_URL in backend/.env

---

## What's Next?

The app is now running locally! Try:

1. **Creating notes** - Backend is ready for POST requests
2. **Star notes** - Click the star icon on any card
3. **Browse the UI** - Hover over cards to see the Netflix effect

The basic structure is complete and running!
