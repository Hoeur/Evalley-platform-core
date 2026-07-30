"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/core/utils/cn";
import { Button } from "@/design-system/ui/button";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagePicker({
  file,
  currentUrl,
  onChange,
  label = "image",
  hint = "PNG, JPG or WEBP · up to ~2MB",
}: {
  file?: File;
  currentUrl?: string | null;
  onChange: (file?: File) => void;
  label?: string;
  hint?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview ?? currentUrl ?? null;

  function accept(files: FileList | null) {
    const next = files?.[0];
    if (next && next.type.startsWith("image/")) onChange(next);
  }

  function clear() {
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload ${label}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          accept(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-input hover:bg-muted/50",
        )}
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt=""
            className="size-24 rounded-lg border object-cover"
          />
        ) : (
          <div className="bg-muted grid size-24 place-items-center rounded-lg border">
            <ImagePlus className="text-muted-foreground size-7" />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-sm font-medium">
            <span className="text-primary">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-muted-foreground text-xs">{hint}</p>
        </div>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => accept(event.target.files)}
        />
      </div>

      {file && (
        <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="truncate">
            {file.name} · {formatBytes(file.size)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            aria-label="Remove selected image"
            onClick={(event) => {
              event.stopPropagation();
              clear();
            }}
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
