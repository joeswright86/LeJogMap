/** @type {number} Miles already cycled */
const MILES_COVERED = 411;
/** @type {number} Conversion factor from miles to meters */
const METERS_PER_MILE = 1609.34;
/** @type {string} Starting point of the journey */
const ORIGIN = "Cornwall, Land's End, Penzance TR19 7AA";
/** @type {string} End point of the journey */
const DESTINATION = "John o' Groats, UK";
/** @type {Object} Marker configuration */
const MARKER_CONFIG = {
  url: "https://maps.google.com/mapfiles/kml/shapes/cycling.png",
  size: 32
};

/**
 * Creates and returns a Google Maps instance
 * @returns {google.maps.Map}
 */
function createMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement) {
    throw new Error("Map element not found");
  }
  
  return new google.maps.Map(mapElement, {
    zoom: 6,
    center: { lat: 55, lng: -4 },
    disableDefaultUI: true,
  });
}

/**
 * Calculates the total distance of the route
 * @param {Array<google.maps.LatLng>} route - Array of route points
 * @returns {number} Total distance in meters
 */
function calculateTotalDistance(route) {
  return route.reduce((total, point, index) => {
    if (index === 0) return 0;
    return total + google.maps.geometry.spherical.computeDistanceBetween(route[index - 1], point);
  }, 0);
}

/**
 * Updates the progress UI elements
 * @param {number} distanceTravelled - Distance covered in meters
 * @param {number} totalDistance - Total route distance in meters
 */
function updateProgressUI(distanceTravelled, totalDistance) {
  const progressBar = document.getElementById("progressBar");
  const progressLabel = document.getElementById("progressLabel");
  
  if (!progressBar || !progressLabel) {
    console.error("Progress UI elements not found");
    return;
  }

  const progressPercent = (distanceTravelled / totalDistance) * 100;
  progressBar.style.width = `${progressPercent}%`;
  
  const milesTotal = Math.round(totalDistance / METERS_PER_MILE);
  progressLabel.textContent = `${MILES_COVERED} mi of ${milesTotal} mi`;
}

/**
 * Places a marker at the current progress point
 * @param {google.maps.Map} map - Google Maps instance
 * @param {Array<google.maps.LatLng>} route - Array of route points
 * @param {number} distanceTravelled - Distance covered in meters
 */
function placeProgressMarker(map, route, distanceTravelled) {
  let distanceCovered = 0;
  
  for (let i = 1; i < route.length; i++) {
    const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(route[i - 1], route[i]);
    if (distanceCovered + segmentDistance >= distanceTravelled) {
      const overshoot = distanceTravelled - distanceCovered;
      const heading = google.maps.geometry.spherical.computeHeading(route[i - 1], route[i]);
      const markerPosition = google.maps.geometry.spherical.computeOffset(route[i - 1], overshoot, heading);
      
      new google.maps.Marker({
        position: markerPosition,
        map,
        icon: {
          url: MARKER_CONFIG.url,
          scaledSize: new google.maps.Size(MARKER_CONFIG.size, MARKER_CONFIG.size),
        },
        title: "Distance Travelled"
      });
      break;
    }
    distanceCovered += segmentDistance;
  }
}

/**
 * Initializes the map and sets up the route
 */
async function initMap() {
  try {
    const map = createMap();
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map });

    directionsService.route({
      origin: ORIGIN,
      destination: DESTINATION,
      travelMode: google.maps.TravelMode.BICYCLING,
    }, (response, status) => {
      if (status !== "OK") {
        throw new Error(`Directions request failed: ${status}`);
      }

      directionsRenderer.setDirections(response);
      const route = response.routes[0].overview_path;
      
      const distanceTravelled = MILES_COVERED * METERS_PER_MILE;
      const totalRouteDistance = calculateTotalDistance(route);
      
      updateProgressUI(distanceTravelled, totalRouteDistance);
      placeProgressMarker(map, route, distanceTravelled);
    });
  } catch (error) {
    console.error("Failed to initialize map:", error);
    document.getElementById("progressLabel").textContent = "Failed to load map";
  }
}


window.onload = initMap;





