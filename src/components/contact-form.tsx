import { useState } from "react";
import { submitContact } from "@/lib/wp/api";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [info, setInfo] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setInfo("");
    try {
      const res = await submitContact({ data: { name, email, message } });
      setStatus(res.ok ? "ok" : "err");
      setInfo(res.message);
      if (res.ok) {
        setName("");
        setEmail("");
        setMessage("");
      }
    } catch (err) {
      setStatus("err");
      setInfo(err instanceof Error ? err.message : "تعذر الإرسال.");
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] sm:p-7">
      <div className="grid gap-4">
        <Field label="الاسم" htmlFor="name">
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            className="h-11 w-full rounded-lg bg-bg px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-2 focus:ring-accent"
          />
        </Field>
        <Field label="البريد الإلكتروني" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 w-full rounded-lg bg-bg px-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-2 focus:ring-accent"
          />
        </Field>
        <Field label="الرسالة" htmlFor="message">
          <textarea
            id="message"
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="w-full resize-y rounded-lg bg-bg px-3 py-3 text-sm text-fg outline-none ring-1 ring-border focus:ring-2 focus:ring-accent"
          />
        </Field>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-12 items-center justify-center rounded-full bg-fg px-6 text-sm font-medium text-bg transition-transform duration-150 ease-out active:scale-[0.96] disabled:opacity-60"
        >
          {status === "loading" ? "جارى الإرسال..." : "إرسال الرسالة"}
        </button>
        {info ? (
          <p className={status === "ok" ? "text-sm text-fg" : "text-sm text-accent"}>{info}</p>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="grid gap-2">
      <span className="text-sm font-medium text-fg">{label}</span>
      {children}
    </label>
  );
}
