import OpenAI from "openai";
import fs from "fs/promises";
import { PdfExtractionResult, RealEstateAnalysisReq, RealEstateAnalysisRes } from "@/components/types";
import axios from "axios";

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

// PDFをOpenAIに直接送信して分析する関数
async function analyzePdfWithOpenAI(pdfPath: string): Promise<PdfExtractionResult> {
    try {
        // PDFファイルを読み込む
        const pdfBuffer = await fs.readFile(pdfPath);
        const pdfBase64 = pdfBuffer.toString("base64");

        // OpenAI APIにリクエストを送信
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "あなたは不動産資料から情報を抽出する専門家です。PDFから以下の情報を抽出してください：物件価格(総計)、物件価格(土地)、物件価格(建物)、築年数、建物構造、表面利回り、現況利回り。見つからない情報はnullとしてください。JSON形式で返答してください。"
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "この不動産資料から情報を抽出してください。" },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:application/pdf;base64,${pdfBase64}`,
                            },
                        },
                    ],
                },
            ],
            response_format: { type: "json_object" },
        });

        // レスポンスからJSONデータを取得
        const content = response.choices[0]?.message?.content || "{}";
        console.log("OpenAI response:", content);

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
    } catch (error) {
        console.error("Error analyzing PDF with OpenAI:", error);
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
}

// モック関数（テスト用）
async function analyzePdfWithOpenAIMock(pdfPath: string): Promise<PdfExtractionResult> {
    return {
        total_price: "35000000",
        land_price: "18000000",
        building_price: "17000000",
        building_age: "15",
        structure: "鉄筋コンクリート",
        gross_yield: "6.8",
        current_yield: "5.9"
    };
}

// 不動産投資APIを呼び出して分析レポートを取得する関数
async function calcReport(data: RealEstateAnalysisReq): Promise<RealEstateAnalysisRes> {
    try {
        const response = await axios.post<RealEstateAnalysisRes>(
            'https://realestate-valuation-api-a6mebisk7q-an.a.run.app/analyze',
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error calling real estate analysis API:", error);
        throw error;
    }
}

const apiRoot = {
    analyzePdfWithOpenAI: analyzePdfWithOpenAIMock,
    calcReport: calcReport
};

export default apiRoot;
