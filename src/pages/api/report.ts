import apiRoot from "@/utils/api";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    try {
      const report = await apiRoot.calcReport(req.body);
      return res.status(200).json({ data: report });
    } catch (error) {
      console.error("Error in report API:", error);
      return res.status(500).json({
        error: "レポート生成中にエラーが発生しました",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  res.status(405).json({ message: "Method Not Allowed" });
}
