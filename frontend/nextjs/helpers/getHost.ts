interface GetHostParams {
  purpose?: string;
}

export const getHost = ({ purpose }: GetHostParams = {}): string => {
  if (typeof window !== 'undefined') {
    let { host } = window.location;
    if (process.env.NEXT_PUBLIC_GPTR_API_URL) {
      const apiUrl = process.env.CHOREO_GPT_RESEARCHER_BACKEND_SERVICEURL;
      const apiKey = process.env.CHOREO_GPT_RESEARCHER_BACKEND_APIKEY;
      return `${apiUrl}?api_key=${apiKey}`;
    } else if (purpose === 'langgraph-gui') {
      return host.includes('localhost') ? 'http%3A%2F%2F127.0.0.1%3A8123' : `https://${host}`;
    } else {
      return host.includes('localhost') ? 'http://localhost:8000' : `https://${host}`;
    }
  }
  return '';
};