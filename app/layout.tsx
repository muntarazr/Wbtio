import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Ticker from "./components/Ticker";
import Footer from "./components/Footer";

const momtad = localFont({
  src: [
    { path: "./fonts/mostakbal-momtad-regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/mostakbal-momtad-medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/mostakbal-momtad-semibold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/mostakbal-momtad-bold.ttf", weight: "700", style: "normal" }
  ],
  variable: "--font-momtad",
  display: "swap"
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "wbtio — مواقع ومتاجر وأنظمة أتمتة تشتغل لحالها",
  description:
    "نبني لأصحاب الأعمال مواقع ومتاجر وتطبيقات، وأنظمة ترد على الزبائن وتسجل الطلبات لحالها. ثلاث منصات شغالة اليوم فعلاً — من البصرة، عن بُعد.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${momtad.variable} ${ibmPlexMono.variable} dark`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('wbtio-theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fbfbfb] text-neutral-900 font-arabic antialiased transition-colors duration-200 dark:bg-ink dark:text-paper">
        <Header />
        <Ticker />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
