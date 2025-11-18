import fs from 'fs';
import path from 'path';
import { parseString } from 'xml2js';
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

// Default user ID (you'll need to create a user first or modify this)
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Parse ENEX file and return parsed XML object
 */
async function parseEnexFile(filePath) {
  return new Promise((resolve, reject) => {
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    parseString(xmlData, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

/**
 * Clean and convert HTML content to Markdown
 */
function cleanContent(content) {
  if (!content) return '';
  
  // Evernote wraps content in CDATA
  let cleanedContent = content;
  if (typeof content === 'string') {
    cleanedContent = content;
  } else if (Array.isArray(content)) {
    cleanedContent = content.join('');
  }
  
  // Convert HTML to Markdown
  try {
    return turndownService.turndown(cleanedContent);
  } catch (error) {
    console.warn('Failed to convert HTML to Markdown, using raw content');
    return cleanedContent;
  }
}

/**
 * Get or create a notebook by name
 */
async function getOrCreateNotebook(notebookName, userId) {
  if (!notebookName) return null;
  
  // Check if notebook exists
  const existingNotebook = await pool.query(
    'SELECT id FROM notebooks WHERE user_id = $1 AND name = $2',
    [userId, notebookName]
  );
  
  if (existingNotebook.rows.length > 0) {
    return existingNotebook.rows[0].id;
  }
  
  // Create new notebook
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
    // Check if tag exists
    const existingTag = await pool.query(
      'SELECT id FROM tags WHERE user_id = $1 AND name = $2',
      [userId, tagName]
    );
    
    if (existingTag.rows.length > 0) {
      tagIds.push(existingTag.rows[0].id);
    } else {
      // Create new tag
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
 * Import a single note
 */
async function importNote(note, userId, notebookId) {
  const title = note.title?.[0] || 'Untitled Note';
  const content = cleanContent(note.content?.[0]);
  const createdDate = note.created?.[0] ? new Date(note.created[0]) : new Date();
  const updatedDate = note.updated?.[0] ? new Date(note.updated[0]) : createdDate;
  
  // Extract tags
  const tags = note.tag || [];
  
  // Extract web clip URL if exists
  const sourceUrl = note['note-attributes']?.[0]?.['source-url']?.[0] || null;
  const isWebClip = !!sourceUrl;
  
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
  
  return noteId;
}

/**
 * Import ENEX file
 */
async function importEnexFile(filePath, userId = DEFAULT_USER_ID) {
  console.log(`\n📂 Importing file: ${path.basename(filePath)}`);
  
  try {
    const parsed = await parseEnexFile(filePath);
    const notes = parsed['en-export']?.note || [];
    
    console.log(`Found ${notes.length} notes to import`);
    
    let importedCount = 0;
    let failedCount = 0;
    
    for (const note of notes) {
      try {
        // Extract notebook name from note attributes or use file name
        const notebookName = note['note-attributes']?.[0]?.['notebook']?.[0] 
          || path.basename(filePath, '.enex');
        
        const notebookId = await getOrCreateNotebook(notebookName, userId);
        await importNote(note, userId, notebookId);
        
        importedCount++;
        process.stdout.write(`\r✅ Imported: ${importedCount}/${notes.length}`);
      } catch (error) {
        failedCount++;
        console.error(`\n❌ Failed to import note: ${note.title?.[0] || 'Unknown'}`, error.message);
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
    console.log('✅ Default user created');
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔄 Evernote ENEX Importer
========================

Usage: node import.js <path-to-enex-file> [another-file.enex ...]

Examples:
  node import.js ./my-notes.enex
  node import.js ./notes1.enex ./notes2.enex ./notes3.enex
  node import.js ./exports/*.enex

You can export multiple files from Evernote and import them all at once!
    `);
    process.exit(1);
  }
  
  try {
    console.log('🚀 Starting Evernote import...\n');
    
    // Ensure default user exists
    await ensureDefaultUser();
    
    // Import each file
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
