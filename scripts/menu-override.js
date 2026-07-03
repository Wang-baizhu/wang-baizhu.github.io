// Ensure the theme menu is fully replaced by the user-defined one from _config.landscape.yml
hexo.extend.filter.register('before_generate', function () {
  const customMenu = hexo.config.theme_config && hexo.config.theme_config.menu;
  if (!customMenu) return;

  // Theme can be missing when running in minimal environments; guard to avoid crashes.
  if (!hexo.theme || !hexo.theme.config) return;

  hexo.theme.config.menu = customMenu;
});
