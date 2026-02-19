/**
 * Calculate distance between two addresses using Google Maps Distance Matrix API
 * Returns distance in kilometers
 */
export async function calculateDistance(originAddress, destinationAddress) {
  if (!originAddress || !destinationAddress) {
    return null;
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY_;
    if (!apiKey) {
      console.error("Google Maps API key not found");
      return null;
    }

    const url = new URL(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
    );
    url.searchParams.append("origins", originAddress);
    url.searchParams.append("destinations", destinationAddress);
    url.searchParams.append("key", apiKey);
    url.searchParams.append("units", "metric");

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("Distance Matrix API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Distance Matrix API status:", data.status);
      return null;
    }

    const element = data.rows?.[0]?.elements?.[0];
    if (element?.status !== "OK") {
      console.error("Distance element status:", element?.status);
      return null;
    }

    // Distance is in meters, convert to km
    const distanceKm = element.distance.value / 1000;
    return Math.round(distanceKm * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error("Error calculating distance:", error);
    return null;
  }
}

/**
 * Calculate travel costs based on distance
 * Standard rate: €0.23 per km (Dutch fiscal rate 2024)
 */
export function calculateTravelCosts(distanceKm, ratePerKm = 0.23) {
  if (!distanceKm || distanceKm <= 0) {
    return 0;
  }
  // Round trip
  const totalDistance = distanceKm * 2;
  return Math.round(totalDistance * ratePerKm * 100) / 100;
}
