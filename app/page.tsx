import Generator from "@/components/generator";
import ProspectList from "@/components/prospect-list";

export default function Home() {
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">AI-Powered Prospect Generator</h1>
      <Generator />
      <ProspectList />
    </div>
  );
}
