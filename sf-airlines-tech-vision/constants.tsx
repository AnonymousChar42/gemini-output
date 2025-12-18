import { Plane, TrendingUp, Package, Globe } from 'lucide-react';
import { City, FlightRoute, SiteStat } from './types';

export const CITIES: Record<string, City> = {
  shenzhen: { name: 'Shenzhen (SZX)', coords: { lat: 22.5431, lng: 114.0579 }, type: 'hub' },
  beijing: { name: 'Beijing (PEK)', coords: { lat: 39.9042, lng: 116.4074 }, type: 'hub' },
  hangzhou: { name: 'Hangzhou (HGH)', coords: { lat: 30.2741, lng: 120.1551 }, type: 'hub' },
  frankfurt: { name: 'Frankfurt (FRA)', coords: { lat: 50.1109, lng: 8.6821 }, type: 'destination' },
  newyork: { name: 'New York (JFK)', coords: { lat: 40.7128, lng: -74.0060 }, type: 'destination' },
  tokyo: { name: 'Tokyo (NRT)', coords: { lat: 35.6762, lng: 139.6503 }, type: 'destination' },
  singapore: { name: 'Singapore (SIN)', coords: { lat: 1.3521, lng: 103.8198 }, type: 'destination' },
  losangeles: { name: 'Los Angeles (LAX)', coords: { lat: 34.0522, lng: -118.2437 }, type: 'destination' },
  dubai: { name: 'Dubai (DXB)', coords: { lat: 25.2048, lng: 55.2708 }, type: 'destination' },
};

export const ROUTES: FlightRoute[] = [
  { id: 'SF7891', from: 'shenzhen', to: 'frankfurt', flightNumber: 'O3-7891', status: 'In Flight', cargoType: 'Electronics', progress: 0.6 },
  { id: 'SF9022', from: 'hangzhou', to: 'newyork', flightNumber: 'O3-9022', status: 'In Flight', cargoType: 'Medical', progress: 0.3 },
  { id: 'SF1023', from: 'beijing', to: 'tokyo', flightNumber: 'O3-1023', status: 'Scheduled', cargoType: 'General', progress: 0.1 },
  { id: 'SF4451', from: 'shenzhen', to: 'singapore', flightNumber: 'O3-4451', status: 'Landed', cargoType: 'Perishables', progress: 0.95 },
  { id: 'SF8812', from: 'shenzhen', to: 'losangeles', flightNumber: 'O3-8812', status: 'In Flight', cargoType: 'E-Commerce', progress: 0.45 },
  { id: 'SF3321', from: 'hangzhou', to: 'dubai', flightNumber: 'O3-3321', status: 'In Flight', cargoType: 'Auto Parts', progress: 0.7 },
];

export const STATS: SiteStat[] = [
  { label: 'All-Cargo Fleet', value: '86+', icon: Plane },
  { label: 'Global Destinations', value: '90+', icon: Globe },
  { label: 'Daily Shipments', value: '2.5M+', icon: Package },
  { label: 'YoY Growth', value: '15%', icon: TrendingUp },
];
