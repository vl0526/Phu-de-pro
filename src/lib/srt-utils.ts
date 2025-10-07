import type { Subtitle } from '@/types';

function timeToMs(time: string): number {
  const parts = time.replace(',', '.').match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
  if (!parts) return 0;
  const [, hours, minutes, seconds, milliseconds] = parts;
  return (
    parseInt(hours, 10) * 3600000 +
    parseInt(minutes, 10) * 60000 +
    parseInt(seconds, 10) * 1000 +
    parseInt(milliseconds, 10)
  );
}

export function formatMsToTime(ms: number): string {
  const date = new Date(ms);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds},${milliseconds}`;
}

export function parseSrt(content: string): Subtitle[] {
  const subtitles: Subtitle[] = [];
  const blocks = content.trim().replace(/\r/g, '').split(/\n\n/);

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length >= 2) {
      try {
        const id = parseInt(lines[0], 10);
        if (isNaN(id)) {
            // Some SRT files don't have IDs, so we can try parsing from the timecode line
            const timeMatchFirstLine = lines[0].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
            if (timeMatchFirstLine) {
                const newId = subtitles.length + 1;
                const [, startTime, endTime] = timeMatchFirstLine;
                const text = lines.slice(1).join('\n');
                 subtitles.push({
                  id: newId,
                  originalId: newId,
                  start: timeToMs(startTime),
                  end: timeToMs(endTime),
                  text,
                });
            }
            continue;
        };

        const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
        if (!timeMatch) continue;

        const [, startTime, endTime] = timeMatch;
        const text = lines.slice(2).join('\n');

        subtitles.push({
          id,
          originalId: id,
          start: timeToMs(startTime),
          end: timeToMs(endTime),
          text,
        });
      } catch (error) {
        console.error("Skipping malformed SRT block:", block);
      }
    }
  }
  return subtitles;
}

export function stringifySrt(subtitles: Subtitle[]): string {
  return subtitles
    .map(sub => {
      const startTime = formatMsToTime(sub.start);
      const endTime = formatMsToTime(sub.end);
      return `${sub.id}\n${startTime} --> ${endTime}\n${sub.text}`;
    })
    .join('\n\n') + '\n\n';
}
