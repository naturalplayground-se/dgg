import { createFont } from "fonteditor-core";

const FONT_FAMILY = "CustomSvgA";
const FONT_FILE_NAME = "custom-a.ttf";
const LETTER_A_CODE = 65;
const SPACE_CODE = 32;
const SPACE_ADVANCE_WIDTH = 300;
const PRESENTATION_ATTRIBUTES = [
  "fill",
  "stroke",
  "stroke-width",
  "fill-rule",
  "opacity",
  "fill-opacity",
];
const UNSUPPORTED_TAGS = [
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

function parseStyleRules(document) {
  const rules = new Map();
  const cssText = Array.from(document.querySelectorAll("style"))
    .map((styleElement) => styleElement.textContent || "")
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const classRulePattern = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g;
  let match = classRulePattern.exec(cssText);

  while (match) {
    const [, className, declarationBlock] = match;
    const declarations = declarationBlock
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .reduce((current, declaration) => {
        const separatorIndex = declaration.indexOf(":");

        if (separatorIndex === -1) {
          return current;
        }

        const property = declaration.slice(0, separatorIndex).trim();
        const value = declaration.slice(separatorIndex + 1).trim();

        if (PRESENTATION_ATTRIBUTES.includes(property) && value) {
          current[property] = value;
        }

        return current;
      }, {});

    rules.set(className, declarations);
    match = classRulePattern.exec(cssText);
  }

  return rules;
}

function inlineStyleRules(document, rules) {
  Array.from(document.querySelectorAll("[class]")).forEach((element) => {
    const classNames = element
      .getAttribute("class")
      .split(/\s+/)
      .filter(Boolean);

    classNames.forEach((className) => {
      const declarations = rules.get(className);

      if (!declarations) {
        return;
      }

      Object.entries(declarations).forEach(([property, value]) => {
        if (!element.hasAttribute(property)) {
          element.setAttribute(property, value);
        }
      });
    });

    element.removeAttribute("class");
  });
}

function removeClipPaths(document) {
  Array.from(document.querySelectorAll("clipPath")).forEach((element) => {
    element.remove();
  });

  Array.from(document.querySelectorAll("[clip-path]")).forEach((element) => {
    element.removeAttribute("clip-path");
  });
}

function removeStyleElements(document) {
  Array.from(document.querySelectorAll("style")).forEach((element) => {
    element.remove();
  });
}

function removeEmptyDefs(document) {
  Array.from(document.querySelectorAll("defs")).forEach((element) => {
    if (!element.children.length && !element.textContent.trim()) {
      element.remove();
    }
  });
}

function unwrapEmptyGroups(document) {
  let unwrappedGroup = true;

  while (unwrappedGroup) {
    unwrappedGroup = false;

    Array.from(document.querySelectorAll("g")).forEach((group) => {
      if (group.attributes.length > 0 || !group.parentNode) {
        return;
      }

      while (group.firstChild) {
        group.parentNode.insertBefore(group.firstChild, group);
      }

      group.remove();
      unwrappedGroup = true;
    });
  }
}

function normalizeSvg(svgText) {
  try {
    const document = getSvgDocument(svgText);
    const rules = parseStyleRules(document);

    inlineStyleRules(document, rules);
    removeClipPaths(document);
    removeStyleElements(document);
    removeEmptyDefs(document);
    unwrapEmptyGroups(document);

    return new XMLSerializer().serializeToString(document);
  } catch (err) {
    return svgText;
  }
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

export function createTtfFromSvg(svgText, options = {}) {
  const preservePathDetail = options.preservePathDetail ?? true;
  const document = getSvgDocument(svgText);
  const warnings = getUnsupportedWarnings(document);
  const normalizedSvgText = normalizeSvg(svgText);
  const sourceGlyph = getGlyphFromSvg(normalizedSvgText);
  const font = createFont();
  const helper = font.getHelper();

  helper.addGlyf(createSpaceGlyph());
  helper.addGlyf(createAGlyph(sourceGlyph));
  applyFontNames(font);

  if (!preservePathDetail) {
    font.optimize();
  }

  return {
    bytes: font.write({ type: "ttf", toBuffer: false }),
    fileName: FONT_FILE_NAME,
    fontFamily: FONT_FAMILY,
    glyph: "A",
    warnings,
  };
}
