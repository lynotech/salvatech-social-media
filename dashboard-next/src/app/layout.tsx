import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SalvaTech · Agent Room',
  description: 'Dashboard de produção de conteúdo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-black overflow-hidden">{children}</body>
    </html>
  );
}
