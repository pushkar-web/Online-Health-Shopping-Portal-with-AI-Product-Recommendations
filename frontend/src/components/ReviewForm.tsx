'use client';
import { useState } from 'react';
import { reviewAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface ReviewFormProps {
    productId: number;
    onSuccess: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return toast.error('Please write a comment');

        setLoading(true);
        try {
            await reviewAPI.create({ productId, rating, comment });
            toast.success('Review submitted');
            setComment('');
            setRating(5);
            onSuccess();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-vc-surface-high rounded-lg border border-outlineVar/15 p-6 mb-8 animate-fade-in">
            <h3 className="text-base font-semibold text-onSurface mb-4">Write a Review</h3>

            {/* Star Rating */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-onSurfaceVar mb-2">Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                        >
                            <span className={star <= (hoverRating || rating) ? 'text-amber' : 'text-vc-surface-bright'}>
                                ★
                            </span>
                        </button>
                    ))}
                    <span className="ml-2 text-sm text-outline self-center">
                        {hoverRating || rating} / 5
                    </span>
                </div>
            </div>

            {/* Comment */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-onSurfaceVar mb-2">Your Review</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    rows={4}
                    className="vc-input resize-none"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn-sage px-8 py-3 w-full sm:w-auto disabled:opacity-50"
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}
