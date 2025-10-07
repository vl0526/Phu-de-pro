import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Space_Grotesk } from 'next/font/google'
import { ThemeProvider } from '@/contexts/theme-provider';
import { SubtitleEditorProvider } from '@/contexts/subtitle-editor-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})


export const metadata: Metadata = {
  title: 'Sub Edit Pro',
  description: 'Chỉnh sửa file phụ đề SRT chuyên nghiệp',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased overflow-hidden`} suppressHydrationWarning>
        <SubtitleEditorProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </SubtitleEditorProvider>
      </body>
    </html>
  );
}
