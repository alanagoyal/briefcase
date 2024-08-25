import DocumentSummarizer from "@/components/document-summarizer";
import Component from "@/components/legal-assistant";
import Sidebar from "@/components/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <Component />
    </div>
  );
}
