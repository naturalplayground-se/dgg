/**
 * Extract document color swatches from InDesign IDML.
 * Swatches live in Resources/Graphic.xml; Styles.xml may duplicate some entries.
 */

function clamp255(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function clamp100(n) {
  return Math.max(0, Math.min(100, n));
}

function rgbToHex(r, g, b) {
  const to = (x) => x.toString(16).padStart(2, "0");
  return `#${to(clamp255(r))}${to(clamp255(g))}${to(clamp255(b))}`;
}

/** Approximate CMYK (0–100) from sRGB for styles.json `cmyk` string. */
function rgbToCmykString(r, g, b) {
  const r1 = clamp255(r) / 255;
  const g1 = clamp255(g) / 255;
  const b1 = clamp255(b) / 255;
  const k = 1 - Math.max(r1, g1, b1);
  if (k >= 1 - 1e-6) {
    return "0,0,0,100";
  }
  const c = (1 - r1 - k) / (1 - k);
  const m = (1 - g1 - k) / (1 - k);
  const y = (1 - b1 - k) / (1 - k);
  return `${Math.round(c * 100)},${Math.round(m * 100)},${Math.round(
    y * 100
  )},${Math.round(k * 100)}`;
}

function cmykToRgb(c, m, y, k) {
  const c1 = clamp100(c) / 100;
  const m1 = clamp100(m) / 100;
  const y1 = clamp100(y) / 100;
  const k1 = clamp100(k) / 100;
  return {
    r: Math.round(255 * (1 - c1) * (1 - k1)),
    g: Math.round(255 * (1 - m1) * (1 - k1)),
    b: Math.round(255 * (1 - y1) * (1 - k1)),
  };
}

const KAPPA = 24389 / 27;

/**
 * CIELAB (D65) to sRGB. L typically 0–100, a/b roughly −128–127.
 */
function labToRgb(L, a, b) {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const delta = 6 / 29;

  function finv(ft) {
    if (ft > delta) {
      return ft * ft * ft;
    }
    return (116 * ft - 16) / KAPPA;
  }

  const X = 0.95047 * finv(fx);
  const Y = 1.0 * finv(fy);
  const Z = 1.08883 * finv(fz);

  let R = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
  let G = X * -0.969266 + Y * 1.8760108 + Z * 0.041556;
  let B = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;

  function srgbChannel(c) {
    const v =
      c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return clamp255(Math.round(v * 255));
  }

  return {
    r: srgbChannel(R),
    g: srgbChannel(G),
    b: srgbChannel(B),
  };
}

function parseColorParts(raw) {
  return raw
    .trim()
    .split(/[\s,]+/)
    .filter((s) => s.length > 0)
    .map((s) => parseFloat(s));
}

/**
 * @param {Element} el InDesign IDML Color element
 * @returns {{ name: string, rgb: string, cmyk: string } | null}
 */
export function idmlColorElementToStyle(el) {
  const name = el.getAttribute("Name");
  if (!name || name === "None") {
    return null;
  }

  const model = el.getAttribute("Model") || "";
  if (model === "MixedInkGroup" || model === "MixedInkGroupChild") {
    return null;
  }

  const spaceRaw = (el.getAttribute("Space") || "").toUpperCase();
  const rawValue = el.getAttribute("ColorValue") || "";
  const parts = parseColorParts(rawValue);

  if (parts.length === 0) {
    return null;
  }

  let rgbHex;
  let cmykStr;

  if (spaceRaw === "LAB" && parts.length >= 3) {
    const { r, g, b } = labToRgb(parts[0], parts[1], parts[2]);
    rgbHex = rgbToHex(r, g, b);
    cmykStr = rgbToCmykString(r, g, b);
  } else if (spaceRaw === "RGB" && parts.length >= 3) {
    const [r, g, b] = parts;
    rgbHex = rgbToHex(r, g, b);
    cmykStr = rgbToCmykString(r, g, b);
  } else if (
    (spaceRaw === "CMYK" || parts.length >= 4) &&
    parts.length >= 4
  ) {
    const c = parts[0];
    const m = parts[1];
    const y = parts[2];
    const k = parts[3];
    const maxVal = Math.max(c, m, y, k, 1);
    const scale = maxVal > 1.01 ? 1 : 100;
    const cn = clamp100((c / scale) * 100);
    const mn = clamp100((m / scale) * 100);
    const yn = clamp100((y / scale) * 100);
    const kn = clamp100((k / scale) * 100);
    const { r, g, b } = cmykToRgb(cn, mn, yn, kn);
    rgbHex = rgbToHex(r, g, b);
    cmykStr = `${Math.round(cn)},${Math.round(mn)},${Math.round(yn)},${Math.round(
      kn
    )}`;
  } else if (parts.length === 3) {
    const [r, g, b] = parts;
    rgbHex = rgbToHex(r, g, b);
    cmykStr = rgbToCmykString(r, g, b);
  } else {
    return null;
  }

  return { name, rgb: rgbHex, cmyk: cmykStr };
}

function collectColorsFromXmlDoc(xmlDoc) {
  const list = xmlDoc.getElementsByTagNameNS("*", "Color");
  const out = [];
  for (let i = 0; i < list.length; i++) {
    out.push(list[i]);
  }
  return out;
}

function prioritizeBlackPaper(colors) {
  const isBlack = (c) => /^black$/i.test(c.name);
  const isPaper = (c) => /^paper$/i.test(c.name);
  const black = colors.filter(isBlack);
  const paper = colors.filter(isPaper);
  const rest = colors.filter((c) => !isBlack(c) && !isPaper(c));
  return [...black, ...paper, ...rest];
}

/**
 * Build styles.json `colors` array: all swatches from Graphic.xml (and any extra
 * Color definitions in Styles.xml), with Black/Paper first when present.
 *
 * @param {string | null | undefined} graphicXml
 * @param {string | null | undefined} stylesXml
 * @returns {{ name: string, rgb: string, cmyk: string }[]}
 */
export function buildIdmlSwatchColors(graphicXml, stylesXml) {
  const parser = new DOMParser();
  const bySelf = new Map();
  const order = [];

  function ingestDoc(xmlString, label) {
    if (!xmlString || typeof xmlString !== "string") {
      return;
    }
    const doc = parser.parseFromString(xmlString, "text/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      console.warn(`idmlColors: failed to parse ${label}`);
      return;
    }
    const elements = collectColorsFromXmlDoc(doc);
    for (const el of elements) {
      const self = el.getAttribute("Self") || "";
      const style = idmlColorElementToStyle(el);
      if (!style) {
        continue;
      }
      const key = self || `${style.name}\t${style.rgb}\t${style.cmyk}`;
      if (bySelf.has(key)) {
        continue;
      }
      bySelf.set(key, style);
      order.push(key);
    }
  }

  ingestDoc(graphicXml, "Resources/Graphic.xml");
  ingestDoc(stylesXml, "Resources/Styles.xml");

  const merged = order.map((k) => bySelf.get(k));
  return prioritizeBlackPaper(merged);
}
