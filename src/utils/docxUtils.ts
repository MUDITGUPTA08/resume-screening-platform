import mammoth from 'mammoth';

export interface DocxParseResult {
  text: string;
  error?: string;
}

/**
 * Validates that an uploaded file is strictly a Word document (.docx).
 * The candidate brief explicitly states:
 * "A resume/CV upload field that accepts Word documents (.docx) only — not PDF."
 */
export function validateDocxFile(file: File): { isValid: boolean; errorMessage?: string } {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.pdf')) {
    return {
      isValid: false,
      errorMessage: 'PDF documents are not accepted. Please upload a Microsoft Word document (.docx) only.'
    };
  }

  if (fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
    return {
      isValid: false,
      errorMessage: 'Legacy .doc format detected. Please save your file as a modern .docx Word document and try again.'
    };
  }

  if (!fileName.endsWith('.docx')) {
    return {
      isValid: false,
      errorMessage: 'Invalid file format. Only Microsoft Word documents (.docx) are accepted.'
    };
  }

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    return {
      isValid: false,
      errorMessage: 'File size exceeds 10MB limit.'
    };
  }

  return { isValid: true };
}

/**
 * Extracts raw text from an uploaded .docx file using mammoth.
 */
export async function extractTextFromDocx(file: File): Promise<DocxParseResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value ? result.value.trim() : '';

    if (!text || text.length < 20) {
      return {
        text: '',
        error: 'The Word document (.docx) appears to be empty or contains unreadable text. Please check the file contents.'
      };
    }

    return { text };
  } catch (err: any) {
    console.error('Error parsing .docx file with mammoth:', err);
    return {
      text: '',
      error: `Could not parse Word document: ${err?.message || 'Unsupported internal .docx structure'}`
    };
  }
}
