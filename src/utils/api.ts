import { analyzePdfWithOpenAI } from "@/services/openai";
import { calcReport } from "@/services/realestate";
import { analyzePdfWithOpenAIMock, calcReportMock } from "@/mocks/api";

const isProduction = process.env.APP_ENV === "production";

const apiRoot = {
  analyzePdfWithOpenAI: isProduction
    ? analyzePdfWithOpenAI
    : analyzePdfWithOpenAIMock,
  calcReport: isProduction ? calcReport : calcReportMock,
};

export default apiRoot;
