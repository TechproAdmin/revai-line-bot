import type { NextApiRequest, NextApiResponse } from "next";
import apiRoot from "@/utils/api";
import { logger } from "@/utils/logger";

interface ErrorResponse {
  error: string;
  details?: string;
}

interface SuccessResponse<T = unknown> {
  data: T;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>,
) {
  const startTime = Date.now();
  const logContext = logger.apiStart("REPORT_GENERATION", req);

  logger.logRequest(req, logContext);

  if (req.method !== "POST") {
    logger.warn("Method not allowed", { ...logContext, method: req.method });
    const methodNotAllowedResponse: ErrorResponse = {
      error: "Method Not Allowed",
      details: `Expected POST, received ${req.method}`,
    };
    logger.logResponse(res, logContext, methodNotAllowedResponse);
    return res.status(405).json(methodNotAllowedResponse);
  }

  try {
    if (!req.body) {
      const errorResponse: ErrorResponse = {
        error: "リクエストボディが必要です",
        details: "Request body is required for report generation",
      };
      logger.logResponse(res, logContext, errorResponse);
      return res.status(400).json(errorResponse);
    }

    logger.info("Starting report calculation", logContext);
    const report = await apiRoot.calcReport(req.body);

    const responseData: SuccessResponse = { data: report };
    logger.logResponse(res, logContext, responseData);
    logger.apiEnd("REPORT_GENERATION", logContext, res, startTime);
    return res.status(200).json(responseData);
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.apiError("REPORT_GENERATION", logContext, errorInstance);

    const errorResponse: ErrorResponse = {
      error: "レポート生成中にエラーが発生しました",
      details: errorInstance.message,
    };
    logger.logResponse(res, logContext, errorResponse);
    return res.status(500).json(errorResponse);
  }
}
