import axios from "axios";
import type {
  RealEstateAnalysisReq,
  RealEstateAnalysisRes,
} from "@/components/types";
import { API_CONFIG } from "@/config/api";

type ExternalApiResponse = Omit<RealEstateAnalysisRes, "conditions">;

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
