import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/types/auth.types.js';
import { MarketplaceService } from '../service/marketplace.service.js';
import { 
  createListingSchema, 
  createOfferSchema, 
  counterOfferSchema 
} from '../validation/marketplace.validation.js';

export class MarketplaceController {
  private marketplaceService = new MarketplaceService();

  // ==========================================
  // LISTINGS
  // ==========================================

  createListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createListingSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.marketplaceService.createListing(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Marketplace sales listing created successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getListingDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { listingId } = req.params;
      const result = await this.marketplaceService.getListingDetails(listingId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listListings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, minPrice, maxPrice, minQuantity, status, sortBy, sortOrder, page, limit } = req.query;

      const result = await this.marketplaceService.listListings({
        search: search as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minQuantity: minQuantity ? parseFloat(minQuantity as string) : undefined,
        status: status as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // OFFERS & NEGOTIATIONS
  // ==========================================

  submitOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createOfferSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.marketplaceService.submitOffer(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Offer submitted successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  counterOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { offerId } = authReq.params;
      const validated = counterOfferSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      const result = await this.marketplaceService.fpoCounterOffer(
        offerId,
        validated.counterPricePerKg,
        actorUserId,
        actorTenantId
      );

      res.status(200).json({
        success: true,
        message: 'Counter-offer submitted to buyer successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  acceptOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { offerId } = authReq.params;
      const actorUserId = authReq.user?.userId || 'system';
      const actorTenantId = authReq.user?.roles.includes('SuperAdmin') ? null : (authReq.user?.tenantId || null);

      const result = await this.marketplaceService.acceptOffer(offerId, actorUserId, actorTenantId);
      res.status(200).json({
        success: true,
        message: 'Offer accepted successfully. Purchase order generated.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  rejectOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const { offerId } = authReq.params;
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.marketplaceService.rejectOffer(offerId, actorUserId);
      res.status(200).json({
        success: true,
        message: 'Offer rejected successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==========================================
  // WISHLIST
  // ==========================================

  addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { buyerId, listingId } = req.body;
      if (!buyerId || !listingId) {
        return res.status(400).json({
          success: false,
          message: 'buyerId and listingId are required to wishlist.',
        });
      }

      await this.marketplaceService.addToWishlist(buyerId, listingId);
      res.status(200).json({
        success: true,
        message: 'Listing added to buyer wishlist.',
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { buyerId, listingId } = req.body;
      if (!buyerId || !listingId) {
        return res.status(400).json({
          success: false,
          message: 'buyerId and listingId are required to remove from wishlist.',
        });
      }

      await this.marketplaceService.removeFromWishlist(buyerId, listingId);
      res.status(200).json({
        success: true,
        message: 'Listing removed from buyer wishlist.',
      });
    } catch (error) {
      next(error);
    }
  };

  getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { buyerId } = req.params;
      const result = await this.marketplaceService.getWishlist(buyerId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
