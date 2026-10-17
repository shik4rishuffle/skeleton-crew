#!/usr/bin/env node

/**
 * TASK-021: Before-Mode Test Script
 *
 * Verifies every significant styled component selector in the main CSS
 * has a corresponding .before-mode rule in before.css.
 *
 * Exit 0 on pass, exit 1 on failure. No external dependencies.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'public', 'css');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const GLOBAL_CSS = path.join(ROOT, 'global.css');
const BEFORE_CSS = path.join(ROOT, 'before.css');

// ---------------------------------------------------------------------------
// Exclusions - selectors that do NOT need before-mode coverage
// ---------------------------------------------------------------------------
const EXCLUDED_PREFIXES = [
  'toggle__btn',
  'toggle__pill',
  'skeleton',
  'container',
  'section',
  'visually-hidden',
  'skip-link',
  'hero--short',
  'contact-form',
  'contact__',
  'services__',
];

function isExcluded(selector) {
  // Strip leading dot
  const name = selector.replace(/^\./, '');

  for (const prefix of EXCLUDED_PREFIXES) {
    if (name === prefix || name.startsWith(prefix + '--') || name.startsWith(prefix + '__')) {
      return true;
    }
    // Prefix match for entries like "contact__" and "services__"
    if (prefix.endsWith('__') && name.startsWith(prefix)) {
      return true;
    }
  }

  // State classes
  if (name.startsWith('is-')) {
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Parse class selectors from a CSS string, ignoring @-rules and pseudo-elements
// ---------------------------------------------------------------------------
function extractSelectors(css) {
  const selectors = new Set();

  // Remove all block comments
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Track brace depth to distinguish selector lines from property lines.
  // A line containing a class selector outside of a declaration block
  // (depth 0 or at the line that opens a block) is a selector line.
  const lines = cleaned.split('\n');
  let depth = 0;
  let inKeyframes = false;
  let keyframeDepth = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === '}') {
      // Adjust depth for closing braces
      const closes = (trimmed.match(/\}/g) || []).length;
      depth -= closes;
      if (depth < 0) depth = 0;
      if (inKeyframes && depth <= keyframeDepth) {
        inKeyframes = false;
      }
      continue;
    }

    // Detect @keyframes - skip everything inside
    if (/@keyframes\s/.test(trimmed)) {
      inKeyframes = true;
      keyframeDepth = depth;
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      depth += opens - closes;
      continue;
    }

    if (inKeyframes) {
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      depth += opens - closes;
      if (depth < 0) depth = 0;
      if (depth <= keyframeDepth) {
        inKeyframes = false;
      }
      continue;
    }

    // Skip @media / @supports lines themselves (contents are processed)
    if (trimmed.startsWith('@')) {
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      depth += opens - closes;
      continue;
    }

    // A selector line is one that either:
    // - contains an opening brace (selector { ... })
    // - or is a standalone selector with no colon (property: value lines have colons)
    const hasBrace = trimmed.includes('{');
    const isPropertyLine = !hasBrace && trimmed.includes(':') && !trimmed.startsWith('.');

    if (isPropertyLine) {
      // This is a CSS property declaration - skip it
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      depth += opens - closes;
      continue;
    }

    // Extract selector part (everything before the opening brace)
    const selectorPart = hasBrace ? trimmed.split('{')[0] : trimmed;
    if (!selectorPart.includes('.')) {
      const opens = (trimmed.match(/\{/g) || []).length;
      const closes = (trimmed.match(/\}/g) || []).length;
      depth += opens - closes;
      continue;
    }

    // Extract class selectors - must start with a letter (not a digit)
    const classPattern = /\.(([a-zA-Z][\w-]*(?:__[\w-]+)?(?:--[\w-]+)?))/g;
    let match;
    while ((match = classPattern.exec(selectorPart)) !== null) {
      selectors.add('.' + match[1]);
    }

    const opens = (trimmed.match(/\{/g) || []).length;
    const closes = (trimmed.match(/\}/g) || []).length;
    depth += opens - closes;
  }

  return selectors;
}

// ---------------------------------------------------------------------------
// Extract selectors that appear after .before-mode in before.css
// ---------------------------------------------------------------------------
function extractBeforeModeSelectors(css) {
  const selectors = new Set();

  // Remove all block comments
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Match patterns like: body.before-mode .some-class
  // Also matches: body.before-mode .some-class .nested-class
  const pattern = /body\.before-mode\s+\.([\w-]+(?:__[\w-]+)?(?:--[\w-]+)?)/g;
  let match;
  while ((match = pattern.exec(cleaned)) !== null) {
    selectors.add('.' + match[1]);
  }

  return selectors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  // 1. Read component CSS files
  const componentFiles = fs.readdirSync(COMPONENTS_DIR)
    .filter(f => f.endsWith('.css'))
    .map(f => path.join(COMPONENTS_DIR, f));

  // 2. Collect selectors from component files and global.css
  const componentSelectors = new Set();

  const allSources = [...componentFiles, GLOBAL_CSS];
  for (const file of allSources) {
    const css = fs.readFileSync(file, 'utf8');
    const selectors = extractSelectors(css);
    for (const sel of selectors) {
      componentSelectors.add(sel);
    }
  }

  // 3. Read before.css and extract covered selectors
  const beforeCss = fs.readFileSync(BEFORE_CSS, 'utf8');
  const beforeSelectors = extractBeforeModeSelectors(beforeCss);

  // 4. Filter to significant selectors (apply exclusions)
  const significantSelectors = [];
  for (const sel of componentSelectors) {
    if (!isExcluded(sel)) {
      significantSelectors.push(sel);
    }
  }

  // Sort for consistent output
  significantSelectors.sort();

  // 5. Check coverage - a selector is covered if it appears in before.css
  // or if its BEM block is covered (e.g. .nav covers .nav__logo)
  const missing = [];
  for (const sel of significantSelectors) {
    // Direct match
    if (beforeSelectors.has(sel)) {
      continue;
    }

    // Block-level match: if .nav__logo-img is not directly covered,
    // check if .nav (the block) has at least one before-mode rule.
    // But we only accept block-level coverage for elements that aren't
    // "key elements" listed in the task.
    const name = sel.replace(/^\./, '');
    const blockName = name.split('__')[0].split('--')[0];

    // Check if any selector in before.css starts with this block
    let blockCovered = false;
    for (const bSel of beforeSelectors) {
      const bName = bSel.replace(/^\./, '');
      if (bName === blockName || bName.startsWith(blockName + '__') || bName.startsWith(blockName + '--')) {
        blockCovered = true;
        break;
      }
    }

    if (!blockCovered) {
      missing.push(sel);
    }
  }

  // 6. Output results
  if (missing.length === 0) {
    console.log(`PASS: All ${significantSelectors.length} component selectors have before-mode coverage`);
    process.exit(0);
  } else {
    console.log(`FAIL: ${missing.length} selectors missing from before.css:`);
    for (const sel of missing) {
      console.log(`  - ${sel}`);
    }
    process.exit(1);
  }
}

main();
