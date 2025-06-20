import type { NextApiRequest, NextApiResponse } from "next";
import apiRoot from "@/utils/api";
import { logger } from "@/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const startTime = Date.now();
  const logContext = logger.apiStart("REPORT_GENERATION", req);

  logger.logRequest(req, logContext);

  if (req.method === "POST") {
    try {
      logger.info("Starting report calculation", logContext);
      const report = await apiRoot.calcReport(req.body);

      const responseData = { data: report };
      logger.logResponse(res, logContext, responseData);
      logger.apiEnd("REPORT_GENERATION", logContext, res, startTime);
      return res.status(200).json(responseData);
    } catch (error) {
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));
      logger.apiError("REPORT_GENERATION", logContext, errorInstance);

      const errorResponse = {
        error: "レポート生成中にエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
      };
      logger.logResponse(res, logContext, errorResponse);
      return res.status(500).json(errorResponse);
    }
  }

  logger.warn("Method not allowed", { ...logContext, method: req.method });
  const methodNotAllowedResponse = { message: "Method Not Allowed" };
  logger.logResponse(res, logContext, methodNotAllowedResponse);
  res.status(405).json(methodNotAllowedResponse);
}
