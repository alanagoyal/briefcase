import DocumentSummarizer from "@/components/document-summarizer";

export default function Home() {
  return (
    <div className="container mx-auto p-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Ask Legal</h1>
      <DocumentSummarizer />
    </div>
  );
}
