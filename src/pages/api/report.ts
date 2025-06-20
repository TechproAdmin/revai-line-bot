import type { NextApiRequest, NextApiResponse } from "next";
import apiRoot from "@/utils/api";
import { logger } from "@/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const startTime = Date.now();
  const logContext = logger.apiStart("REPORT_GENERATION");

  if (req.method === "POST") {
    try {
      logger.info("Starting report calculation", logContext);
      const report = await apiRoot.calcReport(req.body);

      logger.apiEnd("REPORT_GENERATION", logContext, startTime);
      return res.status(200).json({ data: report });
    } catch (error) {
      const errorInstance =
        error instanceof Error ? error : new Error(String(error));
      logger.apiError("REPORT_GENERATION", logContext, errorInstance);

      return res.status(500).json({
        error: "レポート生成中にエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  logger.warn("Method not allowed", { ...logContext, method: req.method });
  res.status(405).json({ message: "Method Not Allowed" });
}
