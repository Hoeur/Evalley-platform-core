import { requireModuleAccess } from "@/core/auth/authorize.server";
import { ReviewsWorkspace } from "@/features/evalley";
import { getReviewViews } from "@/features/evalley/api/ecommerce-workspaces.server";

export default async function ReviewsPage() { await requireModuleAccess("reviews", "reviews.read"); return <ReviewsWorkspace initialReviews={await getReviewViews()} />; }
