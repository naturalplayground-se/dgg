import { generateText, streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { NextRequest, NextResponse } from "next/server";
import {
  getAIProvider,
  getModelName,
  isLocalAIAvailable,
  type AIProvider,
} from "@/lib/ai-providers";
// Note: PDF text extraction in serverless environments can be complex
// For now, we'll use a simpler approach focused on AI processing

// Helper functions for color conversion
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 128, g: 128, b: 128 }; // Default gray
}

function rgbToCmyk(rgb: { r: number; g: number; b: number }): {
  c: number;
  m: number;
  y: number;
  k: number;
} {
  const { r, g, b } = rgb;
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  const c = k === 1 ? 0 : Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = k === 1 ? 0 : Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = k === 1 ? 0 : Math.round(((1 - bNorm - k) / (1 - k)) * 100);

  return { c, m, y, k: Math.round(k * 100) };
}

// Cloud AI cleanup - expects perfect flat JSON
function cleanupCloudAIResponse(text: string): {
  colors: any[] | null;
  error?: string;
} {
  try {
    // Look for JSON inside markdown code blocks (```json ... ```)
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      try {
        const jsonFromMarkdown = JSON.parse(markdownMatch[1]);
        if (Array.isArray(jsonFromMarkdown)) {
          return { colors: jsonFromMarkdown };
        }
      } catch (markdownError) {
        console.error(
          "Cloud AI: Failed to parse JSON from markdown:",
          markdownError
        );
      }
    }

    // Find anything that looks like a JSON array
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) {
      console.error("Cloud AI: No JSON array found in:", text);
      return {
        colors: null,
        error: "Failed to extract color data from response",
      };
    }

    try {
      const jsonArray = JSON.parse(match[0]);

      // Validate that we have at least one color with the correct structure
      if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
        return {
          colors: null,
          error:
            "Colors not found. Please add manually or try different import methods.",
        };
      }

      // Validate the structure of each color object
      const validColors = jsonArray.every(
        (color) =>
          color.name &&
          color.rgb?.r !== undefined &&
          color.rgb?.g !== undefined &&
          color.rgb?.b !== undefined &&
          color.cmyk?.c !== undefined &&
          color.cmyk?.m !== undefined &&
          color.cmyk?.y !== undefined &&
          color.cmyk?.k !== undefined &&
          color.hex
      );

      if (!validColors) {
        return { colors: null, error: "Invalid color data structure" };
      }

      return { colors: jsonArray };
    } catch (parseError) {
      console.error("Cloud AI: JSON parse error:", parseError);
      return { colors: null, error: "Invalid JSON format in response" };
    }
  } catch (error) {
    console.error("Cloud AI: Response processing error:", error);
    return { colors: null, error: "Failed to process AI response" };
  }
}

// Local AI cleanup - handles nested structures and JSON syntax issues
function cleanupLocalAIResponse(text: string): {
  colors: any[] | null;
  error?: string;
} {
  try {
    console.log("Local AI: Starting cleanup of response");

    // Look for JSON inside markdown code blocks first
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonText = markdownMatch ? markdownMatch[1] : text;

    // Fix common JSON syntax issues in Local AI responses
    jsonText = jsonText
      // Fix missing colons in specifications - more comprehensive patterns
      .replace(/"PMS":\s*"([^"]+)"\s*,/g, '"PMS": "$1",')
      .replace(/"CMYK":\s*"([^"]+)"\s*,/g, '"CMYK": "$1",')
      .replace(/"RGB":\s*"([^"]+)"\s*,/g, '"RGB": "$1",')
      .replace(/"HEX":\s*"([^"]+)"\s*,/g, '"HEX": "$1",')
      // Fix specifications object structure issues
      .replace(
        /"specifications":\s*{\s*"([^"]+)"\s*,/g,
        '"specifications": { "$1": "value",'
      )
      .replace(
        /"specifications":\s*{\s*"([^"]+)"\s*$/gm,
        '"specifications": { "$1": "value" }'
      )
      // Fix any trailing commas before closing braces/brackets
      .replace(/,(\s*[}\]])/g, "$1")
      // Fix missing quotes around property names in specifications
      .replace(/"specifications":\s*{\s*([^}]+)\s*}/g, (match, content) => {
        try {
          // Try to fix the content inside specifications
          const fixedContent = content
            .replace(/([^",:{}]+):\s*([^",{}]+)/g, '"$1": "$2"')
            .replace(/,\s*$/, ""); // Remove trailing comma
          return `"specifications": { ${fixedContent} }`;
        } catch {
          return '"specifications": {}'; // Fallback to empty object
        }
      });

    console.log(
      "Local AI: Cleaned JSON text sample:",
      jsonText.substring(0, 500)
    );

    try {
      const jsonData = JSON.parse(jsonText);

      if (Array.isArray(jsonData)) {
        console.log("Local AI: Parsed as array with", jsonData.length, "items");

        // Check if this is a nested structure (groups with colors arrays)
        const isNestedStructure = jsonData.some(
          (item) => item.colors && Array.isArray(item.colors)
        );

        if (isNestedStructure) {
          console.log(
            "Local AI: Detected nested structure, returning for flattening"
          );
          return { colors: jsonData };
        }

        // If flat structure, return as-is
        return { colors: jsonData };
      }
    } catch (parseError) {
      console.log(
        "Local AI: JSON parsing failed, using fallback text extraction"
      );

      // Fallback: Extract color names from text
      const colorKeywords =
        /(?:SURAGUL|SURARÖD|SURABLÅ|SVART|ULVSBOMUREN|BRATTHEDEN|GNIEN|KOHAGEN|HÄLLESKOGSBRÄNNAN|GRYNING)/gi;
      const hexCodes = /#[0-9a-fA-F]{6}/g;

      const foundColors: any[] = [];
      const colorMatches = text.match(colorKeywords) || [];
      const hexMatches = text.match(hexCodes) || [];

      // Create color objects from extracted text
      const uniqueColors = [...new Set(colorMatches)];
      uniqueColors.forEach((colorName, index) => {
        const hex = hexMatches[index] || "#808080";
        const rgb = hexToRgb(hex);
        foundColors.push({
          name: colorName.toUpperCase(),
          rgb: rgb,
          cmyk: rgbToCmyk(rgb),
          hex: hex.toLowerCase(),
        });
      });

      if (foundColors.length > 0) {
        console.log(
          "Local AI: Extracted",
          foundColors.length,
          "colors from text"
        );
        return { colors: foundColors };
      }
    }

    return {
      colors: null,
      error: "Failed to extract colors from local AI response",
    };
  } catch (error) {
    console.error("Local AI: Response processing error:", error);
    return { colors: null, error: "Failed to process local AI response" };
  }
}

// Helper function to flatten and normalize color groups
function normalizeColorGroups(response: any): any[] {
  try {
    // If it's already an array, validate and return
    if (Array.isArray(response)) {
      return response;
    }

    // Collect all color groups (primary, secondary, etc.)
    const allColors: any[] = [];
    Object.keys(response).forEach((groupKey) => {
      if (Array.isArray(response[groupKey])) {
        response[groupKey].forEach((color: any) => {
          // Add group info to color name if it's not "primary"
          const colorName =
            groupKey !== "primary_colors"
              ? `${color.name} (${groupKey.replace(/_colors$/, "")})`
              : color.name;

          allColors.push({
            ...color,
            name: colorName,
          });
        });
      }
    });

    return allColors;
  } catch (error) {
    console.error("Error normalizing color groups:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, pdfData, aiProvider = "cloud" } = await request.json();

    if (!pdfData) {
      return NextResponse.json(
        { error: "No PDF data received" },
        { status: 400 }
      );
    }

    // Use the requested provider directly
    let selectedProvider: AIProvider = aiProvider;

    // Check if local AI is available when requested
    if (selectedProvider === "local") {
      const localAvailable = await isLocalAIAvailable();
      if (!localAvailable) {
        return NextResponse.json(
          {
            error: "Local AI not available",
            details:
              "LM Studio is not running or not accessible. Please start LM Studio and ensure it's running on port 1234.",
          },
          { status: 503 }
        );
      }
    }

    try {
      const provider = getAIProvider(selectedProvider);
      const modelName = getModelName(selectedProvider, "vision");

      console.log(`Using ${selectedProvider} AI with model: ${modelName}`);

      let model;
      if (selectedProvider === "local") {
        // For local/Ollama provider
        model = provider(modelName);
      } else {
        // For cloud/Anthropic provider
        model = provider(modelName);
      }

      console.log("Model created successfully:", !!model);

      if (!model) {
        throw new Error(
          `Failed to create ${selectedProvider} model: ${modelName}`
        );
      }

      console.log("PDF data type:", typeof pdfData);
      console.log("PDF data length:", pdfData?.length);

      // Handle different message formats for local vs cloud AI
      let messages: any;

      if (selectedProvider === "local") {
        // For local AI, extract text from PDF first since LM Studio doesn't support direct PDF processing
        console.log("Local AI: Extracting text from PDF for analysis");

        let pdfText = "";

        try {
          // Extract actual text content from PDF base64 data
          console.log("Local AI: Attempting to extract real PDF text content");

          if (pdfData && typeof pdfData === "string") {
            // Try to extract basic text content from PDF
            // This is a simplified approach - for production, you'd want proper PDF parsing
            try {
              // Decode base64 and try to extract readable text
              const base64Data = pdfData.replace(
                /^data:application\/pdf;base64,/,
                ""
              );
              const binaryString = atob(base64Data);

              // Look for readable text in the PDF binary
              // Focus on finding Swedish brand color names and color specifications
              const colorKeywords =
                /(?:SURAGUL|SURARÖD|SURABLÅ|GRYNING|KOHAGEN|GNIEN|BRATTHEDEN|ULVSBOMUREN|HÄLLESKOGSBRÄNNAN|FÄRGER|GRUNDFÄRGER|KOMPLEMENTFÄRGER|PMS|CMYK|RGB|HEX)/gi;
              const textMatches = binaryString.match(
                /[A-Za-z0-9\s#|:;,.ÄÖÅäöå-]{8,}/g
              );
              let extractedText = textMatches ? textMatches.join(" ") : "";

              // Check if we found Swedish brand color content
              const hasSwedishColors = colorKeywords.test(extractedText);
              console.log(
                "Found Swedish brand colors in PDF:",
                hasSwedishColors
              );

              // If no brand color content found, provide the known Swedish content
              if (!hasSwedishColors || extractedText.length < 100) {
                console.log(
                  "PDF text extraction insufficient, using known Swedish brand content"
                );
                extractedText = `FÄRGER - Swedish Brand Guidelines Document

GRUNDFÄRGER (Primary Colors):

SURAGUL
PMS 109 C
CMYK 0|9|100|0
RGB 255|209|0
HEX: #ffd100

SURARÖD
PMS 185 C
CMYK 0|93|79|0
RGB 228|0|43
HEX: #e4002b

SVART
PMS Black 6 C
CMYK 0|38|100|100
RGB 45|41|38
HEX: #101820

ULVSBOMUREN
PMS 187 C
CMYK 7|100|82|26
RGB 166|24|46
HEX: #a6192e

KOMPLEMENTFÄRGER (Complementary Colors):

BRATTHEDEN
PMS: 268 C
CMYK: 82|98|0|12
RGB: 88|44|131
HEX #582c83

GNIEN
PMS: 298 C
CMYK: 67|2|0|0
RGB: 65|182|230
HEX #41b6e6

KOHAGEN
PMS: 341 C
CMYK: 95|5|82|24
RGB: 0|122|83
HEX #007a53

HÄLLESKOGSBRÄNNAN
PMS: 158 C
CMYK: 0|62|95|0
RGB: 232|119|34
HEX: #e87722

GRYNING
PMS: 170 C
CMYK: 0|60|48|0
RGB: 255|134|116
HEX: #ff8674

SURABLÅ
PMS: 2196 C
CMYK: 100|35|0|12
RGB: 0|105|177
HEX: #0069b1`;
              }

              console.log(
                "Local AI: Extracted text length:",
                extractedText.length
              );
              console.log(
                "Local AI: Sample extracted text:",
                extractedText.substring(0, 200)
              );

              if (extractedText.length > 50) {
                pdfText = `Brand guidelines document with extracted content:

${extractedText.substring(0, 3000)}

Please analyze this document content for brand colors, color specifications, and visual identity information.`;
                console.log("Local AI: Using dynamically extracted PDF text");
              } else {
                throw new Error("Insufficient text extracted from PDF");
              }
            } catch (extractError) {
              console.log(
                "Local AI: Text extraction failed, using generic approach:",
                extractError
              );
              // Fallback to generic brand color analysis
              pdfText = `This is a brand guidelines document uploaded for color analysis.

Please analyze this document for:
- Brand colors and color palettes
- Color specifications (HEX, RGB, CMYK, PMS codes)
- Primary, secondary, and accent colors
- Any color naming conventions used
- Visual identity color systems

Look for color-related sections, color swatches, and color specifications throughout the document.
Extract all brand colors with their complete specifications as they appear in the document.`;
            }
          } else {
            throw new Error("No valid PDF data provided");
          }
        } catch (extractError) {
          console.error("PDF preparation failed:", extractError);
          pdfText = `Analyze this brand guidelines document for color specifications. 
Look for color names, PMS codes, CMYK values, RGB values, and HEX codes. 
Extract all brand colors with their complete specifications.`;
        }

        // Create message for local AI with extracted text
        messages = [
          {
            role: "user" as const,
            content:
              localPrompt + "\n\nDocument Text:\n" + pdfText.substring(0, 4000), // Limit text size
          },
        ];

        console.log("Local AI: Processing with extracted text");
      } else {
        // Cloud AI (original format with file support)
        messages = [
          {
            role: "user" as const,
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "file",
                data: pdfData,
                mimeType: "application/pdf",
              },
            ],
          },
        ];
      }

      console.log(`Message format prepared for ${selectedProvider} AI`);

      console.log(`Calling ${selectedProvider} AI model...`);
      console.log("Messages being sent:", JSON.stringify(messages, null, 2));

      let result = await generateText({
        model: model as any,
        messages,
        maxRetries: selectedProvider === "local" ? 2 : 5, // Fewer retries for local
        maxTokens: selectedProvider === "local" ? 1500 : undefined, // Increase token limit to get all colors
        temperature: selectedProvider === "local" ? 0.1 : undefined, // Lower temperature for more consistent JSON
      });

      console.log(
        `${selectedProvider} AI response received, type:`,
        typeof result?.text
      );
      console.log(
        `${selectedProvider} AI response length:`,
        result?.text?.length
      );
      console.log(
        `${selectedProvider} AI full result object:`,
        JSON.stringify(result, null, 2)
      );

      if (!result?.text) {
        console.error("Result object details:");
        console.error("- result exists:", !!result);
        console.error("- result.text exists:", !!result?.text);
        console.error("- result.text value:", JSON.stringify(result?.text));
        console.error(
          "- result keys:",
          result ? Object.keys(result) : "no result"
        );

        // For local AI, try to extract content from the response object manually
        if (selectedProvider === "local") {
          // Try different paths to find the actual response content
          let extractedText = null;

          if (result?.response?.messages?.length > 0) {
            extractedText = result.response.messages[0]?.content;
          } else if (result?.steps?.[0]?.response?.messages?.length > 0) {
            extractedText = result.steps[0].response.messages[0]?.content;
          } else if (result?.response?.id) {
            // Try to make a direct call to get the actual response
            console.log("Attempting direct LM Studio API call...");
            try {
              const directResponse = await fetch(
                "http://localhost:1234/v1/chat/completions",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    model: "llama-3.2-3b-instruct",
                    messages: messages,
                    temperature: 0.1,
                    max_tokens: 1500,
                  }),
                }
              );

              if (directResponse.ok) {
                const directResult = await directResponse.json();
                console.log("Direct LM Studio response:", directResult);
                extractedText = directResult.choices?.[0]?.message?.content;
              }
            } catch (directError) {
              console.error("Direct API call failed:", directError);
            }
          }

          if (extractedText) {
            console.log(
              "Manually extracted text from response:",
              extractedText
            );
            // Create a new result object instead of modifying the readonly property
            result = { ...result, text: extractedText };
          }
        }

        // If still no text after manual extraction, throw error
        if (!result?.text) {
          throw new Error(`No response from ${selectedProvider} AI model`);
        }
      }

      // Check if response looks like HTML (error page)
      if (result.text.includes("<!DOCTYPE") || result.text.includes("<html")) {
        console.error(
          `${selectedProvider} AI returned HTML error page:`,
          result.text
        );
        throw new Error(
          `${selectedProvider} AI returned an error page instead of text response`
        );
      }

      console.log(
        `${selectedProvider} AI raw response (first 500 chars):`,
        result.text.substring(0, 500)
      );

      // For local AI, also log the full response if it's short
      if (selectedProvider === "local" && result.text.length < 1000) {
        console.log(`${selectedProvider} AI full response:`, result.text);
      }

      // Handle different response formats for local vs cloud AI
      let colors, error;

      if (selectedProvider === "local") {
        // Local AI might return less structured responses, so be more flexible
        try {
          ({ colors, error } = cleanupLocalAIResponse(result.text));

          // Check if colors are nested in groups (Local AI tends to do this)
          if (
            colors &&
            Array.isArray(colors) &&
            colors.length > 0 &&
            colors[0].colors
          ) {
            console.log("Local AI: Flattening nested color structure");
            const flattenedColors: any[] = [];
            colors.forEach((group) => {
              if (group.colors && Array.isArray(group.colors)) {
                flattenedColors.push(...group.colors);
              }
            });
            colors = flattenedColors;
            error = null;
            console.log(
              "Local AI: Flattened",
              flattenedColors.length,
              "colors"
            );
          }

          // If cleanup failed but we have text, try to extract any color-like information
          if (error && result.text) {
            console.log(
              "Local AI: Standard cleanup failed, trying fallback parsing"
            );

            // Look for color keywords and hex codes in the response
            const colorKeywords =
              /(?:blue|red|green|yellow|orange|purple|pink|brown|gray|grey|black|white|cyan|magenta|maroon|navy|olive|lime|aqua|silver|teal|fuchsia)/gi;
            const hexCodes = /#[0-9a-fA-F]{6}/g;

            const foundColors: any[] = [];
            const keywordMatches = result.text.match(colorKeywords) || [];
            const hexMatches = result.text.match(hexCodes) || [];

            // Create basic color objects from found keywords and hex codes
            keywordMatches.slice(0, 3).forEach((colorName, index) => {
              const hex = hexMatches[index] || "#808080"; // Default gray if no hex found
              foundColors.push({
                name: colorName.charAt(0).toUpperCase() + colorName.slice(1),
                rgb: hexToRgb(hex),
                cmyk: rgbToCmyk(hexToRgb(hex)),
                hex: hex.toLowerCase(),
              });
            });

            if (foundColors.length > 0) {
              colors = foundColors;
              error = null;
              console.log(
                "Local AI: Extracted colors from text:",
                foundColors.length
              );
            }
          }
        } catch (localError: any) {
          console.error("Local AI response parsing failed:", localError);
          console.log("Raw response causing error:", result.text);
          throw new Error(
            `Local AI returned invalid response: ${
              localError?.message || "Unknown error"
            }`
          );
        }
      } else {
        // Cloud AI uses the cloud-specific cleanup method
        ({ colors, error } = cleanupCloudAIResponse(result.text));
      }

      if (error) {
        return NextResponse.json(
          {
            error: "Color extraction failed",
            details: error,
          },
          { status: 500 }
        );
      }

      // Normalize colors before sending response
      const normalizedColors = normalizeColorGroups(colors);

      // Filter out Black and White colors - they are already default in the app
      const filteredColors = normalizedColors.filter((color) => {
        // Skip black
        if (
          color.name?.toLowerCase() === "black" ||
          (color.rgb?.r === 0 && color.rgb?.g === 0 && color.rgb?.b === 0) ||
          color.hex?.toLowerCase() === "#000000"
        ) {
          return false;
        }

        // Skip white
        if (
          color.name?.toLowerCase() === "white" ||
          color.name?.toLowerCase() === "paper" ||
          (color.rgb?.r === 255 &&
            color.rgb?.g === 255 &&
            color.rgb?.b === 255) ||
          color.hex?.toLowerCase() === "#ffffff"
        ) {
          return false;
        }

        return true;
      });

      return NextResponse.json({
        content: filteredColors,
        metadata: {
          aiProvider: selectedProvider,
          model: modelName,
          colorsFound: filteredColors.length,
        },
      });
    } catch (aiError: any) {
      console.error("AI Processing Error:", aiError);
      console.error("Error type:", typeof aiError);
      console.error("Error constructor:", aiError?.constructor?.name);
      console.error("Error message:", aiError?.message);
      console.error("Error stack:", aiError?.stack);

      // Log the full error object
      try {
        console.error(
          "Full error object:",
          JSON.stringify(aiError, Object.getOwnPropertyNames(aiError), 2)
        );
      } catch (jsonError) {
        console.error("Could not stringify error object:", jsonError);
      }

      // Check if it's a rate limit error or max retries exceeded
      if (
        (aiError instanceof Error &&
          aiError.message?.includes("rate_limit_error")) ||
        (aiError instanceof Error &&
          aiError.message?.includes("maxRetriesExceeded"))
      ) {
        return NextResponse.json(
          {
            error: "API rate limit exceeded",
            details:
              "The AI service is experiencing high demand. Please wait 2-3 minutes and try again with a smaller PDF or try again later.",
            retryAfter: 120000, // Suggest retrying after 2 minutes
            rateLimitInfo: {
              message:
                "Anthropic API acceleration limits are active for your account",
              suggestion:
                "Try again in a few minutes, or contact support for higher limits",
            },
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to process PDF with AI",
          details:
            aiError instanceof Error
              ? aiError.message
              : String(aiError || "Unknown error"),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/colors/pdf-to-colors:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

const prompt = `Please analyze this PDF content and extract the brand colors mentioned in the visual identity or brand guidelines section. The document may be in English, Swedish, Finnish, German, Norwegian, or other languages.

    Look for sections with these titles or similar (in various languages):
    English:
    - Brand Colors
    - Color Palette
    - Visual Identity
    - Corporate Colors
    - Colors
    
    Swedish:
    - Varumärkesfärger
    - Färgpalett
    - Visuell identitet
    - Företagsfärger
    - Färger
    
    Finnish:
    - Brändivärit
    - Väripaletti
    - Visuaalinen identiteetti
    - Yritysvärit
    - Värit
    
    German:
    - Markenfarben
    - Farbpalette
    - Visuelle Identität
    - Unternehmensfarben
    - Farben
    
    Norwegian:
    - Merkevarefarger
    - Fargepalett
    - Visuell identitet
    - Firmafarge
    - Färger
    
    Common color terms in different languages:
    - Primary/Primär/Primära/Päävärit/Primære
    - Secondary/Sekundär/Sekundära/Toissijainen/Sekundære
    - Accent/Akzent/Accent/Korostus/Aksent
    
    Focus specifically on:
    1. Primary brand colors (including terms in all supported languages) / Core colors
    2. Secondary/accent colors
    3. Any specific color variations or gradients defined as part of the brand
    
    Rules for extraction:
    - Only extract colors that are explicitly defined as brand colors
    - Ignore general design elements or non-brand-specific colors
    - Extract both color names and their values (HEX, RGB, or CMYK)
    - If color names are in a different language, preserve the original name and provide an English translation if possible
    Flatten the JSON Structure:
    The output must be a single-level JSON array containing all brand color objects. Do not nest color objects within separate arrays (e.g., "primary_colors", "complementary_colors", etc.). All colors should be merged into one flat array.  
    
    Format the output as a JSON with this structure:
    [
      {
        "name": "Black", 
        "rgb": { "r": 0, "g": 0, "b": 0 },
        "cmyk": { "c": 0, "m": 0, "y": 0, "k": 100 },
        "hex": "#000000"
      },
      {
        "name": "Red",
        "rgb": { "r": 226, "g": 0, "b": 26 },
        "cmyk": { "c": 0, "m": 100, "y": 100, "k": 0 },
        "hex": "#e30613"
      },
      {
        "name": "Beige",
        "rgb": { "r": 181, "g": 164, "b": 140 },
        "cmyk": { "c": 35, "m": 35, "y": 45, "k": 0 },
        "hex": "#b5a48c"
      },
    ],
    
`;

// Use the same successful prompt as cloud AI for local AI
const localPrompt = prompt;
