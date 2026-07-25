"use client";

import { useState } from "react";
import { Review } from "@/components/home/mockData";

interface ProductReviewsProps {
  productId: string;
  rating: number;
  reviewCount: number;
}

export default function ProductReviews({
  productId,
  rating,
  reviewCount,
}: ProductReviewsProps) {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newComment) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId,
      userName: newName,
      rating: newRating,
      title: newTitle || "Highly Recommended!",
      comment: newComment,
      date: "Just Now",
      verifiedBuyer: true,
    };

    setReviewsList([newRev, ...reviewsList]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowReviewModal(false);
      setNewName("");
      setNewTitle("");
      setNewComment("");
    }, 1200);
  };

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-[#FAF8F5] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-[11px] sm:text-xs tracking-[0.3em] text-[#C9A648] uppercase font-semibold">
              CLIENT TESTIMONIALS & RATING
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-gray-900 mt-1 tracking-tight">
              Customer Reviews
            </h2>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="mt-4 md:mt-0 px-6 py-3 bg-[#171717] text-[#D4AF37] text-xs font-medium uppercase tracking-widest rounded shadow hover:bg-[#C9A648] hover:text-white transition-colors"
          >
            Write A Review
          </button>
        </div>

        {/* Rating Breakdown Summary Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left Score */}
          <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
            <span className="text-5xl sm:text-6xl font-serif font-light text-gray-900">
              {rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-400 font-sans"> / 5.0</span>
            <div className="flex items-center justify-center md:justify-start text-amber-500 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-light">Based on {reviewCount} verified buyer reviews</p>
          </div>

          {/* Center Distribution Bars */}
          <div className="md:col-span-2 space-y-2">
            {[
              { stars: "5 Stars", percentage: 88, count: Math.round(reviewCount * 0.88) },
              { stars: "4 Stars", percentage: 9, count: Math.round(reviewCount * 0.09) },
              { stars: "3 Stars", percentage: 3, count: Math.round(reviewCount * 0.03) },
              { stars: "2 Stars", percentage: 0, count: 0 },
              { stars: "1 Star", percentage: 0, count: 0 },
            ].map((bar) => (
              <div key={bar.stars} className="flex items-center text-xs space-x-3">
                <span className="w-14 text-gray-600 font-medium">{bar.stars}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A648] rounded-full"
                    style={{ width: `${bar.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-400 font-mono text-[11px]">
                  {bar.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviewsList.length > 0 ? (
            reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="w-8 h-8 rounded-full bg-[#C9A648]/20 text-[#C9A648] font-serif font-bold flex items-center justify-center text-xs uppercase">
                        {rev.userName[0]}
                      </span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                          {rev.userName}
                          {rev.verifiedBuyer && (
                            <span className="ml-2 text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-normal">
                              ✓ Verified Buyer
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-light">{rev.date}</p>
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  <h5 className="text-sm font-serif font-semibold text-gray-900 mt-3">
                    {rev.title}
                  </h5>

                  <p className="text-xs text-gray-600 font-light mt-1 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100 space-y-3">
              <p className="text-sm text-gray-500 font-light">No reviews posted yet for this product.</p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="text-xs text-[#C9A648] font-bold uppercase tracking-widest hover:underline"
              >
                Be the first to submit a review &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Write A Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700"
            >
              &times;
            </button>

            <h3 className="text-xl font-serif text-gray-900 mb-1">Write A Review</h3>
            <p className="text-xs text-gray-500 font-light mb-6">
              Share your experience with ELANTRAA Haute Couture
            </p>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg text-center font-medium">
                ✓ Thank you for your review! It has been posted successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                {/* Rating Selector */}
                <div>
                  <label className="block text-gray-700 font-semibold uppercase mb-1">
                    Your Rating
                  </label>
                  <div className="flex space-x-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <svg
                          className={`w-6 h-6 ${
                            star <= newRating ? "fill-current" : "text-gray-300 fill-current"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold uppercase mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Kapoor"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold uppercase mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stunning craftsmanship!"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold uppercase mb-1">
                    Review Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe fit, fabric texture, styling..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-[#C9A648] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#171717] text-[#D4AF37] hover:bg-[#C9A648] hover:text-white uppercase tracking-widest font-medium rounded transition-colors"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
