import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Button } from '../../components/ui/Button/index.js';

interface MandiPrice {
  id: string;
  marketId: string;
  commodityName: string;
  variety: string;
  arrivalVolumeTonnes: string;
  minPrice: string;
  maxPrice: string;
  modalPrice: string;
  priceDate: string;
  market?: {
    marketName: string;
    district: string;
    state: string;
  };
}

export default function Mandi() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [prices, setPrices] = useState<MandiPrice[]>([]);
  const [search, setSearch] = useState('');
  const [stateName, setStateName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMandiPrices = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:8000/api/v1/mandi/prices?limit=25`;
      if (search) url += `&commodity=${search}`;
      if (stateName) url += `&state=${stateName}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPrices(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandiPrices();
  }, [search, stateName]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900 p-8 rounded-3xl border border-slate-800">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Live Price Feed
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">
            Mandi <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">Price Index</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Live Agmarknet prices feed with Redis caching fallback. Track commodity prices
            across markets for informed trading decisions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Commodity</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
              placeholder="e.g. Cotton, Wheat"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">State</label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
              placeholder="e.g. Maharashtra, Gujarat"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={fetchMandiPrices}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.183m0-4.992v4.99" />
              </svg>
              Force Sync Feed
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
          <p>Loading daily prices index...</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Market</th>
                <th className="px-6 py-4">Commodity / Variety</th>
                <th className="px-6 py-4">Arrival Volume</th>
                <th className="px-6 py-4">Min Price</th>
                <th className="px-6 py-4">Max Price</th>
                <th className="px-6 py-4 font-bold text-amber-400">Modal Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227 4.773L5.636 16.591M5.636 7.409l1.591-1.591" />
                    </svg>
                    <p>No mandi pricing records found matching current filter context.</p>
                  </td>
                </tr>
              ) : (
                prices.map((price) => (
                  <tr key={price.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-100">{price.market?.marketName}</p>
                      <p className="text-xs text-slate-500">
                        {price.market?.district}, {price.market?.state}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{price.commodityName}</p>
                      <p className="text-xs text-slate-500">{price.variety || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">{price.arrivalVolumeTonnes ? `${price.arrivalVolumeTonnes} Tonnes` : 'N/A'}</td>
                    <td className="px-6 py-4">{price.minPrice} INR/q</td>
                    <td className="px-6 py-4">{price.maxPrice} INR/q</td>
                    <td className="px-6 py-4 font-bold text-amber-400">{price.modalPrice} INR/q</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
