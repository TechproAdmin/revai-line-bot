export function Footer() {
  return (
    <footer className="text-center text-sm text-gray-500 mt-8 pb-4 space-y-2">
      <div className="text-xs text-gray-400">
        本サービスは入力された値に基づき計算を行い、レポートを作成するものです。
        <br />
        実際の収益性を担保するものではございません。
      </div>
      <div>
        © 2025 RevAI. Operated by{" "}
        <a
          href="https://www.techpro-j.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 underline hover:text-gray-700"
          style={{ textDecorationSkipInk: "none" }}
        >
          Tech Property Japan Co.,Ltd.
        </a>
      </div>
    </footer>
  );
}
