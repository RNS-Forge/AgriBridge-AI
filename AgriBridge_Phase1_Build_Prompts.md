# AGRIOS — PHASE 1 BUILD PROMPTS
### Cultivate → Sell Slice | 6 Roles | Separate Prompt Per Module
Version 1.0 — September 2026

---

## HOW TO USE THIS DOCUMENT

Each section below is a **standalone prompt**. Copy one section at a time into Claude Code, Claude, or any AI coding assistant. Each prompt is self-contained — it includes the context the AI needs, so you don't have to re-explain the whole platform every time.

**Recommended build order:**
1. Database Schema
2. Auth & RBAC
3. Farm & Plot Management
4. Crop Lifecycle Management
5. Task & Work Management
6. Inventory Management
7. Expense Management
8. Weather Integration
9. Mandi Price Reference
10. Produce Marketplace (Direct Sale)
11. Mandi Agent & Slot Booking
12. Logistics (Minimal)
13. Profit Report Engine
14. Admin Panel
15. Farmer Mobile App — Screen Flow
16. API Layer — Full Spec

Each prompt assumes the stack: **PostgreSQL + Node.js/NestJS (or FastAPI) backend, React/Next.js web, React Native mobile.** Swap freely if your stack differs — just edit the "Tech Stack" line in each prompt.

---

## PROMPT 1 — DATABASE SCHEMA

```
You are building the database schema for AgriBridge Phase 1, an agricultural
platform connecting farm cultivation data directly to a produce sales
marketplace.

CONTEXT:
Phase 1 scope is "Cultivate → Sell." Six roles: Farmer, Farm Manager,
Worker, Buyer, Mandi Agent, Admin. The core differentiator: when a farmer
lists produce for sale, the system automatically calculates their real
cost-per-kg from recorded cultivation expenses, so they can compare it
against a buyer's offer or a mandi's reference price before accepting.

Farmers can sell two ways: (1) direct to a Buyer via a produce listing,
or (2) by booking a slot at a Mandi and selling through a Mandi Agent.

TASK:
Design a normalized PostgreSQL schema covering these entities and their
relationships:

- User, Role (RBAC: FARMER, FARM_MANAGER, WORKER, BUYER, MANDI_AGENT, ADMIN)
- Farm, Plot (plot belongs to farm; farm belongs to farmer)
- Season, CropCycle (crop cycle belongs to plot; has sowing date, expected
  harvest date, current growth stage, status)
- Task (belongs to crop cycle; assigned to worker or farm manager; has
  status, due date, evidence photo URL)
- InventoryItem, InventoryTransaction (stock in/out, linked to crop cycle
  for consumption tracking)
- Expense (linked to farm, plot, crop cycle, category, amount, date,
  vendor — this is the source of truth for cost-basis calculation)
- WeatherAlert (linked to farm/plot location, alert type, severity, date)
- MarketPrice (crop, mandi/market name, date, min/max/modal price —
  sourced from Agmarknet, refreshed nightly)
- ProduceListing (linked to crop cycle/harvest; auto-computed cost_per_kg
  field derived from summed expenses ÷ harvested quantity; asking price;
  status)
- Offer (buyer's offer against a listing; status: pending/accepted/rejected)
- Order (created on accepted offer; status lifecycle: LISTED → OFFERED →
  ACCEPTED → SCHEDULED → PICKED_UP → DELIVERED → COMPLETED)
- Mandi (market/facility — name, location, commodities traded)
- MandiSlot (mandi_id, date, time_window, capacity, commodities_accepted,
  status)
- SlotBooking (farmer_id, slot_id, expected_quantity, status: requested/
  confirmed/completed/cancelled)
- MandiSale (booking_id, actual_quantity, grade, sale_price, commission,
  net_payout — this is ground-truth sale data, separate from Order)
- ProfitReport (generated after sale completion: total_cost, total_revenue,
  net_profit, linked to crop_cycle)
- AuditLog (who, what, when, old_value, new_value — for expense edits,
  listing changes, admin actions)

REQUIREMENTS:
1. Every Expense, Task, and InventoryTransaction must trace back to a
   specific Plot and CropCycle — this traceability is what powers the
   cost-basis feature, so do not make these optional/nullable.
2. ProduceListing.cost_per_kg should be a computed/derived value (either
   a stored column updated via trigger, or computed at query time) —
   pick whichever your team is more comfortable maintaining, and note
   the tradeoff.
3. Include appropriate foreign keys, indexes on frequently-filtered
   columns (farm_id, plot_id, crop_cycle_id, date columns, status columns).
4. Use enums or lookup tables for status fields, not free-text.
5. Output: full SQL DDL (CREATE TABLE statements) plus a short ER
   relationship summary in plain text.

Do not include Phase 2+ entities (disease detection, storage, machinery,
AI recommendations, schemes, insurance) — keep this strictly to the
Phase 1 scope above.
```

---

## PROMPT 2 — AUTH & RBAC MODULE

```
You are building the authentication and role-based access control (RBAC)
module for AgriBridge Phase 1.

CONTEXT:
Six roles exist: FARMER, FARM_MANAGER, WORKER, BUYER, MANDI_AGENT, ADMIN.
A single user can hold exactly one primary role at signup, but a Farmer
may later grant Farm Manager or Worker access scoped to specific farms
they own (not a global role change — a permission grant).

TASK:
Build an authentication service with:
1. Registration (email or phone + OTP), login, logout, session/token
   refresh.
2. Role assignment at signup (Farmer, Buyer, Mandi Agent, Admin sign up
   directly; Farm Manager and Worker are invited by a Farmer and accept
   an invite link).
3. Farm-scoped permission model: a Farm Manager or Worker's access is
   tied to specific farm_id(s), not global. Design the permission check
   so "can this user act on this farm/plot/crop-cycle" is a single
   reusable authorization function.
4. Role-based route/endpoint guards (e.g. only FARMER or FARM_MANAGER
   with permission on that farm can create an Expense; only WORKER
   assigned to a Task can mark it complete; only ADMIN can suspend a user
   or remove a listing).
5. Password hashing (bcrypt/argon2), short-lived access tokens, refresh
   token rotation, basic rate limiting on login attempts.
6. Audit log entry on every login, role grant, and permission change.

OUTPUT:
- Database migration for User, Role, FarmPermission (or equivalent)
  tables if not already covered by the main schema.
- API endpoints: POST /auth/register, POST /auth/login, POST /auth/refresh,
  POST /auth/logout, POST /farms/{farmId}/invite, POST /invites/{id}/accept.
- Middleware/guard code for the chosen backend framework enforcing the
  farm-scoped permission model.
- Note any security gaps you had to make assumptions about, and flag them
  clearly rather than silently deciding.
```

---

## PROMPT 3 — FARM & PLOT MANAGEMENT

```
You are building the Farm and Plot management module for AgriBridge Phase 1.

CONTEXT:
A Farmer can own multiple Farms. Each Farm has one or more Plots (the
actual cultivable units — e.g. "Plot A: 2 acres"). Every downstream
record (crop cycles, tasks, expenses) attaches to a specific Plot.

TASK:
Build CRUD functionality for:
1. Farm: name, location (address + lat/long), total area, owner (farmer),
   optional assigned Farm Manager(s).
2. Plot: belongs to a farm; name/label, area, soil type (free text or
   simple enum — no soil sensor integration in phase 1), water source
   (borewell/canal/rainfed/other), ownership status (owned/leased),
   optional notes.
3. Listing/detail views: a Farmer sees all their farms and can drill
   into a farm to see its plots; a Farm Manager sees only farms they've
   been granted access to.
4. Basic validation: area must be positive, a plot's area should not
   obviously exceed its parent farm's total area (soft warning, not a
   hard block — farmers may not have exact figures).

OUTPUT:
- API endpoints: POST /farms, GET /farms, GET /farms/{id}, PATCH /farms/{id},
  DELETE /farms/{id} (soft delete only — don't hard-delete farms with
  crop history), and the equivalent nested routes under
  /farms/{farmId}/plots.
- Basic web/mobile screen wireframe description (not full UI code) for:
  Farm list → Farm detail → Plot list → Plot detail/edit.
- Keep this module simple — no GIS boundary drawing, no satellite
  overlay. Lat/long point + area in acres is sufficient for phase 1.
```

---

## PROMPT 4 — CROP LIFECYCLE MANAGEMENT

```
You are building the Crop Lifecycle module for AgriBridge Phase 1.

CONTEXT:
A CropCycle represents one crop being grown on one Plot during one
Season. It moves through stages: Sowing → Germination → Vegetative →
Flowering → Fruit/Grain Development → Maturity → Harvest. No AI
prediction in phase 1 — the farmer manually advances stages and logs
dates; the system just structures and timestamps this.

TASK:
Build functionality for:
1. Creating a CropCycle: select plot, crop name/type (from a simple
   predefined crop list — don't build a taxonomy system, a flat lookup
   table of ~30-50 common crops is enough for v1), sowing date, expected
   harvest date (auto-suggest based on typical crop duration if you have
   that data, otherwise leave manual).
2. Stage progression: farmer or farm manager updates current stage
   manually; each stage change is timestamped and logged.
3. Linking point for Tasks, Expenses, and InventoryTransactions — this
   module doesn't build those, but must expose crop_cycle_id as the
   foreign key they'll all attach to.
4. Harvest recording: actual harvest date, actual quantity harvested
   (with unit — kg/quintal/tonne), grade/quality note (free text).
   This harvest record is what later feeds the ProduceListing's
   cost-basis calculation.
5. CropCycle status: ACTIVE, HARVESTED, ABANDONED (farmer can mark a
   cycle abandoned if crop fails — this should NOT delete linked
   expenses/tasks, since that data is still valuable for learning).

OUTPUT:
- API endpoints: POST /plots/{plotId}/crop-cycles, GET crop-cycles by
  plot/farm, PATCH to update stage, POST /crop-cycles/{id}/harvest.
- A simple stage-transition state diagram in plain text.
- Do not build weather-triggered stage suggestions or AI stage detection
  — that's phase 2+.
```

---

## PROMPT 5 — TASK & WORK MANAGEMENT

```
You are building the Task and Work Management module for AgriBridge Phase 1.

CONTEXT:
Tasks are the operational to-do items tied to a CropCycle (e.g.
"Irrigate Plot A," "Apply fertilizer"). Farmer or Farm Manager creates
and assigns tasks; Worker executes them.

TASK:
Build functionality for:
1. Task creation: title, description, linked crop_cycle_id (and
   therefore plot/farm), assigned_to (worker or farm manager user_id),
   due date, priority (low/normal/high).
2. Status lifecycle: TODO → ASSIGNED → IN_PROGRESS → COMPLETED /
   CANCELLED / OVERDUE (auto-flag OVERDUE via a scheduled job when
   due_date has passed and status isn't COMPLETED).
3. Worker-side actions: view only tasks assigned to them, mark
   IN_PROGRESS or COMPLETED, upload one or more evidence photos on
   completion, add a completion note.
4. Farmer/Manager-side: view all tasks across their farms, filter by
   plot/crop-cycle/status/assignee, reassign or cancel a task.
5. Push/in-app notification trigger points: task assigned, task due
   today, task marked overdue (just define the trigger points and
   payload — actual notification delivery is a separate module).

OUTPUT:
- API endpoints: POST /crop-cycles/{id}/tasks, GET /tasks (with filters),
  PATCH /tasks/{id}/status, POST /tasks/{id}/evidence.
- A scheduled job spec (cron-style) for the overdue-flagging job.
- Keep assignment simple — no drag-and-drop kanban board needed for v1,
  a filtered list view is sufficient.
```

---

## PROMPT 6 — INVENTORY MANAGEMENT (LIGHTWEIGHT)

```
You are building a lightweight Inventory module for AgriBridge Phase 1.

CONTEXT:
This module exists primarily to make Expense tracking accurate — not
to be a full warehouse management system. Farmers track seeds,
fertilizer, pesticide, and similar consumables so that consumption
against a specific crop cycle can be costed correctly.

TASK:
Build functionality for:
1. InventoryItem: name, category (seed/fertilizer/pesticide/other),
   unit (kg/litre/packet/other), current stock quantity, average unit
   cost.
2. InventoryTransaction: type (PURCHASE / CONSUMPTION), quantity, date,
   linked crop_cycle_id when type is CONSUMPTION (this is what lets a
   fertilizer purchase get costed against the right crop), linked
   supplier name (free text, no supplier marketplace in phase 1).
3. Stock level auto-update on each transaction (purchase increases
   stock, consumption decreases it).
4. Low-stock warning: simple threshold field per item, flag in UI when
   current stock falls below it — no automated reordering, just a
   visual flag.
5. When a CONSUMPTION transaction is recorded against a crop cycle, it
   should automatically also generate a linked Expense entry
   (quantity × average unit cost) so farmers don't have to double-enter
   the same cost in two places.

OUTPUT:
- API endpoints: POST /inventory/items, POST /inventory/transactions,
  GET /inventory/items (with low-stock filter).
- Clear description of the auto-expense-generation logic on consumption,
  including how to avoid double-counting if a farmer also manually
  enters an expense for the same purchase.
```

---

## PROMPT 7 — EXPENSE MANAGEMENT (CORE DIFFERENTIATOR)

```
You are building the Expense Management module for AgriBridge Phase 1. This
module is the foundation of the platform's core differentiating feature
— real-time cost-basis calculation feeding directly into produce
listings.

CONTEXT:
Every Expense must link to Farm, Plot, and CropCycle. Categories:
Seeds, Fertilizer, Pesticide, Labour, Machinery, Fuel, Electricity,
Water, Transport, Storage, Repairs, Other. Some expenses arrive
automatically from Inventory consumption (see Prompt 6); others are
entered directly (e.g. labour wages, machinery rental).

TASK:
Build functionality for:
1. Manual expense entry: category, amount, date, linked crop_cycle_id,
   optional vendor name, optional note/photo of receipt.
2. Auto-generated expenses from Inventory consumption (integration
   point with Prompt 6's module) and from Task-linked labour costs if
   the farmer tracks per-task wage.
3. Cost aggregation query: given a crop_cycle_id, return total expense,
   broken down by category, and total ÷ harvested quantity = cost per
   kg (requires the harvest quantity from Prompt 4's CropCycle.harvest
   record — if harvest hasn't happened yet, return running cost-to-date
   instead of cost-per-kg).
4. This aggregation function is what Prompt 10 (Produce Marketplace)
   will call directly when a farmer creates a listing — design it as a
   clean, reusable service function, not inline logic buried in a
   controller.
5. Basic reports: cost per acre, cost per crop cycle, cost trend over
   a season, filterable by farm/plot.

OUTPUT:
- API endpoints: POST /expenses, GET /expenses (filtered), GET
  /crop-cycles/{id}/cost-summary (returns total, per-category breakdown,
  and cost-per-kg or cost-to-date).
- The cost_per_kg calculation function, written clearly enough to be
  directly reused by the marketplace module — treat this as a shared
  service, not a one-off endpoint.
- Edge case handling: what happens if harvest quantity is zero or not
  yet recorded — must not throw a divide-by-zero error, must return a
  clear "harvest not recorded yet" state instead.
```

---

## PROMPT 8 — WEATHER INTEGRATION (BASIC)

```
You are building a basic weather alert module for AgriBridge Phase 1. No
AI-driven risk scoring yet — just clear, actionable alerts.

CONTEXT:
Each Farm has a location (lat/long from Prompt 3). Farmers need simple,
plain-language weather alerts relevant to their farm's location, not a
generic weather app experience.

TASK:
Build functionality for:
1. Integration with a weather API (e.g. OpenWeatherMap, Weatherbit, or
   IMD data where accessible) to fetch current conditions and short-term
   forecast for a farm's lat/long.
2. A scheduled job that checks each active farm's forecast daily and
   generates a WeatherAlert record when conditions cross a defined
   threshold (heavy rain probability above X%, extreme temperature,
   high wind).
3. Alert copy must be actionable and plain-language, not a raw data
   dump. Example: "Rain is likely within the next 24 hours. Consider
   delaying irrigation." — not "Rain probability: 70%."
4. Farmer-facing endpoint to view current + recent alerts for their
   farm(s).

OUTPUT:
- API endpoints: GET /farms/{farmId}/weather (current + forecast), GET
  /farms/{farmId}/alerts.
- The scheduled job spec and the threshold rules you're using (state
  your assumptions on thresholds clearly — these should be configurable,
  not hardcoded magic numbers).
- Do not build crop-specific risk scoring or pest/disease weather
  correlation — that's phase 2+.
```

---

## PROMPT 9 — MANDI PRICE REFERENCE

```
You are building the Mandi Price Reference module for AgriBridge Phase 1.

CONTEXT:
This gives farmers a reference price point (not live trading) alongside
their own cost-basis and any buyer offers. Data source is India's
Agmarknet system (via data.gov.in dataset access, or a comparable
ingestion pipeline) — daily min/max/modal wholesale prices by
commodity and mandi.

TASK:
Build functionality for:
1. A nightly scheduled ingestion job that pulls the latest available
   daily price data for a defined list of commodities and mandis
   (start with the crops and regions your pilot farmers actually grow
   — don't try to ingest all 4,000+ mandis on day one) and stores it in
   the MarketPrice table (crop, mandi, date, min/max/modal price).
2. A lookup endpoint: given a crop and a farm's location, return the
   2-3 nearest mandis' most recent modal price.
3. Clear "as of [date]" labeling on all displayed prices — this is
   reference data, not live, and must never be presented as real-time.
4. Graceful handling of ingestion failures (API/source may not exist or
   be delayed) — the system must not crash or show stale data as if it
   were current; show a clear "price data unavailable" state instead.

OUTPUT:
- The ingestion job design (source, frequency, error handling).
- API endpoint: GET /crops/{cropId}/mandi-prices?farmId=X (returns
  nearest mandis with dated modal prices).
- Flag clearly that this depends on external data access (official
  API key request process, or scraping the public commodity report as
  an interim measure) — do not assume a live API key is already
  available.
```

---

## PROMPT 10 — PRODUCE MARKETPLACE (DIRECT SALE)

```
You are building the Produce Marketplace module for AgriBridge Phase 1 —
this is the platform's signature feature.

CONTEXT:
When a Farmer creates a listing for harvested produce, the system
automatically pulls their real cost-per-kg (from Prompt 7's expense
aggregation service) and displays it alongside the asking price and
the nearest mandi reference price (from Prompt 9), so the farmer can
judge any buyer offer against their actual numbers before accepting.

TASK:
Build functionality for:
1. ProduceListing creation: farmer selects a harvested crop_cycle,
   system pulls quantity harvested + auto-computed cost_per_kg, farmer
   sets asking price and any listing details (grade, photos, available
   from/until dates, pickup location).
2. Buyer-side: search/filter listings by crop, location, quantity,
   price range; view listing detail (asking price and mandi reference
   price shown to buyer; the farmer's actual cost_per_kg is NEVER shown
   to the buyer — that's private farmer data, only visible to the
   farmer themselves).
3. Offer flow: buyer submits an offer (price, quantity); farmer sees
   the offer alongside their cost_per_kg and the mandi reference price
   in one view, so the margin is immediately obvious; farmer
   accepts/rejects/counters.
4. Order creation on accepted offer, with status lifecycle: LISTED →
   OFFERED → NEGOTIATING → ACCEPTED → SCHEDULED → PICKED_UP → DELIVERED
   → COMPLETED.
5. On COMPLETED status, trigger creation of a ProfitReport (see Prompt
   13) using the actual agreed sale price, not the original asking
   price.

OUTPUT:
- API endpoints: POST /produce/listings, GET /produce/listings (buyer
  search/filter), POST /listings/{id}/offers, PATCH /offers/{id}
  (accept/reject/counter), POST /orders, PATCH /orders/{id}/status.
- Explicit note in the code/comments on the privacy rule: cost_per_kg
  must never appear in any buyer-facing API response or view — enforce
  this at the serialization layer, not just by convention.
```

---

## PROMPT 11 — MANDI AGENT & SLOT BOOKING

```
You are building the Mandi Agent role and Slot Booking feature for
AgriBridge Phase 1 — the second selling path alongside direct-to-buyer.

CONTEXT:
A Mandi Agent represents a specific mandi/APMC yard. Farmers can book a
slot to bring produce to that mandi on a specific date/time instead of
listing directly to a buyer. The agent records the actual arrival,
grade, and sale price achieved, deducts commission, and this becomes
ground-truth data for the farmer's profit report — often more accurate
and timely than the official Agmarknet modal price.

TASK:
Build functionality for:
1. Mandi & MandiSlot management (Mandi Agent side): agent registers/
   manages their mandi profile, publishes available slots (date, time
   window, capacity, commodities accepted).
2. Slot discovery & booking (Farmer side): farmer browses available
   slots near their farm for their harvested crop, requests a booking
   (expected quantity), agent confirms or rejects.
3. Arrival & sale recording (Mandi Agent side): on the booked date,
   agent records actual quantity delivered, grade, final sale price
   achieved at that mandi, commission taken, and net payout to farmer.
4. This MandiSale record, like a COMPLETED Order in Prompt 10, should
   trigger a ProfitReport using the actual sale price and commission
   as real costs — treat it as an equivalent, parallel path to the
   direct marketplace, not a lesser feature.
5. Status lifecycle for SlotBooking: REQUESTED → CONFIRMED → COMPLETED
   / CANCELLED / NO_SHOW.
6. Farmer-facing view: alongside a mandi slot's availability, show the
   farmer's own cost_per_kg (from Prompt 7) and the general mandi price
   reference (from Prompt 9) for context, same principle as the direct
   marketplace — informed decision, not blind booking.

OUTPUT:
- API endpoints: POST /mandis, POST /mandis/{id}/slots, GET
  /mandis/slots (farmer search with location/crop filters), POST
  /slots/{id}/bookings, PATCH /bookings/{id}/status, POST
  /bookings/{id}/sale (agent records final sale).
- Clarify in your design how MandiSale and Order (Prompt 10) both feed
  the same ProfitReport structure without duplicating logic — ideally
  both should normalize into a common "Sale" concept internally, even
  though they have different role/workflow logic.
```

---

## PROMPT 12 — LOGISTICS (MINIMAL)

```
You are building a minimal Logistics status-tracking module for AgriBridge
Phase 1 — deliberately NOT a full route-optimization or fleet
management system.

CONTEXT:
Once an Order (direct marketplace sale) or SlotBooking (mandi sale)
reaches a "produce needs to move" stage, there needs to be a simple way
to track pickup and delivery status. No vehicle matching, no route
planning in phase 1.

TASK:
Build functionality for:
1. A simple status field progression on the Order: SCHEDULED →
   PICKED_UP → DELIVERED, updatable by the farmer (marking their own
   produce as picked up) or the buyer (confirming delivery received).
2. Optional: capture a pickup date/time, delivery date/time, and a
   simple "proof of delivery" (photo or confirmation checkbox) at the
   DELIVERED step.
3. For mandi bookings, similarly track whether the farmer's transport
   to the mandi is self-arranged (default assumption for phase 1 — no
   logistics provider network yet).

OUTPUT:
- API endpoints: PATCH /orders/{id}/logistics-status, POST
  /orders/{id}/proof-of-delivery.
- Keep this intentionally thin — resist the urge to add vehicle
  matching, ETA calculation, or multi-stop routing. That's phase 3+
  per the original roadmap.
```

---

## PROMPT 13 — PROFIT REPORT ENGINE

```
You are building the Profit Report engine for AgriBridge Phase 1 — the
module that closes the loop from cultivation cost to actual sale
outcome.

CONTEXT:
Once a sale completes (via direct Order or MandiSale), the farmer
should see an honest, fully-computed profit report using real recorded
numbers — no AI estimation needed at this stage, since all the inputs
(expenses, sale price) are now known facts.

TASK:
Build functionality for:
1. On sale completion (Order status = COMPLETED, or MandiSale recorded),
   automatically generate a ProfitReport for that crop_cycle:
   - total_cost (sum of all Expenses linked to the crop_cycle)
   - total_revenue (actual sale price × quantity sold, minus any
     commission if sold via mandi)
   - net_profit (revenue − cost)
   - cost breakdown by category (from Prompt 7)
   - profit per kg, profit per acre
2. A season-end summary view: if a farmer has multiple crop cycles in
   a season, aggregate into a season-level report as well as
   per-cycle.
3. Historical view: farmer can see profit reports across past seasons
   for the same plot, to compare crop choices over time (this becomes
   valuable input for a future AI recommendation engine, even though
   no AI exists yet in phase 1 — just make sure the data is structured
   for that future use).
4. This report should be presented in the "best case / expected case /
   worst case" style is NOT needed here, since these are actuals, not
   predictions — show the real single numbers plainly. Reserve
   range-based presentation for future AI-driven planning features.

OUTPUT:
- API endpoints: GET /crop-cycles/{id}/profit-report, GET
  /farms/{farmId}/profit-reports (list/history), GET
  /plots/{plotId}/profit-history (for cross-season comparison).
- Note explicitly that this module deliberately does NOT use AI or
  estimation — it's pure arithmetic on real recorded data, which is
  itself a selling point (radical transparency vs. black-box
  predictions).
```

---

## PROMPT 14 — ADMIN PANEL

```
You are building the Admin Panel for AgriBridge Phase 1.

CONTEXT:
Admin's job in phase 1 is trust & safety, not full platform operations
— verify users, moderate listings, handle disputes.

TASK:
Build functionality for:
1. User management: search users by role/name/email, view profile,
   suspend/reinstate an account, view a user's activity summary
   (listings created, orders completed, disputes raised).
2. Listing moderation: view all active ProduceListings, flag/remove a
   listing (e.g. suspected fraud, fake produce claims), with a required
   reason logged.
3. Dispute handling: a simple dispute record (raised by farmer or
   buyer against an Order, or by farmer against a MandiSale), with
   status (OPEN, UNDER_REVIEW, RESOLVED), admin notes, and resolution
   outcome.
4. Basic platform health view: count of active users by role, listings
   created this week, orders completed this week, open disputes count
   — simple counters, not a full BI dashboard.
5. Every admin action (suspend user, remove listing, resolve dispute)
   must write to the AuditLog with who/what/when/before-after values.

OUTPUT:
- API endpoints: GET /admin/users, PATCH /admin/users/{id}/suspend,
  DELETE /admin/listings/{id} (soft-delete with reason), POST/PATCH
  /admin/disputes, GET /admin/dashboard-summary.
- Confirm every mutating admin action is captured in AuditLog — this
  is non-negotiable given the trust implications of this role.
```

---

## PROMPT 15 — FARMER MOBILE APP SCREEN FLOW

```
You are designing the Farmer-facing mobile app screen flow for AgriBridge
Phase 1. This is a UX/screen-flow prompt, not a backend prompt.

CONTEXT:
Primary user: a working farmer, possibly with limited literacy or
limited smartphone fluency, often in a low-connectivity area. Design
principle: action-first, not data-dump. The home screen should surface
"what do I need to do today" and "how is my money doing" above
everything else.

TASK:
Design (as a wireframe description, screen-by-screen, not final visual
UI) the following flow:

1. HOME — today's tasks, current investment total, expected/actual
   profit snapshot if a sale is in progress, weather alert banner if
   active, one-tap access to "List Produce" and "Book Mandi Slot."
2. MY FARMS → FARM DETAIL → PLOT DETAIL — simple drill-down, plot
   detail shows active crop cycle status and quick links to tasks/
   expenses for that plot.
3. CROP CYCLE DETAIL — stage progress indicator (visual, e.g. a
   horizontal stepper: Sowing → ... → Harvest), linked tasks list,
   linked expense total-to-date, "Record Harvest" action when
   applicable.
4. EXPENSES — simple add-expense form (category, amount, date, photo
   of receipt optional), running total view per crop cycle.
5. SELL FLOW — after harvest is recorded, two clear paths presented
   side by side: "List for Direct Sale" vs. "Book a Mandi Slot" — both
   showing the farmer's own cost_per_kg prominently before they choose
   either path.
6. LISTING DETAIL (farmer view) — asking price, cost_per_kg, mandi
   reference price, all three shown together; incoming offers listed
   below with the same three-number comparison per offer.
7. PROFIT REPORT — shown after sale completes: simple, no jargon,
   large clear numbers (total cost, total revenue, net profit), with
   an option to view detailed category breakdown.

REQUIREMENTS:
- Every screen must work with minimal text and clear icons — this is
  for a low-literacy-tolerant design, not a data-dense dashboard.
- Specify what should be available offline (viewing cached farm/task/
  expense data, queuing new expense/task-completion entries for later
  sync) vs. what requires connectivity (submitting a listing, viewing
  live mandi slots, submitting an offer).
- Output as a structured screen list with: screen name, primary
  purpose, key elements shown, primary action button, offline behavior.
```

---

## PROMPT 16 — API LAYER FULL SPEC (INTEGRATION PROMPT)

```
You are assembling the full Phase 1 API specification for AgriBridge by
combining the individual module designs already built (auth, farms/
plots, crop cycles, tasks, inventory, expenses, weather, mandi prices,
marketplace, mandi booking, logistics, profit reports, admin).

TASK:
1. Produce a single consolidated OpenAPI (Swagger) spec covering all
   endpoints across the modules above, using consistent naming,
   consistent auth requirements (which roles can hit which endpoint),
   and consistent pagination/filtering conventions across list
   endpoints.
2. Add request/response examples for the 5-6 most critical endpoints:
   creating a crop cycle, recording an expense, creating a produce
   listing (showing the auto-computed cost_per_kg in the response),
   submitting an offer, booking a mandi slot, and fetching a profit
   report.
3. Flag any inconsistencies you find across the individual module
   designs (e.g. different pagination styles, inconsistent status enum
   naming) and propose one consistent convention to apply platform-wide.
4. Note authentication requirements per endpoint (which of the 6 roles
   can access it) in a single reference table.

OUTPUT:
- Full OpenAPI YAML/JSON spec.
- The role-access reference table (endpoint × role matrix).
- A short list of naming/convention fixes needed to make the
  individually-designed modules consistent as one API surface.
```

---

## NOTES FOR USE

- Feed these prompts **in order** — several later prompts (Expense,
  Marketplace, Mandi Booking, Profit Report) explicitly depend on
  earlier ones' output (the schema, the cost-basis service function).
- If using Claude Code, paste each prompt as a fresh task/session
  scoped to that module — don't try to run all 16 in one giant context,
  the modularity is the point.
- After each module is built, re-run Prompt 16 (or a trimmed version of
  it) periodically to catch drift between modules before it compounds.
- Phase 2+ features (AI crop planning, disease detection, storage,
  machinery, supplier marketplace, FPO mode, finance/insurance, IoT)
  are intentionally excluded from every prompt above — do not let scope
  creep back in during implementation.
