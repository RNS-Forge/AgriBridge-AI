import { Router } from 'express';
import { MarketplaceController } from '../controller/marketplace.controller.js';
import { authenticate, authorize, tenantAware } from '../../auth/middleware/index.js';

const router = Router();
const controller = new MarketplaceController();

router.use(authenticate);

// Public query paths (All buyers and FPO admins can list or search listings)
router.get('/listings', controller.listListings);
router.get('/listings/:listingId', controller.getListingDetails);

// Wishlist paths
router.get('/wishlist/:buyerId', controller.getWishlist);
router.post('/wishlist/add', controller.addToWishlist);
router.post('/wishlist/remove', controller.removeFromWishlist);

// Offers & Negotiation
router.post('/offer', controller.submitOffer); // Buyers submit offers
router.post('/offer/:offerId/counter', authorize(['FPO_ADMIN', 'SuperAdmin']), tenantAware, controller.counterOffer); // FPO counter offers
router.post('/offer/:offerId/accept', controller.acceptOffer); // FPO accepts buyer offer, or Buyer accepts FPO counter offer
router.post('/offer/:offerId/reject', controller.rejectOffer); // FPO rejects buyer offer, or Buyer rejects counter offer

// Listings creations (Guarded by FPO_ADMIN / SuperAdmin & Tenant aware validation)
router.post('/listings', authorize(['FPO_ADMIN', 'SuperAdmin']), tenantAware, controller.createListing);

export default router;
