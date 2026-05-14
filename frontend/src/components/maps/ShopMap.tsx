"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Store, Star, ArrowRight } from "lucide-react";
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
  location_city: string;
  latitude: number;
  longitude: number;
  rating: number;
  is_verified: boolean;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export function ShopMap({ shops }: { shops: Shop[] }) {
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]); // Default to London

  useEffect(() => {
    if (shops.length > 0 && shops[0].latitude && shops[0].longitude) {
      setCenter([shops[0].latitude, shops[0].longitude]);
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, [shops]);

  return (
    <div className="h-[500px] w-full rounded-3xl overflow-hidden border border-slate-800 glass relative">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {shops.map((shop) => (
          shop.latitude && shop.longitude && (
            <Marker key={shop.id} position={[shop.latitude, shop.longitude]}>
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Store className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-slate-900">{shop.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
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
