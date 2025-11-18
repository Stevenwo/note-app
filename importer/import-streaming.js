import fs from 'fs';
import path from 'path';
import sax from 'sax';
import pg from 'pg';
import TurndownService from 'turndown';
import dotenv from 'dotenv';

dotenv.config({ path: '../backend/.env' });

const { Pool } = pg;

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize HTML to Markdown converter
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Default user ID
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Clean and convert HTML content to Markdown
 */
function cleanContent(content) {
  if (!content) return '';
  
  try {
    return turndownService.turndown(content);
  } catch (error) {
    console.warn('Failed to convert HTML to Markdown, using raw content');
    return content;
  }
}

/**
 * Get or create a notebook by name
 */
async function getOrCreateNotebook(notebookName, userId) {
  if (!notebookName) return null;
  
  const existingNotebook = await pool.query(
    'SELECT id FROM notebooks WHERE user_id = $1 AND name = $2',
    [userId, notebookName]
  );
  
  if (existingNotebook.rows.length > 0) {
    return existingNotebook.rows[0].id;
  }
  
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  const newNotebook = await pool.query(
    'INSERT INTO notebooks (user_id, name, color) VALUES ($1, $2, $3) RETURNING id',
    [userId, notebookName, randomColor]
  );
  
  return newNotebook.rows[0].id;
}

/**
 * Get or create tags
 */
async function getOrCreateTags(tagNames, userId) {
  if (!tagNames || tagNames.length === 0) return [];
  
  const tagIds = [];
  
  for (const tagName of tagNames) {
    const existingTag = await pool.query(
      'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
      [userId, tagName]
    );
    
    if (existingTag.rows.length > 0) {
      tagIds.push(existingTag.rows[0].id);
    } else {
      const newTag = await pool.query(
        'INSERT INTO tags (user_id, name) VALUES ($1, $2) RETURNING id',
        [userId, tagName]
      );
      tagIds.push(newTag.rows[0].id);
    }
  }
  
  return tagIds;
}

/**
 * Safely parse a date string, returning current date if invalid
 */
function parseDate(dateString) {
  if (!dateString) return new Date();
  
  const date = new Date(dateString);
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

/**
 * Import a single note
 */
async function importNote(note, userId, importedCount, totalNotes) {
  try {
    const title = note.title || 'Untitled Note';
    const content = cleanContent(note.content);
    const createdDate = parseDate(note.created);
    const updatedDate = parseDate(note.updated) || createdDate;
    
    const tags = note.tags || [];
    const sourceUrl = note.sourceUrl || null;
    const isWebClip = !!sourceUrl;
    
    // Get or create notebook
    const notebookName = note.notebook || 'Imported Notes';
    const notebookId = await getOrCreateNotebook(notebookName, userId);
    
    // Insert note
    const insertedNote = await pool.query(
      `INSERT INTO notes (user_id, notebook_id, title, content, is_web_clip, web_clip_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId, notebookId, title, content, isWebClip, sourceUrl, createdDate, updatedDate]
    );
    
    const noteId = insertedNote.rows[0].id;
    
    // Add tags
    if (tags.length > 0) {
      const tagIds = await getOrCreateTags(tags, userId);
      for (const tagId of tagIds) {
        await pool.query(
          'INSERT INTO note_tags (note_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [noteId, tagId]
        );
      }
    }
    
    // Progress update
    process.stdout.write(`\r✅ Imported: ${importedCount}/${totalNotes || '?'} - ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}    `);
    
    return true;
  } catch (error) {
    console.error(`\n❌ Failed to import note: ${note.title || 'Unknown'}`, error.message);
    return false;
  }
}

/**
 * Parse ENEX file using streaming SAX parser
 */
async function parseEnexFileStreaming(filePath, userId) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const parser = sax.createStream(true, { trim: true });
    
    let currentNote = null;
    let currentTag = '';
    let currentText = '';
    let notes = [];
    let elementStack = [];
    
    parser.on('opentag', (node) => {
      elementStack.push(node.name);
      
      if (node.name === 'note') {
        currentNote = {
          title: '',
          content: '',
          created: null,
          updated: null,
          tags: [],
          notebook: null,
          sourceUrl: null
        };
      }
      
      currentTag = node.name;
      currentText = '';
    });
    
    parser.on('text', (text) => {
      currentText += text;
    });
    
    parser.on('closetag', (tagName) => {
      elementStack.pop();
      
      if (currentNote) {
        if (tagName === 'title' && elementStack[elementStack.length - 1] === 'note') {
          currentNote.title = currentText.trim();
        } else if (tagName === 'content') {
          currentNote.content = currentText;
        } else if (tagName === 'created') {
          currentNote.created = currentText.trim();
        } else if (tagName === 'updated') {
          currentNote.updated = currentText.trim();
        } else if (tagName === 'tag') {
          currentNote.tags.push(currentText.trim());
        } else if (tagName === 'source-url') {
          currentNote.sourceUrl = currentText.trim();
        } else if (tagName === 'note') {
          // Note is complete, add to array
          notes.push({ ...currentNote });
          currentNote = null;
        }
      }
      
      currentText = '';
    });
    
    parser.on('end', () => {
      resolve(notes);
    });
    
    parser.on('error', (error) => {
      reject(error);
    });
    
    stream.pipe(parser);
  });
}

/**
 * Import ENEX file with streaming
 */
async function importEnexFile(filePath, userId = DEFAULT_USER_ID) {
  console.log(`\n📂 Importing file: ${path.basename(filePath)}`);
  console.log('⏳ Parsing file (this may take a moment for large files)...\n');
  
  try {
    const notes = await parseEnexFileStreaming(filePath, userId);
    const totalNotes = notes.length;
    
    console.log(`Found ${totalNotes} notes to import\n`);
    
    let importedCount = 0;
    let failedCount = 0;
    
    for (const note of notes) {
      const success = await importNote(note, userId, importedCount + 1, totalNotes);
      if (success) {
        importedCount++;
      } else {
        failedCount++;
      }
    }
    
    console.log(`\n\n✨ Import complete!`);
    console.log(`   Successfully imported: ${importedCount}`);
    if (failedCount > 0) {
      console.log(`   Failed: ${failedCount}`);
    }
    
  } catch (error) {
    console.error('❌ Error importing file:', error);
    throw error;
  }
}

/**
 * Create default user if doesn't exist
 */
async function ensureDefaultUser() {
  const result = await pool.query('SELECT id FROM users WHERE id = $1', [DEFAULT_USER_ID]);
  
  if (result.rows.length === 0) {
    console.log('Creating default user...');
    await pool.query(
      `INSERT INTO users (id, email, name, password_hash)
       VALUES ($1, 'default@noteapp.local', 'Default User', 'temp_password')`,
      [DEFAULT_USER_ID]
    );
    console.log('✅ Default user created\n');
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔄 Evernote ENEX Streaming Importer
===================================

This version handles LARGE files efficiently!

Usage: node import-streaming.js <path-to-enex-file> [another-file.enex ...]

Examples:
  node import-streaming.js ./my-notes.enex
  node import-streaming.js "C:\\Users\\steve\\Desktop\\Aquaponics.enex"
    `);
    process.exit(1);
  }
  
  try {
    console.log('🚀 Starting Evernote import...\n');
    
    await ensureDefaultUser();
    
    for (const filePath of args) {
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        continue;
      }
      
      await importEnexFile(filePath);
    }
    
    console.log('\n🎉 All imports completed!');
    
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
