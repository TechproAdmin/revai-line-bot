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
        // チャートコンテナの強制横並び設定
        const chartContainer = clonedDoc.querySelector(
          ".chart-container",
        ) as HTMLElement;
        if (chartContainer) {
          chartContainer.style.setProperty("display", "flex", "important");
          chartContainer.style.setProperty(
            "flex-direction",
            "row",
            "important",
          );
          chartContainer.style.setProperty("flex-wrap", "wrap", "important");
          chartContainer.style.setProperty("gap", "15px", "important");
          chartContainer.style.setProperty(
            "justify-content",
            "space-between",
            "important",
          );

          // 各チャートのサイズ調整
          const chartWrappers = chartContainer.children;
          Array.from(chartWrappers).forEach((wrapper, index) => {
            const wrapperElement = wrapper as HTMLElement;
            wrapperElement.style.setProperty(
              "flex",
              "1 1 calc(33.333% - 10px)",
              "important",
            );
            wrapperElement.style.setProperty("min-width", "350px", "important");
            wrapperElement.style.setProperty("max-width", "450px", "important");
          });
        }

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
    const margin = 10;

    // コンテンツエリアの計算
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    // 縦横両方を考慮してコンテンツ全体が収まるようスケール
    const scaleX = contentWidth / canvas.width;
    const scaleY = contentHeight / canvas.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    // 余白を最小限に調整
    const x = margin + (contentWidth - scaledWidth) / 2;
    const y = margin + (contentHeight - scaledHeight) / 2;

    // PDFに画像を追加
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      x,
      y,
      scaledWidth,
      scaledHeight,
    );

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
