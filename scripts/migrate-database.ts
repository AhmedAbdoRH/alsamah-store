import { createClient } from '@supabase/supabase-js';

/**
 * Database Migration Script
 * ينقل جميع البيانات من قاعدة بيانات Supabase إلى أخرى
 */

interface MigrationConfig {
  sourceUrl: string;
  sourceKey: string;
  targetUrl: string;
  targetKey: string;
}

const config: MigrationConfig = {
  sourceUrl: process.env.SOURCE_SUPABASE_URL || '',
  sourceKey: process.env.SOURCE_SUPABASE_KEY || '',
  targetUrl: process.env.TARGET_SUPABASE_URL || '',
  targetKey: process.env.TARGET_SUPABASE_KEY || '',
};

// Validate configuration
if (!config.sourceUrl || !config.sourceKey || !config.targetUrl || !config.targetKey) {
  console.error('❌ Missing environment variables. Please set:');
  console.error('   - SOURCE_SUPABASE_URL');
  console.error('   - SOURCE_SUPABASE_KEY');
  console.error('   - TARGET_SUPABASE_URL');
  console.error('   - TARGET_SUPABASE_KEY');
  process.exit(1);
}

const sourceClient = createClient(config.sourceUrl, config.sourceKey);
const targetClient = createClient(config.targetUrl, config.targetKey);

interface TableData {
  [key: string]: any[];
}

async function migrateData() {
  try {
    console.log('🚀 بدء نقل البيانات...\n');

    // الجداول المراد نقلها بالترتيب (مع احترام العلاقات)
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

    const allData: TableData = {};

    // 1. استخراج البيانات من قاعدة البيانات المصدر
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
        console.warn(`⚠️  خطأ في جدول ${table}:`, err);
        allData[table] = [];
      }
    }

    console.log('\n📤 إدراج البيانات في قاعدة البيانات الهدف...\n');

    // 2. إدراج البيانات في قاعدة البيانات الهدف
    for (const table of tables) {
      if (allData[table].length === 0) {
        console.log(`⏭️  تخطي جدول ${table} (لا توجد بيانات)`);
        continue;
      }

      try {
        // حذف البيانات الموجودة أولاً (اختياري)
        await targetClient.from(table).delete().neq('id', '');

        // إدراج البيانات الجديدة
        const { error } = await targetClient.from(table).insert(allData[table]);

        if (error) {
          console.error(`❌ خطأ في إدراج بيانات ${table}: ${error.message}`);
        } else {
          console.log(`✅ تم إدراج ${allData[table].length} سجل في جدول ${table}`);
        }
      } catch (err) {
        console.error(`❌ خطأ في جدول ${table}:`, err);
      }
    }

    console.log('\n✨ اكتمل نقل البيانات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في عملية النقل:', error);
    process.exit(1);
  }
}

// تشغيل الهجرة
migrateData();
