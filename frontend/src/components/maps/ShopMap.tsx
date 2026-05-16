"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Store, Star, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Shop {
  id: string;
  name: string;
  description?: string;
  location_city?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  is_verified?: boolean;
}


function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export function ShopMap({ shops, onSearchArea }: { shops: Shop[], onSearchArea?: (bounds: any) => void }) {
  const [center, setCenter] = useState<[number, number]>([34.05, -118.24]); // Default to LA for demo
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showSearchBtn, setShowSearchBtn] = useState(false);

  useEffect(() => {
    if (shops.length > 0 && shops[0].lat && shops[0].lng) {
      setCenter([shops[0].lat, shops[0].lng]);
    }

    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const userPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(userPos);
        if (shops.length === 0) setCenter(userPos);
        
        // Persist location to backend if logged in
        // (Note: In a real app, this would be debounced or triggered by user action)
        try {
          const token = localStorage.getItem("supabase.auth.token");
          if (token) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/locations/`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${JSON.parse(token).currentSession.access_token}`
              },
              body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
            });
          }
        } catch (err) {
          console.warn("Failed to persist location", err);
        }
      });
    }
  }, [shops]);

  function MapSearchControl() {
    const map = useMapEvents({
      moveend: () => setShowSearchBtn(true),
      zoomend: () => setShowSearchBtn(true),
    });

    if (!showSearchBtn || !onSearchArea) return null;

    return (
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const bounds = map.getBounds();
            onSearchArea({
              min_lat: bounds.getSouth(),
              max_lat: bounds.getNorth(),
              min_lon: bounds.getWest(),
              max_lon: bounds.getEast(),
            });
            setShowSearchBtn(false);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold shadow-2xl transition-all scale-110 border border-blue-400/20 whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4" />
          Search this area
        </button>
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-slate-800 glass relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <ChangeView center={center} />
        <MapSearchControl />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* User Location Marker & Rings */}
        {userLocation && (
          <>
            <Marker 
              position={userLocation}
              icon={L.divIcon({
                className: "user-location-marker",
                html: `<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })}
            >
              <Popup>You are here</Popup>
            </Marker>
            {/* Distance Rings */}
            <Circle center={userLocation} radius={5000} pathOptions={{ color: 'blue', weight: 1, fillOpacity: 0.05, dashArray: '5, 5' }} />
            <Circle center={userLocation} radius={15000} pathOptions={{ color: 'blue', weight: 1, fillOpacity: 0.02, dashArray: '5, 10' }} />
          </>
        )}
        {shops.map((shop) => (
          shop.lat && shop.lng && (
            <Marker key={shop.id} position={[shop.lat, shop.lng]}>
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-slate-900">{shop.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    {shop.rating || "N/A"} • {shop.location_city}
                  </div>
                  <Link 
                    href={`/shops/${shop.id}`}
                    className="flex items-center justify-between w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    View Shop <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {/* Legend overlay */}
      <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-xs font-bold text-slate-300">Fabrication Shops</span>
        </div>
      </div>
    </div>
  );
}
