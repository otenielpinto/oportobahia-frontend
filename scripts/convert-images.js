#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '..', 'public', 'images', 'landing');
const files = [
  { input: 'hero-primary.png', output: 'hero-primary.webp', quality: 85 },
  { input: 'feature-dashboards.png', output: 'feature-dashboards.webp', quality: 80 },
  { input: 'feature-reports.png', output: 'feature-reports.webp', quality: 80 },
  { input: 'feature-erp.png', output: 'feature-erp.webp', quality: 80 },
  { input: 'feature-royalties.png', output: 'feature-royalties.webp', quality: 80 },
  { input: 'feature-catalog.png', output: 'feature-catalog.webp', quality: 80 },
  { input: 'cta-supporting.png', output: 'cta-supporting.webp', quality: 80 },
];

async function convertImages() {
  console.log('🚀 Converting PNG to WebP...\n');
  
  for (const file of files) {
    const inputPath = path.join(imagesDir, file.input);
    const outputPath = path.join(imagesDir, file.output);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`⚠️  Skipping ${file.input} - file not found`);
      continue;
    }
    
    try {
      await sharp(inputPath)
        .webp({ quality: file.quality })
        .toFile(outputPath);
      
      const stats = fs.statSync(outputPath);
      const originalStats = fs.statSync(inputPath);
      const savings = ((1 - stats.size / originalStats.size) * 100).toFixed(1);
      
      console.log(`✅ ${file.input} → ${file.output}`);
      console.log(`   Original: ${(originalStats.size / 1024).toFixed(1)} KB`);
      console.log(`   WebP: ${(stats.size / 1024).toFixed(1)} KB (${savings}% smaller)\n`);
    } catch (error) {
      console.error(`❌ Error converting ${file.input}: ${error.message}\n`);
    }
  }
  
  console.log('✨ Conversion complete!');
}

convertImages();
