import { saveAs } from "file-saver";

const CORS_PROXIES = [
  "https://api.codetabs.com/v1/proxy/?quest=",
  "https://api.allorigins.win/raw?url=",
  "https://thingproxy.freeboard.io/fetch/",
  "https://corsproxy.io/?",
];

const EC_TOKEN =
  "3bb2a6e53c9684ffdc9a9bf71d5b2a620e68abb153386c46ebe547292f11a96176a59ec4f0c7aacfef2663c08018dc100eedf850c284fb72392ba910777487b32ba21c08cc8c33d00bda49e7e2cc90baff01835518dde43e2e8d5ebf7b76545fc2687ab10bc2b0911a141f3cf7f04f3cac438a135f";

const UNICODE_PARAM = "AAAAAQAAAAEAAAAB";

export const URLTypes = Object.freeze({
  Invalid: 0,
  FontFamily: 1,
  FontCollection: 2,
});

function prependHttps(url) {
  if (
    !url.toLowerCase().startsWith("http://") &&
    !url.toLowerCase().startsWith("https://")
  ) {
    return "https://" + url;
  }
  return url;
}

export function getURLType(url) {
  if (url.indexOf("fonts.adobe.com/collections") !== -1) {
    return URLTypes.FontCollection;
  } else if (url.indexOf("fonts.adobe.com/fonts") !== -1) {
    return URLTypes.FontFamily;
  }
  return URLTypes.Invalid;
}

function buildTypekitURL(id, fvd) {
  return `https://use.typekit.net/pf/tk/${id}/${fvd}/l?unicode=${UNICODE_PARAM}&features=ALL&v=3&ec_token=${EC_TOKEN}`;
}

function getOrderedProxies() {
  let lastIndex = 0;
  try {
    const stored = parseInt(localStorage.getItem("cors_proxy_index"), 10);
    if (!isNaN(stored) && stored < CORS_PROXIES.length) {
      lastIndex = stored;
    }
  } catch {
    // localStorage unavailable
  }

  const ordered = [...CORS_PROXIES];
  ordered.splice(lastIndex, 1);
  ordered.unshift(CORS_PROXIES[lastIndex]);
  return ordered;
}

async function fetchViaProxy(url) {
  const ordered = getOrderedProxies();

  for (let i = 0; i < ordered.length; i++) {
    try {
      const response = await fetch(ordered[i] + url);
      if (response.ok) {
        const originalIndex = CORS_PROXIES.indexOf(ordered[i]);
        try {
          localStorage.setItem("cors_proxy_index", originalIndex);
        } catch {
          // ignore
        }
        return await response.text();
      }
    } catch {
      // try next proxy
    }
  }

  throw new Error(
    "All CORS proxies failed. Check your internet connection and try again."
  );
}

function extractJSON(html, searchPrefix) {
  const start = html.indexOf(searchPrefix);
  if (start === -1) {
    return null;
  }

  const sub = html.substring(start);

  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;

  for (let i = 0; i < sub.length; i++) {
    const ch = sub[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === "{" || ch === "[") {
      depth++;
    } else if (ch === "}" || ch === "]") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }

  if (end === -1) {
    return null;
  }

  try {
    return JSON.parse(sub.substring(0, end));
  } catch {
    return null;
  }
}

export async function getFontFamily(url) {
  url = prependHttps(url);
  const html = await fetchViaProxy(url);

  const json = extractJSON(html, '{"family":{"slug":"');
  if (!json) {
    throw new Error(
      "Could not parse font family data. Check that the URL is correct."
    );
  }

  const family = json.family;
  const defaultLang = family.display_font.default_language;
  const sampleText =
    json.textSampleData?.textSamples?.[defaultLang]?.list || "The quick brown fox jumps over the lazy dog";

  const designers = (family.designers || []).map((d) => {
    const info = json.designer_info?.[d.slug];
    return {
      name: d.name,
      url: info ? "https://fonts.adobe.com" + info.url : null,
    };
  });

  const fonts = (family.fonts || []).map((f) => ({
    url: buildTypekitURL(f.family.web_id, f.font.web.fvd),
    name: f.name,
    style: f.variation_name,
    familyName: f.preferred_family_name,
    familyUrl: "https://fonts.adobe.com/fonts/" + family.slug,
  }));

  return {
    name: family.name,
    foundry: family.foundry?.name || "",
    designers,
    fonts,
    sampleText,
  };
}

export async function getFontCollection(url) {
  url = prependHttps(url);
  const html = await fetchViaProxy(url);

  const json = extractJSON(html, '{"fontpack":{"all_valid_slugs":');
  if (!json) {
    throw new Error(
      "Could not parse font collection data. Check that the URL is correct."
    );
  }

  const pack = json.fontpack;
  const variations = pack.font_variations || [];
  const defaultLang = variations[0]?.default_language || "en";
  const sampleText =
    json.textSampleData?.textSamples?.[defaultLang]?.list || "The quick brown fox jumps over the lazy dog";

  const fonts = variations.map((v) => ({
    url: buildTypekitURL(v.opaque_id, v.fvd),
    name: v.full_display_name,
    style: v.variation_name,
    familyName: v.family?.name || "",
    familyUrl: v.family?.slug
      ? "https://fonts.adobe.com/fonts/" + v.family.slug
      : "",
  }));

  return {
    name: pack.name,
    foundry: "",
    designers: [{ name: pack.contributor_credit, url }],
    fonts,
    sampleText,
  };
}

export async function fetchFonts(url) {
  const type = getURLType(url);
  if (type === URLTypes.FontFamily) {
    return getFontFamily(url);
  } else if (type === URLTypes.FontCollection) {
    return getFontCollection(url);
  }
  throw new Error(
    "Invalid URL. Please enter a valid Adobe Fonts family or collection URL (e.g. fonts.adobe.com/fonts/... or fonts.adobe.com/collections/...)"
  );
}

async function ensureWawoff2() {
  if (typeof window === "undefined") return;
  if (window.Module?.decompress) return;

  await new Promise((resolve, reject) => {
    window.Module = { onRuntimeInitialized: resolve };
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/wawoff2@2.0.1/build/decompress_binding.js";
    script.onerror = () =>
      reject(new Error("Failed to load WOFF2 decompressor"));
    document.head.appendChild(script);
  });
}

async function convertWoff2ToTTF(woff2Bytes) {
  await ensureWawoff2();
  return window.Module.decompress(woff2Bytes);
}

export async function downloadFont(font) {
  const response = await fetch(font.url);
  if (!response.ok) {
    throw new Error(`Failed to download font: ${font.name}`);
  }
  const buffer = await response.arrayBuffer();
  const ttfBytes = await convertWoff2ToTTF(new Uint8Array(buffer));
  saveAs(new Blob([ttfBytes]), font.name + ".ttf");
}

export async function downloadAllFonts(fonts) {
  for (const font of fonts) {
    await downloadFont(font);
  }
}
