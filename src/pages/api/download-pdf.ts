import fs from "node:fs";
import path from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/server/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const startTime = Date.now();
  const logContext = logger.apiStart("DOWNLOAD_PDF", req);

  logger.logRequest(req, logContext);

  if (req.method !== "GET") {
    logger.warn("Method not allowed", { ...logContext, method: req.method });
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { file } = req.query;

    if (!file || typeof file !== "string") {
      logger.warn("Missing or invalid file parameter", { ...logContext, file });
      return res.status(400).json({ error: "ファイル名が必要です" });
    }

    // ファイル名のバリデーション（セキュリティ対策）
    if (!/^report_[\w-]+_\d+\.pdf$/.test(file)) {
      logger.warn("Invalid filename format", { ...logContext, file });
      return res.status(400).json({ error: "無効なファイル名です" });
    }

    const tempDir = path.join(process.cwd(), "temp", "pdfs");
    const filePath = path.join(tempDir, file);

    // ファイルの存在確認
    if (!fs.existsSync(filePath)) {
      logger.warn("File not found", { ...logContext, filePath });
      return res.status(404).json({ error: "ファイルが見つかりません" });
    }

    // ファイルの作成日時をチェック（24時間制限）
    const stats = fs.statSync(filePath);
    const fileAge = Date.now() - stats.mtime.getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (fileAge > twentyFourHours) {
      // 期限切れファイルを削除
      fs.unlinkSync(filePath);
      logger.warn("File expired and deleted", {
        ...logContext,
        filePath,
        fileAge,
      });
      return res
        .status(410)
        .json({ error: "ファイルの有効期限が切れています" });
    }

    // ファイルを読み込み
    const fileBuffer = fs.readFileSync(filePath);

    // レスポンスヘッダーを設定
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent("収益性分析レポート.pdf")}"`,
    );
    res.setHeader("Content-Length", fileBuffer.length);

    logger.info("PDF download successful", {
      ...logContext,
      filename: file,
      fileSize: fileBuffer.length,
    });

    logger.apiEnd("DOWNLOAD_PDF", logContext, res, startTime);

    // ファイルを送信
    return res.status(200).send(fileBuffer);
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.apiError("DOWNLOAD_PDF", logContext, errorInstance);

    return res.status(500).json({
      error: "ファイルのダウンロード中にエラーが発生しました",
      details: errorInstance.message,
    });
  }
}
