const containerId = typeof mapContainerId !== 'undefined' ? mapContainerId : 'map';
const mapContainer = document.getElementById(containerId);
const mapboxToken = typeof mapToken !== 'undefined' ? mapToken : null;
const listingCoords = typeof listingCoordinates !== 'undefined' ? listingCoordinates : null;
const hasListingCoords =
  Array.isArray(listingCoords) &&
  listingCoords.length === 2 &&
  listingCoords.every((coord) => typeof coord === 'number' && !Number.isNaN(coord)) &&
  !(listingCoords[0] === 0 && listingCoords[1] === 0);

if (!mapContainer) {
  // Not all pages have a map container.
} else if (!mapboxToken) {
  mapContainer.innerHTML = '<p class="text-muted">Map unavailable: no Mapbox token configured.</p>';
} else if (!hasListingCoords) {
  mapContainer.innerHTML = '<p class="text-muted">Location not available for this listing.</p>';
} else {
  const map = new mapboxgl.Map({
    accessToken: mapboxToken,
    container: mapContainerId,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: listingCoords,
    zoom: 11,
  });

  map.addControl(new mapboxgl.NavigationControl());
  new mapboxgl.Marker().setLngLat(listingCoords).addTo(map);
}