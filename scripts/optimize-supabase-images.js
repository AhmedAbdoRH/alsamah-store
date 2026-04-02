import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'scripts', 'reports');
const CHECKPOINT_PATH = path.join(REPORTS_DIR, 'supabase-image-optimization-checkpoint.json');
const PUBLIC_OBJECT_MARKER = '/storage/v1/object/public/';
const TARGET_BYTES = 150 * 1024;
const DEFAULT_CACHE_CONTROL = '31536000';
const DEFAULT_BATCH_SIZE = 20;
const OP_TIMEOUT_MS = 120000;

const VARIANTS = {
  full: { maxWidth: 1400, targetBytes: TARGET_BYTES },
  detail: { maxWidth: 1200, targetBytes: TARGET_BYTES },
  card: { maxWidth: 640, targetBytes: 90 * 1024 },
  thumb: { maxWidth: 320, targetBytes: 45 * 1024 },
};

const TABLES = [
  { name: 'services', columns: ['id', 'image_url', 'gallery'], updateColumns: ['image_url', 'gallery'] },
  { name: 'banners', columns: ['id', 'image_url'], updateColumns: ['image_url'] },
  { name: 'testimonials', columns: ['id', 'image_url'], updateColumns: ['image_url'] },
  { name: 'store_settings', columns: ['id', 'logo_url', 'favicon_url', 'og_image_url'], updateColumns: ['logo_url', 'favicon_url', 'og_image_url'] },
  { name: 'product_images', columns: ['id', 'image_url'], updateColumns: ['image_url'], optional: true },
];

sharp.concurrency(2);

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((arg) => arg.startsWith('--')));
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const batchArg = args.find((arg) => arg.startsWith('--batch-size='));

  return {
    apply: flags.has('--apply'),
    dryRun: flags.has('--dry-run') || !flags.has('--apply'),
    resetCheckpoint: flags.has('--reset-checkpoint'),
    limit: limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : null,
    batchSize: batchArg ? Number.parseInt(batchArg.split('=')[1], 10) : DEFAULT_BATCH_SIZE,
  };
}

function withTimeout(promise, label, timeoutMs = OP_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const [rawKey, ...valueParts] = trimmed.split('=');
    const key = rawKey?.trim();
    if (!key) {
      continue;
    }

    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    env[key] = value;
  }

  return env;
}

function normalizeServiceRoleKey(value) {
  if (!value) {
    return '';
  }

  const tokenStart = value.indexOf('eyJ');
  if (tokenStart > 0) {
    return value.slice(tokenStart);
  }

  return value;
}

function loadEnv() {
  const merged = {
    ...loadEnvFile(path.join(ROOT_DIR, '.env')),
    ...loadEnvFile(path.join(ROOT_DIR, '.env.local')),
    ...process.env,
  };

  return {
    supabaseUrl: merged.SUPABASE_URL || merged.VITE_SUPABASE_URL || '',
    serviceRoleKey: normalizeServiceRoleKey(
      merged.SUPABASE_SERVICE_ROLE_KEY || merged.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
    ),
  };
}

function ensureEnv(config) {
  if (!config.supabaseUrl || !config.serviceRoleKey) {
    throw new Error('Missing Supabase URL or service role key in .env/.env.local.');
  }
}

function parseStorageUrl(url) {
  if (!url || !url.includes(PUBLIC_OBJECT_MARKER)) {
    return null;
  }

  const markerIndex = url.indexOf(PUBLIC_OBJECT_MARKER);
  const objectPath = url.slice(markerIndex + PUBLIC_OBJECT_MARKER.length).split('?')[0];
  const slashIndex = objectPath.indexOf('/');
  if (slashIndex === -1) {
    return null;
  }

  const bucket = objectPath.slice(0, slashIndex);
  const filePath = decodeURIComponent(objectPath.slice(slashIndex + 1));
  return { bucket, filePath };
}

function isAlreadyOptimized(filePath) {
  return filePath.startsWith('optimized/') && filePath.includes('__full.');
}

function isRasterContentType(contentType) {
  return /^image\/(jpeg|jpg|png|webp|avif|tiff|gif|heic|heif)$/i.test(contentType || '');
}

function buildVariantPath(originalPath, variant) {
  const parsed = path.posix.parse(originalPath);
  const safeName = parsed.name.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'image';
  const hash = crypto.createHash('sha1').update(originalPath).digest('hex').slice(0, 8);
  const legacyDir = parsed.dir ? path.posix.join('optimized', 'legacy', parsed.dir) : path.posix.join('optimized', 'legacy');
  return path.posix.join(legacyDir, `${safeName}-${hash}__${variant}.webp`);
}

async function optimizeBuffer(buffer, { maxWidth, targetBytes }) {
  const metadata = await sharp(buffer, { failOn: 'none' }).metadata();
  const originalWidth = metadata.width || maxWidth;
  let width = Math.min(originalWidth, maxWidth);
  let quality = 84;

  for (let attempt = 0; attempt < 18; attempt += 1) {
    const output = await sharp(buffer, { failOn: 'none', animated: false })
      .rotate()
      .resize({
        width,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({
        quality,
        alphaQuality: 80,
        effort: 4,
      })
      .toBuffer();

    if (output.length <= targetBytes || (width <= 280 && quality <= 42)) {
      return output;
    }

    if (quality > 46) {
      quality -= 6;
    } else {
      width = Math.max(280, Math.round(width * 0.85));
    }
  }

  return sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({
      width: Math.min(originalWidth, maxWidth),
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({ quality: 42, alphaQuality: 70, effort: 4 })
    .toBuffer();
}

async function fetchTableRows(client, table) {
  const { data, error } = await withTimeout(
    client.from(table.name).select(table.columns.join(', ')),
    `select ${table.name}`
  );

  if (error) {
    if (table.optional) {
      return [];
    }
    throw error;
  }

  return data || [];
}

function collectReferencedUrls(tableStates) {
  const urls = new Set();

  for (const state of Object.values(tableStates)) {
    for (const row of state.rows.values()) {
      if ('image_url' in row && row.image_url) {
        urls.add(row.image_url);
      }

      if (Array.isArray(row.gallery)) {
        for (const item of row.gallery) {
          if (item) {
            urls.add(item);
          }
        }
      }

      for (const column of ['logo_url', 'favicon_url', 'og_image_url']) {
        if (typeof row[column] === 'string' && row[column]) {
          urls.add(row[column]);
        }
      }
    }
  }

  return Array.from(urls);
}

function createTableStates(tableRows) {
  const tableStates = {};

  for (const { table, rows } of tableRows) {
    const rowMap = new Map();
    for (const row of rows) {
      rowMap.set(String(row.id), structuredClone(row));
    }

    tableStates[table.name] = {
      table,
      rows: rowMap,
      dirty: new Set(),
    };
  }

  return tableStates;
}

function applyReplacementToStates(tableStates, originalUrl, replacementUrl) {
  for (const state of Object.values(tableStates)) {
    for (const [rowId, row] of state.rows.entries()) {
      let changed = false;

      if (typeof row.image_url === 'string' && row.image_url === originalUrl) {
        row.image_url = replacementUrl;
        changed = true;
      }

      if (Array.isArray(row.gallery)) {
        const nextGallery = row.gallery.map((item) => (item === originalUrl ? replacementUrl : item));
        if (JSON.stringify(nextGallery) !== JSON.stringify(row.gallery)) {
          row.gallery = nextGallery;
          changed = true;
        }
      }

      for (const column of ['logo_url', 'favicon_url', 'og_image_url']) {
        if (typeof row[column] === 'string' && row[column] === originalUrl) {
          row[column] = replacementUrl;
          changed = true;
        }
      }

      if (changed) {
        state.dirty.add(rowId);
      }
    }
  }
}

async function flushDirtyRows(client, tableStates, dryRun) {
  const stats = {};

  for (const state of Object.values(tableStates)) {
    let updated = 0;
    for (const rowId of Array.from(state.dirty)) {
      updated += 1;

      if (!dryRun) {
        const row = state.rows.get(rowId);
        const payload = {};
        for (const column of state.table.updateColumns) {
          payload[column] = row[column] ?? null;
        }

        const { error } = await withTimeout(
          client.from(state.table.name).update(payload).eq('id', rowId),
          `update ${state.table.name}:${rowId}`
        );

        if (error) {
          throw error;
        }
      }
    }

    state.dirty.clear();
    stats[state.table.name] = updated;
  }

  return stats;
}

function loadCheckpoint(resetCheckpoint) {
  if (resetCheckpoint && fs.existsSync(CHECKPOINT_PATH)) {
    fs.unlinkSync(CHECKPOINT_PATH);
  }

  if (!fs.existsSync(CHECKPOINT_PATH)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf-8'));
}

function saveCheckpoint(checkpoint) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2));
}

function createInitialCheckpoint(urls, dryRun) {
  return {
    dryRun,
    createdAt: new Date().toISOString(),
    totalUrls: urls.length,
    processedUrls: [],
    processedSet: {},
    replacements: {},
    skipped: [],
    optimized: [],
    flushHistory: [],
    lastIndex: 0,
  };
}

async function uploadVariant(client, bucket, filePath, buffer, dryRun) {
  if (!dryRun) {
    const { error } = await withTimeout(
      client.storage.from(bucket).upload(filePath, buffer, {
        upsert: true,
        contentType: 'image/webp',
        cacheControl: DEFAULT_CACHE_CONTROL,
      }),
      `upload ${bucket}/${filePath}`
    );

    if (error) {
      throw error;
    }
  }

  const { data } = client.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

function printProgress(index, total, action, url) {
  const percent = ((index / total) * 100).toFixed(1);
  console.log(`[${index}/${total}] ${percent}% ${action}: ${url}`);
}

async function main() {
  const args = parseArgs();
  const env = loadEnv();
  ensureEnv(env);

  const admin = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const tableRows = [];
  for (const table of TABLES) {
    const rows = await fetchTableRows(admin, table);
    tableRows.push({ table, rows });
  }

  const tableStates = createTableStates(tableRows);
  const referencedUrls = collectReferencedUrls(tableStates);
  const targetUrls = args.limit ? referencedUrls.slice(0, args.limit) : referencedUrls;

  let checkpoint = args.dryRun
    ? createInitialCheckpoint(targetUrls, true)
    : loadCheckpoint(args.resetCheckpoint) || createInitialCheckpoint(targetUrls, false);

  if (checkpoint.totalUrls !== targetUrls.length) {
    checkpoint = createInitialCheckpoint(targetUrls, args.dryRun);
  }

  for (const [originalUrl, replacementUrl] of Object.entries(checkpoint.replacements || {})) {
    applyReplacementToStates(tableStates, originalUrl, replacementUrl);
  }

  if (!args.dryRun && Object.keys(checkpoint.replacements || {}).length > 0) {
    const resumedStats = await flushDirtyRows(admin, tableStates, false);
    checkpoint.flushHistory.push({
      at: new Date().toISOString(),
      reason: 'resume-sync',
      stats: resumedStats,
    });
    saveCheckpoint(checkpoint);
  }

  let batchProcessed = 0;

  for (let index = checkpoint.lastIndex || 0; index < targetUrls.length; index += 1) {
    const url = targetUrls[index];

    if (checkpoint.processedSet[url]) {
      checkpoint.lastIndex = index + 1;
      continue;
    }

    printProgress(index + 1, targetUrls.length, 'processing', url);

    const parsed = parseStorageUrl(url);
    if (!parsed) {
      checkpoint.skipped.push({ url, reason: 'not-a-supabase-public-url' });
      checkpoint.processedSet[url] = true;
      checkpoint.processedUrls.push(url);
      checkpoint.lastIndex = index + 1;
      if (!args.dryRun) saveCheckpoint(checkpoint);
      continue;
    }

    if (isAlreadyOptimized(parsed.filePath)) {
      checkpoint.replacements[url] = url;
      checkpoint.processedSet[url] = true;
      checkpoint.processedUrls.push(url);
      checkpoint.lastIndex = index + 1;
      if (!args.dryRun) saveCheckpoint(checkpoint);
      continue;
    }

    try {
      const { data, error } = await withTimeout(
        admin.storage.from(parsed.bucket).download(parsed.filePath),
        `download ${parsed.bucket}/${parsed.filePath}`
      );

      if (error) {
        throw error;
      }

      const arrayBuffer = await data.arrayBuffer();
      const sourceBuffer = Buffer.from(arrayBuffer);
      const contentType = data.type || '';
      if (!isRasterContentType(contentType)) {
        checkpoint.skipped.push({ url, reason: `unsupported-content-type:${contentType || 'unknown'}` });
      } else {
        const variantUrls = {};

        for (const [variantName, config] of Object.entries(VARIANTS)) {
          const optimizedBuffer = await optimizeBuffer(sourceBuffer, config);
          const variantPath = buildVariantPath(parsed.filePath, variantName);
          variantUrls[variantName] = await uploadVariant(
            admin,
            parsed.bucket,
            variantPath,
            optimizedBuffer,
            args.dryRun
          );
        }

        checkpoint.replacements[url] = variantUrls.full;
        checkpoint.optimized.push({
          sourceUrl: url,
          sourceBytes: sourceBuffer.length,
          bucket: parsed.bucket,
          sourcePath: parsed.filePath,
          variants: variantUrls,
        });

        applyReplacementToStates(tableStates, url, variantUrls.full);
        batchProcessed += 1;
      }
    } catch (error) {
      checkpoint.skipped.push({ url, reason: error.message });
    }

    checkpoint.processedSet[url] = true;
    checkpoint.processedUrls.push(url);
    checkpoint.lastIndex = index + 1;

    if (!args.dryRun) {
      saveCheckpoint(checkpoint);
    }

    if (batchProcessed >= args.batchSize) {
      const stats = await flushDirtyRows(admin, tableStates, args.dryRun);
      checkpoint.flushHistory.push({
        at: new Date().toISOString(),
        reason: 'batch',
        stats,
      });
      batchProcessed = 0;
      if (!args.dryRun) {
        saveCheckpoint(checkpoint);
      }
      console.log(`Flushed batch updates: ${JSON.stringify(stats)}`);
    }
  }

  const finalStats = await flushDirtyRows(admin, tableStates, args.dryRun);
  checkpoint.flushHistory.push({
    at: new Date().toISOString(),
    reason: 'final',
    stats: finalStats,
  });

  const report = {
    apply: args.apply,
    dryRun: args.dryRun,
    targetBytes: TARGET_BYTES,
    scannedUrls: referencedUrls.length,
    processedUrls: checkpoint.processedUrls.length,
    skipped: checkpoint.skipped,
    optimized: checkpoint.optimized,
    updatedRows: checkpoint.flushHistory,
    checkpointPath: args.dryRun ? null : CHECKPOINT_PATH,
  };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `supabase-image-optimization-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  if (!args.dryRun) {
    saveCheckpoint(checkpoint);
  }

  console.log(`Mode: ${args.dryRun ? 'dry-run' : 'apply'}`);
  console.log(`Scanned URLs: ${report.scannedUrls}`);
  console.log(`Processed URLs: ${report.processedUrls}`);
  console.log(`Skipped URLs: ${report.skipped.length}`);
  console.log(`Final flush: ${JSON.stringify(finalStats)}`);
  console.log(`Report: ${reportPath}`);
  if (!args.dryRun) {
    console.log(`Checkpoint: ${CHECKPOINT_PATH}`);
  }
}

main().catch((error) => {
  console.error(`Image optimization failed: ${error.message}`);
  process.exit(1);
});
