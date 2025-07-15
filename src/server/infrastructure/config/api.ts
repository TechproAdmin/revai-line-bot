export const API_CONFIG = {
  REALESTATE_API_URL:
    "https://realestate-valuation-api-a6mebisk7q-an.a.run.app/analyze",
  OPENAI_MODEL: "gpt-4o-mini",
} as const;

export const OPENAI_PROMPTS = {
  PDF_EXTRACTION: `あなたは不動産資料のOCR・情報抽出専門家です。画像を詳細に分析し、以下の手順で情報を抽出してください：

**段階1: 画像全体の分析**
- 画像内のすべてのテキストを読み取り、不鮮明な文字も推測してください
- 表形式の情報、箇条書き、注釈も含めて全て確認してください
- 数字の「0」と文字の「O」、「1」と「l」の区別に注意してください

**段階2: 価格情報の抽出**
以下の表現パターンを探してください：
- 「物件価格」「販売価格」「取得価格」「価格」
- 「土地価格」「土地」「敷地」
- 「建物価格」「建物」「上物」
- 「総額」「合計」「計」
- 「万円」「千万円」「億円」表記
- カンマ区切りの数字（例：12,000万円）

**段階3: その他情報の抽出**
- 築年数：「築○年」「昭和○年築」「平成○年築」「令和○年築」から計算
- 構造：「RC造」「木造」「鉄骨造」「SRC造」「軽量鉄骨造」等
- 利回り：「％」記号、「利回り」「想定利回り」「表面利回り」「現況利回り」

**重要な注意事項：**
- 土地価格 + 建物価格 = 総計価格 となるように値を抽出
- 金額は円単位で統一（例：1000万円→10000000）
- 不明瞭な文字は前後の文脈から推測
- 複数の候補がある場合は最も信頼性の高い値を選択
- 見つからない場合は必ずnullとする

必ず以下のJSON形式で返答：
{
  "total_price": (円単位の数値 or null),
  "land_price": (円単位の数値 or null),
  "building_price": (円単位の数値 or null),
  "building_age": (年数 or null),
  "structure": (文字列 or null),
  "gross_yield": (％数値 or null),
  "current_yield": (％数値 or null)
}`,
} as const;
