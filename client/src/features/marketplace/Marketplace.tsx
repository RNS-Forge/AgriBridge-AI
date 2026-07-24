import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index.js';
import { Button } from '../../components/ui/Button/index.js';

interface Listing {
  id: string;
  tenantId: string;
  fpoName?: string;
  poolId: string | null;
  batchId: string | null;
  title: string;
  description: string | null;
  quantityKg: string;
  pricePerKg: string;
  status: string;
  createdAt: string;
}

interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName?: string;
  offerPricePerKg: string;
  quantityKg: string;
  status: string;
  counterPricePerKg: string | null;
  offeredBy: string;
  updatedAt: string;
}

export default function Marketplace() {
  const { token, user, tenantId } = useSelector((state: RootState) => state.auth);
  const [listings, setListings] = useState<Listing[]>([]);
  const [offers, setOffers] = useState<Record<string, Offer[]>>({});
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);

  // Listing creation inputs
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Offer modal inputs
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState('');

  // Counter offer state
  const [activeCounterOfferId, setActiveCounterOfferId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');

  const isFpoAdmin = user?.roles.includes('FPO_ADMIN') || user?.roles.includes('SuperAdmin');

  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:8000/api/v1/marketplace/listings?status=active`;
      if (search) url += `&search=${search}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setListings(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffersForListing = async (listingId: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/marketplace/listings/${listingId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      // Mocking or fetching offers trail
      // In this client view we will query offers list or mock them
      setOffers(prev => ({
        ...prev,
        [listingId]: [
          {
            id: 'offer-1',
            listingId,
            buyerId: 'buyer-99',
            buyerName: 'Aman Food Exports LLC',
            offerPricePerKg: '22.00',
            quantityKg: '10000.00',
            status: 'pending',
            counterPricePerKg: null,
            offeredBy: 'buyer',
            updatedAt: new Date().toISOString(),
          }
        ]
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [search, minPrice, maxPrice]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/marketplace/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          tenantId,
          title: newTitle,
          description: newDesc,
          quantityKg: Number(newQty),
          pricePerKg: Number(newPrice),
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchListings();
        setNewTitle('');
        setNewDesc('');
        setNewQty('');
        setNewPrice('');
      } else {
        const body = await res.json();
        alert(body.message || 'Listing creation failed');
      }
    } catch (err) {
      alert('Error creating listing');
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    try {
      const res = await fetch('http://localhost:8000/api/v1/marketplace/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: selectedListing.id,
          buyerId: '00000000-0000-0000-0000-000000000000', // Mock Buyer UUID
          offerPricePerKg: Number(offerPrice),
          quantityKg: Number(offerQty),
        }),
      });

      if (res.ok) {
        setSelectedListing(null);
        alert('Offer submitted successfully!');
        fetchListings();
      } else {
        const body = await res.json();
        alert(body.message || 'Offer submission failed');
      }
    } catch (err) {
      alert('Error submitting offer');
    }
  };

  const handleCounterOffer = async (offerId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/marketplace/offer/${offerId}/counter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-ID': tenantId || '',
        },
        body: JSON.stringify({
          counterPricePerKg: Number(counterPrice),
        }),
      });

      if (res.ok) {
        setActiveCounterOfferId(null);
        setCounterPrice('');
        alert('Counter-offer submitted to buyer successfully!');
      }
    } catch (err) {
      alert('Error submitting counter offer');
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/marketplace/offer/${offerId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        alert('Offer accepted successfully! Purchase order generated.');
        fetchListings();
      }
    } catch (err) {
      alert('Error accepting offer');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950/30 to-slate-900 p-8 rounded-3xl border border-slate-800">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Global Trade Catalog
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">
              Agri <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Marketplace</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Trade high quality crop pools with verified domestic and export buyers.
              Review bids, negotiate prices, and manage purchase orders seamlessly.
            </p>
          </div>
          {isFpoAdmin && (
            <Button
              onClick={() => setShowAddModal(true)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Sales Listing
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Search Listing</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
              placeholder="Search by variety or description..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Min Price (INR)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Max Price (INR)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <p>Loading marketplace listings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="group relative overflow-hidden bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-950/20">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">{listing.title}</h3>
                  <span className="text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
                    {listing.pricePerKg} INR/kg
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{listing.description}</p>
                <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                  <div className="bg-slate-950/50 rounded-lg p-3">
                    <span className="block font-semibold text-slate-400 mb-1">Quantity</span>
                    <span className="text-slate-200 font-medium">{listing.quantityKg} kg</span>
                  </div>
                  <div className="bg-slate-950/50 rounded-lg p-3">
                    <span className="block font-semibold text-slate-400 mb-1">FPO Owner</span>
                    <span className="text-slate-200 font-medium">{listing.fpoName || 'AgriBridge FPO'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Offer list for FPO Admin */}
                {isFpoAdmin ? (
                  <div>
                    <button
                      onClick={() => fetchOffersForListing(listing.id)}
                      className="text-xs text-emerald-400 hover:underline mb-2 block"
                    >
                      View Active Buyer Offers
                    </button>
                    {offers[listing.id]?.map((off) => (
                      <div key={off.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span>{off.buyerName}</span>
                          <span className="text-emerald-400">{off.offerPricePerKg} INR/kg</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Qty: {off.quantityKg} kg</span>
                          <span>Status: {off.status}</span>
                        </div>
                        <div className="flex space-x-2 pt-1">
                          <button
                            onClick={() => handleAcceptOffer(off.id)}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-semibold"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => setActiveCounterOfferId(off.id)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold border border-slate-700"
                          >
                            Counter
                          </button>
                        </div>
                        {activeCounterOfferId === off.id && (
                          <div className="flex items-center space-x-2 pt-2">
                            <input
                              type="number"
                              value={counterPrice}
                              onChange={(e) => setCounterPrice(e.target.value)}
                              placeholder="Counter Price"
                              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100 w-24"
                            />
                            <button
                              onClick={() => handleCounterOffer(off.id)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded font-semibold"
                            >
                              Submit
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="w-full py-2 bg-slate-800 hover:bg-emerald-950 hover:text-emerald-400 hover:border-emerald-800/30 text-sm font-semibold rounded-lg border border-slate-700 transition-colors"
                  >
                    Submit Purchase Offer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-950/20">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-100">Create Marketplace Listing</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-100 transition-colors p-1 hover:bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Listing Title</label>
                <input 
                  type="text" 
                  required 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                  placeholder="e.g. Premium Cotton Grade A" 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)} 
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors resize-none" 
                  placeholder="Details about grade, moisture, harvest date..." 
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quantity (kg)</label>
                  <input 
                    type="number" 
                    required 
                    value={newQty} 
                    onChange={e => setNewQty(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price Per kg (INR)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={newPrice} 
                    onChange={e => setNewPrice(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="25.00"
                  />
                </div>
              </div>
              <Button type="submit">
                Publish Listing
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-950/20">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3.75-3a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm4.5 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-100">Submit Purchase Offer</h3>
              </div>
              <button 
                onClick={() => setSelectedListing(null)} 
                className="text-slate-400 hover:text-slate-100 transition-colors p-1 hover:bg-slate-800 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Making offer on:</p>
                <p className="text-sm font-semibold text-slate-200">{selectedListing.title}</p>
                <p className="text-xs text-emerald-400 mt-1">Current Price: {selectedListing.pricePerKg} INR/kg</p>
              </div>
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your Offer Price Per kg (INR)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={offerPrice} 
                    onChange={e => setOfferPrice(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="e.g. 24.50" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Requested Quantity (kg)</label>
                  <input 
                    type="number" 
                    required 
                    value={offerQty} 
                    onChange={e => setOfferQty(e.target.value)} 
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none transition-colors" 
                    placeholder="e.g. 10000" 
                  />
                </div>
                <Button type="submit">
                  Submit Offer
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
