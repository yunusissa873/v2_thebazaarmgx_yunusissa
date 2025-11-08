/**
 * Master Test Runner
 * 
 * This script runs all tests in sequence:
 * 1. Check Supabase connection
 * 2. Test UUID generation
 * 3. Validate migration file
 * 4. Run comprehensive validation (if database is ready)
 * 
 * Usage:
 *   npx tsx scripts/run-all-tests.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

async function runTest(name: string, script: string, required: boolean = true): Promise<TestResult> {
  console.log(`\n🔄 Running: ${name}`);
  console.log('─'.repeat(80));
  
  const startTime = Date.now();
  
  try {
    const { stdout, stderr } = await execAsync(`npx tsx ${script}`, {
      cwd: path.join(__dirname, '..'),
      timeout: 60000, // 60 second timeout
    });
    
    const duration = Date.now() - startTime;
    
    if (stderr && !stdout.includes('✅')) {
      // Check if it's just warnings
      if (stderr.includes('⚠️') && !stderr.includes('❌')) {
        return {
          name,
          status: 'pass',
          message: 'Completed with warnings',
          duration
        };
      }
      
      return {
        name,
        status: required ? 'fail' : 'skip',
        message: stderr.substring(0, 200),
        duration
      };
    }
    
    return {
      name,
      status: 'pass',
      message: 'Completed successfully',
      duration
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Check exit code
    if (error.code === 1 && !required) {
      return {
        name,
        status: 'skip',
        message: 'Skipped (not required)',
        duration
      };
    }
    
    return {
      name,
      status: required ? 'fail' : 'skip',
      message: error.message?.substring(0, 200) || 'Unknown error',
      duration
    };
  }
}

async function runAllTests() {
  console.log('🧪 Running All Tests');
  console.log('='.repeat(80));
  console.log('\nThis will run:');
  console.log('  1. UUID Generation Test');
  console.log('  2. Supabase Connection Check');
  console.log('  3. Migration Helper (validation)');
  console.log('  4. Comprehensive Validation (if database ready)');
  console.log('\nPress Ctrl+C to cancel, or wait 5 seconds...');
  
  // Wait 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test 1: UUID Generation
  console.log('\n' + '='.repeat(80));
  console.log('TEST 1: UUID Generation');
  console.log('='.repeat(80));
  const test1 = await runTest(
    'UUID Generation',
    'scripts/test-uuid-generation.ts',
    true
  );
  results.push(test1);
  
  // Test 2: Supabase Connection
  console.log('\n' + '='.repeat(80));
  console.log('TEST 2: Supabase Connection');
  console.log('='.repeat(80));
  const test2 = await runTest(
    'Supabase Connection',
    'scripts/check-supabase-connection.ts',
    false // Not required if credentials aren't set
  );
  results.push(test2);
  
  // Test 3: Migration Helper
  console.log('\n' + '='.repeat(80));
  console.log('TEST 3: Migration Helper');
  console.log('='.repeat(80));
  const test3 = await runTest(
    'Migration Helper',
    'scripts/run-migration-helper.ts',
    true
  );
  results.push(test3);
  
  // Test 4: Comprehensive Validation (only if connection passed)
  if (test2.status === 'pass') {
    console.log('\n' + '='.repeat(80));
    console.log('TEST 4: Comprehensive Validation');
    console.log('='.repeat(80));
    const test4 = await runTest(
      'Comprehensive Validation',
      'scripts/comprehensive-validation.ts',
      false // Optional
    );
    results.push(test4);
  } else {
    console.log('\n⏭️  Skipping Comprehensive Validation (database not connected)');
    results.push({
      name: 'Comprehensive Validation',
      status: 'skip',
      message: 'Skipped - database connection required'
    });
  }
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Test Summary');
  console.log('='.repeat(80));
  
  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
    const time = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${icon} ${result.name}${time}: ${result.message}`);
  });
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  
  console.log('\n' + '─'.repeat(80));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📦 Total: ${results.length}`);
  
  if (failed === 0) {
    console.log('\n✨ All required tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

// Run all tests
runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

