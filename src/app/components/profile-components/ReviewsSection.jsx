"use client";

import { useState } from "react";
import {
  MessageSquare,
  Star,
  UserCircle2,
  Lock,
  Loader2,
  CheckCircle2,
  Handshake,
  PhoneCall,
  ShieldAlert,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useReviews } from "@/hooks/useReviews";
import { useAddReview } from "@/app/hooks/useAddReview";
import { useLeadStatus, useConfirmDeal } from "@/app/hooks/useLead";

// ── Interactive star input ────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star`}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={
              star <= active
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-600">
          {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][value]}
        </span>
      )}
    </div>
  );
}

// ── Static star display for review cards ─────────────────────────────────────
function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={
            i <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }
        />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// Props:
//   businessId — MongoDB ObjectId string of the business
//   ownerId    — MongoDB ObjectId string of the business owner (to block self-review)
//   isOwner    — optional boolean shortcut (provider-profile page passes true)
export default function ReviewsSection({ businessId, ownerId, isOwner = false }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  const { data, isLoading: reviewsLoading } = useReviews(businessId);
  const { mutate: submit, isPending, isSuccess } = useAddReview(businessId);
  const { data: lead, isLoading: leadLoading } = useLeadStatus(businessId);
  const { mutate: confirmDeal, isPending: confirmingDeal } = useConfirmDeal(businessId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingError, setRatingError] = useState("");

  const reviews = data?.reviews ?? [];
  const total = data?.total ?? 0;

  // 30-minute gate: contact timestamp → review eligibility
  const REVIEW_DELAY_MS = 30 * 60 * 1000;
  const contactedAt = lead?.lastContactedAt || lead?.createdAt;
  const timeSinceContact = contactedAt ? Date.now() - new Date(contactedAt).getTime() : 0;
  const dealConfirmed =
    lead?.customerConfirmed === "yes" ||
    lead?.status === "confirmed" ||
    lead?.status === "disputed";
  const thirtyMinPassed = timeSinceContact >= REVIEW_DELAY_MS;
  const minutesRemaining = Math.max(1, Math.ceil((REVIEW_DELAY_MS - timeSinceContact) / 60000));

  // True when the current user already has a published review for this business
  const alreadyReviewed =
    !reviewsLoading &&
    !!user &&
    reviews.some((r) => r.user?._id?.toString() === user.id);

  const viewerIsOwner =
    isOwner || (user && ownerId && user.id === ownerId.toString());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      setRatingError("Please select a rating");
      return;
    }
    setRatingError("");
    submit(
      { rating, comment },
      {
        onSuccess: () => {
          setRating(0);
          setComment("");
        },
      }
    );
  };

  return (
    <div className="bg-white sm:shadow-sm sm:rounded-2xl p-5 sm:p-6 border-b sm:border-none border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <div className="p-1.5 sm:p-2 bg-yellow-50 rounded-lg">
          <MessageSquare size={18} className="text-yellow-600" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Customer Reviews</h2>
        <span className="ml-auto text-sm text-gray-500 font-medium">
          {total} {total === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* ── Add Review Block ── */}
      {!authLoading && businessId && (
        <div className="mb-5 sm:mb-6">
          {!user ? (
            <div className="flex flex-col items-center gap-3 py-5 px-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
              <div className="p-3 bg-white border border-gray-200 rounded-full shadow-sm">
                <Lock size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">
                  Sign in to leave a review
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Only registered users can post reviews.
                </p>
              </div>
              <Link
                href={`/sign-in?redirect=${encodeURIComponent(pathname)}`}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition"
              >
                Sign In to Review
              </Link>
            </div>
          ) : user && !user.isEmailVerified ? (
            <div className="flex flex-col items-center gap-3 py-5 px-4 bg-amber-50 border border-amber-100 rounded-xl text-center">
              <div className="p-3 bg-white border border-amber-200 rounded-full shadow-sm">
                <ShieldAlert size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">
                  Verify your account to leave a review
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Email verification is required before posting reviews.
                </p>
              </div>
              <Link
                href={`/verify-email?redirect=${encodeURIComponent(pathname)}`}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition"
              >
                Verify Email
              </Link>
            </div>
          ) : viewerIsOwner ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
              <MessageSquare size={15} />
              <span>You cannot review your own business.</span>
            </div>
          ) : isSuccess || alreadyReviewed ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
              <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-700 text-sm">
                  Review submitted!
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Thank you for your feedback.
                </p>
              </div>
            </div>
          ) : leadLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : !lead ? (
            // No contact yet — gate the form
            <div className="flex flex-col items-center gap-3 py-5 px-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
              <div className="p-3 bg-white border border-gray-200 rounded-full shadow-sm">
                <PhoneCall size={20} className="text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">
                  Contact this provider first
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  You can leave a review only after contacting this provider.
                </p>
              </div>
            </div>
          ) : lead.status === "confirmed" || lead.status === "disputed" || lead.customerConfirmed === "yes" ? (
            dealConfirmed && !thirtyMinPassed ? (
              // Deal confirmed but 30 min haven't passed yet
              <div className="flex flex-col items-center gap-3 py-5 px-4 bg-orange-50 border border-orange-100 rounded-xl text-center">
                <div className="p-3 bg-white border border-orange-200 rounded-full shadow-sm">
                  <Clock size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700 text-sm">
                    Review available soon
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    You can add a review 30 minutes after contacting the provider.
                  </p>
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    {minutesRemaining} {minutesRemaining === 1 ? "minute" : "minutes"} remaining
                  </p>
                </div>
              </div>
            ) : (
            // Deal confirmed + 30 min passed → show review form
            <form
              onSubmit={handleSubmit}
              className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4"
            >
              <p className="font-semibold text-gray-700 text-sm">
                Leave a Review
              </p>

              <div>
                <StarInput value={rating} onChange={setRating} />
                {ratingError && (
                  <p className="text-xs text-red-500 mt-1">{ratingError}</p>
                )}
              </div>

              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience (min. 10 characters)…"
                  rows={3}
                  maxLength={500}
                  required
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">
                  {comment.length}/500
                </p>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition cursor-pointer"
              >
                {isPending ? "Submitting…" : "Submit Review"}
              </button>
            </form>
            )
          ) : lead.customerConfirmed === "no" ? null : (
            // Lead exists but deal not confirmed yet
            <div className="flex flex-col items-center gap-3 py-5 px-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
              <div className="p-3 bg-white border border-blue-200 rounded-full shadow-sm">
                <Handshake size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-sm">
                  Did a deal happen?
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Confirm your deal to unlock the review form.
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => confirmDeal("yes")}
                  disabled={confirmingDeal}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition"
                >
                  {confirmingDeal ? "Saving…" : "Yes, Deal Done!"}
                </button>
                <button
                  onClick={() => confirmDeal("no")}
                  disabled={confirmingDeal}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 text-sm font-semibold rounded-xl transition"
                >
                  No Deal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Reviews List ── */}
      {reviewsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                    <UserCircle2 size={22} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {review.user?.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarDisplay rating={review.rating} />
              </div>
              <p className="text-gray-700 text-sm leading-relaxed pl-1">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
