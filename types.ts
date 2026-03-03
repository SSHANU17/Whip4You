
export interface Vehicle {
  _id?: string;
  id: string;
  vin: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number | 'Call For Price';
  mileage: number;
  bodyType: 'Sedan' | 'Coupe' | 'SUV' | 'Hatchback' | 'Mini-Van' | 'Truck' | 'Commercial';
  transmission: string;
  engine: string;
  fuelType: string;
  exteriorColor: string;
  interiorColor: string;
  features: string[];
  images: string[];
  status: 'Available' | 'Sold';
  description: string;
}

export interface ContactForm {
  _id?: string;
  id: string;
  type: 'General' | 'Test-Drive' | 'Trade-In' | 'Finance' | 'Car Finder';
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  vehicleId?: string;
  details?: any;
}

export interface Review {
  _id?: string;
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export type SortOption = 'price_asc' | 'price_desc' | 'year_new' | 'year_old' | 'mileage_low';
