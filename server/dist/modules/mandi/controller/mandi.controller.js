import { MandiService } from '../service/mandi.service.js';
import { createMarketSchema, createPriceSchema } from '../validation/mandi.validation.js';
export class MandiController {
    mandiService = new MandiService();
    createMarket = async (req, res, next) => {
        try {
            const authReq = req;
            const validated = createMarketSchema.parse(authReq.body);
            const actorUserId = authReq.user?.userId || 'system';
            const result = await this.mandiService.createMarket(validated, actorUserId);
            res.status(201).json({
                success: true,
                message: 'Market record created successfully.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    recordPrice = async (req, res, next) => {
        try {
            const authReq = req;
            const validated = createPriceSchema.parse(authReq.body);
            const actorUserId = authReq.user?.userId || 'system';
            const result = await this.mandiService.recordPrice(validated, actorUserId);
            res.status(201).json({
                success: true,
                message: 'Mandi daily commodity price entry recorded successfully.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    listMarkets = async (req, res, next) => {
        try {
            const result = await this.mandiService.listMarkets();
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getDailyPrices = async (req, res, next) => {
        try {
            const { commodityName, state, district, priceDate } = req.query;
            const result = await this.mandiService.getDailyPrices({
                commodityName: commodityName,
                state: state,
                district: district,
                priceDate: priceDate,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getNearbyMarkets = async (req, res, next) => {
        try {
            const { latitude, longitude, radiusKm, commodityName } = req.query;
            if (!latitude || !longitude) {
                return res.status(400).json({
                    success: false,
                    message: 'Latitude and Longitude query coordinates are required.',
                });
            }
            const rad = radiusKm ? parseFloat(radiusKm) : 50; // default 50km
            const lat = parseFloat(latitude);
            const lon = parseFloat(longitude);
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
                commodityName: commodityName,
            });
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    compareMarkets = async (req, res, next) => {
        try {
            const { commodityName, marketIds } = req.query;
            if (!commodityName || !marketIds) {
                return res.status(400).json({
                    success: false,
                    message: 'commodityName and comma-separated marketIds list query parameters are required.',
                });
            }
            const idsList = marketIds.split(',').map((id) => id.trim()).filter((id) => id.length > 0);
            if (idsList.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'At least two market IDs are required to perform a comparison.',
                });
            }
            const result = await this.mandiService.compareMarkets(commodityName, idsList);
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    triggerSync = async (req, res, next) => {
        try {
            const authReq = req;
            const actorUserId = authReq.user?.userId || 'system';
            const result = await this.mandiService.syncAgmarknetData(actorUserId);
            res.status(200).json({
                success: true,
                message: 'Agmarknet pricing sync execution triggered successfully.',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
