import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schema/review.schema';
import { ReviewSummary, ReviewSummaryDocument } from './schema/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewSummaryDto } from './dto/review-summary.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Product, ProductDocument } from '../product/schema/product.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(ReviewSummary.name) private reviewSummaryModel: Model<ReviewSummaryDocument>,
     @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}
  

  async createReview(createReviewDto: CreateReviewDto): Promise<ReviewDocument> {
    try {
      // Check if user has already reviewed this product
      const existingReview = await this.reviewModel.findOne({
        userId: new Types.ObjectId(createReviewDto.userId),
        productId: new Types.ObjectId(createReviewDto.productId)
      });

      if (existingReview) {
        throw new ConflictException('User has already reviewed this product');
      }

      // Verify purchase if purchaseId is provided
      let isVerifiedPurchase = false;
      if (createReviewDto.purchaseId) {
        // Here you would typically check if the purchase exists and belongs to the user
        // For now, we'll set it to true if purchaseId is provided
        isVerifiedPurchase = true;
      }

      // Create the review
      const reviewData = {
        ...createReviewDto,
        userId: new Types.ObjectId(createReviewDto.userId),
        productId: new Types.ObjectId(createReviewDto.productId),
        purchaseId: createReviewDto.purchaseId ? new Types.ObjectId(createReviewDto.purchaseId) : undefined,
        isVerifiedPurchase: createReviewDto.isVerifiedPurchase ?? isVerifiedPurchase,
        reviewDate: new Date(),
        helpfulCount: 0,
        isVisible: true
      };

      const createdReview = new this.reviewModel(reviewData);
      const savedReview = await createdReview.save();

      // Update review summary
      await this.updateReviewSummary(new Types.ObjectId(createReviewDto.productId));

      return savedReview;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create review');
    }
  }

  private async updateReviewSummary(productId: Types.ObjectId): Promise<void> {
    const reviews = await this.reviewModel.find({ 
      productId, 
      isVisible: true 
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    const verifiedPurchaseCount = reviews.filter(r => r.isVerifiedPurchase).length;

    await this.reviewSummaryModel.findOneAndUpdate(
      { productId },
      {
        totalReviews,
        averageRating: Math.round(averageRating * 100) / 100, 
        ratingDistribution,
        verifiedPurchaseCount
      },
      { upsert: true, new: true }
    );
  }

  async getReviewsByProduct(
    productId: string, 
    page: number = 1, 
    limit: number = 10,
    sortBy: 'rating' | 'date' = 'date',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ reviews: ReviewDocument[], total: number, summary: ReviewSummaryDto | null }> {
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortField = sortBy === 'rating' ? 'rating' : 'reviewDate';

    const [reviews, total, summary] = await Promise.all([
      this.reviewModel
        .find({ productId: new Types.ObjectId(productId), isVisible: true })
        .populate('userId', 'name')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.reviewModel.countDocuments({ productId: new Types.ObjectId(productId), isVisible: true }),
      this.reviewSummaryModel.findOne({ productId: new Types.ObjectId(productId) }).lean()
    ]);

    return { 
      reviews: reviews as ReviewDocument[], 
      total, 
      summary: summary as ReviewSummaryDto | null 
    };
  }

  async getReviewById(reviewId: string): Promise<ReviewDocument> {
    const review = await this.reviewModel
      .findById(reviewId)
      .populate('userId', 'name')
      .populate('productId', 'name');

    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async updateReview(reviewId: string, updateReviewDto: UpdateReviewDto): Promise<ReviewDocument> {
    const review = await this.reviewModel.findById(reviewId);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updatedReview = await this.reviewModel.findByIdAndUpdate(
      reviewId,
      updateReviewDto,
      { new: true, runValidators: true }
    );

    // Update summary if rating changed
    if (updateReviewDto.rating) {
      await this.updateReviewSummary(review.productId);
    }

    return updatedReview!;
  }

  async deleteReview(reviewId: string): Promise<void> {
    const review = await this.reviewModel.findById(reviewId);
    
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.reviewModel.findByIdAndDelete(reviewId);
    
    // Update summary after deletion
    await this.updateReviewSummary(review.productId);
  }

  async markReviewHelpful(reviewId: string): Promise<ReviewDocument> {
    const review = await this.reviewModel.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }
}
