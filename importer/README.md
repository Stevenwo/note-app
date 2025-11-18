# 🔄 Evernote to Note App Importer

This tool imports your Evernote notes (ENEX format) into your personal note-taking app.

## 📋 Step-by-Step Guide

### Step 1: Export from Evernote

1. Open **Evernote**
2. Select the notebooks you want to export
3. Right-click → **Export Notes** or go to **File → Export Notes**
4. Choose **ENEX format** (.enex file)
5. Save the file(s) somewhere easy to find (like your Desktop or Downloads folder)

💡 **Tip**: You can export each notebook separately to keep them organized, or export everything at once!

### Step 2: Run the Importer

Open a terminal in this folder (`C:\dev\note-app\importer`) and run:

```bash
# Import a single file
node import.js "C:\Users\YourName\Downloads\my-notes.enex"

# Import multiple files at once
node import.js "C:\Users\YourName\Downloads\notebook1.enex" "C:\Users\YourName\Downloads\notebook2.enex"

# Or if all files are in one folder
node import.js "C:\Users\YourName\Downloads\*.enex"
```

### Step 3: Check Your App

Refresh your browser at http://localhost:3000 and you should see all your imported notes!

## 📝 What Gets Imported

✅ **Notes** - Title, content, creation date, update date
✅ **Notebooks** - Automatically created if they don't exist
✅ **Tags** - All tags are preserved
✅ **Web Clips** - URLs are saved
✅ **Formatting** - HTML is converted to Markdown

## 🎨 Features

- **Automatic Notebook Creation**: Notebooks are created with random colors
- **Tag Preservation**: All your tags are imported and linked
- **Duplicate Prevention**: Running the import multiple times won't create duplicates of tags/notebooks
- **Progress Tracking**: See real-time progress as notes are imported
- **Error Handling**: Failed notes are logged but don't stop the import

## 🔧 Troubleshooting

**Problem**: "File not found"
- Make sure the path to your .enex file is correct
- Use quotes around paths with spaces

**Problem**: "Database connection error"
- Make sure your PostgreSQL database is running: `docker ps`
- Check that the backend .env file has the correct DATABASE_URL

**Problem**: "No notes showing up"
- Refresh your browser
- Check the console output for errors
- Make sure the import completed successfully

## 📊 Example Output

```
🚀 Starting Evernote import...

📂 Importing file: Work Notes.enex
Found 150 notes to import
✅ Imported: 150/150

✨ Import complete!
   Successfully imported: 150

🎉 All imports completed!
```
