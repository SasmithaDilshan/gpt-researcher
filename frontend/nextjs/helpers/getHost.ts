interface GetHostParams {
  purpose?: string;
}


export const getHost = async ({ purpose }: GetHostParams = {}): Promise<string> => {
  const serviceURL: string = process.env.CHOREO_GPT_RESEARCHER_SERVICEURL || '';
  const choreoApiKey: string = process.env.CHOREO_GPT_RESEARCHER_CHOREOAPIKEY || '';

  console.log('Inside getHost - serviceURL:', serviceURL);
  console.log('Inside getHost - choreoApiKey:', choreoApiKey);
  
  const channelName = 'ws';
  const wsURL ="ws://gpt-researcher-backend-3418791020:8000/ws?api_key=chk_eyJjb25uZWN0aW9uLWlkIjoiMDFmMDA0ZGItOWVmOS0xYjgwLWIyOTYtZDFkZTllMTdjMTE2In0=cxm3RA";
  console.log('wsURL', wsURL);
  return wsURL;
};