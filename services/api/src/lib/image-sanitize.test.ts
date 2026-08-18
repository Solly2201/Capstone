import { describe, expect, it } from "vitest";
import { detectImageFormat, stripImageMetadata } from "./image-sanitize.js";

/**
 * Fixtures are hand-built containers rather than real photographs: the
 * sanitiser walks container structure and never decodes pixels, so a
 * structurally valid file with a known secret in its metadata is a
 * sharper test than a real JPEG whose EXIF we would have to trust.
 */

const GPS_SECRET = "GPS:19.0760N,72.8777E-DEVICE-SERIAL-1234";

const jpegSegment = (marker: number, payload: Buffer) => {
  const header = Buffer.from([0xff, marker, 0x00, 0x00]);
  header.writeUInt16BE(payload.length + 2, 2);
  return Buffer.concat([header, payload]);
};

const buildJpeg = () =>
  Buffer.concat([
    Buffer.from([0xff, 0xd8]), // SOI
    jpegSegment(0xe1, Buffer.concat([Buffer.from("Exif\0\0"), Buffer.from(GPS_SECRET)])), // APP1 EXIF
    jpegSegment(0xfe, Buffer.from("comment: taken at home")), // COM
    jpegSegment(0xdb, Buffer.from([0x00, 0x01, 0x02, 0x03])), // DQT (structural)
    Buffer.from([0xff, 0xda, 0x00, 0x02]), // SOS
    Buffer.from([0x11, 0x22, 0x33, 0x44]), // entropy-coded data
    Buffer.from([0xff, 0xd9]) // EOI
  ]);

const pngChunk = (type: string, data: Buffer) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  return Buffer.concat([length, Buffer.from(type, "ascii"), data, Buffer.alloc(4)]);
};

const buildPng = () =>
  Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", Buffer.alloc(13)),
    pngChunk("tEXt", Buffer.concat([Buffer.from("Comment\0"), Buffer.from(GPS_SECRET)])),
    pngChunk("eXIf", Buffer.from(GPS_SECRET)),
    pngChunk("IDAT", Buffer.from([0x78, 0x9c, 0x63, 0x00])),
    pngChunk("IEND", Buffer.alloc(0))
  ]);

describe("detectImageFormat", () => {
  it("identifies images by magic bytes, not by a claimed type", () => {
    expect(detectImageFormat(buildJpeg())).toBe("image/jpeg");
    expect(detectImageFormat(buildPng())).toBe("image/png");
  });

  it("rejects anything that is not a supported image", () => {
    expect(detectImageFormat(Buffer.from("#!/bin/sh\nrm -rf /"))).toBeNull();
    expect(detectImageFormat(Buffer.from("GIF89a"))).toBeNull();
    expect(detectImageFormat(Buffer.alloc(0))).toBeNull();
    // A PDF renamed to .jpg with an image/jpeg content type.
    expect(detectImageFormat(Buffer.from("%PDF-1.7"))).toBeNull();
  });
});

describe("stripImageMetadata", () => {
  it("removes EXIF/GPS and comment segments from a JPEG", () => {
    const original = buildJpeg();
    expect(original.includes(GPS_SECRET)).toBe(true);

    const result = stripImageMetadata(original);

    expect(result).not.toBeNull();
    expect(result!.format).toBe("image/jpeg");
    expect(result!.bytes.includes(GPS_SECRET)).toBe(false);
    expect(result!.bytes.includes("comment: taken at home")).toBe(false);
    expect(result!.bytes.length).toBeLessThan(original.length);
  });

  it("keeps the JPEG structurally intact", () => {
    const bytes = stripImageMetadata(buildJpeg())!.bytes;

    // Still starts with SOI and retains the quantisation table and scan.
    expect(bytes.subarray(0, 2).equals(Buffer.from([0xff, 0xd8]))).toBe(true);
    expect(bytes.includes(Buffer.from([0xff, 0xdb]))).toBe(true);
    expect(bytes.includes(Buffer.from([0xff, 0xda]))).toBe(true);
    // The entropy-coded scan data is preserved byte for byte.
    expect(bytes.includes(Buffer.from([0x11, 0x22, 0x33, 0x44]))).toBe(true);
  });

  it("removes text and eXIf chunks from a PNG while keeping image data", () => {
    const original = buildPng();
    expect(original.includes(GPS_SECRET)).toBe(true);

    const result = stripImageMetadata(original);

    expect(result).not.toBeNull();
    expect(result!.format).toBe("image/png");
    expect(result!.bytes.includes(GPS_SECRET)).toBe(false);
    expect(result!.bytes.includes("tEXt")).toBe(false);
    expect(result!.bytes.includes("eXIf")).toBe(false);
    expect(result!.bytes.includes("IHDR")).toBe(true);
    expect(result!.bytes.includes("IDAT")).toBe(true);
    expect(result!.bytes.includes("IEND")).toBe(true);
  });

  it("returns null for a non-image so callers must reject it", () => {
    expect(stripImageMetadata(Buffer.from("<?php system($_GET[0]); ?>"))).toBeNull();
  });

  it("does not hang or throw on truncated input", () => {
    const truncatedJpeg = buildJpeg().subarray(0, 8);
    const truncatedPng = buildPng().subarray(0, 20);

    expect(() => stripImageMetadata(truncatedJpeg)).not.toThrow();
    expect(() => stripImageMetadata(truncatedPng)).not.toThrow();
  });
});
