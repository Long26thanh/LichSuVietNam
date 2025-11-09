import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./LocationMap.css";

// Fix default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ClickableMap = ({ position, setPosition, onSelect }) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            if (onSelect) onSelect({ latitude: lat, longitude: lng });
        },
    });
    return null;
};

const LocationMap = ({
    latitude,
    longitude,
    name,
    description,
    interactive = false,
    onLocationSelect = null,
    draggable = true,
    initialPosition = null,
}) => {
    // Compute initial center
    const defaultCenter = [16.0, 108.0]; // central Vietnam fallback
    const [markerPos, setMarkerPos] = useState(() => {
        if (initialPosition && initialPosition[0] && initialPosition[1]) {
            return [parseFloat(initialPosition[0]), parseFloat(initialPosition[1])];
        }
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
        }
        return null;
    });

    // Keep marker in sync when props change (e.g., user types coords)
    useEffect(() => {
        if (initialPosition && initialPosition[0] && initialPosition[1]) {
            setMarkerPos([parseFloat(initialPosition[0]), parseFloat(initialPosition[1])]);
            return;
        }
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            if (!isNaN(lat) && !isNaN(lng)) setMarkerPos([lat, lng]);
            else setMarkerPos(null);
        } else {
            setMarkerPos(null);
        }
    }, [latitude, longitude, initialPosition]);

    const center = markerPos || defaultCenter;

    return (
        <div className="location-map-container">
            <MapContainer center={center} zoom={markerPos ? 13 : 6} scrollWheelZoom={false} className="location-map">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {interactive && <ClickableMap position={markerPos} setPosition={setMarkerPos} onSelect={onLocationSelect} />}

                {markerPos && (
                    <Marker
                        position={markerPos}
                        draggable={interactive && draggable}
                        eventHandlers={
                            interactive
                                ? {
                                      dragend: (e) => {
                                          const latlng = e.target.getLatLng();
                                          const lat = latlng.lat;
                                          const lng = latlng.lng;
                                          setMarkerPos([lat, lng]);
                                          if (onLocationSelect) onLocationSelect({ latitude: lat, longitude: lng });
                                      },
                                  }
                                : undefined
                        }
                    >
                        <Popup>
                            <div className="map-popup">
                                <h3>{name}</h3>
                                {description && <p>{description}</p>}
                                <div className="coordinates">
                                    <strong>Tọa độ:</strong> {markerPos[0].toFixed(6)},{" "}
                                    {markerPos[1].toFixed(6)}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default LocationMap;
