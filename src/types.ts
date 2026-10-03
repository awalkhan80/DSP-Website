export interface Experience {
  id: string;
  category: 'desert-safaris' | 'city-tours' | 'buggies' | 'private-convoys';
  categoryLabel: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor?: string;
  duration: string;
  priceAED: number;
  priceUnit?: string;
  description: string;
  image: string;
  altText: string;
  highlights: string[];
  departureTime?: string;
  returnTime?: string;
  hotelPickup: boolean;
  featured?: boolean;
  vehicleType?: string;
  itinerary?: {
    time: string;
    title: string;
    description: string;
  }[];
  // B2B.Tickets / Supplier Reseller Properties
  inventorySource?: 'direct' | 'b2b_tickets';
  b2bTourId?: number;
  b2bOfferId?: number;
  b2bSupplierPriceAED?: number;
  b2bMarkupPercent?: number;
  b2bStatus?: 'active' | 'inactive';
}

export interface B2BTourRaw {
  id: number;
  name: string;
  heroImage?: {
    srcSet?: {
      sizes?: { src: string; width: number; height: number }[];
    }[];
  };
  categories?: { name: string; url: string }[];
  salesDescription?: string;
  termsAndConditions?: string;
  cancellationPolicy?: string;
  offers?: B2BOfferRaw[];
  googlePlacesRating?: number;
  totalRating?: number;
  totalRatingsCount?: number;
}

export interface B2BOfferRaw {
  id: number;
  name: string;
  code?: string;
  numberOfHours?: number;
  description?: string;
  pricingPeriods?: {
    id: number;
    pricePerAdult: number;
    pricePerChild: number;
    recPricePerAdult: number;
    recPricePerChild: number;
    currency: string;
    isBookable: boolean;
  }[];
  timeSlots?: {
    id: number;
    name: string;
    startTime: number;
    endTime: number;
  }[];
}

export interface B2BBookingRecord {
  id: string;
  phoenixRef: string;
  b2bBookingId?: number | string;
  tourId: number | string;
  tourName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  tourDate: string;
  pax: number;
  totalAED: number;
  supplierCostAED: number;
  profitMarginAED: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  experienceType: string;
  rating: number;
  date: string;
  content: string;
  avatarInitial: string;
  avatarBg: string;
  verified: boolean;
}

export type Currency = 'AED' | 'USD' | 'EUR' | 'GBP';

export interface QuadBikeVariantPricing {
  singleInside30m: number;
  singleInside60m: number;
  singleOpen30m: number;
  singleOpen60m: number;
  doubleInside30m: number;
  doubleInside60m: number;
  doubleOpen30m: number;
  doubleOpen60m: number;
}

export interface BuggyModelPricing {
  twoSeater30m: number;
  twoSeater60m: number;
  fourSeater30m: number;
  fourSeater60m: number;
}

export interface OffRoadPricingConfig {
  quad220cc: QuadBikeVariantPricing;
  quad350cc: QuadBikeVariantPricing;
  buggyPolaris: BuggyModelPricing;
  buggyCanAm: BuggyModelPricing;
}

export interface BookingState {
  experienceId: string;
  date: string;
  adults: number;
  children: number;
  timeSlot: string;
  transferType: 'shared' | 'private_4x4';
  hotelName: string;
  roomNumber: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  specialRequests: string;
  addOnQuad: boolean;
  addOnFalcon: boolean;
  addOnVipSeating: boolean;
}
