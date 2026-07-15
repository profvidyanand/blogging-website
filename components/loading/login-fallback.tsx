import { Spinner } from "@/components/ui/spinner";

export function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Spinner />
        Loading…
      </div>
    </div>
  );
}
