const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function cropImages() {
  const catalogs = ['plato_v2', 'dinewell_v2'];
  
  for (const catalog of catalogs) {
    const catalogDir = path.join(__dirname, 'images', 'catalog', catalog);
    
    if (!fs.existsSync(catalogDir)) {
      console.log(`Directory not found: ${catalogDir}`);
      continue;
    }
    
    const files = fs.readdirSync(catalogDir).filter(f => f.endsWith('.jpg'));
    console.log(`\nProcessing ${files.length} images from ${catalog}...`);
    
    for (const file of files) {
      try {
        const inputPath = path.join(catalogDir, file);
        
        // Get image metadata to calculate crop dimensions
        const metadata = await sharp(inputPath).metadata();
        const { width, height } = metadata;
        
        // Crop to approximately top 65% of image (removes bottom metadata text)
        const cropHeight = Math.round(height * 0.65);
        
        // Process and save using temporary file
        const tempPath = inputPath + '.temp.jpg';
        await sharp(inputPath)
          .extract({
            left: 0,
            top: 0,
            width: width,
            height: cropHeight
          })
          .toFile(tempPath);
        
        // Replace original with cropped version
        fs.unlinkSync(inputPath);
        fs.renameSync(tempPath, inputPath);
        
        console.log(`✓ ${file} (${width}x${height} → ${width}x${cropHeight})`);
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
      }
    }
  }
  
  console.log('\n✅ All images cropped successfully!');
  console.log('Refresh products page (Ctrl+F5) to see changes');
}

cropImages().catch(err => console.error('Error:', err));
