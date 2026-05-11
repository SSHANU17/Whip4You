
import React from 'react';

export const COLORS = {
  black: '#000000',
  gold: '#D4AF37',
  goldLight: '#F1D592',
  white: '#FFFFFF',
  offWhite: '#FAFAFA'
};

export const BODY_TYPES = [
  { name: 'Sedan', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400', size: 'md' },
  { name: 'Coupe', image: 'https://images.unsplash.com/photo-1494976866556-6812c9d1c72e?auto=format&fit=crop&q=80&w=400', size: 'md' },
  { name: 'SUV', image: 'https://images.unsplash.com/photo-1605559424843-9e4c3ca4b786?auto=format&fit=crop&q=80&w=400', size: 'lg' },
  { name: 'Hatchback', image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&q=80&w=400', size: 'sm' },
  { name: 'Mini-Van', image: 'https://images.unsplash.com/photo-1605559827260-476dbad52601?auto=format&fit=crop&q=80&w=400', size: 'lg' },
  { name: 'Truck', image: 'https://images.unsplash.com/photo-1533473359331-35b1d4d57ba7?auto=format&fit=crop&q=80&w=400', size: 'lg' }
];

export const MOCK_REVIEWS = [
  { id: '1', name: 'John Doe', rating: 5, text: 'Great experience! Found exactly what I was looking for at a fair price.', date: '2 days ago' },
  { id: '2', name: 'Jane Smith', rating: 5, text: 'Professional staff and no-pressure sales. Highly recommend Whip4You.', date: '1 week ago' },
  { id: '3', name: 'Mike Johnson', rating: 4, text: 'Smooth trade-in process. Got a decent value for my old sedan.', date: '2 weeks ago' }
];

// High quality sports car engine startup sound
export const ENGINE_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3';
