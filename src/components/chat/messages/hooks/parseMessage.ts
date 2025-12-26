interface ParsedMessage {
  thinking?: string;
  content: string;
  attachments: { name: string }[];
}

const fileTagRegex = /<file name="([^"]+)">[\s\S]*?<\/file>/g;

const THINK_PATTERNS = [
  { open: '<think>', close: '</think>' },
  { open: '◁think▷', close: '◁/think▷' },
  { open: '[think]', close: '[/think]' },
  { open: '*think*', close: '*/think*' },
] as const;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractThinking(text: string, attachments: { name: string }[]): ParsedMessage {
  const trimmed = text.trim();

  for (const { open, close } of THINK_PATTERNS) {
    const openEsc = escapeRegex(open);
    const closeEsc = escapeRegex(close);

    const completeRegex = new RegExp(`${openEsc}([\\s\\S]*?)${closeEsc}`, 'g');
    const completeMatch = trimmed.match(completeRegex);
    if (completeMatch) {
      const thinkingMatch = trimmed.match(new RegExp(`${openEsc}([\\s\\S]*?)${closeEsc}`));
      const thinking = thinkingMatch?.[1]?.trim() || '';
      const content = trimmed.replace(completeRegex, '').trim();
      return { thinking, content, attachments };
    }

    if (trimmed.startsWith(open)) {
      const thinking = trimmed.slice(open.length).trim();
      return { thinking, content: '', attachments };
    }

    if (trimmed === close) {
      return { content: '', attachments };
    }

    if (trimmed.startsWith(close)) {
      const content = trimmed.slice(close.length).trim();
      return { content, attachments };
    }
  }

  return { content: trimmed, attachments };
}

export function parseMessage(content: string | undefined): ParsedMessage {
  if (!content || typeof content !== 'string') {
    return { content: '', attachments: [] };
  }

  const attachments = [...content.matchAll(fileTagRegex)].map((m) => ({ name: m[1] }));
  const processedContent = content.replace(fileTagRegex, '').trim();

  return extractThinking(processedContent, attachments);
}
