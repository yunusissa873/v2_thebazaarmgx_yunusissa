/**
 * Test UUID Generation from Custom IDs
 * 
 * This script tests the UUID generation function to ensure
 * it produces consistent, valid UUIDs from custom string IDs.
 * 
 * Usage:
 *   npx tsx scripts/test-uuid-generation.ts
 */

import { createHash } from 'crypto';

/**
 * Convert custom hex string ID to UUID format (deterministic)
 * Same function as in seed-categories.ts
 */
function generateUUIDFromString(input: string): string {
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace
  const hash = createHash('md5').update(namespace + input).digest('hex');
  
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '5' + hash.substring(13, 16), // Version 5
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20), // Variant
    hash.substring(20, 32)
  ].join('-');
}

/**
 * Validate UUID format
 */
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Test cases from the actual category data
const testCases = [
  { id: '51df0b3228', name: 'Fashion & Apparel' },
  { id: 'a82763ef71', name: "Women's Fashion" },
  { id: '8d44d65527', name: 'Clothing' },
  { id: '79f4d7b369', name: 'Dresses' },
  { id: 'eb2ecf0c9d', name: 'Tops & Blouses' },
];

console.log('🧪 Testing UUID Generation\n');
console.log('='.repeat(80));

let passedTests = 0;
let failedTests = 0;

// Test 1: UUID Format Validation
console.log('\n📋 Test 1: UUID Format Validation');
testCases.forEach((testCase) => {
  const uuid = generateUUIDFromString(testCase.id);
  const isValid = isValidUUID(uuid);
  
  if (isValid) {
    console.log(`   ✅ "${testCase.name}" (${testCase.id}) → ${uuid}`);
    passedTests++;
  } else {
    console.log(`   ❌ "${testCase.name}" (${testCase.id}) → ${uuid} (INVALID FORMAT)`);
    failedTests++;
  }
});

// Test 2: Deterministic Generation (same input = same output)
console.log('\n📋 Test 2: Deterministic Generation');
testCases.forEach((testCase) => {
  const uuid1 = generateUUIDFromString(testCase.id);
  const uuid2 = generateUUIDFromString(testCase.id);
  const uuid3 = generateUUIDFromString(testCase.id);
  
  if (uuid1 === uuid2 && uuid2 === uuid3) {
    console.log(`   ✅ "${testCase.name}": Consistent (${uuid1})`);
    passedTests++;
  } else {
    console.log(`   ❌ "${testCase.name}": Inconsistent results`);
    console.log(`      Run 1: ${uuid1}`);
    console.log(`      Run 2: ${uuid2}`);
    console.log(`      Run 3: ${uuid3}`);
    failedTests++;
  }
});

// Test 3: Different IDs produce different UUIDs
console.log('\n📋 Test 3: Unique UUIDs for Different IDs');
const uuids = testCases.map(tc => generateUUIDFromString(tc.id));
const uniqueUUIDs = new Set(uuids);

if (uuids.length === uniqueUUIDs.size) {
  console.log(`   ✅ All ${uuids.length} test IDs produced unique UUIDs`);
  passedTests++;
} else {
  console.log(`   ❌ Found duplicate UUIDs!`);
  console.log(`      Expected ${uuids.length} unique, got ${uniqueUUIDs.size}`);
  failedTests++;
}

// Test 4: UUID Version and Variant
console.log('\n📋 Test 4: UUID Version 5 and Variant Check');
testCases.forEach((testCase) => {
  const uuid = generateUUIDFromString(testCase.id);
  const parts = uuid.split('-');
  const version = parts[2].charAt(0);
  const variant = parts[3].charAt(0);
  
  const versionOk = version === '5';
  const variantOk = ['8', '9', 'a', 'b'].includes(variant.toLowerCase());
  
  if (versionOk && variantOk) {
    console.log(`   ✅ "${testCase.name}": Version 5, Variant ${variant.toUpperCase()}`);
    passedTests++;
  } else {
    console.log(`   ❌ "${testCase.name}": Version ${version}, Variant ${variant}`);
    failedTests++;
  }
});

// Summary
console.log('\n' + '='.repeat(80));
console.log('📊 Test Summary');
console.log('='.repeat(80));
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📦 Total: ${passedTests + failedTests}`);

if (failedTests === 0) {
  console.log('\n✨ All tests passed! UUID generation is working correctly.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the issues above.');
  process.exit(1);
}

