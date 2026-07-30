"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/core/utils/cn";

export function ProductImagesField({
  existing,
  files,
  onChange,
}: {
  existing: readonly string[];
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = Array.from(list).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (next.length) onChange([...files, ...next]);
  }

  function removeAt(index: number) {
    onChange(files.filter((_, position) => position !== index));
  }

  return (
    <div className="space-y-3">
      {existing.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-1.5 text-xs">Current images</p>
          <div className="flex flex-wrap gap-2">
            {existing.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt=""
                className="size-16 rounded-lg border object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {previews.length > 0 && (
        <div>
          <p className="text-muted-foreground mb-1.5 text-xs">New uploads</p>
          <div className="flex flex-wrap gap-2">
            {previews.map((url, index) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="size-16 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => removeAt(index)}
                  className="bg-background absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full border shadow-sm"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label="Add product images"
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
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-5 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-input hover:bg-muted/50",
        )}
      >
        <ImagePlus className="text-muted-foreground size-6" />
        <p className="text-sm font-medium">
          <span className="text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-muted-foreground text-xs">
          Add one or more images. PNG, JPG or WEBP.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
      </div>
    </div>
  );
}
