import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: '夏休みのダラダラ防止ツール',
  description: 'ぽっかり空いた時間を有意義に。AIがあなたにぴったりのアクションプランを提案し、Googleカレンダーに登録します。',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ja" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased h-full m-0" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
