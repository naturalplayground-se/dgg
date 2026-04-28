import { createFont } from "fonteditor-core";

const FONT_FAMILY = "CustomSvgA";
const FONT_FILE_NAME = "custom-a.ttf";
const LETTER_A_CODE = 65;
const SPACE_CODE = 32;
const SPACE_ADVANCE_WIDTH = 300;
const UNSUPPORTED_TAGS = [
  "clipPath",
  "filter",
  "foreignObject",
  "image",
  "linearGradient",
  "mask",
  "pattern",
  "radialGradient",
  "text",
];

function getSvgDocument(svgText) {
  if (!svgText || !svgText.trim().includes("<svg")) {
    throw new Error("Please upload a valid SVG file.");
  }

  if (typeof DOMParser === "undefined") {
    throw new Error("SVG parsing is only available in the browser.");
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(svgText, "image/svg+xml");
  const parseError = document.querySelector("parsererror");

  if (parseError) {
    throw new Error("The SVG could not be parsed. Please check the file.");
  }

  if (!document.querySelector("svg")) {
    throw new Error("The file does not contain an SVG root element.");
  }

  return document;
}

function getUnsupportedWarnings(document) {
  return UNSUPPORTED_TAGS.filter((tagName) => document.querySelector(tagName)).map(
    (tagName) =>
      `${tagName} elements may not be preserved. Use filled vector paths for best results.`,
  );
}

function getGlyphFromSvg(svgText) {
  const sourceFont = createFont(svgText, {
    type: "svg",
    combinePath: true,
  });
  const sourceGlyph = sourceFont.get().glyf?.[0];

  if (!sourceGlyph?.contours?.length) {
    throw new Error(
      "No vector contours were found. Convert strokes/text/images to filled paths and try again.",
    );
  }

  return sourceGlyph;
}

function createSpaceGlyph() {
  return {
    contours: [],
    xMin: 0,
    yMin: 0,
    xMax: 0,
    yMax: 0,
    advanceWidth: SPACE_ADVANCE_WIDTH,
    leftSideBearing: 0,
    name: "space",
    unicode: [SPACE_CODE],
  };
}

function createAGlyph(sourceGlyph) {
  return {
    ...sourceGlyph,
    advanceWidth: Math.max(sourceGlyph.advanceWidth || 0, sourceGlyph.xMax || 0),
    leftSideBearing: sourceGlyph.leftSideBearing || 0,
    name: "A",
    unicode: [LETTER_A_CODE],
  };
}

function applyFontNames(font) {
  const fontObject = font.get();
  fontObject.name = {
    ...fontObject.name,
    fontFamily: FONT_FAMILY,
    fontSubFamily: "Regular",
    uniqueSubFamily: `${FONT_FAMILY} Regular`,
    version: "Version 1.0",
    postScriptName: `${FONT_FAMILY}-Regular`,
    fullName: `${FONT_FAMILY} Regular`,
  };
  font.set(fontObject);
}

export function createTtfFromSvg(svgText) {
  const document = getSvgDocument(svgText);
  const warnings = getUnsupportedWarnings(document);
  const sourceGlyph = getGlyphFromSvg(svgText);
  const font = createFont();
  const helper = font.getHelper();

  helper.addGlyf(createSpaceGlyph());
  helper.addGlyf(createAGlyph(sourceGlyph));
  applyFontNames(font);
  font.optimize();

  return {
    bytes: font.write({ type: "ttf", toBuffer: false }),
    fileName: FONT_FILE_NAME,
    fontFamily: FONT_FAMILY,
    glyph: "A",
    warnings,
  };
}
