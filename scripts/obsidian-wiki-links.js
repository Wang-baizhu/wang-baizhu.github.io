const WIKI_LINK_RE = /(!)?\[\[([^\]]+)\]\]/g;

const normalizeRoot = root => {
  if (!root) return '/';
  let normalized = root;
  if (!normalized.startsWith('/')) normalized = `/${normalized}`;
  if (!normalized.endsWith('/')) normalized += '/';
  return normalized;
};

const collectionToArray = collection => {
  if (!collection) return [];
  if (typeof collection.toArray === 'function') return collection.toArray();
  if (typeof collection.forEach === 'function' && !Array.isArray(collection)) {
    const result = [];
    collection.forEach(item => result.push(item));
    return result;
  }
  return Array.isArray(collection) ? collection : [];
};

const buildTargetMap = hexo => {
  const root = normalizeRoot(hexo.config.root || '/');
  const siteUrl = (hexo.config.url || '').replace(/\/+$/, '');
  const map = new Map();

  const toRelativeUrl = url => {
    if (!url) return '';
    if (siteUrl && url.startsWith(siteUrl)) {
      return url.slice(siteUrl.length) || '/';
    }
    return url.startsWith('/') ? url : `/${url}`;
  };

  const addItem = item => {
    if (!item || !item.title) return;
    const key = item.title.trim().toLowerCase();
    if (!key || map.has(key)) return;
    const permalinkPath = toRelativeUrl(item.permalink || item.path || '');
    const withRoot = permalinkPath.startsWith(root)
      ? permalinkPath
      : `${root}${permalinkPath.replace(/^\/+/, '')}`;
    map.set(key, withRoot);
  };

  const posts = collectionToArray(hexo.locals.get('posts'));
  const pages = collectionToArray(hexo.locals.get('pages'));
  [...posts, ...pages].forEach(addItem);

  return { map, root };
};

const resolveTarget = (rawTarget, map, root) => {
  const target = rawTarget.trim();
  if (!target) return rawTarget;

  const [base, ...hashParts] = target.split('#');
  const hash = hashParts.length ? `#${hashParts.join('#')}` : '';
  const lookupKey = base.trim().toLowerCase();

  if (map.has(lookupKey)) {
    return `${map.get(lookupKey)}${hash}`;
  }

  const hasExtension = /\.[\w-]+$/.test(base);
  const encodedBase = encodeURI(base.trim());
  const basePath = hasExtension ? encodedBase : `${encodedBase}/`;
  return `${root}${basePath}${hash}`;
};

hexo.extend.filter.register('before_post_render', function (data) {
  if (!data || !data.content) return data;

  const { map, root } = buildTargetMap(hexo);
  data.content = data.content.replace(
    WIKI_LINK_RE,
    (match, isEmbed, inner) => {
      const [rawTarget, rawAlias] = inner.split('|');
      const target = (rawTarget || '').trim();
      if (!target) return match;

      const alias = rawAlias ? rawAlias.trim() : '';
      const url = resolveTarget(target, map, root);
      const text = alias || target;

      return isEmbed ? `![${text}](${url})` : `[${text}](${url})`;
    }
  );

  return data;
});
