"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Search, Star, X } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/page/page-container";
import { StatusBadge } from "@/components/status/status-badge";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import { moderateReviewAction } from "../api/review.mutations";
import type { ReviewView } from "../types";

function reviewVariant(status: string) {
  if (status.toLowerCase() === "approved") return "success" as const;
  if (status.toLowerCase() === "pending") return "warning" as const;
  return "danger" as const;
}

export function ReviewsWorkspace({ initialReviews }: { initialReviews: readonly ReviewView[] }) {
  const [reviews, setReviews] = useState([...initialReviews]);
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const visible = useMemo(
    () =>
      reviews.filter((review) =>
        `${review.author} ${review.product} ${review.text}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, reviews],
  );
  const average =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  function moderate(id: string, decision: "approve" | "reject") {
    startTransition(async () => {
      const result = await moderateReviewAction(id, decision);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setReviews((current) =>
        current.map((review) =>
          review.id === id ? { ...review, status: result.status } : review,
        ),
      );
      toast.success(`Review ${result.status}`);
    });
  }

  return (
    <PageContainer className="max-w-[1100px] gap-4 py-5 md:px-7">
      <div>
        <h1 className="font-heading text-xl font-bold">Reviews & Ratings</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Live moderation through core-ecommerce-api.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit rounded-2xl shadow-none">
          <CardContent className="p-5 text-center">
            <p className="font-heading text-5xl font-bold">{average.toFixed(1)}</p>
            <div className="mt-2 flex justify-center text-warning">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  className={index < Math.round(average) ? "size-4 fill-current" : "size-4"}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              from {reviews.length} loaded reviews
            </p>
          </CardContent>
        </Card>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search reviews..."
              className="h-10 rounded-xl bg-card pl-9"
            />
          </div>
          {visible.map((review) => (
            <Card key={review.id} className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">{review.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.product} · {review.time}
                    </p>
                  </div>
                  <StatusBadge variant={reviewVariant(review.status)}>
                    {review.status}
                  </StatusBadge>
                </div>
                <div className="my-3 flex text-warning">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={
                        index < review.rating
                          ? "size-3.5 fill-current"
                          : "size-3.5 text-border"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed">{review.text}</p>
                <div className="mt-4 flex justify-end gap-2">
                  {review.status !== "approved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      disabled={pending}
                      onClick={() => moderate(review.id, "approve")}
                    >
                      <Check className="size-3" />
                      Approve
                    </Button>
                  )}
                  {review.status !== "rejected" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-destructive"
                      disabled={pending}
                      onClick={() => moderate(review.id, "reject")}
                    >
                      <X className="size-3" />
                      Reject
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
