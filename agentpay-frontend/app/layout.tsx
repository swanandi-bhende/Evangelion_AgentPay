import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgentPay - AI-Powered Cross-Border Payments',
  description: 'Send money internationally as easily as sending a text message. Powered by Hedera blockchain and AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}