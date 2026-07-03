'use strict';

hexo.extend.injector.register(
  'head_end',
  '<style>.article-entry figure.highlight.plaintext,.article-entry pre:has(code.language-mermaid),.mermaid-pending{visibility:hidden}.mermaid-pending{min-height:120px}.mermaid-ready{visibility:visible}</style>',
  'default'
);

hexo.extend.injector.register(
  'body_end',
  `<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

const MERMAID_PREFIXES = [
  'flowchart ',
  'graph ',
  'sequenceDiagram',
  'classDiagram',
  'stateDiagram',
  'erDiagram',
  'journey',
  'gantt',
  'mindmap',
  'timeline',
  'gitGraph',
  'pie ',
  'quadrantChart',
  'requirementDiagram',
  'sankey-beta',
  'block-beta',
  'packet-beta',
  'xychart-beta',
  'kanban',
  'architecture-beta',
  'C4Context',
  'C4Container',
  'C4Component',
  'C4Dynamic',
  'C4Deployment'
];

function startsWithMermaid(text) {
  const normalized = text.trim();
  return MERMAID_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function extractCodeText(root) {
  const lineNodes = root.querySelectorAll('.code .line');
  if (lineNodes.length) {
    return Array.from(lineNodes).map((line) => line.textContent).join('\\n');
  }

  const code = root.querySelector('code');
  if (code) return code.textContent;

  const pre = root.querySelector('pre');
  return pre ? pre.textContent : '';
}

function collectBlocks() {
  const blocks = [];

  document.querySelectorAll('pre code.language-mermaid').forEach((code) => {
    blocks.push({
      target: code.closest('pre'),
      source: code.textContent
    });
  });

  document.querySelectorAll('figure.highlight.plaintext').forEach((figure) => {
    const source = extractCodeText(figure);
    if (!startsWithMermaid(source)) {
      figure.style.visibility = 'visible';
      return;
    }

    blocks.push({
      target: figure,
      source
    });
  });

  return blocks;
}

function replaceWithMermaid(blocks) {
  blocks.forEach((block, index) => {
    if (!block.target || !block.target.parentNode) return;

    const container = document.createElement('div');
    container.className = 'mermaid mermaid-pending';
    container.setAttribute('data-mermaid-index', String(index));
    container.textContent = block.source.trim();

    block.target.parentNode.replaceChild(container, block.target);
  });
}

const blocks = collectBlocks();
if (!blocks.length) {
  document.querySelectorAll('figure.highlight.plaintext').forEach((figure) => {
    figure.style.visibility = 'visible';
  });
} else {
  replaceWithMermaid(blocks);

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'default'
  });

  try {
    await mermaid.run({ querySelector: '.mermaid' });
  } catch (error) {
    console.error('Mermaid render failed:', error);
  } finally {
    document.querySelectorAll('.mermaid').forEach((block) => {
      block.classList.remove('mermaid-pending');
      block.classList.add('mermaid-ready');
    });
    document.querySelectorAll('figure.highlight.plaintext').forEach((figure) => {
      figure.style.visibility = 'visible';
    });
  }
}
</script>`,
  'default'
);
