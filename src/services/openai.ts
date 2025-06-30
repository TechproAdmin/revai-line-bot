import fs from "node:fs/promises";
import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/src/resources/chat/completions/completions.js";
import type { PdfExtractionResult } from "@/components/types";
import { API_CONFIG, OPENAI_PROMPTS } from "@/config/api";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

async function createImageContents(
  imagePaths: string[],
): Promise<ChatCompletionContentPart[]> {
  return Promise.all(
    imagePaths.map(async (imagePath) => {
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString("base64");
      return {
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${imageBase64}`,
        },
      } as ChatCompletionContentPart;
    }),
  );
}

function createDefaultExtractionResult(): PdfExtractionResult {
  return {
    total_price: null,
    land_price: null,
    building_price: null,
    building_age: null,
    structure: null,
    gross_yield: null,
    current_yield: null,
  };
}

export async function analyzePdfWithOpenAI(
  imagePaths: string[],
): Promise<PdfExtractionResult> {
  try {
    if (imagePaths.length === 0) {
      throw new Error("No images provided for analysis");
    }

    const imageContents = await createImageContents(imagePaths);

    const response = await openai.chat.completions.create({
      model: API_CONFIG.OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: OPENAI_PROMPTS.PDF_EXTRACTION,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "この不動産資料から情報を抽出してください。複数の画像は同じPDFの連続したページです。",
            },
            ...imageContents,
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";

    try {
      const extractedData = JSON.parse(content) as PdfExtractionResult;
      return {
        total_price: extractedData.total_price,
        land_price: extractedData.land_price,
        building_price: extractedData.building_price,
        building_age: extractedData.building_age,
        structure: extractedData.structure,
        gross_yield: extractedData.gross_yield,
        current_yield: extractedData.current_yield,
      };
    } catch (parseError) {
      console.error("Error parsing JSON from OpenAI response:", parseError);
      return createDefaultExtractionResult();
    }
  } catch (error) {
    console.error("Error analyzing images with OpenAI:", error);
    return createDefaultExtractionResult();
  }
}
