import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

const FALLBACK_MESSAGE = "حدث خطأ غير متوقع. أعد تحميل الصفحة.";

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return FALLBACK_MESSAGE;
}

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <span className="text-accent" aria-hidden="true">
        <TriangleAlert className="size-8" strokeWidth={1.5} />
      </span>
      <h1 className="text-lg font-semibold">تعذر عرض الصفحة</h1>
      <p className="max-w-md text-sm break-words text-muted">{errorMessage(error)}</p>
    </main>
  );
}
