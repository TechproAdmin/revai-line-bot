import {
  analyzePdfWithOpenAI,
  analyzePdfWithOpenAIMock,
  calcReport,
  calcReportMock,
} from "@/server/infrastructure/api";

const isProduction = process.env.APP_ENV === "production";

const apiRoot = {
  analyzePdfWithOpenAI: isProduction
    ? analyzePdfWithOpenAI
    : analyzePdfWithOpenAIMock,
  calcReport: isProduction ? calcReport : calcReportMock,
};

export default apiRoot;
