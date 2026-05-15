const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Test LA to NYC (~3940 km)
const la = { lat: 34.05, lon: -118.24 };
const nyc = { lat: 40.71, lon: -74.00 };
const dist = calculateDistance(la.lat, la.lon, nyc.lat, nyc.lon);

console.log(`Distance from LA to NYC: ${dist.toFixed(2)} km`);
if (dist > 3900 && dist < 4000) {
  console.log("Test Passed!");
} else {
  console.log("Test Failed!");
  process.exit(1);
}
