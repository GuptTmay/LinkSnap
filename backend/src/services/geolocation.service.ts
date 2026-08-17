// services/geoLocation.service.ts

type GeoLocationResponse = {
  success: boolean;
  country?: string;
  flag?: {
    emoji?: string;
  };
  message?: string;
};

export async function getCountryFromIp(
  ip: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}?fields=country,success,flag.emoji`
    );

    const data = (await response.json()) as GeoLocationResponse;

    if (!response.ok || !data.success) {
      console.error(
        "Failed to fetch geolocation data:",
        data.message ?? "Unknown error",
        response.status
      );
      return null;
    }

    return data.country ?? null;
  } catch (err) {
    console.error("Failed to get country from IP:", err);
    return null;
  }
}