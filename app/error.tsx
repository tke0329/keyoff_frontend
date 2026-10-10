"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="container status-page">
      <p className="eyebrow">A MOMENT OF SILENCE</p>
      <h1>잠시 연결이 끊겼습니다.</h1>
      <p>정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
      <button className="button" onClick={reset}>
        다시 시도
      </button>
    </main>
  );
}
