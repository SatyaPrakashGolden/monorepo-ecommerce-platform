"use client"

import { useState } from "react"
import { Star, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Review {
  id: number
  author: string
  rating: number
  date: string
  title: string
  content: string
  verified: boolean
  helpful: number
  notHelpful: number
  size: string
  fit: string
}

export function ProductReviews() {
  const [sortBy, setSortBy] = useState("newest")
  const [filterRating, setFilterRating] = useState("all")

  const reviews: Review[] = [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2024-01-15",
      title: "Perfect for special occasions!",
      content:
        "This dress exceeded my expectations. The quality is amazing and it fits perfectly. I wore it to a wedding and received so many compliments. Definitely worth the price!",
      verified: true,
      helpful: 12,
      notHelpful: 1,
      size: "M",
      fit: "True to size",
    },
    {
      id: 2,
      author: "Emily R.",
      rating: 4,
      date: "2024-01-10",
      title: "Beautiful dress, runs slightly small",
      content:
        "Love the design and fabric quality. However, it runs a bit small so I'd recommend sizing up. The color is exactly as shown in the pictures.",
      verified: true,
      helpful: 8,
      notHelpful: 2,
      size: "L",
      fit: "Runs small",
    },
    {
      id: 3,
      author: "Jessica L.",
      rating: 5,
      date: "2024-01-05",
      title: "Stunning quality!",
      content:
        "The attention to detail is incredible. The fabric feels luxurious and the fit is flattering. Will definitely be ordering more from this brand.",
      verified: true,
      helpful: 15,
      notHelpful: 0,
      size: "S",
      fit: "True to size",
    },
  ]

  const averageRating = 4.8
  const totalReviews = 124

  const ratingDistribution = [
    { stars: 5, count: 89, percentage: 72 },
    { stars: 4, count: 25, percentage: 20 },
    { stars: 3, count: 7, percentage: 6 },
    { stars: 2, count: 2, percentage: 1 },
    { stars: 1, count: 1, percentage: 1 },
  ]

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{averageRating}</div>
          <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600">Based on {totalReviews} reviews</p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map((rating) => (
            <div key={rating.stars} className="flex items-center gap-2">
              <span className="text-sm w-8">{rating.stars}★</span>
              <Progress value={rating.percentage} className="flex-1" />
              <span className="text-sm text-gray-600 w-8">{rating.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Rating</SelectItem>
            <SelectItem value="lowest">Lowest Rating</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRating} onValueChange={setFilterRating}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>{review.author[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{review.author}</span>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified Purchase</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{review.date}</span>
                </div>

                <h4 className="font-medium mb-2">{review.title}</h4>
                <p className="text-gray-600 mb-3">{review.content}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span>Size purchased: {review.size}</span>
                  <span>Fit: {review.fit}</span>
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({review.helpful})
                  </button>
                  <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
                    <ThumbsDown className="h-4 w-4" />
                    Not helpful ({review.notHelpful})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Write Review Button */}
      <div className="text-center">
        <Button className="gradient-royal-primary text-white border-0">Write a Review</Button>
      </div>
    </div>
  )
}
