import React from 'react';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface City {
  name: string;
  coords: Coordinate;
  type: 'hub' | 'destination';
}

export interface FlightRoute {
  id: string;
  from: string;
  to: string;
  flightNumber: string;
  status: 'In Flight' | 'Scheduled' | 'Landed';
  cargoType: string;
  progress: number; // 0 to 1
}

export interface SiteStat {
  label: string;
  value: string;
  icon: React.ElementType;
}