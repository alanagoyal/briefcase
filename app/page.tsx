import Chat from "@/components/chat";

export default function Home() {
  return (
    <div className="w-full min-h-dvh bg-background">
      <Chat />
    </div>
  );
}

export const dynamic = "force-dynamic";
