import crypto from 'crypto';
import { supabase } from '../config/index.js';
function hash(pwd) {
    return crypto.createHash('sha256').update(pwd).digest('hex');
}
const DEFAULT_HASH = hash('AgriBridgeAI@2026');
// ---------------------------------------------------------------------------
// Store Implementation
// ---------------------------------------------------------------------------
class Phase1Store {
    users = [];
    userRequests = [];
    farms = [];
    plots = [];
    cropCycles = [];
    tasks = [];
    inventoryItems = [];
    expenses = [];
    mandiPrices = [];
    produceListings = [];
    offers = [];
    orders = [];
    mandis = [];
    mandiSlots = [];
    slotBookings = [];
    mandiSales = [];
    profitReports = [];
    auditLogs = [];
    disputes = [];
    constructor() {
        this.seedDefaults();
        this.initSupabase().catch((err) => {
            console.warn('[Supabase DB Sync]:', err.message);
        });
    }
    seedDefaults() {
        // 1. Users for each of the 7 roles (Password: AgriBridgeAI@2026)
        this.users = [
            {
                id: 'usr-admin-01',
                email: 'admin@agribridge.com',
                passwordHash: DEFAULT_HASH,
                firstName: 'System',
                lastName: 'Administrator',
                phone: '+91 98765 00001',
                roles: ['ADMIN'],
                status: 'active',
                createdAt: '2026-08-01T10:00:00Z',
            },
            {
                id: 'usr-adminmaker-01',
                email: 'adminmaker@agribridge.com',
                passwordHash: DEFAULT_HASH,
                firstName: 'Vikram',
                lastName: 'Maker',
                phone: '+91 98765 00002',
                roles: ['ADMIN_MAKER'],
                status: 'active',
                createdAt: '2026-08-02T11:00:00Z',
            },
            {
                id: 'usr-farmer-01',
                email: 'farmer@agribridge.com',
                passwordHash: DEFAULT_HASH,
                firstName: 'Rajesh',
                lastName: 'Sharma',
                phone: '+91 98765 11111',
                roles: ['FARMER'],
                status: 'active',
                createdAt: '2026-08-05T09:30:00Z',
            },
            {
                id: 'usr-manager-01',
                email: 'farmmanager@agribridge.com',
                passwordHash: DEFAULT_HASH,
                firstName: 'Amit',
                lastName: 'Verma',
                phone: '+91 98765 22222',
                roles: ['FARM_MANAGER'],
                status: 'active',
                createdAt: '2026-08-06T10:00:00Z',
            },
            {
                id: 'usr-worker-01',
                email: 'worker@agribridge.com',
                passwordHash: DEFAULT_HASH,
                firstName: 'Suresh',
                lastName: 'Patil',
                phone: '+91 98765 33333',
                roles: ['WORKER'],
                status: 'active',
                createdAt: '2026-08-07T08:00:00Z',
            },
            {
                id: 'usr-buyer-01',
                email: 'buyer@agribridge.com',
                passwordHash: DEFAULT_HASH,
                firstName: 'Sunil',
                lastName: 'Mehta',
                phone: '+91 98765 44444',
                roles: ['BUYER'],
                status: 'active',
                createdAt: '2026-08-08T12:00:00Z',
            },
            {
                id: 'usr-agent-01',
                email: 'mandiagent@agribridge.com',
                passwordHash: DEFAULT_HASH,
                firstName: 'Ganesh',
                lastName: 'Shinde',
                phone: '+91 98765 55555',
                roles: ['MANDI_AGENT'],
                status: 'active',
                createdAt: '2026-08-09T07:30:00Z',
            },
        ];
        // 2. User Requests (Approval Queue)
        this.userRequests = [
            {
                id: 'req-001',
                email: 'kiran.deshmukh@gmail.com',
                passwordHash: DEFAULT_HASH,
                firstName: 'Kiran',
                lastName: 'Deshmukh',
                phone: '+91 98220 12345',
                requestedRole: 'FARMER',
                requestedBy: 'adminmaker@agribridge.com',
                status: 'PENDING_APPROVAL',
                notes: 'Owns 15 acres pomegranate orchard in Niphad, Nashik. Verified local documents.',
                createdAt: '2026-09-02T14:20:00Z',
            },
            {
                id: 'req-002',
                email: 'sahil.procure@bigbasket.in',
                passwordHash: DEFAULT_HASH,
                firstName: 'Sahil',
                lastName: 'Kapoor',
                phone: '+91 98110 54321',
                requestedRole: 'BUYER',
                requestedBy: 'SELF_REGISTER',
                status: 'PENDING_APPROVAL',
                notes: 'Institutional wholesale procurement request for western Maharashtra hub.',
                createdAt: '2026-09-03T09:15:00Z',
            },
        ];
        // 3. Farms & Plots (Owned by Farmer Rajesh Sharma)
        this.farms = [
            {
                id: 'farm-01',
                farmerId: 'usr-farmer-01',
                name: 'Surya Green Valley Farm',
                location: 'Dindori Taluka, Nashik District, Maharashtra',
                totalAreaAcres: 25.0,
                soilType: 'Black Loamy',
                waterSource: 'Borewell & Drip Irrigation',
                ownershipType: 'Owned',
                latitude: 20.0889,
                longitude: 73.8344,
                managerIds: ['usr-manager-01'],
                createdAt: '2026-08-10T08:00:00Z',
            },
            {
                id: 'farm-02',
                farmerId: 'usr-farmer-01',
                name: 'Krishna Riverbed Plot',
                location: 'Pimpalgaon Baswant, Nashik, Maharashtra',
                totalAreaAcres: 12.5,
                soilType: 'Alluvial Riverbed',
                waterSource: 'River Canal & Pump',
                ownershipType: 'Leased',
                latitude: 20.1704,
                longitude: 73.9877,
                managerIds: ['usr-manager-01'],
                createdAt: '2026-08-12T09:00:00Z',
            },
        ];
        this.plots = [
            {
                id: 'plot-01',
                farmId: 'farm-01',
                name: 'Plot A — Pomegranate Orchard (Bhagwa)',
                areaAcres: 10.0,
                soilType: 'Black Loamy',
                waterSource: 'Drip Irrigation',
                ownershipType: 'Owned',
                notes: 'High-density plantation, 6th year fruiting.',
                createdAt: '2026-08-10T08:30:00Z',
            },
            {
                id: 'plot-02',
                farmId: 'farm-01',
                name: 'Plot B — Export Thompson Grapes',
                areaAcres: 8.0,
                soilType: 'Sandy Loam',
                waterSource: 'Borewell + Drip',
                ownershipType: 'Owned',
                notes: 'Y-trellis system, GlobalGAP compliant.',
                createdAt: '2026-08-10T08:45:00Z',
            },
            {
                id: 'plot-03',
                farmId: 'farm-01',
                name: 'Plot C — Soya & Pulses Rotation',
                areaAcres: 7.0,
                soilType: 'Black Cotton',
                waterSource: 'Rainfed & Sprinklers',
                ownershipType: 'Owned',
                notes: 'Crop rotation block.',
                createdAt: '2026-08-10T09:00:00Z',
            },
        ];
        // 4. Crop Cycles
        this.cropCycles = [
            {
                id: 'cc-01',
                plotId: 'plot-01',
                farmId: 'farm-01',
                cropName: 'Organic Pomegranate (Bhagwa)',
                variety: 'Bhagwa Super Red',
                season: 'Monsoon-Kharif 2026',
                sowingDate: '2026-02-15T00:00:00Z',
                expectedHarvestDate: '2026-08-25T00:00:00Z',
                currentStage: 'HARVEST',
                status: 'HARVESTED',
                actualHarvestDate: '2026-08-28T00:00:00Z',
                harvestedQuantityKg: 12500,
                harvestGrade: 'Grade A+ (Export Ready)',
                notes: 'Harvest completed with 12,500 kg yield. Exceptional color and brix index (16.5).',
                createdAt: '2026-02-15T08:00:00Z',
            },
            {
                id: 'cc-02',
                plotId: 'plot-02',
                farmId: 'farm-01',
                cropName: 'Thompson Seedless Grapes',
                variety: 'Thompson White',
                season: 'Kharif 2026',
                sowingDate: '2026-04-10T00:00:00Z',
                expectedHarvestDate: '2026-09-20T00:00:00Z',
                currentStage: 'MATURITY',
                status: 'ACTIVE',
                actualHarvestDate: null,
                harvestedQuantityKg: null,
                harvestGrade: null,
                notes: 'Berry softening stage, awaiting final brix check.',
                createdAt: '2026-04-10T08:00:00Z',
            },
        ];
        // 5. Tasks (Assigned to Worker Suresh Patil or Manager Amit Verma)
        this.tasks = [
            {
                id: 'tsk-01',
                cropCycleId: 'cc-02',
                farmId: 'farm-01',
                plotId: 'plot-02',
                title: 'Apply Potash & Micro-nutrients Foliar Spray',
                description: 'Spray Soluble Sulfate of Potash 0-0-50 for berry sizing and sugar accumulation.',
                assignedTo: 'usr-worker-01',
                assigneeName: 'Suresh Patil',
                priority: 'HIGH',
                dueDate: '2026-09-09T18:00:00Z',
                status: 'IN_PROGRESS',
                wageAmount: 450,
                createdAt: '2026-09-05T08:00:00Z',
            },
            {
                id: 'tsk-02',
                cropCycleId: 'cc-01',
                farmId: 'farm-01',
                plotId: 'plot-01',
                title: 'Post-Harvest Sorting & Crating for Despatch',
                description: 'Sort harvested pomegranates into export cartons (4.5kg) and domestic crates (20kg).',
                assignedTo: 'usr-worker-01',
                assigneeName: 'Suresh Patil',
                priority: 'NORMAL',
                dueDate: '2026-08-30T18:00:00Z',
                status: 'COMPLETED',
                evidencePhotoUrl: '/logo/sample-produce.png',
                completionNotes: 'Completed 620 export crates sorted and packed in cold storage.',
                completedAt: '2026-08-29T16:45:00Z',
                wageAmount: 900,
                createdAt: '2026-08-28T09:00:00Z',
            },
            {
                id: 'tsk-03',
                cropCycleId: 'cc-02',
                farmId: 'farm-01',
                plotId: 'plot-02',
                title: 'Irrigation Filter Backwash & Line Inspection',
                description: 'Clean disk filters and check dripper emitters in rows 1 to 24.',
                assignedTo: 'usr-manager-01',
                assigneeName: 'Amit Verma',
                priority: 'NORMAL',
                dueDate: '2026-09-12T17:00:00Z',
                status: 'TODO',
                wageAmount: 0,
                createdAt: '2026-09-06T10:00:00Z',
            },
        ];
        // 6. Inventory Items
        this.inventoryItems = [
            {
                id: 'inv-01',
                farmId: 'farm-01',
                name: 'NPK 19-19-19 Water Soluble Fertilizer',
                category: 'FERTILIZER',
                unit: 'Bag (25kg)',
                currentStock: 42,
                averageUnitCost: 1450,
                lowStockThreshold: 10,
                createdAt: '2026-08-01T08:00:00Z',
            },
            {
                id: 'inv-02',
                farmId: 'farm-01',
                name: 'Organic Bio-Fungicide (Trichoderma)',
                category: 'PESTICIDE',
                unit: 'Litre',
                currentStock: 16,
                averageUnitCost: 680,
                lowStockThreshold: 5,
                createdAt: '2026-08-01T08:00:00Z',
            },
            {
                id: 'inv-03',
                farmId: 'farm-01',
                name: 'Drip Emitter Flush Chemical',
                category: 'OTHER',
                unit: 'Can (5L)',
                currentStock: 4,
                averageUnitCost: 850,
                lowStockThreshold: 6, // Low stock warning!
                createdAt: '2026-08-01T08:00:00Z',
            },
        ];
        // 7. Expenses (Source of Truth for Cost Basis Calculation!)
        // Total for cc-01 (12,500 kg harvested):
        // Seeds/Saplings: 110,000 | Fertilizer: 85,000 | Pesticide: 42,000 | Labour: 96,000 | Irrigation/Electricity: 34,000 | Packaging: 45,000
        // Total = Rs 412,000
        // Real Cost Basis = 412,000 / 12,500 = Rs 32.96 per kg!
        this.expenses = [
            {
                id: 'exp-01',
                farmId: 'farm-01',
                plotId: 'plot-01',
                cropCycleId: 'cc-01',
                category: 'SEEDS',
                amount: 110000,
                date: '2026-02-18T10:00:00Z',
                vendor: 'Jain Tissue Culture Labs',
                receiptUrl: null,
                notes: 'High-density Bhagwa grafts (600 saplings @ Rs 183)',
                source: 'MANUAL',
                createdAt: '2026-02-18T10:00:00Z',
            },
            {
                id: 'exp-02',
                farmId: 'farm-01',
                plotId: 'plot-01',
                cropCycleId: 'cc-01',
                category: 'FERTILIZER',
                amount: 85000,
                date: '2026-04-12T11:00:00Z',
                vendor: 'Nashik Agro Inputs Depot',
                receiptUrl: null,
                notes: 'Organic vermicompost + water-soluble NPK foliar nutrients',
                source: 'INVENTORY_CONSUMPTION',
                createdAt: '2026-04-12T11:00:00Z',
            },
            {
                id: 'exp-03',
                farmId: 'farm-01',
                plotId: 'plot-01',
                cropCycleId: 'cc-01',
                category: 'PESTICIDE',
                amount: 42000,
                date: '2026-05-20T09:30:00Z',
                vendor: 'BioCare Solutions Ltd',
                receiptUrl: null,
                notes: 'Pheromone traps and botanical neem oil sprays',
                source: 'MANUAL',
                createdAt: '2026-05-20T09:30:00Z',
            },
            {
                id: 'exp-04',
                farmId: 'farm-01',
                plotId: 'plot-01',
                cropCycleId: 'cc-01',
                category: 'LABOUR',
                amount: 96000,
                date: '2026-07-15T18:00:00Z',
                vendor: 'Local Farm Labour Gang',
                receiptUrl: null,
                notes: 'Manual pruning, weed clearing, and harvesting labour',
                source: 'TASK_LABOUR',
                createdAt: '2026-07-15T18:00:00Z',
            },
            {
                id: 'exp-05',
                farmId: 'farm-01',
                plotId: 'plot-01',
                cropCycleId: 'cc-01',
                category: 'ELECTRICITY',
                amount: 34000,
                date: '2026-08-10T12:00:00Z',
                vendor: 'MSEDCL Maharashtra',
                receiptUrl: null,
                notes: 'Solar & grid agricultural pump consumption',
                source: 'MANUAL',
                createdAt: '2026-08-10T12:00:00Z',
            },
            {
                id: 'exp-06',
                farmId: 'farm-01',
                plotId: 'plot-01',
                cropCycleId: 'cc-01',
                category: 'STORAGE',
                amount: 45000,
                date: '2026-08-29T14:00:00Z',
                vendor: 'Pimpalgaon Cold Chain Hub',
                receiptUrl: null,
                notes: 'Corrugated boxes + pre-cooling facility storage (3 days)',
                source: 'MANUAL',
                createdAt: '2026-08-29T14:00:00Z',
            },
        ];
        // 8. Mandi Prices Reference (Agmarknet Style Wholesale Benchmarks)
        this.mandiPrices = [
            {
                id: 'mp-01',
                cropName: 'Organic Pomegranate (Bhagwa)',
                mandiName: 'Nashik APMC Yard',
                district: 'Nashik',
                state: 'Maharashtra',
                minPrice: 55.0,
                maxPrice: 78.0,
                modalPrice: 68.5,
                date: '2026-09-06',
                arrivalVolumeQuintals: 1450,
            },
            {
                id: 'mp-02',
                cropName: 'Thompson Seedless Grapes',
                mandiName: 'Pimpalgaon Baswant APMC',
                district: 'Nashik',
                state: 'Maharashtra',
                minPrice: 65.0,
                maxPrice: 94.0,
                modalPrice: 82.0,
                date: '2026-09-06',
                arrivalVolumeQuintals: 2100,
            },
            {
                id: 'mp-03',
                cropName: 'Soyabean (Yellow)',
                mandiName: 'Latur APMC Yard',
                district: 'Latur',
                state: 'Maharashtra',
                minPrice: 42.0,
                maxPrice: 49.5,
                modalPrice: 46.8,
                date: '2026-09-06',
                arrivalVolumeQuintals: 3200,
            },
        ];
        // 9. Produce Marketplace Listing (Direct Sale)
        // Farmer's real cost_per_kg = Rs 32.96! Asking price = Rs 74.00!
        this.produceListings = [
            {
                id: 'lst-01',
                cropCycleId: 'cc-01',
                farmerId: 'usr-farmer-01',
                farmerName: 'Rajesh Sharma',
                cropName: 'Organic Pomegranate (Bhagwa)',
                variety: 'Bhagwa Super Red',
                quantityKg: 8500,
                askingPricePerKg: 74.0,
                costPerKg: 32.96, // PRIVATE TO FARMER! Never shown to Buyer
                nearestMandiModalPrice: 68.5,
                grade: 'Grade A+ (Export Ready)',
                pickupLocation: 'Surya Green Valley Farm, Dindori, Nashik',
                availableFrom: '2026-09-01T00:00:00Z',
                availableUntil: '2026-09-25T00:00:00Z',
                photos: ['/logo/bg-login.png'],
                status: 'ACTIVE',
                createdAt: '2026-09-01T10:00:00Z',
            },
        ];
        // 10. Offers (Buyer सुनील Mehta makes an offer)
        this.offers = [
            {
                id: 'ofr-01',
                listingId: 'lst-01',
                buyerId: 'usr-buyer-01',
                buyerName: 'Sunil Mehta (FreshMart Retailing)',
                offeredPricePerKg: 64.0,
                quantityKg: 5000,
                totalOfferAmount: 320000,
                counterPricePerKg: null,
                message: 'Ready to dispatch refrigerated carrier for direct farmgate pickup within 48 hours.',
                status: 'PENDING',
                createdAt: '2026-09-03T11:20:00Z',
            },
        ];
        // 11. Orders (Already accepted direct sale progressing through logistics)
        this.orders = [
            {
                id: 'ord-01',
                listingId: 'lst-01',
                offerId: 'ofr-prior-01',
                buyerId: 'usr-buyer-01',
                buyerName: 'Sunil Mehta (FreshMart Retailing)',
                farmerId: 'usr-farmer-01',
                farmerName: 'Rajesh Sharma',
                cropName: 'Organic Pomegranate (Bhagwa)',
                quantityKg: 4000,
                agreedPricePerKg: 71.5,
                totalAmount: 286000,
                status: 'DELIVERED', // Can be marked COMPLETED by buyer/farmer!
                scheduledPickupDate: '2026-09-02T10:00:00Z',
                actualPickupDate: '2026-09-02T11:30:00Z',
                actualDeliveryDate: '2026-09-03T16:00:00Z',
                proofOfDeliveryUrl: '/logo/sample-pod.png',
                proofOfDeliveryNote: 'Received in sound condition at cold hub dock 3. Inspection grade A verified.',
                logisticsArrangedBy: 'BUYER',
                createdAt: '2026-09-01T15:00:00Z',
            },
        ];
        // 12. Mandi Yard & Slots
        this.mandis = [
            {
                id: 'mandi-01',
                name: 'Nashik Central APMC Market Yard',
                agentId: 'usr-agent-01',
                location: 'Market Yard Road, Panchavati, Nashik, Maharashtra',
                district: 'Nashik',
                state: 'Maharashtra',
                commoditiesTraded: ['Pomegranate', 'Grapes', 'Onion', 'Tomato', 'Capsicum'],
                defaultCommissionRate: 2.5,
                createdAt: '2026-08-15T08:00:00Z',
            },
        ];
        this.mandiSlots = [
            {
                id: 'slot-01',
                mandiId: 'mandi-01',
                date: '2026-09-10T00:00:00Z',
                timeWindow: '07:30 AM — 11:30 AM (Early Auction Window)',
                capacityQuintals: 450,
                bookedQuintals: 210,
                commoditiesAccepted: ['Pomegranate', 'Grapes'],
                status: 'OPEN',
                createdAt: '2026-09-01T08:00:00Z',
            },
            {
                id: 'slot-02',
                mandiId: 'mandi-01',
                date: '2026-09-12T00:00:00Z',
                timeWindow: '08:00 AM — 12:00 PM (Standard Window)',
                capacityQuintals: 600,
                bookedQuintals: 120,
                commoditiesAccepted: ['Pomegranate', 'Grapes', 'Onion'],
                status: 'OPEN',
                createdAt: '2026-09-01T08:00:00Z',
            },
        ];
        this.slotBookings = [
            {
                id: 'sb-01',
                slotId: 'slot-01',
                mandiId: 'mandi-01',
                farmerId: 'usr-farmer-01',
                farmerName: 'Rajesh Sharma',
                cropCycleId: 'cc-01',
                cropName: 'Organic Pomegranate (Bhagwa)',
                expectedQuantityKg: 2000,
                status: 'CONFIRMED',
                createdAt: '2026-09-04T12:00:00Z',
            },
        ];
        // 13. Completed Mandi Sale
        this.mandiSales = [
            {
                id: 'ms-01',
                bookingId: 'sb-prior-01',
                mandiId: 'mandi-01',
                farmerId: 'usr-farmer-01',
                cropCycleId: 'cc-01',
                cropName: 'Organic Pomegranate (Bhagwa)',
                actualQuantityKg: 2000,
                grade: 'Grade A',
                auctionSalePricePerKg: 70.0,
                grossRevenue: 140000,
                commissionRate: 2.5,
                commissionAmount: 3500,
                netPayout: 136500,
                saleDate: '2026-08-30T11:00:00Z',
                agentNotes: 'High bidder competition. Payout disbursed via RTGS.',
                createdAt: '2026-08-30T11:30:00Z',
            },
        ];
        // 14. Profit Reports (Radical Transparency - arithmetic on real recorded numbers!)
        this.profitReports = [
            {
                id: 'pr-01',
                cropCycleId: 'cc-01',
                cropName: 'Organic Pomegranate (Bhagwa)',
                farmId: 'farm-01',
                plotId: 'plot-01',
                saleType: 'MANDI_SALE',
                referenceId: 'ms-01',
                quantitySoldKg: 2000,
                salePricePerKg: 70.0,
                grossRevenue: 140000,
                deductions: 3500,
                totalRevenue: 136500,
                totalCost: 65920, // 2000kg * Rs 32.96 cost_per_kg
                netProfit: 70580,
                marginPercent: 51.7,
                profitPerKg: 35.29,
                profitPerAcre: 7058,
                categoryBreakdown: {
                    SEEDS: 17600,
                    FERTILIZER: 13600,
                    PESTICIDE: 6720,
                    LABOUR: 15360,
                    ELECTRICITY: 5440,
                    STORAGE: 7200,
                },
                generatedAt: '2026-08-30T12:00:00Z',
            },
        ];
        // 15. Audit Logs
        this.auditLogs = [
            {
                id: 'aud-01',
                userId: 'usr-admin-01',
                userName: 'System Administrator',
                action: 'USER_ROLE_SEED',
                entityName: 'Role',
                entityId: 'ALL',
                oldValue: null,
                newValue: '7 Roles Initialized',
                timestamp: '2026-08-01T10:00:00Z',
            },
            {
                id: 'aud-02',
                userId: 'usr-adminmaker-01',
                userName: 'Vikram Maker',
                action: 'REQUEST_USER_CREATION',
                entityName: 'UserRequest',
                entityId: 'req-001',
                oldValue: null,
                newValue: 'Role: FARMER, Email: kiran.deshmukh@gmail.com',
                timestamp: '2026-09-02T14:20:00Z',
            },
        ];
        // 16. Disputes
        this.disputes = [
            {
                id: 'disp-01',
                referenceType: 'ORDER',
                referenceId: 'ord-prior-99',
                raisedBy: 'usr-buyer-01',
                raisedByName: 'Sunil Mehta (Buyer)',
                reason: 'Carrier arrived 3 hours late at pickup point due to road block. Produce temperature was maintained, requesting rescheduled delivery receipt.',
                status: 'UNDER_REVIEW',
                adminNotes: 'Carrier logs reviewed. GPS shows vehicle stuck at highway toll bottleneck. Extension granted.',
                resolutionOutcome: undefined,
                createdAt: '2026-09-03T18:00:00Z',
            },
        ];
    }
    // Cost Aggregation Engine: Given a crop_cycle_id, returns total expense, breakdown, and cost_per_kg
    calculateCropCost(cropCycleId) {
        const cycle = this.cropCycles.find((c) => c.id === cropCycleId);
        if (!cycle)
            return null;
        const cycleExpenses = this.expenses.filter((e) => e.cropCycleId === cropCycleId);
        const totalExpense = cycleExpenses.reduce((sum, e) => sum + e.amount, 0);
        const categoryBreakdown = {};
        for (const exp of cycleExpenses) {
            categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
        }
        const plot = this.plots.find((p) => p.id === cycle.plotId);
        const areaAcres = plot ? plot.areaAcres : 1;
        const costPerAcre = areaAcres > 0 ? Math.round((totalExpense / areaAcres) * 100) / 100 : totalExpense;
        const harvestQuantityKg = cycle.harvestedQuantityKg || null;
        const isHarvested = Boolean(harvestQuantityKg && harvestQuantityKg > 0);
        const costPerKg = isHarvested && harvestQuantityKg
            ? Math.round((totalExpense / harvestQuantityKg) * 100) / 100
            : null;
        return {
            cropCycleId,
            cropName: cycle.cropName,
            totalExpense,
            harvestQuantityKg,
            costPerKg,
            costPerAcre,
            isHarvested,
            categoryBreakdown,
            expensesCount: cycleExpenses.length,
        };
    }
    isSaving = false;
    savePending = false;
    initialized = false;
    async initSupabase() {
        try {
            if (!supabase)
                return;
            const { data: buckets } = await supabase.storage.listBuckets();
            if (!buckets?.some((b) => b.name === 'agribridge-data')) {
                await supabase.storage.createBucket('agribridge-data', { public: false });
            }
            const { data: fileBlob, error } = await supabase.storage
                .from('agribridge-data')
                .download('phase1_state.json');
            if (fileBlob && !error) {
                const text = await fileBlob.text();
                const state = JSON.parse(text);
                if (state) {
                    if (Array.isArray(state.users) && state.users.length)
                        this.users = state.users;
                    if (Array.isArray(state.userRequests))
                        this.userRequests = state.userRequests;
                    if (Array.isArray(state.farms) && state.farms.length)
                        this.farms = state.farms;
                    if (Array.isArray(state.plots))
                        this.plots = state.plots;
                    if (Array.isArray(state.cropCycles))
                        this.cropCycles = state.cropCycles;
                    if (Array.isArray(state.tasks))
                        this.tasks = state.tasks;
                    if (Array.isArray(state.inventoryItems))
                        this.inventoryItems = state.inventoryItems;
                    if (Array.isArray(state.expenses))
                        this.expenses = state.expenses;
                    if (Array.isArray(state.mandiPrices))
                        this.mandiPrices = state.mandiPrices;
                    if (Array.isArray(state.produceListings))
                        this.produceListings = state.produceListings;
                    if (Array.isArray(state.offers))
                        this.offers = state.offers;
                    if (Array.isArray(state.orders))
                        this.orders = state.orders;
                    if (Array.isArray(state.mandis))
                        this.mandis = state.mandis;
                    if (Array.isArray(state.mandiSlots))
                        this.mandiSlots = state.mandiSlots;
                    if (Array.isArray(state.slotBookings))
                        this.slotBookings = state.slotBookings;
                    if (Array.isArray(state.mandiSales))
                        this.mandiSales = state.mandiSales;
                    if (Array.isArray(state.profitReports))
                        this.profitReports = state.profitReports;
                    if (Array.isArray(state.auditLogs))
                        this.auditLogs = state.auditLogs;
                    if (Array.isArray(state.disputes))
                        this.disputes = state.disputes;
                    console.log('[Supabase DB] Synced state snapshot from Supabase Storage (agribridge-data)');
                }
            }
            else {
                await this.saveToSupabase();
                console.log('[Supabase DB] Seeded initial state snapshot to Supabase Storage (agribridge-data)');
            }
            this.initialized = true;
        }
        catch (err) {
            console.warn('[Supabase DB Init Warning]:', err.message);
        }
    }
    async saveToSupabase() {
        if (this.isSaving) {
            this.savePending = true;
            return;
        }
        this.isSaving = true;
        try {
            if (!supabase)
                return;
            const snapshot = {
                updatedAt: new Date().toISOString(),
                users: this.users,
                userRequests: this.userRequests,
                farms: this.farms,
                plots: this.plots,
                cropCycles: this.cropCycles,
                tasks: this.tasks,
                inventoryItems: this.inventoryItems,
                expenses: this.expenses,
                mandiPrices: this.mandiPrices,
                produceListings: this.produceListings,
                offers: this.offers,
                orders: this.orders,
                mandis: this.mandis,
                mandiSlots: this.mandiSlots,
                slotBookings: this.slotBookings,
                mandiSales: this.mandiSales,
                profitReports: this.profitReports,
                auditLogs: this.auditLogs,
                disputes: this.disputes,
            };
            const payload = JSON.stringify(snapshot, null, 2);
            await supabase.storage
                .from('agribridge-data')
                .upload('phase1_state.json', payload, { upsert: true, contentType: 'application/json' });
        }
        catch (err) {
            console.warn('[Supabase Save Warning]:', err.message);
        }
        finally {
            this.isSaving = false;
            if (this.savePending) {
                this.savePending = false;
                this.saveToSupabase();
            }
        }
    }
}
export const phase1Store = new Phase1Store();
