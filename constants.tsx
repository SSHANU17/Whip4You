
import React from 'react';
import { Truck, Car, Bus } from 'lucide-react';

export const COLORS = {
  black: '#000000',
  gold: '#D4AF37',
  goldLight: '#F1D592',
  white: '#FFFFFF',
  offWhite: '#FAFAFA'
};

export const BODY_TYPES = [
  { name: 'Sedan', icon: <Car className="w-8 h-8" /> },
  { name: 'Coupe', icon: <Car className="w-8 h-8" /> },
  { name: 'SUV', icon: <Car className="w-8 h-8" /> },
  { name: 'Hatchback', icon: <Car className="w-8 h-8" /> },
  { name: 'Mini-Van', icon: <Bus className="w-8 h-8" /> },
  { name: 'Truck', icon: <Truck className="w-8 h-8" /> }
];

export const MOCK_REVIEWS = [
  { id: '1', name: 'John Doe', rating: 5, text: 'Great experience! Found exactly what I was looking for at a fair price.', date: '2 days ago' },
  { id: '2', name: 'Jane Smith', rating: 5, text: 'Professional staff and no-pressure sales. Highly recommend Whip4You.', date: '1 week ago' },
  { id: '3', name: 'Mike Johnson', rating: 4, text: 'Smooth trade-in process. Got a decent value for my old sedan.', date: '2 weeks ago' }
];

// High quality sports car engine startup - Updated to a more reliable source
export const ENGINE_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3';
