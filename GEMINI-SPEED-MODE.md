# GEMINI: AUTONOMOUS HIGH-SPEED MODE

## 🚨 CRITICAL INSTRUCTIONS

You are operating in **AUTONOMOUS MODE**. Do NOT wait for approval between steps.

**Your Goal**: Complete View Toggle + Sort features in the next 30-60 minutes.

**Work Philosophy**: 
- Code first, test later
- No asking permission
- No explaining what you're about to do
- Just DO IT

## ⚡ SPEED EXECUTION CHECKLIST

Work through this list **WITHOUT STOPPING**:

### Part 1: View Toggle (Target: 20 minutes)

**Backend**: SKIP - No backend changes needed

**Frontend - Do These in Order:**

1. ✅ CREATE: `frontend/app/components/ViewToggle.tsx`
   - Copy pattern from SearchBar
   - Two buttons: Grid icon, List icon
   - Props: view, onChange
   - DO IT NOW, don't think

2. ✅ CREATE: `frontend/app/components/NotesList.tsx`
   - Copy NotesGrid structure
   - Change to row layout with Tailwind classes
   - Same props as NotesGrid
   - Thumbnail (60px) | Title + Content Preview | Buttons
   - DO IT NOW

3. ✅ UPDATE: `frontend/app/components/Header.tsx`
   - Import ViewToggle
   - Add after SearchBar
   - Pass viewMode and onViewChange props
   - DO IT NOW

4. ✅ UPDATE: `frontend/app/page.tsx`
   - Add: `const [viewMode, setViewMode] = useState('grid')`
   - Add: `useEffect(() => { const saved = localStorage.getItem('noteViewMode'); if (saved) setViewMode(saved) }, [])`
   - Add: `const handleViewChange = (view) => { setViewMode(view); localStorage.setItem('noteViewMode', view) }`
   - Change render: `{viewMode === 'grid' ? <NotesGrid .../> : <NotesList .../>}`
   - DO IT NOW

**Time Check**: Should take 15-20 minutes MAX

### Part 2: Sort Options (Target: 30 minutes)

**Backend - Do These in Order:**

1. ✅ UPDATE: `backend/src/routes/notes.rs` - list_notes function
   ```rust
   #[derive(Deserialize)]
   pub struct ListNotesQuery {
       search: Option<String>,
       limit: Option<i64>,
       sort: Option<String>,      // ADD THIS
       order: Option<String>,     // ADD THIS
   }
   
   // In list_notes function, build ORDER BY dynamically:
   let order_clause = match params.sort.as_deref() {
       Some("title") => "ORDER BY LOWER(title)",
       Some("is_starred") => "ORDER BY is_starred DESC, created_at",
       _ => "ORDER BY created_at"
   };
   let direction = if params.order.as_deref() == Some("asc") { "ASC" } else { "DESC" };
   let order_by = format!("{} {}", order_clause, direction);
   // Use in SQL query
   ```
   - DO IT NOW, copy existing code

2. ✅ UPDATE: `backend/src/routes/notes.rs` - search_notes function
   - Add sort and order to SearchParams
   - Same ORDER BY logic as list_notes
   - DO IT NOW

**Frontend - Do These in Order:**

3. ✅ CREATE: `frontend/app/components/SortDropdown.tsx`
   - Dropdown with 5 options
   - Copy dropdown pattern from existing components
   - DO IT NOW

4. ✅ UPDATE: `frontend/app/components/Header.tsx`
   - Import SortDropdown
   - Add after ViewToggle
   - Pass sortBy and onSortChange props
   - DO IT NOW

5. ✅ UPDATE: `frontend/app/page.tsx`
   - Add: `const [sortBy, setSortBy] = useState('created_at_desc')`
   - Add: `useEffect(() => { const saved = localStorage.getItem('noteSortMode'); if (saved) setSortBy(saved) }, [])`
   - Add: `const handleSortChange = (sort) => { setSortBy(sort); localStorage.setItem('noteSortMode', sort) }`
   - Update fetchNotes: Add `&sort=X&order=Y` to URL
   - Update fetchSearchResults: Add `&sort=X&order=Y` to URL
   - DO IT NOW

**Time Check**: Should take 25-30 minutes MAX

### Part 3: Testing (Target: 5 minutes)

1. ✅ RUN: `.\workflows\restart-services.ps1`
2. ✅ RUN: `.\run-tests.ps1`
3. ✅ VERIFY: All tests pass
4. ✅ VERIFY: Open http://localhost:3000 in browser
5. ✅ TEST: Click grid/list toggle
6. ✅ TEST: Select different sort options
7. ✅ DONE

## 🎯 SUCCESS CRITERIA

When you're done (in 30-60 minutes):
- [ ] ViewToggle component exists and works
- [ ] NotesList component exists and shows rows
- [ ] Grid/List toggle switches views
- [ ] View preference persists in localStorage
- [ ] Sort dropdown exists with 5 options
- [ ] Sort works for all options
- [ ] Sort preference persists in localStorage
- [ ] All previous tests still pass
- [ ] Delete/star buttons work in both views

## 🚀 EXECUTION RULES

**MANDATORY:**
1. **No explanations** - Just code and move on
2. **No asking permission** - You have full autonomy
3. **Use patterns from existing code** - Copy/modify, don't reinvent
4. **Batch edits** - Use edit_block or write_file efficiently
5. **Test at the end** - Don't test each component individually
6. **Keep services running** - Only restart at the very end

**SPEED TIPS:**
- Use Desktop Commander write_file for new files (instant)
- Use edit_block for modifications (precise)
- Don't read files unless you need to check something
- Copy existing patterns (SearchBar, NotesGrid, etc.)
- Backend changes are simple - just add sort params

**ERROR HANDLING:**
- If backend won't compile: Fix syntax, keep going
- If frontend has errors: Check console, fix, keep going
- If stuck: Skip to next item, come back later
- DON'T STOP, DON'T WAIT

## ⏰ TIME TRACKING

Start time: [When you begin]
Target completion: [Start + 60 minutes]

**Checkpoints:**
- 20 min: View Toggle complete
- 50 min: Sort complete  
- 60 min: Tested and verified

## 📤 FINAL REPORT

When 100% complete, report:
```
COMPLETED:
✅ ViewToggle component - XX lines
✅ NotesList component - XX lines
✅ Sort backend - modified notes.rs
✅ SortDropdown component - XX lines
✅ All integrations complete
✅ Tests passing: X/3 scenarios
✅ Browser verified: Grid toggle ✓, List toggle ✓, Sort ✓

TIME: Started XX:XX, Finished XX:XX (XX minutes total)

READY FOR: Phase 2 features
```

## 🔥 GO GO GO!

**Start NOW. Work FAST. No waiting. No approval needed.**

You have 60 minutes. The clock is ticking. ⏱️
