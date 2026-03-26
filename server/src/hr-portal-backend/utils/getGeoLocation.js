// utils/getGeoLocation.js
require("dotenv").config();
const axios = require("axios");

async function getGeoLocation(ip) {
  console.log("🌍 Starting geo lookup for IP:", ip);

  try {
    const token = process.env.IPINFO_TOKEN;

    if (!token) {
      console.error("❌ IPINFO_TOKEN not set in .env file!");
      return { location: "Unknown", latitude: null, longitude: null };
    }

    console.log("🔑 Using IPINFO_TOKEN:", token);

    const url = `https://ipinfo.io/${ip}?token=${token}`;
    console.log("➡️  Requesting:", url);

    const { data } = await axios.get(url);
    console.log("✅ Raw IPinfo response:", data);

    let [latitude, longitude] = [null, null];
    if (data.loc) {
      try {
        [latitude, longitude] = data.loc.split(",").map(Number);
        console.log("📍 Parsed coordinates:", latitude, longitude);
      } catch (parseErr) {
        console.error("⚠️ Failed to parse loc field:", data.loc, parseErr.message);
      }
    } else {
      console.warn("⚠️ No loc field found in IPinfo response!");
    }

    const locationString = `${data.city || ""}, ${data.region || ""}, ${data.country || ""}`.trim();
    console.log("🏙️ Final location string:", locationString);

    return {
      location: locationString || "Unknown",
      latitude,
      longitude,
    };
  } catch (err) {
    if (err.response) {
      console.error("❌ Geo lookup failed with response:", {
        status: err.response.status,
        data: err.response.data,
      });
    } else {
      console.error("❌ Geo lookup failed:", err.message);
    }

    return { location: "Unknown", latitude: null, longitude: null };
  }
}

module.exports = getGeoLocation;
