import { cn } from "@/lib/utils";

export function CoverImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-end bg-elevated p-5 text-start",
          className,
        )}
      >
        <span className="line-clamp-4 text-xl font-semibold leading-snug tracking-tight text-fg">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
