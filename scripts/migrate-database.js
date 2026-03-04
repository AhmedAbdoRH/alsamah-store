import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// قراءة متغيرات البيئة من ملف .env.migration
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ لم يتم العثور على ملف ${filePath}`);
    console.error('يرجى إنشاء ملف .env.migration بالمتغيرات المطلوبة');
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      env[key.trim()] = value;
    }
  });

  return env;
}

const envPath = path.join(__dirname, '..', '.env.migration');
const env = loadEnv(envPath);

const config = {
  sourceUrl: env.SOURCE_SUPABASE_URL,
  sourceKey: env.SOURCE_SUPABASE_KEY,
  targetUrl: env.TARGET_SUPABASE_URL,
  targetKey: env.TARGET_SUPABASE_KEY,
};

// التحقق من المتغيرات
if (!config.sourceUrl || !config.sourceKey || !config.targetUrl || !config.targetKey) {
  console.error('❌ متغيرات بيئية ناقصة في .env.migration');
  console.error('المتغيرات المطلوبة:');
  console.error('  - SOURCE_SUPABASE_URL');
  console.error('  - SOURCE_SUPABASE_KEY');
  console.error('  - TARGET_SUPABASE_URL');
  console.error('  - TARGET_SUPABASE_KEY');
  process.exit(1);
}

const sourceClient = createClient(config.sourceUrl, config.sourceKey);
const targetClient = createClient(config.targetUrl, config.targetKey);

async function migrateData() {
  try {
    console.log('🚀 بدء نقل البيانات...\n');

    const tables = [
      'categories',
      'subcategories',
      'services',
      'product_images',
      'product_sizes',
      'banners',
      'store_settings',
      'testimonials',
    ];

    const allData = {};

    // استخراج البيانات
    console.log('📥 استخراج البيانات من قاعدة البيانات المصدر...\n');

    for (const table of tables) {
      try {
        const { data, error } = await sourceClient.from(table).select('*');

        if (error) {
          console.warn(`⚠️  تحذير: لم يتمكن من استخراج بيانات ${table}: ${error.message}`);
          allData[table] = [];
        } else {
          allData[table] = data || [];
          console.log(`✅ تم استخراج ${allData[table].length} سجل من جدول ${table}`);
        }
      } catch (err) {
        console.warn(`⚠️  خطأ في جدول ${table}:`, err.message);
        allData[table] = [];
      }
    }

    console.log('\n📤 إدراج البيانات في قاعدة البيانات الهدف...\n');

    // إدراج البيانات
    for (const table of tables) {
      if (allData[table].length === 0) {
        console.log(`⏭️  تخطي جدول ${table} (لا توجد بيانات)`);
        continue;
      }

      try {
        // حذف البيانات الموجودة
        await targetClient.from(table).delete().neq('id', '');

        // إدراج البيانات الجديدة
        const { error } = await targetClient.from(table).insert(allData[table]);

        if (error) {
          console.error(`❌ خطأ في إدراج بيانات ${table}: ${error.message}`);
        } else {
          console.log(`✅ تم إدراج ${allData[table].length} سجل في جدول ${table}`);
        }
      } catch (err) {
        console.error(`❌ خطأ في جدول ${table}:`, err.message);
      }
    }

    console.log('\n✨ اكتمل نقل البيانات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في عملية النقل:', error.message);
    process.exit(1);
  }
}

migrateData();
