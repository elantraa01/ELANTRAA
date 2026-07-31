"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(4.8);
  const [totalCount, setTotalCount] = useState(0);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.averageRating) setAverageRating(data.averageRating);
        if (data.totalReviewsCount !== undefined) setTotalCount(data.totalReviewsCount);
      }
    } catch (err) {
      console.warn("Failed to fetch reviews", err);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId, fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setFeedbackMsg("Please sign in to write a review.");
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating: ratingInput,
          comment: commentInput,
        }),
      });

      if (res.ok) {
        setFeedbackMsg("Thank you! Your review has been published.");
        setCommentInput("");
        fetchReviews();
      } else {
        const data = await res.json();
        setFeedbackMsg(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-serif text-gray-900 uppercase tracking-widest font-light">
              Customer Reviews & Feedback
            </h3>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex text-[#C9A648] text-lg">
                {"★".repeat(Math.round(averageRating))}
                {"☆".repeat(5 - Math.round(averageRating))}
              </div>
              <span className="text-sm font-semibold text-gray-900">{averageRating} out of 5</span>
              <span className="text-xs text-gray-400 font-sans">({totalCount} reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-8">
          {/* Submit Review Form */}
          <div className="lg:col-span-1 bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit">
            <h4 className="text-sm font-serif uppercase tracking-wider text-gray-900 font-semibold mb-3">
              Write a Review
            </h4>

            {!session ? (
              <p className="text-xs text-gray-500 font-sans leading-relaxed">
                Please <a href="/login" className="text-[#C9A648] font-semibold underline">sign in</a> to share your review and experience with this product.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Rating
                  </label>
                  <div className="flex space-x-1 text-2xl text-gray-300">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className={`transition-colors ${star <= ratingInput ? "text-[#C9A648]" : "hover:text-[#C9A648]/60"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Your Feedback
                  </label>
                  <textarea
                    rows={4}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Share details about fit, quality, or styling..."
                    className="w-full text-xs p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C9A648] bg-white font-sans"
                    required
                  />
                </div>

                {feedbackMsg && (
                  <p className={`text-xs font-medium ${feedbackMsg.includes("Thank you") ? "text-emerald-600" : "text-rose-600"}`}>
                    {feedbackMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#171717] text-[#D4AF37] text-xs font-semibold uppercase tracking-widest rounded-lg hover:bg-[#C9A648] hover:text-white transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? "Publishing..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>

          {/* Existing Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r.id} className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        {r.userName}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded-full">
                        ✓ Verified Buyer
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="text-[#C9A648] text-xs">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </div>
                  {r.comment && (
                    <p className="text-xs text-gray-700 leading-relaxed font-sans pt-1">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 text-xs text-gray-500">
                No customer reviews yet. Be the first to share your feedback!
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
