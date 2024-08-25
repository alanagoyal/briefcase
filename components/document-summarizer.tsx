"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CardHeader } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCompletion } from "ai/react";
import Chat from "@/components/chat";
import FeeCalculator from "@/components/fee-calculator";

export default function DocumentSummarizer() {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [documentContent, setDocumentContent] = useState<string>("");

  const { complete } = useCompletion({
    api: "/generate-summary",
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    console.log("File dropped:", file.name, file.type);
    setIsLoading(true);

    try {
      const text = await extractTextFromFile(file);
      setDocumentContent(text);
      console.log("Generating summary");
      const result = await complete("", {
        body: { content: text },
      });

      console.log("Summary generated:", result);
      if (result) {
        setSummary(result);
      }
    } catch (error) {
      console.error("Error in summarizing document:", error);
    } finally {
      setIsLoading(false);
    }
  }, [complete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    multiple: false,
  }); 

  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Legal Document</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Upload a PDF or Word document to summarize
          </p>
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
          >
            <input {...getInputProps()} />
            {isLoading ? (
              <p>Uploading...</p>
            ) : isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag and drop a document here to upload and summarize</p>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Document Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            AI-generated summary of the legal document
          </p>
          <ScrollArea className="h-48 border rounded-md p-4">
            {summary ? (
              <p className="whitespace-pre-line">{summary}</p>
            ) : (
              <p className="text-gray-500">
                Upload a document to see its AI-generated summary here. The summary will provide a concise overview of the key points, important clauses, and potential implications of the document.
              </p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      {documentContent && (
        <>
          <Chat content={documentContent} />
          <FeeCalculator summary={summary} content={documentContent} />
        </>
      )}
    </div>
  );
}

async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  if (file.type === "application/pdf") {
    return extractTextFromPdf(arrayBuffer);
  } else if (
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractTextFromWord(arrayBuffer);
  } else if (file.type === "text/plain") {
    return new TextDecoder().decode(arrayBuffer);
  } else {
    throw new Error("Unsupported file type");
  }
}

async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item: any) => item.str.trim().length > 0)
      .map((item: any) => item.str)
      .join(" ");
    text += pageText + "\n";
  }

  return text.trim();
}

async function extractTextFromWord(arrayBuffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}