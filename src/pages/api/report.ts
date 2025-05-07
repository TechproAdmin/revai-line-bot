import { NextApiRequest, NextApiResponse } from "next";
import apiRoot from "@/utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const report = await apiRoot.calcReport(req.body);
    return res.status(200).json({ data: report });
  }
  res.status(405).json({ message: "Method Not Allowed" });
}
