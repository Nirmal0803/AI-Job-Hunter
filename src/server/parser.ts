import mammoth from 'mammoth';
// @ts-ignore
import * as pdfParseModule from 'pdf-parse';
const pdfParse: any = (pdfParseModule as any).default || pdfParseModule;

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  originalFilename: string
): Promise<{ text: string; isScannedLikely: boolean; pdfBase64?: string }> {
  const extension = originalFilename.split('.').pop()?.toLowerCase();

  if (mimeType.includes('pdf') || extension === 'pdf') {
    try {
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text?.trim() || '';
      const isScannedLikely = text.length < 50; // Very short text indicates scanned image or OCR needed
      const pdfBase64 = buffer.toString('base64');
      return {
        text,
        isScannedLikely,
        pdfBase64,
      };
    } catch (err) {
      console.warn('pdf-parse encountered an error, using base64 for Gemini multimodal OCR:', err);
      return {
        text: '',
        isScannedLikely: true,
        pdfBase64: buffer.toString('base64'),
      };
    }
  }

  if (
    mimeType.includes('wordprocessingml') ||
    mimeType.includes('msword') ||
    extension === 'docx' ||
    extension === 'doc'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.trim() || '';
      return {
        text,
        isScannedLikely: false,
      };
    } catch (err) {
      console.error('Error parsing DOCX:', err);
      throw new Error(`Failed to parse DOCX file: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Fallback plain text / markdown / rtf
  const text = buffer.toString('utf-8').trim();
  return {
    text,
    isScannedLikely: false,
  };
}
