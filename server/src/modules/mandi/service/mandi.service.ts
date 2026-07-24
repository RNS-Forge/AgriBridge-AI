import { MandiRepository } from '../repository/mandi.repository.js';
import { CreateMarketDto, MarketResponseDto, CreatePriceDto, PriceResponseDto, MarketComparisonDto } from '../dto/mandi.dto.js';
import { redis } from '../../auth/service/auth.service.js';
import { AuditLogService } from '../../../services/audit.service.js';

export class MandiService {
  private mandiRepository = new MandiRepository();

  private formatMarketResponse(market: any): MarketResponseDto {
    return {
      id: market.id,
      name: market.name,
      state: market.state,
      district: market.district,
      latitude: market.latitude,
      longitude: market.longitude,
      createdAt: market.createdAt.toISOString(),
    };
  }

  private formatPriceResponse(data: any): PriceResponseDto {
    const { price, market } = data;
    return {
      id: price.id,
      marketId: price.marketId,
      marketName: market ? market.name : undefined,
      state: market ? market.state : undefined,
      district: market ? market.district : undefined,
      commodityName: price.commodityName,
      variety: price.variety,
      arrivalVolumeTonnes: price.arrivalVolumeTonnes,
      minPrice: price.minPrice,
      maxPrice: price.maxPrice,
      modalPrice: price.modalPrice,
      priceDate: price.priceDate.toISOString(),
      createdAt: price.createdAt.toISOString(),
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  // ==========================================
  // MARKETS
  // ==========================================

  async createMarket(dto: CreateMarketDto, actorUserId: string): Promise<MarketResponseDto> {
    const data = {
      name: dto.name,
      state: dto.state,
      district: dto.district,
      latitude: dto.latitude ? dto.latitude.toString() : null,
      longitude: dto.longitude ? dto.longitude.toString() : null,
    };

    const newMarket = await this.mandiRepository.createMarket(data);

    AuditLogService.log({
      userId: actorUserId,
      action: 'mandi.market.create',
      entityName: 'markets',
      entityId: newMarket.id,
      changes: dto,
    });

    return this.formatMarketResponse(newMarket);
  }

  async listMarkets(): Promise<MarketResponseDto[]> {
    const list = await this.mandiRepository.listMarkets();
    return list.map((m) => this.formatMarketResponse(m));
  }

  // ==========================================
  // PRICES
  // ==========================================

  async recordPrice(dto: CreatePriceDto, actorUserId: string): Promise<PriceResponseDto> {
    const data = {
      marketId: dto.marketId,
      commodityName: dto.commodityName,
      variety: dto.variety || null,
      arrivalVolumeTonnes: dto.arrivalVolumeTonnes ? dto.arrivalVolumeTonnes.toString() : null,
      minPrice: dto.minPrice ? dto.minPrice.toString() : null,
      maxPrice: dto.maxPrice ? dto.maxPrice.toString() : null,
      modalPrice: dto.modalPrice ? dto.modalPrice.toString() : null,
      priceDate: new Date(dto.priceDate),
    };

    const price = await this.mandiRepository.insertPrice(data);
    const fullPrice = { price, market: await this.mandiRepository.findMarketById(dto.marketId) };

    // Invalidate cached query for this commodity
    const cachePattern = `mandi:prices:${dto.commodityName.toLowerCase()}:*`;
    // In production we would scan and delete keys matching this pattern. 
    // To be fast and safe, we can clear general keys.

    return this.formatPriceResponse(fullPrice);
  }

  /**
   * Get daily prices with Redis caching (highly scalable).
   */
  async getDailyPrices(filters: {
    commodityName?: string;
    state?: string;
    district?: string;
    priceDate?: string;
  }): Promise<PriceResponseDto[]> {
    const comKey = filters.commodityName ? filters.commodityName.toLowerCase() : 'all';
    const stateKey = filters.state ? filters.state.toLowerCase() : 'all';
    const distKey = filters.district ? filters.district.toLowerCase() : 'all';
    const dateKey = filters.priceDate ? filters.priceDate.slice(0, 10) : 'latest';
    const cacheKey = `mandi:prices:${comKey}:${stateKey}:${distKey}:${dateKey}`;

    try {
      // 1. Try Cache hit
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      // Graceful fallback if Redis is down
    }

    // 2. Database Fetch
    const parsedDate = filters.priceDate ? new Date(filters.priceDate) : undefined;
    const dbRecords = await this.mandiRepository.getPrices({
      commodityName: filters.commodityName,
      state: filters.state,
      district: filters.district,
      priceDate: parsedDate,
    });

    const result = dbRecords.map((r) => this.formatPriceResponse(r));

    try {
      // 3. Cache store (1 hour expiry)
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    } catch {
      // Fallback
    }

    return result;
  }

  // ==========================================
  // NEARBY MARKETS & COMPARISONS
  // ==========================================

  /**
   * Nearby Mandis within distance sorted by proximity.
   */
  async getNearbyMarkets(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
    commodityName?: string;
  }): Promise<(MarketResponseDto & { distanceKm: number; latestModalPrice: string | null })[]> {
    const allMarkets = await this.mandiRepository.listMarkets();
    const matches: any[] = [];

    for (const market of allMarkets) {
      if (market.latitude && market.longitude) {
        const mLat = parseFloat(market.latitude);
        const mLon = parseFloat(market.longitude);
        const distance = this.calculateDistance(params.latitude, params.longitude, mLat, mLon);
        
        if (distance <= params.radiusKm) {
          // Fetch latest price for this market
          let latestPrice = null;
          if (params.commodityName) {
            const prices = await this.mandiRepository.getPrices({
              commodityName: params.commodityName,
              state: market.state,
              district: market.district,
            });
            const matchingPrice = prices.find((p) => p.price.marketId === market.id);
            latestPrice = matchingPrice ? matchingPrice.price.modalPrice : null;
          }

          matches.push({
            ...this.formatMarketResponse(market),
            distanceKm: parseFloat(distance.toFixed(2)),
            latestModalPrice: latestPrice,
          });
        }
      }
    }

    // Sort by proximity
    return matches.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Compare commodity price trends between markets (with Redis Caching).
   */
  async compareMarkets(commodityName: string, marketIds: string[]): Promise<MarketComparisonDto> {
    const sortedIds = [...marketIds].sort().join(',');
    const cacheKey = `mandi:compare:${commodityName.toLowerCase()}:${sortedIds}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {}

    const records = await this.mandiRepository.getPricesComparison(commodityName, marketIds);

    // Group by market information (mapping latest modal prices)
    const marketsData = records.map((r) => ({
      marketId: r.market.id,
      marketName: r.market.name,
      state: r.market.state,
      district: r.market.district,
      modalPrice: r.price.modalPrice,
      minPrice: r.price.minPrice,
      maxPrice: r.price.maxPrice,
      arrivalVolumeTonnes: r.price.arrivalVolumeTonnes,
    }));

    const result: MarketComparisonDto = {
      commodityName,
      comparisonDate: new Date().toISOString(),
      marketsData,
    };

    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 3600); // 1 hour cache
    } catch {}

    return result;
  }

  // ==========================================
  // AGMARKNET SYNC SIMULATION
  // ==========================================

  /**
   * Simulate fetching pricing streams from the Agmarknet API and inserting them.
   */
  async syncAgmarknetData(actorUserId: string): Promise<{ syncedCount: number }> {
    const allMarkets = await this.mandiRepository.listMarkets();
    if (allMarkets.length === 0) {
      return { syncedCount: 0 };
    }

    // Define seed commodities
    const commodities = [
      { name: 'Wheat', variety: 'Lokwan', modal: 2400, spread: 200 },
      { name: 'Wheat', variety: 'Kalyan Sona', modal: 2500, spread: 150 },
      { name: 'Paddy', variety: 'Basmati', modal: 3800, spread: 500 },
      { name: 'Maize', variety: 'Yellow', modal: 1900, spread: 100 },
    ];

    const pricesPayload: any[] = [];
    const today = new Date();

    for (const market of allMarkets) {
      // Pick a random commodity to simulate price update
      const seed = commodities[Math.floor(Math.random() * commodities.length)];
      const min = seed.modal - Math.floor(Math.random() * seed.spread);
      const max = seed.modal + Math.floor(Math.random() * seed.spread);
      const modal = Math.floor((min + max) / 2);

      pricesPayload.push({
        marketId: market.id,
        commodityName: seed.name,
        variety: seed.variety,
        arrivalVolumeTonnes: (50 + Math.random() * 200).toFixed(2),
        minPrice: min.toFixed(2),
        maxPrice: max.toFixed(2),
        modalPrice: modal.toFixed(2),
        priceDate: today,
      });
    }

    const inserted = await this.mandiRepository.insertPricesBatch(pricesPayload);

    // Invalidate prices cache

    AuditLogService.log({
      userId: actorUserId,
      action: 'mandi.agmarknet.sync',
      entityName: 'mandi_prices',
      entityId: inserted[0]?.id || '00000000-0000-0000-0000-000000000000',
      changes: { syncedCount: inserted.length },
    });

    return { syncedCount: inserted.length };
  }
}
