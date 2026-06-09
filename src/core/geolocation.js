// ─── GEOLOCATION UTILITIES ───
// GPS verification for attendance check-in

const EARTH_RADIUS_METERS = 6371000;
const MAX_ACCURACY_METERS = 100; // Reject if GPS accuracy is worse than this
const DEFAULT_RADIUS_METERS = 100;

/**
 * Convert degrees to radians
 */
const toRadians = (deg) => (deg * Math.PI) / 180;

/**
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in meters.
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
};

/**
 * Get current GPS position from the browser.
 * Returns: { latitude, longitude, accuracy }
 * Throws on denial, timeout, or unavailability.
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GEOLOCATION_UNSUPPORTED'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Reject inaccurate GPS (possible spoofing or bad signal)
        if (accuracy > MAX_ACCURACY_METERS) {
          reject(
            new Error(
              `GPS_LOW_ACCURACY:${Math.round(accuracy)}m (need ≤${MAX_ACCURACY_METERS}m)`
            )
          );
          return;
        }

        resolve({ latitude, longitude, accuracy: Math.round(accuracy) });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('GEOLOCATION_DENIED'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('GEOLOCATION_UNAVAILABLE'));
            break;
          case error.TIMEOUT:
            reject(new Error('GEOLOCATION_TIMEOUT'));
            break;
          default:
            reject(new Error('GEOLOCATION_UNKNOWN'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Always get fresh position
      }
    );
  });
};

/**
 * Verify if user is within the allowed radius of the gym.
 * Returns: { allowed, distance, accuracy }
 */
export const verifyLocation = async (gymLat, gymLng, allowedRadius = DEFAULT_RADIUS_METERS) => {
  const position = await getCurrentPosition();
  const distance = calculateDistance(
    position.latitude,
    position.longitude,
    gymLat,
    gymLng
  );

  return {
    allowed: distance <= allowedRadius,
    distance: Math.round(distance),
    accuracy: position.accuracy,
  };
};

/**
 * Human-readable error messages for geolocation failures.
 */
export const getLocationErrorMessage = (error) => {
  const msg = error?.message || '';

  if (msg === 'GEOLOCATION_UNSUPPORTED') {
    return {
      title: 'GPS Not Supported',
      detail: 'Your browser does not support GPS. Please use Chrome or Safari.',
    };
  }
  if (msg === 'GEOLOCATION_DENIED') {
    return {
      title: 'Location Permission Denied',
      detail: 'Please allow location access in your browser settings and try again.',
    };
  }
  if (msg === 'GEOLOCATION_UNAVAILABLE') {
    return {
      title: 'Location Unavailable',
      detail: 'Could not determine your location. Please check your GPS and try again.',
    };
  }
  if (msg === 'GEOLOCATION_TIMEOUT') {
    return {
      title: 'Location Timeout',
      detail: 'GPS took too long. Please move to an open area and try again.',
    };
  }
  if (msg.startsWith('GPS_LOW_ACCURACY')) {
    return {
      title: 'Inaccurate GPS Signal',
      detail: `Your GPS accuracy is too low (${msg.split(':')[1] || ''}). Please move to an open area or try again.`,
    };
  }

  return {
    title: 'Location Error',
    detail: 'Something went wrong with GPS verification. Please try again.',
  };
};
