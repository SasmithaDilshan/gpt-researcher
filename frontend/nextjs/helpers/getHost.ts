interface GetHostParams {
  purpose?: string;
}


export const getHost = async ({ purpose }: GetHostParams = {}): Promise<string> => {
  const serviceURL: string = process.env.CHOREO_GPT_RESEARCHER_SERVICEURL || '';
  const choreoApiKey: string = process.env.CHOREO_GPT_RESEARCHER_CHOREOAPIKEY || '';

  console.log('Inside getHost - serviceURL:', serviceURL);
  console.log('Inside getHost - choreoApiKey:', choreoApiKey);
  
  const channelName = 'ws';
  const wsURL =`${serviceURL}${channelName}?api_key=${choreoApiKey}`;
  console.log('wsURL', wsURL);
  return wsURL;
};