import fs from "node:fs";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/server/utils/logger";

interface CleanupResponse {
  success: boolean;
  deletedFiles: number;
  totalFiles: number;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CleanupResponse | ErrorResponse>,
) {
  const startTime = Date.now();
  const logContext = logger.apiStart("CLEANUP_PDFS", req);

  logger.logRequest(req, logContext);

  if (req.method !== "POST") {
    logger.warn("Method not allowed", { ...logContext, method: req.method });
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const tempDir = path.join(process.cwd(), "temp", "pdfs");

    if (!fs.existsSync(tempDir)) {
      logger.info("Temp directory does not exist", { ...logContext, tempDir });
      return res
        .status(200)
        .json({ success: true, deletedFiles: 0, totalFiles: 0 });
    }

    const files = fs.readdirSync(tempDir);
    const twentyFourHours = 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      if (!file.endsWith(".pdf")) continue;

      const filePath = path.join(tempDir, file);

      try {
        const stats = fs.statSync(filePath);
        const fileAge = Date.now() - stats.mtime.getTime();

        if (fileAge > twentyFourHours) {
          fs.unlinkSync(filePath);
          deletedCount++;
          logger.info("Expired file deleted", {
            ...logContext,
            filename: file,
            fileAge: `${Math.round(fileAge / (1000 * 60 * 60))} hours`,
          });
        }
      } catch (fileError) {
        logger.warn("Error processing file", {
          ...logContext,
          filename: file,
          error:
            fileError instanceof Error ? fileError.message : String(fileError),
        });
      }
    }

    const responseData: CleanupResponse = {
      success: true,
      deletedFiles: deletedCount,
      totalFiles: files.filter((f) => f.endsWith(".pdf")).length - deletedCount,
    };

    logger.info("Cleanup completed", {
      ...logContext,
      deletedFiles: deletedCount,
      remainingFiles: responseData.totalFiles,
    });

    logger.logResponse(res, logContext, responseData);
    logger.apiEnd("CLEANUP_PDFS", logContext, res, startTime);
    return res.status(200).json(responseData);
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.apiError("CLEANUP_PDFS", logContext, errorInstance);

    const errorResponse: ErrorResponse = {
      error: "クリーンアップ中にエラーが発生しました",
      details: errorInstance.message,
    };
    logger.logResponse(res, logContext, errorResponse);
    return res.status(500).json(errorResponse);
  }
}
