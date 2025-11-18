# Gemini: Next Phase - Getting Started

## 🎯 Mission: Implement Search, View Toggle, and Sort Features

You've successfully tested delete and star features. Now build the remaining Phase 1 features.

## 📋 Quick Start

### Step 1: Read the Plan
```powershell
Get-Content C:\dev\note-app\NEXT-PHASE-INSTRUCTIONS.json | ConvertFrom-Json | ConvertTo-Json -Depth 20
```

### Step 2: Verify Services
```powershell
cd C:\dev\note-app
.\workflows\health-check.ps1
```
All services must show `[OK] Running`

### Step 3: Start with Backend (Search)

#### Create Search Endpoint
File: `backend/src/routes/notes.rs`

Add this function:
```rust
pub async fn search_notes(
    State(state): State<AppState>,
    Query(params): Query<SearchParams>,
) -> Result<Json<Vec<Note>>, StatusCode> {
    // Implementation in NEXT-PHASE-INSTRUCTIONS.json
}
```

#### Register Route
File: `backend/src/main.rs`

Add:
```rust
.route("/api/notes/search", get(routes::notes::search_notes))
```

#### Test Backend
```powershell
Invoke-RestMethod -Uri 'http://localhost:8080/api/notes/search?q=test' -Method GET | ConvertTo-Json
```

### Step 4: Build Frontend (Search)

#### Create SearchBar Component
File: `frontend/app/components/SearchBar.tsx`
- Debounced input (300ms)
- Clear button
- Keyboard shortcuts (Cmd/Ctrl+K)

#### Update Header
File: `frontend/app/components/Header.tsx`
- Import and add SearchBar
- Pass props from page.tsx

#### Update Page
File: `frontend/app/page.tsx`
- Add search state
- Implement debounced search
- Fetch from /api/notes/search
- Display results or all notes

### Step 5: Continue with View Toggle & Sort
Follow the detailed instructions in NEXT-PHASE-INSTRUCTIONS.json

## 📊 Implementation Order

1. **Search Backend** (30-45 min)
   - Endpoint + route + testing

2. **Search Frontend** (45-60 min)
   - SearchBar + Header + Page logic

3. **View Toggle** (60-90 min)
   - ViewToggle component + NotesList component

4. **Sort Backend** (30-45 min)
   - Add sort params to existing endpoints

5. **Sort Frontend** (45-60 min)
   - SortDropdown component + integration

6. **Testing** (30-45 min)
   - Manual tests + Playwright updates

**Total Time: 4-6 hours**

## 🧪 Testing Each Feature

After implementing each feature:

### Backend Testing
```powershell
# Test search
Invoke-RestMethod -Uri 'http://localhost:8080/api/notes/search?q=keyword'

# Test sort
Invoke-RestMethod -Uri 'http://localhost:8080/api/notes?sort=title&order=asc&limit=5'
```

### Frontend Testing
1. Open http://localhost:3000
2. Open browser console (F12)
3. Test the feature manually
4. Check for console errors

### Automated Testing
```powershell
# After all features complete
.\run-tests.ps1
```

## 📁 Key Files

**Backend:**
- `backend/src/routes/notes.rs` - Add search function, update sort
- `backend/src/main.rs` - Register new routes

**Frontend:**
- `frontend/app/components/SearchBar.tsx` - NEW
- `frontend/app/components/ViewToggle.tsx` - NEW
- `frontend/app/components/NotesList.tsx` - NEW (list view)
- `frontend/app/components/SortDropdown.tsx` - NEW
- `frontend/app/components/Header.tsx` - UPDATE (add new components)
- `frontend/app/page.tsx` - UPDATE (add state and logic)

## ✅ Success Checklist

After implementation, verify:

- [ ] Search box appears in header
- [ ] Typing in search filters notes in real-time
- [ ] Search finds notes by title and content
- [ ] Clear button (X) resets search
- [ ] Cmd/Ctrl+K focuses search
- [ ] Grid/List toggle button appears
- [ ] Clicking toggle switches view
- [ ] Both views show delete/star buttons
- [ ] Sort dropdown appears
- [ ] Each sort option works correctly
- [ ] All preferences persist after refresh
- [ ] Features work together (search + sort + view toggle)

## 🚨 Troubleshooting

### Services Down?
```powershell
.\workflows\restart-services.ps1
```

### Backend Not Compiling?
```powershell
cd backend
cargo build
# Fix any compilation errors
```

### Frontend Errors?
```powershell
cd frontend
npm run dev
# Check console for errors
```

### Need Help?
- Read SESSION-STATE.md for current status
- Check NEXT-PHASE-INSTRUCTIONS.json for detailed specs
- Review existing components for patterns

## 📤 What to Report

After completing implementation:

1. **Status**: Which features completed?
2. **Test Results**: Run `.\run-tests.ps1` and share results
3. **Screenshots**: Show search, view toggle, and sort working
4. **Issues**: Any problems encountered?
5. **Questions**: Anything unclear?

## 🎓 Learning Resources

- Follow patterns from NoteCard.tsx for new components
- Reference existing API endpoints in notes.rs
- Test incrementally - don't implement everything at once
- Backend first, then frontend, then testing

Good luck! 🚀

---

**Remember**: Start with search backend, test it, then move to search frontend. Don't try to do everything at once!
