import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './TradeMap.css';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for Barter items
const barterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Mock coordinate generator for Lagos neighborhoods based on location strings
const getCoordinatesForLocation = (locationStr) => {
  const lagosCenter = [6.5244, 3.3792]; // Ikeja
  
  if (!locationStr) return lagosCenter;
  
  const loc = locationStr.toLowerCase();
  if (loc.includes('lekki')) return [6.4698, 3.5852];
  if (loc.includes('yaba')) return [6.5095, 3.3711];
  if (loc.includes('surulere')) return [6.5000, 3.3500];
  if (loc.includes('ikeja')) return [6.6018, 3.3515];
  if (loc.includes('victoria island') || loc.includes('vi')) return [6.4281, 3.4219];
  if (loc.includes('ikoyi')) return [6.4531, 3.4385];
  
  // Return a slight jitter around Ikeja for unknown locations
  const jitterLat = lagosCenter[0] + (Math.random() - 0.5) * 0.1;
  const jitterLng = lagosCenter[1] + (Math.random() - 0.5) * 0.1;
  return [jitterLat, jitterLng];
};

const TradeMap = ({ items, users, activeTab }) => {
  const [mapMarkers, setMapMarkers] = useState([]);
  
  // Lagos Coordinates
  const mapCenter = [6.5244, 3.3792]; 

  useEffect(() => {
    // Generate map markers from active barter items and users
    const markers = [];

    if (activeTab === 'barter' && items) {
      items.forEach(item => {
        // In a real app, item.User.location would be geocoded or stored as lat/lng
        // Here we mock it based on the location string
        const coords = getCoordinatesForLocation(item.User?.location);
        markers.push({
          id: `item-${item.id}`,
          position: coords,
          title: item.item_name,
          subtitle: `Wants: ${item.want_category}`,
          user: item.User?.name || 'Unknown User',
          type: 'barter',
          icon: barterIcon
        });
      });
    } else if (activeTab === 'users' && users) {
      users.forEach(user => {
        const coords = getCoordinatesForLocation(user.location);
        markers.push({
          id: `user-${user.id}`,
          position: coords,
          title: user.name,
          subtitle: `Trust Score: ${Math.round(user.trust_score)}`,
          user: user.location || 'Lagos',
          type: 'user',
          icon: DefaultIcon
        });
      });
    }

    setMapMarkers(markers);
  }, [items, users, activeTab]);

  return (
    <div className="trade-map-container">
      <div className="trade-map-header">
        <h3>Local Trade Radar</h3>
        <p>Discover trusted users and barter opportunities near you</p>
      </div>
      
      <div className="map-wrapper">
        <MapContainer center={mapCenter} zoom={11} scrollWheelZoom={false} className="leaflet-map-instance">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {mapMarkers.map(marker => (
            <Marker key={marker.id} position={marker.position} icon={marker.icon}>
              <Popup>
                <div className="map-popup-content">
                  <strong>{marker.title}</strong>
                  <div className="popup-subtitle">{marker.subtitle}</div>
                  <div className="popup-meta">
                    <i className="fas fa-map-marker-alt"></i> {marker.user}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TradeMap;
