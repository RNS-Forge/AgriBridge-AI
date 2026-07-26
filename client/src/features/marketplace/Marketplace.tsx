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
      // Mocking or fetching offers
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
          buyerId: '00000000-0000-0000-0000-000000000000',
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
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
              Agri Marketplace
            </h1>
            <p className="text-sm text-gray-500 max-w-xl">
              Trade high-quality crop pools with verified domestic and export buyers.
              Review bids, negotiate prices, and manage purchase orders seamlessly.
            </p>
          </div>
          {isFpoAdmin && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
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
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Listing</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Search by variety or description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (INR)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (INR)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p>Loading marketplace listings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-base font-semibold text-gray-900">{listing.title}</h3>
                <span className="text-xs bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 px-3 py-1 rounded-md font-mono">
                  {listing.pricePerKg} INR/kg
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{listing.description}</p>
              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="block font-semibold text-gray-600 mb-1">Quantity</span>
                  <span className="text-gray-900 font-medium">{listing.quantityKg} kg</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <span className="block font-semibold text-gray-600 mb-1">FPO Owner</span>
                  <span className="text-gray-900 font-medium">{listing.fpoName || 'AgriBridge FPO'}</span>
                </div>
              </div>

              <div className="space-y-4">
                {isFpoAdmin ? (
                  <div>
                    <button
                      onClick={() => fetchOffersForListing(listing.id)}
                      className="text-xs text-blue-600 hover:underline mb-2 block"
                    >
                      View Active Buyer Offers
                    </button>
                    {offers[listing.id]?.map((off) => (
                      <div key={off.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span>{off.buyerName}</span>
                          <span className="text-emerald-600">{off.offerPricePerKg} INR/kg</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Qty: {off.quantityKg} kg</span>
                          <span>Status: {off.status}</span>
                        </div>
                        <div className="flex space-x-2 pt-1">
                          <Button
                            onClick={() => handleAcceptOffer(off.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() => setActiveCounterOfferId(off.id)}
                            className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          >
                            Counter
                          </Button>
                        </div>
                        {activeCounterOfferId === off.id && (
                          <div className="flex items-center space-x-2 pt-2">
                            <input
                              type="number"
                              value={counterPrice}
                              onChange={(e) => setCounterPrice(e.target.value)}
                              placeholder="Counter Price"
                              className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-900 text-xs w-24 focus:border-blue-500 focus:ring-blue-500"
                            />
                            <Button
                              onClick={() => handleCounterOffer(off.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                            >
                              Submit
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Button
                    onClick={() => setSelectedListing(listing)}
                    className="w-full py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Submit Purchase Offer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Create Marketplace Listing</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateListing} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="e.g. Premium Cotton Grade A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  placeholder="Details about grade, moisture, harvest date..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    value={newQty}
                    onChange={e => setNewQty(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Per kg (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="25.00"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
              >
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">Submit Purchase Offer</h3>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Making offer on:</p>
                <p className="text-sm font-semibold text-gray-900">{selectedListing.title}</p>
                <p className="text-xs text-emerald-600 mt-1">Current Price: {selectedListing.pricePerKg} INR/kg</p>
              </div>
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Offer Price Per kg (INR)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={offerPrice}
                    onChange={e => setOfferPrice(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g. 24.50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requested Quantity (kg)</label>
                  <input
                    type="number"
                    required
                    value={offerQty}
                    onChange={e => setOfferQty(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g. 10000"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200"
                >
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