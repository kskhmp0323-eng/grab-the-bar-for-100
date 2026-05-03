export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#101418] text-white px-4 py-8">
      <div className="mx-auto max-w-md space-y-6">
        <header>
          <h1 className="text-2xl font-extrabold text-[#D4AF37]">
            利用規約
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            最終更新日：2026年5月3日
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-[#2A3036] bg-[#1B2026] p-5 text-sm leading-7 text-gray-200">
          <p>
            本利用規約は、「Grab the Bar」（以下「本サービス」といいます）の利用条件を定めるものです。
            本サービスを利用するユーザーは、本規約に同意したものとみなします。
          </p>

          <h2 className="text-lg font-bold text-[#D4AF37]">第1条（本サービスの内容）</h2>
          <p>
            本サービスは、ベンチプレス100kg達成を支援するため、MAX重量、トレーニング進捗、完了履歴などを記録・管理するWebアプリです。
          </p>

          <h2 className="text-lg font-bold text-[#D4AF37]">第2条（アカウント登録）</h2>
          <p>
            ユーザーは、メールアドレスおよびパスワードを用いてアカウントを作成できます。
            登録情報に虚偽、不備、第三者の情報の利用があった場合、当方は利用を停止できるものとします。
          </p>

          <h2 className="text-lg font-bold text-[#D4AF37]">第3条（禁止事項）</h2>
          <p>ユーザーは、以下の行為を行ってはなりません。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>法令または公序良俗に反する行為</li>
            <li>第三者のアカウントを不正に利用する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>不正アクセス、データ改ざん、過度な負荷をかける行為</li>
            <li>その他、当方が不適切と判断する行為</li>
          </ul>

          <h2 className="text-lg font-bold text-[#D4AF37]">第4条（トレーニングに関する注意）</h2>
          <p>
            本サービスはトレーニング記録を補助するものであり、医療的助言、専門的なトレーニング指導、怪我の防止を保証するものではありません。
            ユーザーは自身の体調、経験、環境に応じて安全にトレーニングを行うものとします。
          </p>

          <h2 className="text-lg font-bold text-[#D4AF37]">第5条（データの保存）</h2>
          <p>
            本サービスでは、ユーザーごとのMAX重量、完了履歴、進捗情報を保存します。
            ただし、システム障害、通信環境、外部サービスの影響等により、データが消失または正しく保存されない可能性があります。
          </p>

          <h2 className="text-lg font-bold text-[#D4AF37]">第6条（免責事項）</h2>
          <p>
            当方は、本サービスの利用によって発生した怪我、損害、データ消失、その他一切の不利益について、故意または重大な過失がある場合を除き責任を負いません。
          </p>

          <h2 className="text-lg font-bold text-[#D4AF37]">第7条（サービス内容の変更・停止）</h2>
          <p>
            当方は、必要に応じて本サービスの内容変更、停止、中断、終了を行うことができます。
          </p>

          <h2 className="text-lg font-bold text-[#D4AF37]">第8条（規約の変更）</h2>
          <p>
            当方は、必要に応じて本規約を変更できるものとします。変更後の規約は、本サービス上に掲載した時点で効力を生じます。
          </p>

          <h2 className="text-lg font-bold text-[#D4AF37]">第9条（お問い合わせ）</h2>
          <p>
            本サービスに関するお問い合わせは、運営者が指定する方法により行うものとします。
          </p>
        </section>
      </div>
    </main>
  );
}