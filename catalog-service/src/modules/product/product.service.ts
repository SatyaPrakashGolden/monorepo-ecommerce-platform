import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import slugify from 'slugify';
import { Product, ProductDocument } from './schema/product.schema';
import { Offer, OfferDocument } from '../offer/schema/offer.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { uploadFileToS3 } from '../../utils/s3-upload';
import { Types } from 'mongoose';
import { ProductStatus } from './schema/product.schema'
@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Offer.name) private offerModel: Model<OfferDocument>,
  ) { }

  async getFeaturedProducts(): Promise<any[]> {
    const products = await this.productModel
      .aggregate([
        // Step 1: Filter for active products
        {
          $match: {
            status: ProductStatus.ACTIVE,
          },
        },
        // Step 2: Join with Offer collection
        {
          $lookup: {
            from: 'offers', // Collection name for Offer
            let: { productOffers: { $ifNull: ['$offers', []] } }, // Ensure it's an array
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $in: ['$_id', '$$productOffers'] }, // Offers linked to the product
                      { $eq: ['$appliesToAllProducts', true] }, // Offers that apply to all products
                    ],
                  },
                },
              },
              // Filter for active offers only
              {
                $match: {
                  isActive: true,
                },
              },
              // Sort by discount value descending to get the best offer first
              {
                $sort: { discountValue: -1 },
              },
              // Limit to pick the most relevant offer (e.g., first valid offer)
              { $limit: 1 },
            ],
            as: 'offers',
          },
        },
        // Step 3: Unwind offers (optional, to simplify discount calculation)
        {
          $unwind: {
            path: '$offers',
            preserveNullAndEmptyArrays: true, // Keep products without offers
          },
        },
        // Step 4: Join with ReviewSummary collection
        {
          $lookup: {
            from: 'reviewSummaries', // Collection name for ReviewSummary
            localField: '_id',
            foreignField: 'productId',
            as: 'reviewSummary',
          },
        },
        // Step 5: Unwind reviewSummary (optional, as there's one summary per product)
        {
          $unwind: {
            path: '$reviewSummary',
            preserveNullAndEmptyArrays: true, // Keep products without a review summary
          },
        },
        // Step 6: Project the desired fields and calculate discountPrice
        {
          $project: {
            id: '$_id',
            name: 1,
            originalPrice: 1,
            discountPrice: {
              $round: [
                {
                  $cond: {
                    if: { $eq: [{ $ifNull: ['$offers', null] }, null] },
                    then: '$originalPrice', // No offer, use original price
                    else: {
                      $cond: {
                        if: { $eq: ['$offers.discountType', 'percentage'] },
                        then: {
                          $max: [
                            0, // Ensure discount price is never negative
                            {
                              $subtract: [
                                '$originalPrice',
                                {
                                  $multiply: [
                                    '$originalPrice',
                                    { $divide: ['$offers.discountValue', 100] },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        else: {
                          $max: [
                            0, // Ensure discount price is never negative
                            { $subtract: ['$originalPrice', '$offers.discountValue'] },
                          ],
                        }, // Flat discount
                      },
                    },
                  },
                },
              ],
            },
            image: { $arrayElemAt: ['$images', 0] }, // Get first image or null
            rating: { $ifNull: ['$reviewSummary.averageRating', 0] }, // Default to 0 if no summary
            reviews: { $ifNull: ['$reviewSummary.totalReviews', 0] }, // Default to 0 if no summary
            isNew: 1,
            isSale: 1,
            _id: 0, // Exclude _id from output
          },
        },
      ])
      .exec();

    return products;
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.productModel.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return slug;
  }

  private async generateUniqueSKU(prefix: string = 'SKU'): Promise<string> {
    let sku: string;
    let counter = 1;

    do {
      const randomPart = Math.floor(100000 + Math.random() * 900000);
      sku = `${prefix}-${randomPart}`;
      counter++;
    } while (await this.productModel.exists({ sku }));

    return sku;
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }


  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { name, brand, categories } = createProductDto;

    if (!name) {
      throw new BadRequestException('Product name is required to generate a slug.');
    }

    // Validate Brand exists
    const brandExists = await this.productModel.db
      .collection('brands')
      .findOne({ _id: new Types.ObjectId(brand) });

    if (!brandExists) {
      throw new BadRequestException('Invalid brand ID. Brand not found.');
    }

    // Validate Categories (optional but recommended)
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new BadRequestException('At least one category is required.');
    }

    const categoryObjectIds = categories.map((catId) => new Types.ObjectId(catId));

    const slug = await this.generateUniqueSlug(name);
    const sku = await this.generateUniqueSKU();

    const newProduct = new this.productModel({
      ...createProductDto,
      brand: new Types.ObjectId(brand),
      categories: categoryObjectIds,
      slug,
      sku,
    });

    return newProduct.save();
  }




async findByIdWithDetails(productId: string): Promise<any> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(productId)) {
      throw new NotFoundException('Invalid product ID format');
    }

    const productDetails = await this.productModel
      .aggregate([
        // Step 1: Match the specific product
        {
          $match: {
            _id: new Types.ObjectId(productId),
            status: ProductStatus.ACTIVE, // Only return active products
          },
        },
        // Step 2: Join with Brand collection
        {
          $lookup: {
            from: 'brands',
            localField: 'brand',
            foreignField: '_id',
            as: 'brandInfo',
          },
        },
        {
          $unwind: {
            path: '$brandInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Step 3: Join with Offer collection
        {
          $lookup: {
            from: 'offers',
            let: { productOffers: { $ifNull: ['$offers', []] } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $in: ['$_id', '$$productOffers'] },
                      { $eq: ['$appliesToAllProducts', true] },
                    ],
                  },
                },
              },
              {
                $match: {
                  isActive: true,
                },
              },
              {
                $sort: { discountValue: -1 },
              },
              { $limit: 1 },
            ],
            as: 'offers',
          },
        },
        {
          $unwind: {
            path: '$offers',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Step 4: Join with ReviewSummary collection
        {
          $lookup: {
            from: 'reviewSummaries',
            localField: '_id',
            foreignField: 'productId',
            as: 'reviewSummary',
          },
        },
        {
          $unwind: {
            path: '$reviewSummary',
            preserveNullAndEmptyArrays: true,
          },
        },
        // Step 5: Project the desired fields
        {
          $project: {
            id: '$_id',
            name: 1,
            originalPrice: 1,
            discountPrice: {
              $round: [
                {
                  $cond: {
                    if: { $eq: [{ $ifNull: ['$offers', null] }, null] },
                    then: '$originalPrice',
                    else: {
                      $cond: {
                        if: { $eq: ['$offers.discountType', 'percentage'] },
                        then: {
                          $max: [
                            0,
                            {
                              $subtract: [
                                '$originalPrice',
                                {
                                  $multiply: [
                                    '$originalPrice',
                                    { $divide: ['$offers.discountValue', 100] },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        else: {
                          $max: [
                            0,
                            { $subtract: ['$originalPrice', '$offers.discountValue'] },
                          ],
                        },
                      },
                    },
                  },
                },
              ],
            },
            rating: { $ifNull: ['$reviewSummary.averageRating', 0] },
            reviews: { $ifNull: ['$reviewSummary.totalReviews', 0] },
            inStock: 1,
            stockCount: 1,
            brand: { $ifNull: ['$brandInfo.name', 'Unknown Brand'] },
            sku: 1,
            images: 1,
            sizes: {
              $map: {
                input: '$sizes',
                as: 'size',
                in: {
                  name: '$$size.name',
                  inStock: '$$size.inStock',
                },
              },
            },
            colors: {
              $map: {
                input: '$colors',
                as: 'color',
                in: {
                  name: '$$color.name',
                  value: '$$color.value',
                  inStock: '$$color.inStock',
                },
              },
            },
            description: 1,
            features: 1,
            specifications: {
              $arrayToObject: {
                $map: {
                  input: { $objectToArray: '$specifications' },
                  as: 'spec',
                  in: {
                    k: '$$spec.k',
                    v: '$$spec.v',
                  },
                },
              },
            },
            careInstructions: 1,
            material: 1,
            gender: 1,
            tags: 1,
            isNew: 1,
            isSale: 1,
            isReturnable: 1,
            returnDays: 1,
            weight: 1,
            dimensions: 1,
            _id: 0,
          },
        },
      ])
      .exec();

    if (!productDetails || productDetails.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return {
      status: true,
      data: productDetails[0],
    };
  }


}


