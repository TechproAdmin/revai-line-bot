import fs from "node:fs/promises";
import axios from "axios";
import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/src/resources/chat/completions/completions.js";
import { API_CONFIG, OPENAI_PROMPTS } from "@/server/infrastructure/config/api";
import type {
  PdfExtractionResult,
  RealEstateAnalysisReq,
  RealEstateAnalysisRes,
} from "@/shared/types";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

type ExternalApiResponse = Omit<RealEstateAnalysisRes, "conditions">;

// Helper functions
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

// Production API implementations
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

export async function calcReport(
  data: RealEstateAnalysisReq,
): Promise<RealEstateAnalysisRes> {
  try {
    const response = await axios.post<ExternalApiResponse>(
      API_CONFIG.REALESTATE_API_URL,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30秒のタイムアウト
      },
    );

    return {
      conditions: data,
      ...response.data,
    };
  } catch (error) {
    console.error("Error calling real estate analysis API:", error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(
          `API Error: ${error.response.status} - ${error.response.statusText}`,
        );
      } else if (error.request) {
        throw new Error("Network Error: No response received from API");
      }
    }
    throw new Error("Failed to analyze real estate data");
  }
}

// Mock implementations
export async function analyzePdfWithOpenAIMock(
  _imagePaths: string[],
): Promise<PdfExtractionResult> {
  return {
    total_price: "35000000",
    land_price: "18000000",
    building_price: "17000000",
    building_age: "15",
    structure: "鉄筋コンクリート",
    gross_yield: "6.8",
    current_yield: "5.9",
  };
}

export async function calcReportMock(
  data: RealEstateAnalysisReq,
): Promise<RealEstateAnalysisRes> {
  return {
    conditions: data,
    annual_rent_income: [
      0, 8000000, 7524000, 7448760, 7374272.4, 7300529.676, 7227524.37924,
      7155249.1354476, 7083696.644093123, 7012859.677652192, 6942731.080875671,
      6873303.770066913, 6804570.732366244, 6736525.025042582,
      6669159.774792155, 6602468.177044234, 6536443.495273792,
      6471079.060321054, 6406368.269717843, 6342304.5870206645,
      6278881.541150458, 6216092.725738954, 6153931.798481564,
      6092392.480496748, 6031468.5556917805, 5971153.870134862,
      5911442.331433514, 5852327.908119178, 5793804.6290379865,
      5735866.5827476075, 5678507.916920131,
    ],
    net_operating_income: [
      0, 7440000, 6964000, 6888760, 6814272.4, 6740529.676, 6667524.37924,
      6595249.1354476, 6523696.644093123, 6452859.677652192, 6382731.080875671,
      6313303.770066913, 6244570.732366244, 6176525.025042582,
      6109159.774792155, 6042468.177044234, 5976443.495273792,
      5911079.060321054, 5846368.269717843, 5782304.5870206645,
      5718881.541150458, 5656092.725738954, 5593931.798481564,
      5532392.480496748, 5471468.5556917805, 5411153.870134862,
      5351442.331433514, 5292327.908119178, 5233804.6290379865,
      5175866.5827476075, 5118507.916920131,
    ],
    annual_loan_repayment: [
      0, 3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226, 3860948.3261541226, 3860948.3261541226,
      3860948.3261541226,
    ],
    annual_principal_payment: [
      0, 1629535.8979300559, 1670744.3463876098, 1712994.8929212838,
      1756313.89058353, 1800728.3588546962, 1846266.0004961938,
      1892955.218829468, 1940825.1354521066, 1989905.6084020734,
      2040227.2507809699, 2091821.449848473, 2144720.3865997046,
      2198957.0558374077, 2254565.286752045, 2311579.7640221044,
      2370036.0494480133, 2429970.6041333303, 2491420.8112266213,
      2554424.9992385954, 2619022.4659488723, 2685253.5029172897,
      2753159.420615062, 2822782.5741914064, 2894166.389892027,
      2967355.392145306, 3042395.2313336954, 3119332.712267466,
      3198215.823378183, 3279093.7666509748, 3362016.988313105,
    ],
    annual_interest_payment: [
      0, 2231412.4282240667, 2190203.9797665128, 2147953.4332328388,
      2104634.4355705925, 2060219.9672994264, 2014682.3256579288,
      1967993.1073246547, 1920123.190702016, 1871042.7177520492,
      1820721.0753731527, 1769126.8763056495, 1716227.939554418,
      1661991.270316715, 1606383.0394020774, 1549368.5621320182,
      1490912.2767061093, 1430977.7220207923, 1369527.5149275013,
      1306523.3269155272, 1241925.8602052503, 1175694.8232368329,
      1107788.9055390605, 1038165.7519627162, 966781.9362620958,
      893592.9340088167, 818553.0948204272, 741615.6138866567,
      662732.5027759396, 581854.5595031478, 498931.33784101764,
    ],
    loan_balance: [
      90000000, 88370464.10206994, 86699719.75568233, 84986724.86276105,
      83230410.97217752, 81429682.61332282, 79583416.61282663,
      77690461.39399716, 75749636.25854506, 73759730.65014298,
      71719503.39936201, 69627681.94951354, 67482961.56291384,
      65284004.50707643, 63029439.22032438, 60717859.45630228,
      58347823.406854264, 55917852.802720934, 53426431.99149431,
      50872006.99225572, 48252984.526306845, 45567731.023389556,
      42814571.60277449, 39991789.02858309, 37097622.63869106,
      34130267.246545754, 31087872.01521206, 27968539.302944593,
      24770323.47956641, 21491229.712915435, 18129212.724602327,
    ],
    befor_tax_cash_flow: [
      -18000000, 3579051.6738458774, 3103051.6738458774, 3027811.6738458774,
      2953324.073845878, 2879581.3498458774, 2806576.053085877,
      2734300.8092934773, 2662748.3179390007, 2591911.3514980697,
      2521782.754721548, 2452355.4439127906, 2383622.4062121217,
      2315576.6988884597, 2248211.4486380327, 2181519.8508901116,
      2115495.1691196696, 2050130.7341669318, 1985419.9435637207,
      1921356.2608665419, 1857933.2149963356, 1795144.3995848312,
      1732983.4723274414, 1671444.1543426258, 1610520.229537658,
      1550205.5439807395, 1490494.0052793915, 1431379.5819650558,
      1372856.302883864, 1314918.256593485, 1257559.5907660085,
    ],
    cumulative_cash_flow: [
      -18000000, -14420948.326154122, -11317896.652308244, -8290084.978462366,
      -5336760.904616488, -2457179.5547706108, 349396.49831526633,
      3083697.3076087437, 5746445.625547744, 8338356.977045814,
      10860139.731767362, 13312495.175680153, 15696117.581892274,
      18011694.280780733, 20259905.729418766, 22441425.580308877,
      24556920.749428548,
    ],
    depreciation_expense: [
      0, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000,
      1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000,
      1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000, 1200000,
      1200000, 1200000, 1200000, 1200000, 1200000, 1200000,
    ],
    tax_amount: [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
    ],
    after_tax_cash_flow: [
      -18000000, 3579051.6738458774, 3103051.6738458774, 3027811.6738458774,
      2953324.073845878, 2879581.3498458774, 2806576.053085877,
      2734300.8092934773, 2662748.3179390007, 2591911.3514980697,
      2521782.754721548, 2452355.4439127906, 2383622.4062121217,
      2315576.6988884597, 2248211.4486380327, 2181519.8508901116,
      2115495.1691196696, 2050130.7341669318, 1985419.9435637207,
      1921356.2608665419, 1857933.2149963356, 1795144.3995848312,
      1732983.4723274414, 1671444.1543426258, 1610520.229537658,
      1550205.5439807395, 1490494.0052793915, 1431379.5819650558,
      1372856.302883864, 1314918.256593485, 1257559.5907660085,
    ],
    net_present_value: [
      -18000000, -14503448.326154122, -11400096.652308244, -8372284.978462366,
      -5418960.904616488, -2539379.5547706108, 361196.49831526633,
      3133497.3076087437, 5796245.625547744, 8388156.977045814,
      10909939.731767362, 13362295.175680153, 15745917.581892274,
      18061494.280780733, 20309705.729418766, 22491225.580308877,
      24606720.749428548,
    ],
    noi_yield: 0.08266666666666667,
    free_clearly_return: 0.03976724088550984,
    cash_on_cash_return: 0.19883620410254874,
    internal_rate_of_return: 0.19883620410254874,
    payback_period: 5.0,
    sale_gross_yield: 0.06666666666666667,
    return_on_investment: 0.19883620410254874,
    debt_service_coverage_ratio: 1.9272727272727272,
    loan_to_value: 0.8,
    dead_cross_year: 0,
    total_pl: 24606720.749428548,
  };
}
