# AgriBridge-AI Frontend Architecture

## Technology Stack
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Redux Toolkit** - State Management
- **TanStack React Query** - Server State Management
- **React Hook Form** - Form Management
- **Zod** - Schema Validation
- **TailwindCSS** - Styling
- **React Router DOM** - Routing
- **Lucide React** - Icons

## Folder Structure

```
client/src/
├── main.tsx                          # Application entry point
├── App.tsx                           # Root component with routing
├── index.css                         # Global styles & Tailwind imports
├── vite-env.d.ts                     # Vite type declarations
│
├── assets/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── config/                           # Configuration files
│   ├── api.config.ts                # API base URLs and endpoints
│   ├── query.config.ts              # React Query configuration
│   └── theme.config.ts              # Theme configuration
│
├── types/                           # TypeScript type definitions
│   ├── api.types.ts                 # API response/request types
│   ├── auth.types.ts                # Authentication types
│   ├── farmer.types.ts              # Farmer-related types
│   ├── crop.types.ts                # Crop-related types
│   ├── batch.types.ts               # Batch-related types
│   ├── marketplace.types.ts         # Marketplace types
│   ├── export.types.ts              # Export types
│   └── index.ts                     # Type exports
│
├── constants/                       # Application constants
│   ├── routes.constants.ts          # Route paths
│   ├── roles.constants.ts           # User roles
│   ├── status.constants.ts          # Status enums
│   └── index.ts
│
├── utils/                           # Utility functions
│   ├── formatters.ts               # Data formatting utilities
│   ├── validators.ts               # Custom validators
│   ├── date.utils.ts               # Date manipulation
│   ├── number.utils.ts             # Number formatting
│   └── index.ts
│
├── hooks/                           # Custom React hooks
│   ├── useAuth.ts                  # Authentication hook
│   ├── usePermission.ts            # Permission checking hook
│   ├── useDebounce.ts              # Debounce hook
│   ├── useLocalStorage.ts           # Local storage hook
│   └── index.ts
│
├── store/                           # Redux store configuration
│   ├── index.ts                    # Store configuration
│   ├── authSlice.ts                # Authentication state
│   ├── uiSlice.ts                  # UI state (modals, toasts, etc.)
│   ├── filterSlice.ts              # Global filter state
│   └── hooks.ts                    # Typed hooks
│
├── services/                        # API service layer
│   ├── api.service.ts              # Axios instance configuration
│   ├── auth.service.ts             # Auth API calls
│   ├── farmer.service.ts           # Farmer API calls
│   ├── crop.service.ts             # Crop API calls
│   ├── batch.service.ts            # Batch API calls
│   ├── marketplace.service.ts      # Marketplace API calls
│   ├── export.service.ts           # Export API calls
│   ├── mandi.service.ts            # Mandi API calls
│   ├── fpo.service.ts              # FPO API calls
│   ├── ai.service.ts               # AI API calls
│   └── index.ts
│
├── components/                      # Reusable UI components
│   ├── ui/                         # Base UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.types.ts
│   │   │   └── index.ts
│   │   ├── Input/
│   │   │   ├── Input.tsx
│   │   │   ├── Input.types.ts
│   │   │   └── index.ts
│   │   ├── Select/
│   │   │   ├── Select.tsx
│   │   │   ├── Select.types.ts
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   │   ├── Modal.tsx
│   │   │   ├── Modal.types.ts
│   │   │   └── index.ts
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   ├── Card.types.ts
│   │   │   └── index.ts
│   │   ├── Table/
│   │   │   ├── Table.tsx
│   │   │   ├── Table.types.ts
│   │   │   └── index.ts
│   │   ├── Badge/
│   │   │   ├── Badge.tsx
│   │   │   ├── Badge.types.ts
│   │   │   └── index.ts
│   │   ├── Avatar/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Avatar.types.ts
│   │   │   └── index.ts
│   │   ├── Dropdown/
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Dropdown.types.ts
│   │   │   └── index.ts
│   │   ├── Tabs/
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tabs.types.ts
│   │   │   └── index.ts
│   │   ├── DatePicker/
│   │   │   ├── DatePicker.tsx
│   │   │   ├── DatePicker.types.ts
│   │   │   └── index.ts
│   │   ├── Search/
│   │   │   ├── Search.tsx
│   │   │   ├── Search.types.ts
│   │   │   └── index.ts
│   │   ├── Pagination/
│   │   │   ├── Pagination.tsx
│   │   │   ├── Pagination.types.ts
│   │   │   └── index.ts
│   │   ├── Loader/
│   │   │   ├── Loader.tsx
│   │   │   └── index.ts
│   │   ├── EmptyState/
│   │   │   ├── EmptyState.tsx
│   │   │   └── index.ts
│   │   ├── ErrorBoundary/
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── layout/                     # Layout-specific components
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── index.ts
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── SidebarItem.tsx
│   │   │   └── index.ts
│   │   ├── Footer/
│   │   │   ├── Footer.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── forms/                      # Form-specific components
│   │   ├── FormField/
│   │   │   ├── FormField.tsx
│   │   │   └── index.ts
│   │   ├── FormSelect/
│   │   │   ├── FormSelect.tsx
│   │   │   └── index.ts
│   │   ├── FormInput/
│   │   │   ├── FormInput.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── data-display/               # Data display components
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx
│   │   │   ├── DataTable.types.ts
│   │   │   └── index.ts
│   │   ├── StatCard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatCard.types.ts
│   │   │   └── index.ts
│   │   ├── Chart/
│   │   │   ├── Chart.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── index.ts                    # Component exports
│
├── layouts/                         # Page layouts
│   ├── DashboardLayout.tsx         # Main dashboard layout
│   ├── AuthLayout.tsx              # Authentication pages layout
│   ├── PublicLayout.tsx            # Public pages layout
│   └── index.ts
│
├── features/                        # Feature-based modules
│   │
│   ├── auth/                       # Authentication feature
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── VerifyOtp.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   └── ResetPassword.tsx
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── OtpForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useLogin.ts
│   │   │   ├── useRegister.ts
│   │   │   ├── useVerifyOtp.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── dashboard/                  # Dashboard feature
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx      # Main dashboard
│   │   │   ├── Analytics.tsx      # Analytics page
│   │   │   └── Reports.tsx        # Reports page
│   │   ├── components/
│   │   │   ├── StatCards.tsx
│   │   │   ├── RecentActivity.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── Charts.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useDashboardStats.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── farmer/                     # Farmer management feature
│   │   ├── pages/
│   │   │   ├── Farmers.tsx        # Farmers list page
│   │   │   ├── FarmerDetails.tsx  # Individual farmer details
│   │   │   ├── FarmerProfile.tsx  # Farmer profile
│   │   │   ├── AddFarmer.tsx      # Add new farmer
│   │   │   ├── EditFarmer.tsx     # Edit farmer
│   │   │   └── FarmerKyc.tsx      # KYC verification
│   │   ├── components/
│   │   │   ├── FarmerCard.tsx
│   │   │   ├── FarmerTable.tsx
│   │   │   ├── FarmerSearch.tsx
│   │   │   ├── KycStatusBadge.tsx
│   │   │   ├── FarmerForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useFarmers.ts
│   │   │   ├── useFarmer.ts
│   │   │   ├── useFarmerKyc.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── farm/                       # Farm management feature
│   │   ├── pages/
│   │   │   ├── Farms.tsx           # Farms list page
│   │   │   ├── FarmDetails.tsx    # Individual farm details
│   │   │   ├── AddFarm.tsx         # Add new farm
│   │   │   ├── EditFarm.tsx        # Edit farm
│   │   │   └── FarmMap.tsx         # Farm map view
│   │   ├── components/
│   │   │   ├── FarmCard.tsx
│   │   │   ├── FarmTable.tsx
│   │   │   ├── FarmForm.tsx
│   │   │   ├── LocationPicker.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useFarms.ts
│   │   │   ├── useFarm.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── crop/                       # Crop management feature
│   │   ├── pages/
│   │   │   ├── Crops.tsx           # Crops list page
│   │   │   ├── CropDetails.tsx    # Crop details
│   │   │   ├── AddCrop.tsx         # Add new crop
│   │   │   └── CropCalendar.tsx    # Crop calendar view
│   │   ├── components/
│   │   │   ├── CropCard.tsx
│   │   │   ├── CropTable.tsx
│   │   │   ├── CropForm.tsx
│   │   │   ├── SeasonSelector.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useCrops.ts
│   │   │   ├── useCrop.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── batch/                      # Batch management feature
│   │   ├── pages/
│   │   │   ├── Batches.tsx         # Batches list page
│   │   │   ├── BatchDetails.tsx    # Batch details
│   │   │   ├── CreateBatch.tsx     # Create new batch
│   │   │   ├── PoolManagement.tsx  # Pool management
│   │   │   ├── BatchTraceability.tsx # Traceability view
│   │   │   └── QrCodeScanner.tsx   # QR code scanner
│   │   ├── components/
│   │   │   ├── BatchCard.tsx
│   │   │   ├── BatchTable.tsx
│   │   │   ├── PoolCard.tsx
│   │   │   ├── BatchForm.tsx
│   │   │   ├── TraceabilityChart.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useBatches.ts
│   │   │   ├── useBatch.ts
│   │   │   ├── usePools.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── mandi/                      # Mandi pricing feature
│   │   ├── pages/
│   │   │   ├── Mandi.tsx           # Mandi pricing page
│   │   │   ├── MarketDetails.tsx   # Market details
│   │   │   ├── PriceHistory.tsx    # Price history
│   │   │   ├── PriceComparison.tsx # Price comparison
│   │   │   └── MarketMap.tsx       # Market map view
│   │   ├── components/
│   │   │   ├── PriceCard.tsx
│   │   │   ├── PriceChart.tsx
│   │   │   ├── MarketSelector.tsx
│   │   │   ├── CommoditySelector.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useMandiPrices.ts
│   │   │   ├── useMarkets.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── marketplace/                # Marketplace feature
│   │   ├── pages/
│   │   │   ├── Marketplace.tsx     # Marketplace listing page
│   │   │   ├── ListingDetails.tsx  # Listing details
│   │   │   ├── CreateListing.tsx   # Create new listing
│   │   │   ├── MyListings.tsx      # My listings
│   │   │   ├── Offers.tsx          # Offers management
│   │   │   ├── OfferDetails.tsx    # Offer details
│   │   │   ├── Wishlist.tsx         # Wishlist
│   │   │   └── Transactions.tsx    # Transaction history
│   │   ├── components/
│   │   │   ├── ListingCard.tsx
│   │   │   ├── ListingForm.tsx
│   │   │   ├── OfferCard.tsx
│   │   │   ├── OfferForm.tsx
│   │   │   ├── PriceNegotiation.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useListings.ts
│   │   │   ├── useListing.ts
│   │   │   ├── useOffers.ts
│   │   │   ├── useWishlist.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── export/                      # Export management feature
│   │   ├── pages/
│   │   │   ├── Exports.tsx         # Exports list page
│   │   │   ├── ExportDetails.tsx   # Export details
│   │   │   ├── CreateExport.tsx    # Create new export
│   │   │   ├── CustomsClearance.tsx # Customs clearance
│   │   │   ├── Shipments.tsx       # Shipments tracking
│   │   │   ├── Documents.tsx       # Export documents
│   │   │   └── Compliance.tsx      # Compliance check
│   │   ├── components/
│   │   │   ├── ExportCard.tsx
│   │   │   ├── ExportForm.tsx
│   │   │   ├── ShipmentTracker.tsx
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── CustomsStatus.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useExports.ts
│   │   │   ├── useExport.ts
│   │   │   ├── useShipments.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── quality/                    # Quality inspection feature
│   │   ├── pages/
│   │   │   ├── Inspections.tsx     # Inspections list
│   │   │   ├── InspectionDetails.tsx # Inspection details
│   │   │   ├── CreateInspection.tsx # Create inspection
│   │   │   ├── Certificates.tsx    # Certificates management
│   │   │   └── GradeStandards.tsx  # Grade standards
│   │   ├── components/
│   │   │   ├── InspectionForm.tsx
│   │   │   ├── QualityMetrics.tsx
│   │   │   ├── GradeBadge.tsx
│   │   │   ├── CertificateCard.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useInspections.ts
│   │   │   ├── useInspection.ts
│   │   │   ├── useCertificates.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── fpo/                        # FPO management feature
│   │   ├── pages/
│   │   │   ├── FpoDashboard.tsx    # FPO dashboard
│   │   │   ├── Members.tsx         # FPO members
│   │   │   ├── Shares.tsx          # Share management
│   │   │   ├── ProfitDistribution.tsx # Profit distribution
│   │   │   ├── Invitations.tsx     # Member invitations
│   │   │   └── FpoSettings.tsx    # FPO settings
│   │   ├── components/
│   │   │   ├── MemberCard.tsx
│   │   │   ├── ShareTable.tsx
│   │   │   ├── ProfitSplitCard.tsx
│   │   │   ├── InvitationForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useFpoMembers.ts
│   │   │   ├── useShares.ts
│   │   │   ├── useProfitSplits.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── ai/                         # AI Assistant feature
│   │   ├── pages/
│   │   │   ├── AiAssistant.tsx     # AI chat interface
│   │   │   ├── AiInsights.tsx      # AI insights
│   │   │   ├── Recommendations.tsx # AI recommendations
│   │   │   └── AiSettings.tsx     # AI settings
│   │   ├── components/
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── InsightCard.tsx
│   │   │   ├── RecommendationCard.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useAiChat.ts
│   │   │   ├── useAiInsights.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── superadmin/                 # Super Admin feature
│   │   ├── pages/
│   │   │   ├── SuperAdmin.tsx      # Super admin dashboard
│   │   │   ├── Tenants.tsx         # Tenant management
│   │   │   ├── Users.tsx           # User management
│   │   │   ├── Roles.tsx           # Role management
│   │   │   ├── Permissions.tsx     # Permission management
│   │   │   ├── SystemLogs.tsx      # System logs
│   │   │   ├── AuditLogs.tsx       # Audit logs
│   │   │   ├── Analytics.tsx       # Platform analytics
│   │   │   ├── Settings.tsx        # Platform settings
│   │   │   └── Notifications.tsx   # Notification management
│   │   ├── components/
│   │   │   ├── TenantCard.tsx
│   │   │   ├── UserTable.tsx
│   │   │   ├── RoleTable.tsx
│   │   │   ├── LogViewer.tsx
│   │   │   ├── SystemStats.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useTenants.ts
│   │   │   ├── useUsers.ts
│   │   │   ├── useRoles.ts
│   │   │   ├── useAuditLogs.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── profile/                    # User profile feature
│   │   ├── pages/
│   │   │   ├── Profile.tsx         # User profile
│   │   │   ├── Settings.tsx        # Account settings
│   │   │   ├── Security.tsx        # Security settings
│   │   │   └── Notifications.tsx   # Notification preferences
│   │   ├── components/
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── PasswordForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useProfile.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── notifications/              # Notifications feature
│       ├── pages/
│       │   ├── Notifications.tsx   # Notifications list
│       │   └── NotificationSettings.tsx
│       ├── components/
│       │   ├── NotificationItem.tsx
│       │   ├── NotificationPanel.tsx
│       │   └── index.ts
│       ├── hooks/
│       │   ├── useNotifications.ts
│       │   └── index.ts
│       └── index.ts
│
├── lib/                             # Third-party library configurations
│   ├── react-query/
│   │   ├── QueryClient.tsx
│   │   └── index.ts
│   └── react-router/
│       └── index.ts
│
└── styles/                          # Additional styles
    ├── tailwind.css                # Tailwind customizations
    └── animations.css              # Custom animations
```

## Page Routes Structure

### Public Routes
- `/login` - Login page
- `/register` - Registration page
- `/verify-otp` - OTP verification page
- `/forgot-password` - Forgot password page
- `/reset-password` - Reset password page

### Protected Routes

#### Dashboard Routes
- `/dashboard` - Main dashboard
- `/dashboard/analytics` - Analytics page
- `/dashboard/reports` - Reports page

#### Farmer Management Routes (FPO_ADMIN, SuperAdmin)
- `/farmers` - Farmers list
- `/farmers/:id` - Farmer details
- `/farmers/:id/profile` - Farmer profile
- `/farmers/:id/kyc` - KYC verification
- `/farmers/add` - Add new farmer
- `/farmers/:id/edit` - Edit farmer

#### Farm Management Routes (FPO_ADMIN, SuperAdmin)
- `/farms` - Farms list
- `/farms/:id` - Farm details
- `/farms/add` - Add new farm
- `/farms/:id/edit` - Edit farm
- `/farms/:id/map` - Farm map view

#### Crop Management Routes (FPO_ADMIN, SuperAdmin, Farmer)
- `/crops` - Crops list
- `/crops/:id` - Crop details
- `/crops/add` - Add new crop
- `/crops/:id/edit` - Edit crop
- `/crops/calendar` - Crop calendar

#### Batch Management Routes (FPO_ADMIN, SuperAdmin)
- `/batches` - Batches list
- `/batches/:id` - Batch details
- `/batches/create` - Create batch
- `/batches/pools` - Pool management
- `/batches/:id/traceability` - Traceability view
- `/batches/qr-scan` - QR scanner

#### Mandi Pricing Routes (FPO_ADMIN, SuperAdmin, Farmer)
- `/mandi` - Mandi pricing
- `/mandi/markets/:id` - Market details
- `/mandi/price-history` - Price history
- `/mandi/comparison` - Price comparison
- `/mandi/map` - Market map

#### Marketplace Routes (FPO_ADMIN, SuperAdmin, Buyer)
- `/marketplace` - Marketplace listings
- `/marketplace/listings/:id` - Listing details
- `/marketplace/create` - Create listing
- `/marketplace/my-listings` - My listings
- `/marketplace/offers` - Offers management
- `/marketplace/offers/:id` - Offer details
- `/marketplace/wishlist` - Wishlist
- `/marketplace/transactions` - Transactions

#### Export Routes (FPO_ADMIN, SuperAdmin)
- `/exports` - Exports list
- `/exports/:id` - Export details
- `/exports/create` - Create export
- `/exports/customs` - Customs clearance
- `/exports/shipments` - Shipments tracking
- `/exports/documents` - Export documents
- `/exports/compliance` - Compliance check

#### Quality Inspection Routes (FPO_ADMIN, SuperAdmin, QualityInspector)
- `/quality/inspections` - Inspections list
- `/quality/inspections/:id` - Inspection details
- `/quality/inspections/create` - Create inspection
- `/quality/certificates` - Certificates
- `/quality/standards` - Grade standards

#### FPO Management Routes (FPO_ADMIN, SuperAdmin)
- `/fpo` - FPO dashboard
- `/fpo/members` - FPO members
- `/fpo/shares` - Share management
- `/fpo/profits` - Profit distribution
- `/fpo/invitations` - Member invitations
- `/fpo/settings` - FPO settings

#### AI Assistant Routes (All authenticated users)
- `/ai` - AI assistant
- `/ai/insights` - AI insights
- `/ai/recommendations` - Recommendations
- `/ai/settings` - AI settings

#### Super Admin Routes (SuperAdmin only)
- `/superadmin` - Super admin dashboard
- `/superadmin/tenants` - Tenant management
- `/superadmin/users` - User management
- `/superadmin/roles` - Role management
- `/superadmin/permissions` - Permission management
- `/superadmin/logs` - System logs
- `/superadmin/audit` - Audit logs
- `/superadmin/analytics` - Platform analytics
- `/superadmin/settings` - Platform settings
- `/superadmin/notifications` - Notification management

#### Profile Routes (All authenticated users)
- `/profile` - User profile
- `/profile/settings` - Account settings
- `/profile/security` - Security settings
- `/profile/notifications` - Notification preferences

## Role-Based Access Control

### User Roles
- **SuperAdmin** - Full platform access
- **FPO_ADMIN** - FPO tenant administrator
- **QualityInspector** - Quality inspection permissions
- **Farmer** - Farmer-specific features
- **Buyer** - Buyer-specific features

### Route Permissions Matrix

| Route | SuperAdmin | FPO_ADMIN | QualityInspector | Farmer | Buyer |
|-------|-----------|-----------|------------------|---------|-------|
| /dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| /farmers | ✅ | ✅ | ❌ | ❌ | ❌ |
| /farms | ✅ | ✅ | ❌ | ❌ | ❌ |
| /crops | ✅ | ✅ | ❌ | ✅ | ❌ |
| /batches | ✅ | ✅ | ❌ | ❌ | ❌ |
| /mandi | ✅ | ✅ | ❌ | ✅ | ❌ |
| /marketplace | ✅ | ✅ | ❌ | ❌ | ✅ |
| /exports | ✅ | ✅ | ❌ | ❌ | ❌ |
| /quality | ✅ | ✅ | ✅ | ❌ | ❌ |
| /fpo | ✅ | ✅ | ❌ | ❌ | ❌ |
| /ai | ✅ | ✅ | ✅ | ✅ | ✅ |
| /superadmin | ✅ | ❌ | ❌ | ❌ | ❌ |
| /profile | ✅ | ✅ | ✅ | ✅ | ✅ |

## Redux Store Structure

### State Slices

#### authSlice
```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  tenantId: string | null;
  isAuthenticated: boolean;
}
```

#### uiSlice
```typescript
interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalContent: string | null;
  toast: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null;
  loading: boolean;
}
```

#### filterSlice
```typescript
interface FilterState {
  [key: string]: {
    search: string;
    filters: Record<string, any>;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    page: number;
    limit: number;
  };
}
```

## React Query Strategy

### Query Keys Structure
- `['auth']` - Authentication queries
- `['farmers']` - Farmer queries
- `['farmers', id]` - Individual farmer
- `['farms']` - Farm queries
- `['crops']` - Crop queries
- `['batches']` - Batch queries
- `['mandi']` - Mandi pricing queries
- `['marketplace']` - Marketplace queries
- `['exports']` - Export queries
- `['quality']` - Quality inspection queries
- `['fpo']` - FPO queries
- `['ai']` - AI queries
- `['superadmin']` - Super admin queries

## Component Design Patterns

### Base Components
- Atomic design principles
- Highly reusable
- Type-safe props
- Consistent styling

### Feature Components
- Business logic specific
- Feature-specific hooks
- Integration with services

### Layout Components
- Page structure
- Navigation
- Responsive design

## Theme Configuration

### Color Palette
- Primary: Emerald/Teal gradient
- Secondary: Slate grays
- Success: Green
- Warning: Yellow/Orange
- Error: Red
- Info: Blue

### Typography
- Font: Inter or system fonts
- Scale: 12px to 48px
- Weights: 400, 500, 600, 700

### Spacing
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80

### Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

## Form Strategy

### React Hook Form Integration
- Zod schema validation
- Type-safe forms
- Error handling
- Submit optimization

### Form Components
- FormField wrapper
- FormInput
- FormSelect
- FormDatePicker
- FormFileUpload

## Error Handling

### Error Boundary
- Catch React errors
- Fallback UI
- Error logging

### API Error Handling
- Axios interceptors
- Toast notifications
- Retry logic
- Logout on 401

## Performance Optimization

### Code Splitting
- Route-based splitting
- Lazy loading
- Dynamic imports

### Memoization
- React.memo
- useMemo
- useCallback

### Query Optimization
- Stale time configuration
- Cache management
- Optimistic updates

## Security

### Authentication
- JWT token management
- Token refresh
- Secure storage

### Authorization
- Route guards
- Permission checks
- Role-based UI

### Data Security
- Input sanitization
- XSS prevention
- CSRF protection

## Testing Strategy

### Unit Tests
- Component testing
- Hook testing
- Utility testing

### Integration Tests
- Service testing
- API testing
- Flow testing

### E2E Tests
- User flows
- Critical paths
- Cross-browser testing
