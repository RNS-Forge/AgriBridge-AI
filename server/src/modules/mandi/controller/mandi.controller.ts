import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../auth/types/auth.types.js';
import { MandiService } from '../service/mandi.service.js';
import { createMarketSchema, createPriceSchema, queryPricesSchema } from '../validation/mandi.validation.js';

export class MandiController {
  private mandiService = new MandiService();

  createMarket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createMarketSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.mandiService.createMarket(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Market record created successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  recordPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const validated = createPriceSchema.parse(authReq.body);
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.mandiService.recordPrice(validated, actorUserId);
      res.status(201).json({
        success: true,
        message: 'Mandi daily commodity price entry recorded successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listMarkets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.mandiService.listMarkets();
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getDailyPrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commodityName, state, district, priceDate } = req.query;

      const result = await this.mandiService.getDailyPrices({
        commodityName: commodityName as string,
        state: state as string,
        district: district as string,
        priceDate: priceDate as string,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getNearbyMarkets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { latitude, longitude, radiusKm, commodityName } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and Longitude query coordinates are required.',
        });
      }

      const rad = radiusKm ? parseFloat(radiusKm as string) : 50; // default 50km
      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinate parameters.',
        });
      }

      const result = await this.mandiService.getNearbyMarkets({
        latitude: lat,
        longitude: lon,
        radiusKm: rad,
        commodityName: commodityName as string,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  compareMarkets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commodityName, marketIds } = req.query;

      if (!commodityName || !marketIds) {
        return res.status(400).json({
          success: false,
          message: 'commodityName and comma-separated marketIds list query parameters are required.',
        });
      }

      const idsList = (marketIds as string).split(',').map((id) => id.trim()).filter((id) => id.length > 0);

      if (idsList.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'At least two market IDs are required to perform a comparison.',
        });
      }

      const result = await this.mandiService.compareMarkets(commodityName as string, idsList);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  triggerSync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      const actorUserId = authReq.user?.userId || 'system';

      const result = await this.mandiService.syncAgmarknetData(actorUserId);
      res.status(200).json({
        success: true,
        message: 'Agmarknet pricing sync execution triggered successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
