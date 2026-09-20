/**
 * Device and Request Metadata Detector for Edge & Node Runtimes
 * Parses User-Agent, IP, and Cloudflare Geo headers to provide human-readable device info.
 */

export interface DeviceInfo {
  ipAddress: string;
  userAgent: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  location: string;
  summary: string;
}

export function parseDeviceInfo(request: Request): DeviceInfo {
  const headers = request.headers;

  // 1. IP Address extraction
  const ipAddress = 
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    '127.0.0.1';

  // 2. Cloudflare Geo headers
  const city = headers.get('cf-ipcity');
  const country = headers.get('cf-ipcountry');
  const region = headers.get('cf-region');

  let location = 'Localhost / เครือข่ายภายใน';
  if (city && country) {
    location = `${city}, ${country}`;
  } else if (country) {
    location = country === 'TH' ? 'ประเทศไทย' : country;
  } else if (ipAddress !== '127.0.0.1' && ipAddress !== '::1') {
    location = 'ประเทศไทย (โดยประมาณ)';
  }

  // 3. User-Agent parsing
  const ua = headers.get('user-agent') || 'Unknown Device';
  const uaLower = ua.toLowerCase();

  // Device Type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Operating System
  let os = 'Unknown OS';
  if (/windows nt 10\.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/windows nt 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/windows nt 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/iphone/i.test(ua)) {
    const match = ua.match(/os (\d+[._]\d+)/i);
    os = match ? `iOS ${match[1].replace('_', '.')}` : 'iOS (iPhone)';
  } else if (/ipad/i.test(ua)) {
    os = 'iPadOS';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/android/i.test(ua)) {
    const match = ua.match(/android (\d+(\.\d+)?)/i);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // Browser
  let browser = 'Unknown Browser';
  if (/edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/samsungbrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/line\//i.test(ua)) {
    browser = 'LINE In-App';
  } else if (/fbav\//i.test(ua)) {
    browser = 'Facebook In-App';
  } else if (/chrome\//i.test(ua) && !/edg/i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'Apple Safari';
  } else if (/firefox\//i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/opera|opr\//i.test(ua)) {
    browser = 'Opera';
  }

  const summary = `${os} • ${browser}`;

  return {
    ipAddress,
    userAgent: ua,
    deviceType,
    browser,
    os,
    location,
    summary,
  };
}
