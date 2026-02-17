/**
 * Markdown Template Converter
 * Converts markdown templates to JSON format compatible with the system
 * 
 * Run with: node convertMarkdownTemplates.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const BLOCKS_DIR = path.join(__dirname, 'blocks');

/**
 * Extract variables from markdown content
 */
function extractVariables(content) {
  const variableRegex = /\{([^}]+)\}/g;
  const variables = new Set();
  let match;
  
  while ((match = variableRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }
  
  return Array.from(variables);
}

/**
 * Extract title from markdown
 */
function extractTitle(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : 'Untitled Template';
}

/**
 * Determine category from filename or content
 */
function determineCategory(filename, content) {
  const lowerFilename = filename.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  if (lowerFilename.includes('program') || lowerFilename.includes('skills') || 
      lowerFilename.includes('training') || lowerFilename.includes('participation')) {
    return 'Program Participants';
  }
  if (lowerFilename.includes('lease') || lowerFilename.includes('room') || 
      lowerFilename.includes('tenant') || lowerFilename.includes('occupancy')) {
    return 'Shared Residential Lease';
  }
  if (lowerFilename.includes('trial') || lowerContent.includes('clinical trial')) {
    return 'Trial Participants';
  }
  if (lowerFilename.includes('employment') || lowerFilename.includes('contract')) {
    return 'Employment';
  }
  return 'Other';
}

/**
 * Convert filename to template ID
 */
function filenameToId(filename) {
  // Remove .md extension
  let id = filename.replace(/\.md$/, '');
  
  // Convert to uppercase and replace spaces/hyphens with underscores
  id = id.toUpperCase().replace(/[\s-]/g, '_');
  
  // Truncate to 20 characters for database compatibility
  if (id.length > 20) {
    id = id.substring(0, 20);
  }
  
  return id;
}

/**
 * Convert markdown template to JSON template format
 */
function convertMarkdownToJson(filename, content) {
  const id = filenameToId(filename);
  const title = extractTitle(content);
  const category = determineCategory(filename, content);
  const variables = extractVariables(content);
  
  // Create defaults object
  const defaults = {};
  variables.forEach(variable => {
    defaults[variable] = '';
  });
  
  // Create template JSON
  const template = {
    id,
    title,
    category,
    uses: [`block.${id}`],
    defaults
  };
  
  // Create block JSON
  const block = {
    id: `block.${id}`,
    content: content
  };
  
  return { template, block };
}

/**
 * Main conversion function
 */
async function convertAllMarkdownTemplates() {
  console.log('🚀 Starting markdown template conversion...\n');
  
  // Get all .md files
  const files = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith('.md'));
  
  console.log(`Found ${files.length} markdown template files\n`);
  
  const allTemplates = [];
  const allBlocks = [];
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, file), 'utf8');
    const { template, block } = convertMarkdownToJson(file, content);
    
    allTemplates.push(template);
    allBlocks.push(block);
    
    console.log(`✓ Converted: ${file}`);
    console.log(`  ID: ${template.id}`);
    console.log(`  Title: ${template.title}`);
    console.log(`  Category: ${template.category}`);
    console.log(`  Variables: ${Object.keys(template.defaults).length}`);
    console.log('');
  }
  
  // Write combined JSON files
  const templatesOutputPath = path.join(TEMPLATES_DIR, 'markdown_templates.json');
  const blocksOutputPath = path.join(BLOCKS_DIR, 'markdown_blocks.json');
  
  fs.writeFileSync(templatesOutputPath, JSON.stringify(allTemplates, null, 2));
  fs.writeFileSync(blocksOutputPath, JSON.stringify(allBlocks, null, 2));
  
  console.log('✅ Conversion complete!');
  console.log(`📄 Templates written to: ${templatesOutputPath}`);
  console.log(`📦 Blocks written to: ${blocksOutputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   ${allTemplates.length} templates converted`);
  console.log(`   ${allBlocks.length} blocks created`);
  
  // Show category breakdown
  const categories = {};
  allTemplates.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + 1;
  });
  
  console.log(`\n📚 Templates by category:`);
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });
}

// Run the conversion
convertAllMarkdownTemplates().catch(console.error);
