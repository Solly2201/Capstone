// Image type verification and metadata stripping, with no dependencies.
//
// A phone photo's EXIF block routinely carries GPS coordinates, device
// identity and a timestamp. The citizen chose the location on the report;
// they did not choose to publish where they were standing. So metadata is
// removed BEFORE the file is persisted -- original bytes never reach disk.
//
// Written by hand against the JPEG/PNG containers rather than pulling in
// an image stack: dropping metadata segments needs a container walk, not
// decoding. The trade-off is JPEG and PNG only, which is the allow-list.
//
// Deliberately out of scope: face or number-plate masking, any computer
// vision, re-encoding, thumbnails.

export type ImageFormat = "image/jpeg" | "image/png";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Identify by magic bytes: a client-supplied Content-Type is a claim, not
// evidence. Storage decisions use this, and a mismatch is rejected upstream.
export const detectImageFormat = (buffer: Buffer): ImageFormat | null => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return "image/png";
  return null;
};

// Rebuild a JPEG without its APPn segments (APP1 EXIF/GPS, APP13 IPTC,
// APP2 ICC/MPF) or COM comments. Structural segments and the entropy-coded
// scan are copied through untouched, so pixels are never re-encoded.
const stripJpegMetadata = (buffer: Buffer): Buffer => {
  const output: Buffer[] = [Buffer.from([0xff, 0xd8])]; // SOI
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break; // Not a marker boundary: malformed.

    const marker = buffer[offset + 1];
    if (marker === undefined) break;

    // Start of scan: the rest is entropy-coded data, copy verbatim.
    if (marker === 0xda) {
      output.push(buffer.subarray(offset));
      break;
    }

    // Standalone markers carry no length payload.
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9) || marker === 0x01) {
      output.push(buffer.subarray(offset, offset + 2));
      offset += 2;
      continue;
    }

    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > buffer.length) break; // Malformed: stop.

    const isAppSegment = marker >= 0xe0 && marker <= 0xef;
    const isComment = marker === 0xfe;
    if (!isAppSegment && !isComment) {
      output.push(buffer.subarray(offset, offset + 2 + length));
    }
    offset += 2 + length;
  }

  return Buffer.concat(output);
};

// Ancillary PNG chunks that can carry text, timestamps or an embedded
// EXIF block. Critical chunks (IHDR/PLTE/IDAT/IEND) and rendering-
// relevant ones (gAMA, sRGB, ...) are preserved.
const PNG_CHUNKS_TO_DROP = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME"]);

const stripPngMetadata = (buffer: Buffer): Buffer => {
  const output: Buffer[] = [buffer.subarray(0, 8)];
  let offset = 8;

  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const chunkEnd = offset + 12 + length; // length + type + data + CRC
    if (chunkEnd > buffer.length) break; // Malformed: stop.

    if (!PNG_CHUNKS_TO_DROP.has(type)) {
      output.push(buffer.subarray(offset, chunkEnd));
    }
    offset = chunkEnd;
    if (type === "IEND") break;
  }

  return Buffer.concat(output);
};

/**
 * Returns the bytes that are safe to persist, or null when the buffer is
 * not a supported image. Callers must treat null as a rejection.
 */
export const stripImageMetadata = (buffer: Buffer): { format: ImageFormat; bytes: Buffer } | null => {
  const format = detectImageFormat(buffer);
  if (format === null) return null;
  const bytes = format === "image/jpeg" ? stripJpegMetadata(buffer) : stripPngMetadata(buffer);
  return { format, bytes };
};
