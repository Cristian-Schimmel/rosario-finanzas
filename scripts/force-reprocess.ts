/**
 * Force Reprocess Script
 * Clears the news store and reprocesses all articles fresh
 */

import 'dotenv/config';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  console.log('================================================');
  console.log('🗑️  Clearing news store + reprocessing...');
  console.log('================================================');
  console.log(`Started at: ${new Date().toLocaleString('es-AR')}`);
  console.log('');

  const { forceReprocess, getProcessingStatus } = await import('../src/lib/services/news-processor');

  const statusBefore = await getProcessingStatus();
  console.log(`📊 Before: ${statusBefore.storeInfo.articleCount} articles in store`);
  console.log(`   AI Available: ${statusBefore.isAIAvailable ? '✅' : '❌'}`);
  console.log('');

  console.log('🔄 Force reprocessing (clear + process)...');
  const result = await forceReprocess();

  console.log('');
  console.log('================================================');
  console.log('📋 Results:');
  console.log('================================================');
  console.log(`   Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
  console.log(`   Processed: ${result.processedCount} articles`);
  console.log(`   Errors: ${result.errorCount}`);
  console.log(`   Duration: ${(result.duration / 1000).toFixed(1)}s`);

  if (result.errors.length > 0) {
    console.log('');
    console.log('⚠️ Errors:');
    result.errors.slice(0, 10).forEach(err => console.log(`   - ${err}`));
  }

  const statusAfter = await getProcessingStatus();
  console.log('');
  console.log(`📊 After: ${statusAfter.storeInfo.articleCount} articles in store`);
  console.log(`   Last updated: ${statusAfter.storeInfo.lastUpdated}`);
  console.log('');
  console.log('✅ Done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
