export const safeText = (text: unknown): string => {
  if (typeof text === 'string') return text;
  if (typeof text === 'number') return String(text);
  if (!text) return '';
  return JSON.stringify(text).slice(0, 50) + '...';
};

export const extractBusinessName = (input: string): string => {
  if (!input) return '';

  const formatName = (str: string): string => {
    if (!str) return '';
    let formatted = str.replace(/[-_.]/g, ' ');
    return formatted.replace(/\b\w/g, l => l.toUpperCase()).trim();
  };

  try {
    let urlStr = input.trim();
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
      if (!urlStr.includes('.') || urlStr.includes(' ')) return '';
      urlStr = 'https://' + urlStr;
    }

    const url = new URL(urlStr);
    const hostname = url.hostname.replace('www.', '');
    const pathname = url.pathname;
    const socialDomains = ['instagram.com', 'facebook.com', 'linkedin.com', 'tiktok.com', 'twitter.com', 'x.com'];

    if (socialDomains.some(d => hostname.includes(d))) {
      const pathParts = pathname.split('/').filter(p => p);
      if (pathParts.length > 0) {
        if (hostname.includes('linkedin') && pathParts[0] === 'in' && pathParts[1]) {
          return formatName(pathParts[1]);
        }
        return formatName(pathParts[0]);
      }
    }

    const domainParts = hostname.split('.');
    if (domainParts.length > 0) return formatName(domainParts[0]);
    return '';
  } catch (e) {
    return '';
  }
};

export interface TimeAgoResult {
  text: string;
  alert: boolean;
}

export const formatTimeAgo = (isoString: string | undefined): TimeAgoResult => {
  if (!isoString || isoString === 'Ahora') return { text: 'Recién', alert: false };

  try {
    if (typeof isoString !== 'string') return { text: 'N/A', alert: false };

    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (isNaN(diffInSeconds)) return { text: 'N/A', alert: false };
    if (diffInSeconds < 0) return { text: 'Recién', alert: false };
    if (diffInSeconds < 60) return { text: 'Recién', alert: false };
    if (diffInSeconds < 3600) return { text: `${Math.floor(diffInSeconds / 60)} min`, alert: false };
    if (diffInSeconds < 86400) return { text: `${Math.floor(diffInSeconds / 3600)} h`, alert: false };
    
    const days = Math.floor(diffInSeconds / 86400);
    return { text: `${days} día${days !== 1 ? 's' : ''}`, alert: days >= 4 };
  } catch (e) {
    return { text: '-', alert: false };
  }
};

