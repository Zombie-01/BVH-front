import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
  placeholder?: string;
}

function LocationMarker({
  position,
  onLocationSelect,
}: {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <L.Popup>
        <div className="text-center">
          <MapPin className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="font-semibold">Сонгосон байршил</p>
          <p className="text-sm text-muted-foreground">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>
      </L.Popup>
    </Marker>
  );
}

export default function LocationPicker({
  initialLat = 47.9185,
  initialLng = 106.9176,
  onLocationSelect,
  height = "300px",
  placeholder = "Газрын зураг дээр байршлыг сонгоно уу",
}: LocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<
    [number, number] | null
  >(initialLat && initialLng ? [initialLat, initialLng] : null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{placeholder}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          className="flex items-center gap-2">
          <Navigation className="w-4 h-4" />
          Миний байршил
        </Button>
      </div>

      <div className="rounded-lg overflow-hidden border" style={{ height }}>
        <MapContainer
          center={[initialLat, initialLng]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={selectedPosition}
            onLocationSelect={handleLocationSelect}
          />
        </MapContainer>
      </div>

      {selectedPosition && (
        <div className="text-sm text-muted-foreground">
          Сонгосон координат: {selectedPosition[0].toFixed(6)},{" "}
          {selectedPosition[1].toFixed(6)}
        </div>
      )}
    </div>
  );
}
