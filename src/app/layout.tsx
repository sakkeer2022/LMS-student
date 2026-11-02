import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
export const metadata = {
  title: { default: "Amentorz", template: "%s | Amentorz" },
  description:
    "Find a tutor who teaches your exact board, class and subject through focused 1:1 online sessions.",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
