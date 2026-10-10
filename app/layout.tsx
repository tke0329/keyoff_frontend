import type { Metadata } from "next";
import { Header, Footer } from "@/components/shell";
import PlaybackProvider from "@/components/playback-dock";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "KEYOFF — Music Collective", template: "%s | KEYOFF" },
  description:
    "서로 다른 감각이 만나 새로운 음악이 되는 곳. KEYOFF 아티스트와 작품을 만나보세요.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body id="top">
        <a className="skip-link" href="#main">
          본문으로 이동
        </a>
        <PlaybackProvider>
          <Header />
          {children}
          <Footer />
        </PlaybackProvider>
      </body>
    </html>
  );
}
