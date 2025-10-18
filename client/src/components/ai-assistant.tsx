export function AIAssistant({ embedded = false }: { embedded?: boolean }) {
  return (
    <div className={embedded ? "w-full h-full" : "w-full h-[500px]"}>
      <iframe
        src="https://www.easemate.ai/webapp/chat?from=ai-chat"
        className="w-full h-full border-0 rounded-lg"
        title="EaseMate AI Chat"
        allow="microphone; camera"
      />
    </div>
  );
}
