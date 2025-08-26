import fs from "node:fs";
import path from "node:path";
import { Client } from "@line/bot-sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@/server/utils/logger";

interface ErrorResponse {
  error: string;
  details?: string;
}

interface SuccessResponse {
  success: boolean;
  messageId?: string;
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>,
) {
  const startTime = Date.now();
  const logContext = logger.apiStart("SEND_PDF", req);

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
    const { pdfBuffer, userId } = req.body;

    if (!pdfBuffer || !userId) {
      const errorResponse: ErrorResponse = {
        error: "PDFバッファとユーザーIDが必要です",
        details: "pdfBuffer and userId are required",
      };
      logger.logResponse(res, logContext, errorResponse);
      return res.status(400).json(errorResponse);
    }

    // PDFバッファをBase64デコード
    const buffer = Buffer.from(pdfBuffer, "base64");

    // LINE Bot SDKクライアントを初期化
    const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!channelAccessToken) {
      logger.error("LINE_CHANNEL_ACCESS_TOKEN is missing", { ...logContext });
      throw new Error("LINE_CHANNEL_ACCESS_TOKEN is required");
    }

    const client = new Client({
      channelAccessToken,
    });

    logger.info("Initialized LINE Bot client", { ...logContext });

    // PDFファイルを一時ディレクトリに保存
    const filename = `report_${userId}_${Date.now()}.pdf`;
    const tempDir = path.join(process.cwd(), "temp", "pdfs");
    const filePath = path.join(tempDir, filename);

    // 一時ディレクトリが存在しない場合は作成
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // PDFファイルを保存
    fs.writeFileSync(filePath, buffer);

    // PDFダウンロード用のURL
    const downloadUrl = `${req.headers.origin || process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/download-pdf?file=${filename}`;

    // LINEメッセージを送信
    logger.info("Sending message to LINE user", {
      ...logContext,
      userId,
      messageLength: downloadUrl.length,
    });

    try {
      await client.pushMessage(userId, {
        type: "text",
        text: `収益性分析レポートが完成しました！\n\n📊 ファイル名: 収益性分析レポート.pdf \n📁 サイズ: ${(buffer.length / 1024).toFixed(1)}KB\n\n⬇️ PDFをダウンロード:\n${downloadUrl}\n\n※このリンクは24時間有効です。`,
      });

      logger.info("Successfully sent LINE message", { ...logContext, userId });
    } catch (lineError) {
      logger.error("Failed to send LINE message", {
        ...logContext,
        userId,
        error:
          lineError instanceof Error ? lineError.message : String(lineError),
        errorStack: lineError instanceof Error ? lineError.stack : undefined,
      });
      throw lineError;
    }

    const responseData: SuccessResponse = {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
    logger.logResponse(res, logContext, responseData);
    logger.apiEnd("SEND_PDF", logContext, res, startTime);
    return res.status(200).json(responseData);
  } catch (error) {
    const errorInstance =
      error instanceof Error ? error : new Error(String(error));
    logger.apiError("SEND_PDF", logContext, errorInstance);

    const errorResponse: ErrorResponse = {
      error: "PDF送信中にエラーが発生しました",
      details: errorInstance.message,
    };
    logger.logResponse(res, logContext, errorResponse);
    return res.status(500).json(errorResponse);
  }
}
