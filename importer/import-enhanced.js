import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
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

// Directory to save extracted images
const IMAGES_DIR = path.join(process.cwd(), '../frontend/public/note-images');

/**
 * Ensure images directory exists
 */
function ensureImagesDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`📁 Created images directory: ${IMAGES_DIR}\n`);
  }
}

/**
 * Save image resource and return public URL
 */
function saveImageResource(resourceData, mimeType, noteId, resourceIndex) {
  try {
    // Decode base64 data
    const imageBuffer = Buffer.from(resourceData, 'base64');
    
    // Generate filename
    const extension = mimeType.split('/')[1] || 'png';
    const filename = `${noteId}-${resourceIndex}.${extension}`;
    const filePath = path.join(IMAGES_DIR, filename);
    
    // Save file
    fs.writeFileSync(filePath, imageBuffer);
    
    // Return public URL
    return `/note-images/${filename}`;
  } catch (error) {
    console.error('Failed to save image:', error.message);
    return null;
  }
}

/**
 * Convert ENML content to HTML, replacing en-media tags with img tags
 */
function convertEnmlToHtml(enmlContent, resources) {
  if (!enmlContent) return '';
  
  let html = enmlContent;
  
  // Remove ENML DOCTYPE and xml declarations
  html = html.replace(/<\?xml[^>]*\?>/g, '');
  html = html.replace(/<!DOCTYPE[^>]*>/g, '');
  html = html.replace(/<en-note[^>]*>/g, '');
  html = html.replace(/<\/en-note>/g, '');
  
  // Replace en-media tags with img tags
  html = html.replace(/<en-media([^>]*)\/>/g, (match, attributes) => {
    // Extract hash attribute
    const hashMatch = attributes.match(/hash="([^"]*)"/);
    if (!hashMatch) return match;
    
    const hash = hashMatch[1];
    
    // Find corresponding resource
    const resource = resources.find(r => r.hash === hash);
    if (!resource || !resource.url) return match;
    
    // Replace with img tag
    return `<img src="${resource.url}" alt="Image" style="max-width: 100%; height: auto;" />`;
  });
  
  // Replace en-todo tags with checkboxes
  html = html.replace(/<en-todo([^>]*)\/>/g, (match, attributes) => {
    const checked = attributes.includes('checked="true"');
    return checked ? '☑ ' : '☐ ';
  });
  
  return html;
}

/**
 * Clean and convert HTML content to Markdown
 */
function cleanContent(htmlContent) {
  if (!htmlContent) return '';
  
  try {
    return turndownService.turndown(htmlContent);
  } catch (error) {
    console.warn('Failed to convert HTML to Markdown, using HTML');
    return htmlContent;
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
 * Safely parse a date string
 */
function parseDate(dateString) {
  if (!dateString) return new Date();
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

/**
 * Import a single note with resources
 */
async function importNote(note, userId, importedCount, totalNotes) {
  try {
    const title = note.title || 'Untitled Note';
    
    // Process resources (images) first
    const processedResources = [];
    if (note.resources && note.resources.length > 0) {
      for (let i = 0; i < note.resources.length; i++) {
        const resource = note.resources[i];
        if (resource.data && resource.mimeType && resource.mimeType.startsWith('image/')) {
          const imageUrl = saveImageResource(resource.data, resource.mimeType, note.id, i);
          if (imageUrl) {
            processedResources.push({
              hash: resource.hash,
              url: imageUrl,
              mimeType: resource.mimeType
            });
          }
        }
      }
    }
    
    // Convert ENML to HTML with images
    const htmlContent = convertEnmlToHtml(note.content, processedResources);
    
    // Convert to Markdown
    const markdownContent = cleanContent(htmlContent);
    
    // Get thumbnail from first image
    const thumbnailUrl = processedResources.length > 0 ? processedResources[0].url : null;
    
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
      `INSERT INTO notes (user_id, notebook_id, title, content, thumbnail_url, is_web_clip, web_clip_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [userId, notebookId, title, markdownContent, thumbnailUrl, isWebClip, sourceUrl, createdDate, updatedDate]
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
    const hasImages = processedResources.length > 0 ? `📸 ${processedResources.length}` : '';
    process.stdout.write(`\r✅ ${importedCount}/${totalNotes} - ${title.substring(0, 40)}... ${hasImages}    `);
    
    return true;
  } catch (error) {
    console.error(`\n❌ Failed to import: ${note.title || 'Unknown'}`, error.message);
    return false;
  }
}

/**
 * Parse ENEX file with full resource support
 */
async function parseEnexFile(filePath, userId) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const parser = sax.createStream(true, { trim: false });
    
    let currentNote = null;
    let currentResource = null;
    let currentTag = '';
    let currentText = '';
    let notes = [];
    let elementStack = [];
    let inContent = false;
    let contentBuffer = '';
    
    parser.on('opentag', (node) => {
      elementStack.push(node.name);
      
      if (node.name === 'note') {
        currentNote = {
          id: crypto.randomUUID(),
          title: '',
          content: '',
          created: null,
          updated: null,
          tags: [],
          notebook: null,
          sourceUrl: null,
          resources: []
        };
      } else if (node.name === 'resource' && currentNote) {
        currentResource = {
          data: '',
          mimeType: '',
          hash: '',
          width: null,
          height: null
        };
      } else if (node.name === 'content' && currentNote) {
        inContent = true;
        contentBuffer = '';
      }
      
      currentTag = node.name;
      currentText = '';
    });
    
    parser.on('text', (text) => {
      if (inContent) {
        contentBuffer += text;
      } else {
        currentText += text;
      }
    });
    
    parser.on('closetag', (tagName) => {
      elementStack.pop();
      
      if (currentNote) {
        if (tagName === 'title' && elementStack[elementStack.length - 1] === 'note') {
          currentNote.title = currentText.trim();
        } else if (tagName === 'content') {
          currentNote.content = contentBuffer;
          inContent = false;
          contentBuffer = '';
        } else if (tagName === 'created') {
          currentNote.created = currentText.trim();
        } else if (tagName === 'updated') {
          currentNote.updated = currentText.trim();
        } else if (tagName === 'tag') {
          currentNote.tags.push(currentText.trim());
        } else if (tagName === 'source-url') {
          currentNote.sourceUrl = currentText.trim();
        } else if (tagName === 'data' && currentResource) {
          currentResource.data = currentText.trim();
        } else if (tagName === 'mime' && currentResource) {
          currentResource.mimeType = currentText.trim();
        } else if (tagName === 'width' && currentResource) {
          currentResource.width = parseInt(currentText.trim());
        } else if (tagName === 'height' && currentResource) {
          currentResource.height = parseInt(currentText.trim());
        } else if (tagName === 'resource') {
          // Calculate hash for matching with en-media tags
          if (currentResource.data) {
            const hash = crypto.createHash('md5')
              .update(Buffer.from(currentResource.data, 'base64'))
              .digest('hex');
            currentResource.hash = hash;
          }
          currentNote.resources.push(currentResource);
          currentResource = null;
        } else if (tagName === 'note') {
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
 * Import ENEX file
 */
async function importEnexFile(filePath, userId = DEFAULT_USER_ID) {
  console.log(`\n📂 Importing file: ${path.basename(filePath)}`);
  console.log('⏳ Parsing file with full content and images...\n');
  
  try {
    ensureImagesDir();
    
    const notes = await parseEnexFile(filePath, userId);
    const totalNotes = notes.length;
    
    console.log(`Found ${totalNotes} notes to import\n`);
    
    let importedCount = 0;
    let failedCount = 0;
    let totalImages = 0;
    
    for (const note of notes) {
      const success = await importNote(note, userId, importedCount + 1, totalNotes);
      if (success) {
        importedCount++;
        totalImages += note.resources?.filter(r => r.mimeType?.startsWith('image/')).length || 0;
      } else {
        failedCount++;
      }
    }
    
    console.log(`\n\n✨ Import complete!`);
    console.log(`   Successfully imported: ${importedCount} notes`);
    console.log(`   Extracted images: ${totalImages}`);
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
 * Clear existing notes before reimport
 */
async function clearExistingNotes() {
  console.log('🗑️  Clearing existing notes...');
  await pool.query('DELETE FROM note_tags');
  await pool.query('DELETE FROM notes');
  console.log('✅ Existing notes cleared\n');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔄 Enhanced Evernote ENEX Importer
===================================

Extracts full content, images, and metadata!

Usage: node import-enhanced.js <path-to-enex-file> [--clear]

Options:
  --clear    Clear existing notes before import

Examples:
  node import-enhanced.js ./my-notes.enex
  node import-enhanced.js "C:\\Users\\steve\\Desktop\\Aquaponics.enex" --clear
    `);
    process.exit(1);
  }
  
  try {
    console.log('🚀 Starting enhanced Evernote import...\n');
    
    await ensureDefaultUser();
    
    // Check if --clear flag is present
    const clearFlag = args.includes('--clear');
    if (clearFlag) {
      await clearExistingNotes();
      // Remove --clear from args
      args.splice(args.indexOf('--clear'), 1);
    }
    
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
