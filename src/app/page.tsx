import { SubtitleEditorProvider } from '@/contexts/subtitle-editor-context';
import MainLayout from '@/components/app/main-layout';

export default function Home() {
  return (
    <SubtitleEditorProvider>
      <MainLayout />
    </SubtitleEditorProvider>
  );
}
