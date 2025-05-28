function initMap() {
      const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: { lat: 55, lng: -4 },
        disableDefaultUI: true,
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({ map });

      directionsService.route({
        origin: "Cornwall, Land's End, Penzance TR19 7AA",
        destination: "John o' Groats, UK",
        travelMode: google.maps.TravelMode.BICYCLING,
      }, (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);

          // Get full polyline path
          const route = response.routes[0].overview_path;

          // Total distance to find (100 miles in meters)
          const milesCovered = 600;
          const distanceTravelled = (milesCovered * 1609.34).toFixed(0);

          // Compute total route distance (in meters)
          let totalRouteDistance = 0;
          for (let i = 1; i < route.length; i++) {
            totalRouteDistance += google.maps.geometry.spherical.computeDistanceBetween(route[i - 1], route[i]);
          }

          // Update progress bar
          const progressPercent = (distanceTravelled / totalRouteDistance) * 100;
          document.getElementById("progressBar").style.width = `${progressPercent}%`;

          const milesTotal = (totalRouteDistance / 1609.34).toFixed(0);
          
          document.getElementById("progressLabel").textContent = `${milesCovered} mi of ${milesTotal} mi`;

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
                  url: "https://maps.google.com/mapfiles/kml/shapes/cycling.png", // Bike icon
                  scaledSize: new google.maps.Size(32, 32), // Optional: resize the icon
                },
                title: "Distance Travelled"
              });


              break;
            }
            distanceCovered += segmentDistance;
          }

        } else {
          alert("Directions request failed due to " + status);
        }
      });
    }

    window.onload = initMap;