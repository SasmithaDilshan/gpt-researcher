import axios ,{AxiosResponse} from "axios";
interface GetHostParams {
  purpose?: string;
}
const serviceURL: string = process.env.CHOREO_GPT_BACKEND_SERVICEURL ?? '';
const tokenURL: string = process.env.CHOREO_GPT_BACKEND_TOKENURL ?? '';
const consumerKey: string = process.env.CHOREO_GPT_BACKEND_CONSUMERKEY ?? '';
const consumerSecret: string = process.env.CHOREO_GPT_BACKEND_CONSUMERSECRET ?? '';
const choreoApiKey: string = process.env.CHOREO_GPT_BACKEND_APIKEY ?? '';

interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
}

async function getAccessToken(
  tokenUrl: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  try {
    // Request payload for authentication
    const payload = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });

    // Axios request for token
    const response: AxiosResponse<TokenResponse> = await axios.post(tokenUrl, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // Extract and return the access token
    if (response.data.access_token) {
      return response.data.access_token;
    } else {
      throw new Error('Access token not found in response.');
    }
  } catch (error: any) {
    // Error handling
    const errorMessage = error.response
      ? `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`
      : error.message;
    throw new Error(`Failed to fetch access token: ${errorMessage}`);
  }
}

export const getHost = async ({ purpose }: GetHostParams = {}): Promise<string> => {
  const accessToken: string = await getAccessToken(tokenURL, consumerKey, consumerSecret);
  const wsURL  = `${serviceURL}/ws?access_token=${accessToken}&Choreo-API-Key=${choreoApiKey}`;
  // if (typeof window !== 'undefined') {
  //   let { host } = window.location;
  //   if (process.env.NEXT_PUBLIC_GPTR_API_URL) {
  //     return process.env.NEXT_PUBLIC_GPTR_API_URL;
  //   } else if (purpose === 'langgraph-gui') {
  //     return host.includes('localhost') ? 'http%3A%2F%2F127.0.0.1%3A8123' : `https://${host}`;
  //   } else {
  //     return host.includes('localhost') ? 'http://localhost:8000' : `https://${host}`;
  //   }
  // }
  return wsURL;
};