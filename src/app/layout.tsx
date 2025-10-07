import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Bai_Jamjuree, Manrope } from 'next/font/google';
import { ThemeProvider } from '@/contexts/theme-provider';
import { SubtitleEditorProvider } from '@/contexts/subtitle-editor-context';
import { AudioProvider } from '@/contexts/audio-provider';

const manrope = Manrope({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-manrope',
});

const baiJamjuree = Bai_Jamjuree({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bai-jamjuree',
});

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
      <body
        className={`${manrope.variable} ${baiJamjuree.variable} font-body antialiased overflow-hidden`}
        suppressHydrationWarning
      >
        <AudioProvider>
          <SubtitleEditorProvider>
            <ThemeProvider>
              {children}
              <Toaster />
            </ThemeProvider>
          </SubtitleEditorProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
