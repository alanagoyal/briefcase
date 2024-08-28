declare module 'pdfjs-dist' {
    export const GlobalWorkerOptions: {
      workerSrc: string;
    };
  
    export function getDocument(source: ArrayBuffer): {
      promise: Promise<PDFDocumentProxy>;
    };
  
    export interface PDFDocumentProxy {
      numPages: number;
      getPage(pageNumber: number): Promise<PDFPageProxy>;
    }
  
    export interface PDFPageProxy {
      getTextContent(): Promise<PDFPageTextContent>;
    }
  
    export interface PDFPageTextContent {
      items: Array<{
        str: string;
      }>;
    }
  
    // Add this line to include the version property
    export const version: string;
  }