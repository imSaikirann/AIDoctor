
export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
      {message}
    </div>
  );
}