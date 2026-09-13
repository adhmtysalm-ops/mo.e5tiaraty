import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-fg">الصفحة غير موجودة</h1>
      <p className="mt-3 text-base text-muted">
        الرابط غير صحيح أو المقال لم يعد متاحا. عد للرئيسية وتصفح أحدث المختارات.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-fg px-6 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96]"
      >
        العودة للرئيسية
      </Link>
    </main>
  );
}
