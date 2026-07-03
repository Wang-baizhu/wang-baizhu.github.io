const path = require('path');

const defaultCategory =
  (hexo.config.default_category || '').toString().toLowerCase();

const normalizeCategories = cats => {
  if (!cats) return [];
  // Hexo passes either arrays, strings, or Model/Query collections.
  if (cats.toArray) {
    return cats
      .toArray()
      .map(cat => (cat && cat.name ? cat.name : cat))
      .filter(Boolean)
      .map(String)
      .map(str => str.trim());
  }
  const list = Array.isArray(cats) ? cats : [cats];
  return list
    .map(String)
    .map(str => str.trim())
    .filter(Boolean);
};

const deriveFromSource = source => {
  const normalized = path.normalize(source || '');
  const segments = normalized.split(path.sep).filter(Boolean);
  const filename = segments[segments.length - 1] || '';
  const title = filename.replace(path.extname(filename), '');

  const withoutFile = segments.slice(0, -1);
  const postsIndex = withoutFile.indexOf('_posts');
  const categorySegments =
    postsIndex === -1 ? withoutFile : withoutFile.slice(postsIndex + 1);

  return { title, categories: categorySegments };
};

const shouldFillCategories = cats => {
  const normalizedCats = normalizeCategories(cats);
  const hasOnlyDefault =
    defaultCategory &&
    normalizedCats.length === 1 &&
    normalizedCats[0].toLowerCase() === defaultCategory;
  return normalizedCats.length === 0 || hasOnlyDefault;
};

// Fill title/categories during render.
hexo.extend.filter.register('before_post_render', function (data) {
  if (data.layout !== 'post') return data;
  const derived = deriveFromSource(data.source);

  if (!data.title) {
    data.title = derived.title;
  }

  if (shouldFillCategories(data.categories) && derived.categories.length) {
    data.categories = derived.categories;
  }

  return data;
});

// Backfill categories into the database before generators run, so category pages work.
hexo.extend.filter.register('before_generate', function () {
  const posts = hexo.locals.get('posts');
  if (!posts || !posts.forEach) return;

  posts.forEach(post => {
    const derived = deriveFromSource(post.source);

    if (!post.title && derived.title) {
      post.title = derived.title;
    }

    if (shouldFillCategories(post.categories) && derived.categories.length) {
      // setCategories updates the many-to-many relationship Hexo uses for category pages.
      if (typeof post.setCategories === 'function') {
        post.setCategories(derived.categories);
      } else {
        // Fallback to direct assignment (rarely needed).
        post.categories = derived.categories;
      }
    }
  });
});
