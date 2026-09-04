import L from "leaflet";

/** Pin SVG inline como divIcon: evita depender de los PNG de marker de Leaflet. */
export const pinIcon = L.divIcon({
  className: "portulate-pin",
  html: `
    <svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="#0f5132"/>
      <circle cx="15" cy="15" r="6" fill="#ffffff"/>
    </svg>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -38],
});
