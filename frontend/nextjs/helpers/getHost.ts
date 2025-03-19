import axios ,{AxiosResponse} from "axios";
interface GetHostParams {
  purpose?: string;
}


export const getHost = async ({ purpose }: GetHostParams = {}): Promise<string> => {
  const serviceURL: string = process.env.CHOREO_GPT_BACKEND_SERVICEURL || '';
  const choreoApiKey: string = process.env.CHOREO_GPT_BACKEND_APIKEY || '';
   // Logging inside the function to debug
   console.log('Inside getHost - serviceURL:', serviceURL);
   console.log('Inside getHost - choreoApiKey:', choreoApiKey);
  
   const channelName = 'ws'; // Replace with actual channel name
   const wsURL= `${serviceURL}${channelName}?api_key=${choreoApiKey}`

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