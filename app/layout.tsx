import type { Metadata } from 'next';
import { NavBar } from '@/components/layout/NavBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'My Places',
  description: 'Save and browse the places you visit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
