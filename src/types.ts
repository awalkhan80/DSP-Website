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
