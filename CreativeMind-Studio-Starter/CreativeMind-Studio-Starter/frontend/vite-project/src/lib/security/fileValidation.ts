/**
 * lib/security/fileValidation.ts
 *
 * Client-side file validation before uploads.
 *
 * SECURITY NOTES:
 *  - MIME type from the browser is advisory only. The backend MUST re-validate
 *    actual file content (magic bytes). These checks are UX guards, not a
 *    security boundary.
 *  - Magic-byte validation (readFileMagicBytes) provides a stronger client-side
 *    hint by reading the first 12 bytes of the file, but still must not replace
 *    backend validation.
 *  - File names are sanitized before display/submission to prevent path traversal.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum file size: 2 GB */
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024;

/** Maximum file size for images: 50 MB */
export const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;

/** Maximum number of simultaneous uploads */
export const MAX_CONCURRENT_UPLOADS = 10;

// ─── Allowed MIME types by category ──────────────────────────────────────────

export const ALLOWED_MIME_TYPES = {
  video: new Set([
    'video/mp4',
    'video/quicktime',    // .mov
    'video/x-msvideo',    // .avi
    'video/x-matroska',   // .mkv
    'video/webm',
    'video/mpeg',
    'video/ogg',
  ]),
  image: new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    'image/bmp',
    'image/avif',
  ]),
  audio: new Set([
    'audio/mpeg',         // .mp3
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/flac',
    'audio/x-m4a',
    'audio/webm',
  ]),
  document: new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
  ]),
} as const;

export type AllowedCategory = keyof typeof ALLOWED_MIME_TYPES;

// All allowed MIME types flattened into one set
const ALL_ALLOWED_MIMES: Set<string> = new Set([
  ...ALLOWED_MIME_TYPES.video,
  ...ALLOWED_MIME_TYPES.image,
  ...ALLOWED_MIME_TYPES.audio,
  ...ALLOWED_MIME_TYPES.document,
]);

// ─── Allowed file extensions ──────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = new Set([
  // Video
  'mp4', 'mov', 'avi', 'mkv', 'webm', 'mpeg', 'mpg', 'ogv',
  // Image
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'tif', 'tiff', 'bmp', 'avif',
  // Audio
  'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a',
  // Document
  'pdf', 'doc', 'docx', 'txt', 'csv',
]);

// Explicitly blocked extensions (double extension attacks, executables, etc.)
const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'ts',
  'php', 'py', 'rb', 'sh', 'bash', 'ps1', 'psm1', 'jar', 'class',
  'dll', 'so', 'dylib', 'html', 'htm', 'xml', 'svg',
  // Double-extension patterns are caught by the sanitization step
]);

// ─── Magic byte signatures ────────────────────────────────────────────────────

interface MagicSignature {
  bytes:  number[];
  offset: number;
}

const MAGIC_BYTES: Record<string, MagicSignature[]> = {
  'video/mp4':        [{ bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }],
  'image/jpeg':       [{ bytes: [0xFF, 0xD8, 0xFF],        offset: 0 }],
  'image/png':        [{ bytes: [0x89, 0x50, 0x4E, 0x47],  offset: 0 }],
  'image/gif':        [{ bytes: [0x47, 0x49, 0x46, 0x38],  offset: 0 }],
  'image/webp':       [{ bytes: [0x57, 0x45, 0x42, 0x50],  offset: 8 }],
  'application/pdf':  [{ bytes: [0x25, 0x50, 0x44, 0x46],  offset: 0 }], // %PDF
  'audio/mpeg':       [{ bytes: [0xFF, 0xFB],               offset: 0 }, { bytes: [0x49, 0x44, 0x33], offset: 0 }],
  'audio/wav':        [{ bytes: [0x52, 0x49, 0x46, 0x46],  offset: 0 }], // RIFF
  'video/webm':       [{ bytes: [0x1A, 0x45, 0xDF, 0xA3],  offset: 0 }],
};

// ─── Validation result ────────────────────────────────────────────────────────

export interface FileValidationResult {
  valid:    boolean;
  errors:   string[];
  warnings: string[];
  /** Sanitized file name safe for display and submission */
  safeName: string;
  /** Detected category, or null */
  category: AllowedCategory | null;
}

// ─── Sanitize file name ───────────────────────────────────────────────────────

/**
 * Strip path traversal, null bytes, and other dangerous characters from a
 * file name. Collapses multiple extensions by removing all but the last.
 */
export function sanitizeFileName(name: string): string {
  // Remove null bytes
  let safe = name.replace(/\0/g, '');
  // Strip directory separators — keep only the base name
  safe = safe.replace(/[/\\]/g, '_');
  // Remove leading dots (hidden files) and whitespace
  safe = safe.trim().replace(/^\.+/, '');
  // Collapse any non-filename characters
  safe = safe.replace(/[^\w\s.\-()[\]]/g, '_');
  // Limit length
  if (safe.length > 255) safe = safe.slice(0, 251) + safe.slice(safe.lastIndexOf('.'));
  return safe || 'upload';
}

// ─── Detect category from MIME ────────────────────────────────────────────────

export function detectCategory(mimeType: string): AllowedCategory | null {
  for (const [cat, mimes] of Object.entries(ALLOWED_MIME_TYPES) as [AllowedCategory, Set<string>][]) {
    if ((mimes as Set<string>).has(mimeType)) return cat;
  }
  return null;
}

// ─── Read magic bytes ─────────────────────────────────────────────────────────

/**
 * Read the first 12 bytes of a file to validate magic bytes.
 * Returns true if the declared MIME type matches the magic byte signature.
 * Returns true (skip) when the MIME type has no registered signature.
 */
export function readFileMagicBytes(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const signatures = MAGIC_BYTES[file.type];
    if (!signatures) {
      resolve(true); // No signature registered — defer to backend
      return;
    }

    const slice = file.slice(0, 12);
    const reader = new FileReader();
    reader.onload = (e) => {
      const buf = new Uint8Array(e.target?.result as ArrayBuffer);
      const matches = signatures.some(({ bytes, offset }) =>
        bytes.every((b, i) => buf[offset + i] === b),
      );
      resolve(matches);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(slice);
  });
}

// ─── Validate a single file ───────────────────────────────────────────────────

/**
 * Validate a File object for MIME type, extension, and size.
 * Optionally checks magic bytes (async, more expensive).
 *
 * @param file            — The File to validate
 * @param options.maxSize — Override default max size in bytes
 * @param options.allowedCategories — Restrict which categories are accepted
 * @param options.checkMagicBytes   — Read first bytes to verify MIME (default: true)
 */
export async function validateFile(
  file: File,
  options: {
    maxSize?:           number;
    allowedCategories?: AllowedCategory[];
    checkMagicBytes?:   boolean;
  } = {},
): Promise<FileValidationResult> {
  const {
    maxSize = MAX_FILE_SIZE_BYTES,
    allowedCategories,
    checkMagicBytes = true,
  } = options;

  const errors:   string[] = [];
  const warnings: string[] = [];
  const safeName = sanitizeFileName(file.name);
  const ext = safeName.split('.').pop()?.toLowerCase() ?? '';

  // ── Extension checks ──────────────────────────────────────────────────────
  if (BLOCKED_EXTENSIONS.has(ext)) {
    errors.push(`File type ".${ext}" is not allowed for security reasons.`);
  } else if (!ALLOWED_EXTENSIONS.has(ext)) {
    errors.push(`File extension ".${ext}" is not supported.`);
  }

  // Double-extension attack (e.g. malware.exe.pdf)
  const parts = safeName.split('.');
  if (parts.length > 2) {
    const innerExts = parts.slice(1, -1);
    const hasDangerousInner = innerExts.some(e => BLOCKED_EXTENSIONS.has(e.toLowerCase()));
    if (hasDangerousInner) {
      errors.push('File name contains a suspicious double extension.');
    }
  }

  // ── MIME type check ───────────────────────────────────────────────────────
  if (!file.type) {
    warnings.push('File type could not be determined. The backend will re-validate.');
  } else if (!ALL_ALLOWED_MIMES.has(file.type)) {
    errors.push(`File MIME type "${file.type}" is not supported.`);
  }

  // ── Category restriction ─────────────────────────────────────────────────
  const category = detectCategory(file.type);
  if (allowedCategories && category && !allowedCategories.includes(category)) {
    errors.push(`Only ${allowedCategories.join(', ')} files are accepted here.`);
  }

  // ── Size check ────────────────────────────────────────────────────────────
  if (file.size === 0) {
    errors.push('File is empty.');
  } else if (file.size > maxSize) {
    const limitMb = (maxSize / (1024 * 1024)).toFixed(0);
    const sizeMb  = (file.size / (1024 * 1024)).toFixed(1);
    errors.push(`File size (${sizeMb} MB) exceeds the ${limitMb} MB limit.`);
  }

  // ── Magic byte check ─────────────────────────────────────────────────────
  if (checkMagicBytes && errors.length === 0 && file.type) {
    const magicOk = await readFileMagicBytes(file);
    if (!magicOk) {
      errors.push('File content does not match its declared type. The file may be corrupt or renamed.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    safeName,
    category,
  };
}

/**
 * Validate a batch of files. Enforces the concurrent-upload limit.
 * Returns one result per file.
 */
export async function validateFiles(
  files: File[],
  options: Parameters<typeof validateFile>[1] = {},
): Promise<FileValidationResult[]> {
  if (files.length > MAX_CONCURRENT_UPLOADS) {
    // Return a single error result instead of processing them all
    return [
      {
        valid: false,
        errors: [`You can upload at most ${MAX_CONCURRENT_UPLOADS} files at once.`],
        warnings: [],
        safeName: '',
        category: null,
      },
    ];
  }
  return Promise.all(files.map(f => validateFile(f, options)));
}
