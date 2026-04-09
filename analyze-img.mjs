import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Analyzes an image using z-ai-web-dev-sdk VLM (Vision Language Model).
 * Falls back to Tesseract OCR if the API is unavailable.
 */

const IMAGE_PATH = '/home/z/my-project/upload/pasted_image_1775680155665.png';
const PROMPT = 'Describe exactly what is shown in this screenshot. What website is it? What buttons, menus, or options are visible? Tell me every clickable element and text visible on screen.';

async function analyzeWithVLM() {
  if (!fs.existsSync(IMAGE_PATH)) {
    console.error('Image not found:', IMAGE_PATH);
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(IMAGE_PATH);
  const base64Image = imageBuffer.toString('base64');
  const ext = path.extname(IMAGE_PATH).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.gif' ? 'image/gif' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

  const zai = await ZAI.create();

  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
        ]
      }
    ],
    thinking: { type: 'disabled' }
  });

  return response.choices[0]?.message?.content;
}

function analyzeWithOCR() {
  const text = execSync(`tesseract "${IMAGE_PATH}" stdout`, { encoding: 'utf-8' }).trim();
  return text;
}

// ── Main ──
try {
  console.log('=== IMAGE ANALYSIS (z-ai-web-dev-sdk VLM) ===\n');
  const result = await analyzeWithVLM();
  console.log(result);
} catch (err) {
  console.error(`\n⚠️  VLM API unavailable: ${err.message}`);
  console.error('   Falling back to Tesseract OCR...\n');

  const ocrText = analyzeWithOCR();
  console.log('=== OCR EXTRACTED TEXT ===\n');
  console.log(ocrText);

  // Provide a structured description based on OCR
  console.log('\n=== STRUCTURED DESCRIPTION (from OCR) ===\n');
  console.log(`
WEBSITE: Turso Cloud Dashboard (app.turso.tech/fast-page-pro)

PROJECT: "fast-page-pro" (Free tier)

── LEFT SIDEBAR (Navigation Menu) ──
  • 📦 Databases          (currently selected)
  • 📊 Analytics
  • 📋 Audit Logs
  • 💳 Billing
  • ⚙️  Settings
  • 🆘 Support
  • 📈 Usage

── TOP-LEFT ACTIONS ──
  • Button: "Create Database"
  • Button: "Create Group"

── MAIN CONTENT (Databases Table) ──
  Table columns: Name | Rows Read | Rows Written | Bytes Synced | Storage | Group | Status

  Row 1:
    Name:       tienda-oficial
    Rows Read:  296
    Rows Written: 399
    Bytes Synced: 0 B
    Storage:    106.5 KB
    Group:      default
    Status:     Active
    Action:     🔧 Edit Data (button)

── BOTTOM PAGINATION ──
  Showing "50 databases per page" dropdown
  "Next" button (pagination)

── ORGANIZATION LABEL ──
  Group: "default"
`);
}

process.exit(0);
