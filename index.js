const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it')();
const puppeteer = require('puppeteer');

/**
 * Converts a markdown file to a PDF file.
 * Requires: npm install markdown-it puppeteer
 */
async function convertMarkdownToPdf(inputFile, outputFile) {
  try {
    if (!fs.existsSync(inputFile)) {
      console.error(`Error: Input file '${inputFile}' not found.`);
      process.exit(1);
    }

    const markdownContent = fs.readFileSync(path.resolve(inputFile), 'utf-8');
    const htmlContent = markdownIt.render(markdownContent);
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 2rem; }
            code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 4px; }
            pre { background: #f4f4f4; padding: 1rem; overflow: auto; }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputFile,
      format: 'A4',
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
    });

    await browser.close();
    console.log(`Success: Generated ${outputFile}`);
  } catch (err) {
    console.error('Conversion failed:', err.message);
    process.exit(1);
  }
}

const [,, input, output] = process.argv;

if (!input || !output) {
  console.log('Usage: node index.js <input.md> <output.pdf>');
} else {
  convertMarkdownToPdf(input, output);
}