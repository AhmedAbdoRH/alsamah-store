import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║         أداة نقل قاعدة البيانات - Database Migration      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // الحصول على بيانات قاعدة البيانات المصدر
  console.log('📥 بيانات قاعدة البيانات المصدر (Source Database):\n');
  const sourceUrl = await question('أدخل رابط Supabase المصدر: ');
  const sourceKey = await question('أدخل مفتاح الخدمة (Service Role Key) للمصدر: ');

  // الحصول على بيانات قاعدة البيانات الهدف
  console.log('\n📤 بيانات قاعدة البيانات الهدف (Target Database):\n');
  const targetUrl = await question('أدخل رابط Supabase الهدف: ');
  const targetKey = await question('أدخل مفتاح الخدمة (Service Role Key) للهدف: ');

  // التأكيد
  console.log('\n⚠️  تحذير: هذه العملية ستحذف جميع البيانات الموجودة في قاعدة البيانات الهدف!');
  const confirm = await question('هل تريد المتابعة؟ (نعم/لا): ');

  if (confirm.toLowerCase() !== 'نعم' && confirm.toLowerCase() !== 'yes') {
    console.log('❌ تم الإلغاء');
    rl.close();
    process.exit(0);
  }

  try {
    const sourceClient = createClient(sourceUrl, sourceKey);
    const targetClient = createClient(targetUrl, targetKey);

    console.log('\n🚀 بدء نقل البيانات...\n');

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
          console.warn(`⚠️  تحذير: ${table} - ${error.message}`);
          allData[table] = [];
        } else {
          allData[table] = data || [];
          console.log(`✅ ${table}: ${allData[table].length} سجل`);
        }
      } catch (err) {
        console.warn(`⚠️  خطأ في ${table}: ${err.message}`);
        allData[table] = [];
      }
    }

    console.log('\n📤 إدراج البيانات في قاعدة البيانات الهدف...\n');

    // إدراج البيانات
    for (const table of tables) {
      if (allData[table].length === 0) {
        console.log(`⏭️  ${table}: لا توجد بيانات`);
        continue;
      }

      try {
        // حذف البيانات الموجودة
        await targetClient.from(table).delete().neq('id', '');

        // إدراج البيانات الجديدة
        const { error } = await targetClient.from(table).insert(allData[table]);

        if (error) {
          console.error(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: تم إدراج ${allData[table].length} سجل`);
        }
      } catch (err) {
        console.error(`❌ ${table}: ${err.message}`);
      }
    }

    console.log('\n✨ اكتمل نقل البيانات بنجاح!');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }

  rl.close();
}

main();
