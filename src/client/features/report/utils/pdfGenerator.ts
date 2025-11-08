import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePDF(
  reportElement: HTMLElement,
  downloadButtonId: string,
): Promise<void> {
  // ローディング状態を表示
  const button = document.getElementById(downloadButtonId);
  if (button) {
    button.textContent = "PDFを準備中...";
    button.setAttribute("disabled", "true");
  }

  try {
    // チャートが完全にレンダリングされるのを待つ
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // レポートのクローンを作成してPDF専用のスタイルを適用
    const clonedReport = reportElement.cloneNode(true) as HTMLElement;
    clonedReport.id = "pdf-report-clone";

    // クローンを一時的にドキュメントに追加（レンダリングのため）
    clonedReport.style.position = "absolute";
    clonedReport.style.left = "-9999px";
    clonedReport.style.width = "1000px"; // A4最大サイズ

    document.body.appendChild(clonedReport);

    // 条件と結果の表を縦並びで大きく表示
    const container = clonedReport.querySelector(
      ".conditions-results-container",
    ) as HTMLElement;
    if (container) {
      container.style.setProperty("display", "flex", "important");
      container.style.setProperty("flex-direction", "column", "important");
      container.style.setProperty("gap", "30px", "important");
      container.style.setProperty("margin-bottom", "40px", "important");

      const conditionsSection = container.querySelector(
        ".conditions-section",
      ) as HTMLElement;
      const resultsSection = container.querySelector(
        ".results-section",
      ) as HTMLElement;

      if (conditionsSection) {
        conditionsSection.style.setProperty("width", "100%", "important");
        conditionsSection.style.setProperty("font-size", "18px", "important");
        // テーブル内のすべての要素に文字サイズを適用
        const allElements = conditionsSection.querySelectorAll("*");
        allElements.forEach((el) => {
          (el as HTMLElement).style.setProperty(
            "font-size",
            "18px",
            "important",
          );
        });
      }
      if (resultsSection) {
        resultsSection.style.setProperty("width", "100%", "important");
        resultsSection.style.setProperty("font-size", "18px", "important");
        // テーブル内のすべての要素に文字サイズを適用
        const allElements = resultsSection.querySelectorAll("*");
        allElements.forEach((el) => {
          (el as HTMLElement).style.setProperty(
            "font-size",
            "18px",
            "important",
          );
        });
      }

      // 表の後に改ページを挿入
      const pageBreak = document.createElement("div");
      pageBreak.style.setProperty("page-break-after", "always", "important");
      pageBreak.style.setProperty("break-after", "page", "important");
      pageBreak.style.setProperty("height", "1px", "important");
      container.after(pageBreak);
    }

    // チャートを縦並びにする（html2canvas前に設定）
    const chartContainer = clonedReport.querySelector(
      ".chart-container",
    ) as HTMLElement;
    if (chartContainer) {
      // チャートコンテナの前に余白を追加して新しいページから開始（値を小さく調整）
      chartContainer.style.setProperty("margin-top", "90px", "important");
      chartContainer.style.setProperty("display", "flex", "important");
      chartContainer.style.setProperty("flex-direction", "column", "important");
      chartContainer.style.setProperty("gap", "10px", "important");
      chartContainer.style.setProperty("margin-bottom", "0", "important");
      chartContainer.style.setProperty("padding", "0", "important");

      const chartWrappers = chartContainer.querySelectorAll(":scope > div");
      chartWrappers.forEach((wrapper) => {
        const wrapperElement = wrapper as HTMLElement;
        wrapperElement.style.setProperty("width", "100%", "important");
        wrapperElement.style.setProperty("height", "auto", "important");
        wrapperElement.style.setProperty("margin", "0", "important");
        wrapperElement.style.setProperty("margin-left", "25px", "important");
        wrapperElement.style.setProperty("margin-bottom", "85px", "important");
        wrapperElement.style.setProperty("padding", "0", "important");
        wrapperElement.style.setProperty("min-height", "0", "important");
        wrapperElement.style.setProperty("max-height", "none", "important");
        // チャート全体を拡大
        wrapperElement.style.setProperty(
          "transform",
          "scale(1.3)",
          "important",
        );
        wrapperElement.style.setProperty(
          "transform-origin",
          "top left",
          "important",
        );

        // グラフ内のdivの高さを変更
        const allDivs = wrapperElement.querySelectorAll("div");
        allDivs.forEach((div) => {
          const divElement = div as HTMLElement;
          // 余計なマージン・パディングを削除
          divElement.style.setProperty("margin-top", "0", "important");
          divElement.style.setProperty("margin-bottom", "0", "important");
          divElement.style.setProperty("padding-top", "0", "important");
          divElement.style.setProperty("padding-bottom", "0", "important");
        });
      });
    }

    // レンダリングを待つ
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // コンテンツをキャンバスとして取得
    const canvas = await html2canvas(clonedReport, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 1000,
      windowWidth: 1000,
      ignoreElements: (element) => {
        return element.id === downloadButtonId;
      },
      onclone: (clonedDoc) => {
        // onclone内では特別な処理なし（既にclonedReportで設定済み）

        // PDF用フッターを表示
        const pdfFooters = clonedDoc.querySelectorAll(".pdf-footer");
        pdfFooters.forEach((footer) => {
          const footerElement = footer as HTMLElement;
          footerElement.style.setProperty("display", "block", "important");
          footerElement.style.setProperty("visibility", "visible", "important");
          footerElement.style.setProperty("opacity", "1", "important");
          footerElement.style.setProperty("height", "auto", "important");
          footerElement.style.setProperty("overflow", "visible", "important");
        });

        // すべての要素のスタイルを修正
        const allElements = clonedDoc.querySelectorAll("*");
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            // PDF生成時はhidden属性を削除
            if (el.hasAttribute("hidden")) {
              el.removeAttribute("hidden");
            }

            const computedStyle = window.getComputedStyle(el);

            [
              "color",
              "background-color",
              "border-color",
              "outline-color",
              "text-decoration-color",
            ].forEach((prop) => {
              const value = computedStyle.getPropertyValue(prop);
              if (
                value &&
                !value.includes("oklch") &&
                !value.includes("lab") &&
                !value.includes("lch")
              ) {
                el.style.setProperty(prop, value, "important");
              } else if (
                value &&
                (value.includes("oklch") ||
                  value.includes("lab") ||
                  value.includes("lch"))
              ) {
                switch (prop) {
                  case "color":
                    el.style.setProperty(prop, "#000000", "important");
                    break;
                  case "background-color":
                    el.style.setProperty(prop, "transparent", "important");
                    break;
                  case "border-color":
                    el.style.setProperty(prop, "#e5e7eb", "important");
                    break;
                  default:
                    el.style.setProperty(prop, "#000000", "important");
                }
              }
            });

            if (el.classList) {
              const classesToRemove: string[] = [];
              el.classList.forEach((className) => {
                if (
                  className.includes("text-") ||
                  className.includes("bg-") ||
                  className.includes("border-")
                ) {
                  classesToRemove.push(className);
                }
              });
              for (const className of classesToRemove) {
                el.classList.remove(className);
              }
            }
          }
        });

        const styleElements = clonedDoc.querySelectorAll("style");
        for (const el of styleElements) {
          el.remove();
        }
      },
    });

    // クローンを削除
    document.body.removeChild(clonedReport);

    // PDF生成 - A4サイズ
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // A4サイズの寸法を取得
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    // コンテンツエリアの計算
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    // 幅を基準にスケーリング
    const scale = contentWidth / canvas.width;
    const scaledWidth = contentWidth;
    const scaledHeight = canvas.height * scale;

    // 必要なページ数を計算
    const totalPages = Math.ceil(scaledHeight / contentHeight);

    // 各ページに分割して配置
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      // 現在のページで表示する canvas の Y 位置とサイズを計算
      const sourceY = (page * contentHeight) / scale;
      const sourceHeight = Math.min(
        contentHeight / scale,
        canvas.height - sourceY,
      );

      // canvas から該当部分を切り出して新しい canvas を作成
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;

      const pageCtx = pageCanvas.getContext("2d");
      if (pageCtx) {
        // 元の canvas から該当部分をコピー
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight,
        );

        // このページ用の画像データを取得
        const pageImgData = pageCanvas.toDataURL("image/png");

        // PDFに画像を追加
        const destHeight = sourceHeight * scale;
        pdf.addImage(
          pageImgData,
          "PNG",
          margin,
          margin,
          scaledWidth,
          destHeight,
        );
      }
    }

    // PDFを保存
    pdf.save("RevAI｜収益性レポート.pdf");

    // ボタンの状態をリセット
    if (button) {
      button.textContent = "PDFをダウンロード";
      button.removeAttribute("disabled");
    }
  } catch (error) {
    console.error("PDF生成エラー:", error);

    // ボタンの状態をリセット
    if (button) {
      button.textContent = "PDFをダウンロード";
      button.removeAttribute("disabled");
    }

    alert("PDFの生成中にエラーが発生しました。");
  }
}
