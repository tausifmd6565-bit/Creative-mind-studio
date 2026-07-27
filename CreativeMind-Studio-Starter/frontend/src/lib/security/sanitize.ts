/**
 * lib/security/sanitize.ts
 *
 * HTML sanitization utilities for safe rendering of server-provided content.
 *
 * SECURITY RULES:
 *  - Never use dangerouslySetInnerHTML without first passing content through
 *    sanitizeHtml(). Components must import and call this before rendering.
 *  - sanitizeText() strips ALL tags — use it for plain-text fields (names, titles).
 *  - sanitizeHtml() whitelists a narrow set of safe formatting tags only.
 *  - sanitizeUrl() validates protocol allowlist to prevent javascript: injection.
 *  - All functions are pure and side-effect free.
 *
 * No external dependency is required — DOMParser is available in every browser
 * and in jsdom (for tests). For Node SSR, use a server-side sanitizer instead.
 */

// ─── Allowed HTML elements for rich-text fields ───────────────────────────────

const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 's', 'del',
  'br', 'p', 'span', 'code', 'pre', 'blockquote',
  'ul', 'ol', 'li', 'a',
]);

// Only these attributes are preserved on allowed tags
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a:    new Set(['href', 'title', 'target', 'rel']),
  span: new Set(['class']),
  code: new Set(['class']),
  pre:  new Set(['class']),
};

// Allowed URL protocols for href attributes
const SAFE_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Validate a URL string — returns the original if safe, '#' otherwise.
 */
function safeHref(href: string): string {
  try {
    const url = new URL(href, window.location.origin);
    return SAFE_PROTOCOLS.has(url.protocol) ? href : '#';
  } catch {
    // Relative path — allowed
    return href.startsWith('/') || href.startsWith('./') || href.startsWith('../')
      ? href
      : '#';
  }
}

/**
 * Recursively walk a DOM node, building a safe clone.
 * Strips disallowed elements (keeping their text children) and attributes.
 */
function cloneNode(source: Node, doc: Document): Node | null {
  if (source.nodeType === Node.TEXT_NODE) {
    return doc.createTextNode(source.textContent ?? '');
  }

  if (source.nodeType !== Node.ELEMENT_NODE) {
    return null; // ignore comments, processing instructions, etc.
  }

  const el = source as Element;
  const tag = el.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tag)) {
    // Disallowed tag — promote children as a fragment
    const frag = doc.createDocumentFragment();
    for (const child of el.childNodes) {
      const safe = cloneNode(child, doc);
      if (safe) frag.appendChild(safe);
    }
    return frag;
  }

  const safe = doc.createElement(tag);
  const allowedAttrs = ALLOWED_ATTRIBUTES[tag] ?? new Set<string>();

  for (const attr of el.attributes) {
    if (!allowedAttrs.has(attr.name)) continue;
    let value = attr.value;
    if (attr.name === 'href') value = safeHref(value);
    if (attr.name === 'target') {
      // Force noopener for external links
      value = '_blank';
      safe.setAttribute('rel', 'noopener noreferrer');
    }
    safe.setAttribute(attr.name, value);
  }

  for (const child of el.childNodes) {
    const safeChild = cloneNode(child, doc);
    if (safeChild) safe.appendChild(safeChild);
  }

  return safe;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Strip all HTML tags from a string, returning plain text.
 * Use for titles, names, labels — any field that must never render HTML.
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  // Fast path: if no < character present, skip DOM parsing
  if (!input.includes('<')) return input;
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');
  return doc.body.textContent ?? '';
}

/**
 * Sanitize an HTML string to a safe subset of tags and attributes.
 * Returns a string safe to pass to dangerouslySetInnerHTML.
 *
 * @example
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  if (!input.includes('<')) return input; // Fast path: plain text

  const parser = new DOMParser();
  const parsed = parser.parseFromString(input, 'text/html');
  const output = document.createDocumentFragment();

  for (const child of parsed.body.childNodes) {
    const safe = cloneNode(child, document);
    if (safe) output.appendChild(safe);
  }

  const wrapper = document.createElement('div');
  wrapper.appendChild(output);
  return wrapper.innerHTML;
}

/**
 * Validate and normalise a URL string.
 * Returns the sanitized URL or an empty string if the URL is unsafe.
 * Use before setting href, src, or action attributes.
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  const result = safeHref(url.trim());
  return result === '#' ? '' : result;
}

/**
 * Escape special HTML characters to prevent injection when concatenating
 * strings into HTML contexts (template literals, etc.).
 * Prefer sanitizeHtml() for rich content.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}
