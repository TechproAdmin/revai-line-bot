import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePDF(
  reportElement: HTMLElement,
  downloadButtonId: string,
): Promise<undefined>;
export async function generatePDF(
  reportElement: HTMLElement,
  downloadButtonId: string,
  returnBuffer: true,
): Promise<Uint8Array>;
export async function generatePDF(
  reportElement: HTMLElement,
  downloadButtonId: string,
  returnBuffer?: boolean,
): Promise<undefined | Uint8Array> {
  // ローディング状態を表示
  const button = document.getElementById(downloadButtonId);
  let originalButtonText = "";
  if (button) {
    originalButtonText = button.textContent || "";
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
    clonedReport.style.width = "1123px"; // A4横の幅（297mm ≈ 1123px）

    document.body.appendChild(clonedReport);

    // コンテンツをキャンバスとして取得
    const canvas = await html2canvas(clonedReport, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 1123,
      windowWidth: 1123,
      ignoreElements: (element) => {
        return element.id === downloadButtonId;
      },
      onclone: (clonedDoc) => {
        // スタイルシートを削除してシンプルな見た目にする
        const styleElements = clonedDoc.querySelectorAll("style");
        for (const el of styleElements) {
          el.remove();
        }

        // 基本的なスタイルのみ適用
        const allElements = clonedDoc.querySelectorAll("*");
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            // PDF生成時はhidden属性を削除
            if (el.hasAttribute("hidden")) {
              el.removeAttribute("hidden");
            }

            // 基本的な色設定のみ
            el.style.setProperty("color", "#000000", "important");
            el.style.setProperty(
              "background-color",
              "transparent",
              "important",
            );
            el.style.setProperty("border-color", "#e5e7eb", "important");
          }
        });
      },
    });

    // クローンを削除
    document.body.removeChild(clonedReport);

    // PDF生成 - コンテンツサイズに合わせたカスタムサイズ
    const customWidth = canvas.width / 2 + 30; // キャンバス幅の半分 + 余白
    const customHeight = canvas.height / 2 + 30; // キャンバス高さの半分 + 余白

    const pdf = new jsPDF({
      orientation: customWidth > customHeight ? "landscape" : "portrait",
      unit: "pt",
      format: [customWidth, customHeight], // カスタムサイズ
    });

    // カスタムサイズなので余白を最小限に
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;

    // コンテンツをほぼページサイズいっぱいに表示
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    // カスタムサイズなのでスケールは1:1に近く
    const scaleX = contentWidth / canvas.width;
    const scaleY = contentHeight / canvas.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledWidth = canvas.width * scale;
    const scaledHeight = canvas.height * scale;

    // 中央に配置
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

    if (returnBuffer) {
      // PDFバッファを返す
      const pdfBuffer = pdf.output("arraybuffer");

      // ボタンの状態をリセット
      if (button) {
        button.textContent = originalButtonText;
        button.removeAttribute("disabled");
      }

      return new Uint8Array(pdfBuffer);
    } else {
      // PDFを保存
      pdf.save("収益性分析レポート.pdf");

      // ボタンの状態をリセット
      if (button) {
        button.textContent = originalButtonText;
        button.removeAttribute("disabled");
      }
    }
  } catch (error) {
    console.error("PDF生成エラー:", error);

    // ボタンの状態をリセット
    if (button) {
      button.textContent = originalButtonText;
      button.removeAttribute("disabled");
    }

    alert("PDFの生成中にエラーが発生しました。");
  }
}
