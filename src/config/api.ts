export const API_CONFIG = {
  REALESTATE_API_URL:
    "https://realestate-valuation-api-a6mebisk7q-an.a.run.app/analyze",
  OPENAI_MODEL: "gpt-4o-mini",
} as const;

export const OPENAI_PROMPTS = {
  PDF_EXTRACTION: `あなたは不動産資料から情報を抽出する専門家です。画像から以下の情報を正確に抽出してください：

**重要な注意事項：**
- 物件価格(土地)と物件価格(建物)は、物件価格(総計)を土地価格と建物価格に分けたものです
- 土地価格 + 建物価格 = 総計価格 となるように値を抽出してください
- 「土地」「建物」という文字と一緒に記載されている金額を優先的に抽出してください
- 総計価格が記載されているが土地・建物の内訳がない場合は、土地・建物価格はnullとしてください

**抽出する情報：**
- 物件価格(総計) → total_price：物件の総購入価格
- 物件価格(土地) → land_price：土地部分のみの価格
- 物件価格(建物) → building_price：建物部分のみの価格
- 築年数 → building_age：建築からの経過年数
- 建物構造 → structure：RC造、木造、鉄骨造など
- 表面利回り → gross_yield：満室想定時の利回り
- 現況利回り → current_yield：現在の実際の利回り

見つからない情報はnullとしてください。必ず以下のJSON形式で返答してください：
{
  "total_price": (値),
  "land_price": (値),
  "building_price": (値),
  "building_age": (値),
  "structure": (値),
  "gross_yield": (値),
  "current_yield": (値)
}`,
} as const;
