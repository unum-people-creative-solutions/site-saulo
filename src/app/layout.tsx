import { LeadModal } from '@/components/LeadModal/LeadModal';
import { StructuredData } from '@/components/StructuredData';
import { LeadProvider } from '@/context/LeadContext';
import { uncutSans, tinos } from './fonts';
import { metadata } from './site-metadata';
import './globals.css';

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${uncutSans.variable} ${tinos.variable}`}>
      <body className="min-h-full antialiased">
        <StructuredData />
        <LeadProvider>
          {children}
          <LeadModal />
        </LeadProvider>
      </body>
    </html>
  );
}
