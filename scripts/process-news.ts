/**
 * News Processing Script
 * Run this to process all news and save to JSON store
 * 
 * Usage: npx tsx scripts/process-news.ts
 * Or via npm: npm run process-news
 */

import 'dotenv/config';

// Set environment variable to avoid SSL issues in development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  console.log('================================================');
  console.log('📰 Rosario Finanzas - News Processor');
  console.log('================================================');
  console.log(`Started at: ${new Date().toLocaleString('es-AR')}`);
  console.log('');

  // Dynamic import to ensure env vars are loaded
  const { processAllNews, getProcessingStatus } = await import('../src/lib/services/news-processor');

  // Check status before processing
  const statusBefore = await getProcessingStatus();
  console.log('📊 Status before processing:');
  console.log(`   - AI Available: ${statusBefore.isAIAvailable ? '✅ Yes' : '❌ No'}`);
  console.log(`   - Articles in store: ${statusBefore.storeInfo.articleCount}`);
  console.log(`   - Last updated: ${statusBefore.storeInfo.lastUpdated}`);
  console.log('');

  if (!statusBefore.isAIAvailable) {
    console.error('❌ Google AI API key not configured!');
    console.error('   Set GOOGLE_AI_API_KEY in .env file');
    process.exit(1);
  }

  // Process news
  console.log('🔄 Processing news...');
  console.log('   This may take a few minutes...');
  console.log('');
  
  const result = await processAllNews();

  // Show results
  console.log('');
  console.log('================================================');
  console.log('📋 Processing Results:');
  console.log('================================================');
  console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Processed: ${result.processedCount} articles`);
  console.log(`   Errors: ${result.errorCount}`);
  console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);
  
  if (result.errors.length > 0) {
    console.log('');
    console.log('⚠️ Errors encountered:');
    result.errors.slice(0, 5).forEach(err => console.log(`   - ${err}`));
    if (result.errors.length > 5) {
      console.log(`   ... and ${result.errors.length - 5} more`);
    }
  }

  // Check status after processing
  const statusAfter = await getProcessingStatus();
  console.log('');
  console.log('📊 Status after processing:');
  console.log(`   - Articles in store: ${statusAfter.storeInfo.articleCount}`);
  console.log(`   - Last updated: ${statusAfter.storeInfo.lastUpdated}`);
  console.log('');
  console.log('================================================');
  console.log('✅ Done!');
  console.log('================================================');
}

main().catch(console.error);
