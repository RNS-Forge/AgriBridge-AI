import { db } from '../../../database/index.js';
import { markets, mandiPrices } from '../../../db/schema.js';
import { eq, and, sql, inArray } from 'drizzle-orm';
export class MandiRepository {
    async createMarket(marketData) {
        const [newMarket] = await db.insert(markets).values(marketData).returning();
        return newMarket;
    }
    async findMarketById(id) {
        const result = await db.select().from(markets).where(eq(markets.id, id)).limit(1);
        return result[0] || null;
    }
    async listMarkets() {
        return await db.select().from(markets);
    }
    async listMarketsByRegion(state, district) {
        const conditions = [eq(markets.state, state)];
        if (district) {
            conditions.push(eq(markets.district, district));
        }
        return await db.select().from(markets).where(and(...conditions));
    }
    async insertPrice(priceData) {
        const [newPrice] = await db.insert(mandiPrices).values(priceData).returning();
        return newPrice;
    }
    async insertPricesBatch(pricesData) {
        if (pricesData.length === 0)
            return [];
        return await db.insert(mandiPrices).values(pricesData).returning();
    }
    /**
     * Fetch daily prices based on filters.
     */
    async getPrices(filters) {
        const conditions = [];
        if (filters.commodityName) {
            conditions.push(eq(mandiPrices.commodityName, filters.commodityName));
        }
        if (filters.priceDate) {
            // Compare dates only (ignoring time)
            conditions.push(sql `date_trunc('day', ${mandiPrices.priceDate}) = date_trunc('day', ${filters.priceDate}::timestamp)`);
        }
        const marketConditions = [];
        if (filters.state) {
            marketConditions.push(eq(markets.state, filters.state));
        }
        if (filters.district) {
            marketConditions.push(eq(markets.district, filters.district));
        }
        let query = db
            .select({
            price: mandiPrices,
            market: markets,
        })
            .from(mandiPrices)
            .innerJoin(markets, eq(mandiPrices.marketId, markets.id));
        const finalConditions = [...conditions];
        if (marketConditions.length > 0) {
            finalConditions.push(...marketConditions);
        }
        if (finalConditions.length > 0) {
            query = query.where(and(...finalConditions));
        }
        // Sort by latest priceDate and modalPrice desc
        return await query.orderBy(sql `${mandiPrices.priceDate} DESC, ${mandiPrices.modalPrice} DESC`);
    }
    /**
     * Compare prices of a commodity across multiple mandis.
     */
    async getPricesComparison(commodityName, marketIds) {
        if (marketIds.length === 0)
            return [];
        return await db
            .select({
            price: mandiPrices,
            market: markets,
        })
            .from(mandiPrices)
            .innerJoin(markets, eq(mandiPrices.marketId, markets.id))
            .where(and(eq(mandiPrices.commodityName, commodityName), inArray(mandiPrices.marketId, marketIds)))
            .orderBy(sql `${mandiPrices.priceDate} DESC`);
    }
}
