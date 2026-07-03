'use strict';

const fs = require('fs');
const path = require('path');
const { escapeHTML } = require('hexo-util');

const ROUTED_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.pdf',
  '.html',
  '.js',
  '.json',
  '.css'
]);
const EMBED_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.webp',
  '.pdf'
]);
const ROUTE_PREFIX = 'assets/posts';

const normalizePath = (value) => value.split(path.sep).join('/');

// Generator that publishes post-local assets to /assets/posts/...
hexo.extend.generator.register('post-assets', function () {
  const postsRoot = path.join(hexo.source_dir, '_posts');
  if (!fs.existsSync(postsRoot)) return [];

  const pending = [postsRoot];
  const routes = [];

  while (pending.length) {
    const currentDir = pending.pop();
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        pending.push(fullPath);
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (!ROUTED_EXTS.has(ext)) continue;

      const relFromPosts = normalizePath(path.relative(postsRoot, fullPath));
      const routePath = normalizePath(path.join(ROUTE_PREFIX, relFromPosts));

      routes.push({
        path: routePath,
        data: () => fs.createReadStream(fullPath)
      });
    }
  }

  return routes;
});

// Convert Obsidian-style embeds (![[file.png|500]]) into usable markdown/html.
hexo.extend.filter.register('before_post_render', function (data) {
  if (!data?.source || !data?.content) return;

  const postsRoot = path.join(hexo.source_dir, '_posts');
  const currentDir = data.full_source
    ? path.dirname(data.full_source)
    : path.join(hexo.source_dir, path.dirname(data.source));

  data.content = data.content.replace(/!\[\[([^\]]+)\]\]/g, (match, inner) => {
    const [rawTarget, rawSize] = inner.split('|');
    const target = rawTarget && rawTarget.trim();
    if (!target) return match;

    const ext = path.extname(target).toLowerCase();
    if (!EMBED_EXTS.has(ext)) return match;

    const absTarget = path.join(currentDir, target);
    if (!fs.existsSync(absTarget)) return match;

    const relFromPosts = normalizePath(path.relative(postsRoot, absTarget));
    const assetPath = '/' + normalizePath(path.join(ROUTE_PREFIX, relFromPosts));
    const encodedSrc = encodeURI(assetPath);
    const alt = escapeHTML(path.basename(target, ext));

    const size = rawSize && rawSize.trim();
    if (size) {
      const width = size.replace(/[^0-9].*$/, '');
      if (width) {
        return `<img src="${encodedSrc}" alt="${alt}" width="${width}">`;
      }
    }

    return `![${alt}](${encodedSrc})`;
  });

  return data;
});
