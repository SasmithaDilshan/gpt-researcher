import React from "react";
import axios from "axios";
import { clientCredentials } from 'axios-oauth-client';


interface GetHostParams {
  purpose?: string;
}

interface AccessTokenResponse {
  access_token: string;
}

interface HostResponse {
  ws: WebSocket;
  headers: string[];
}

export const getHost = async ({ purpose }: GetHostParams = {}): Promise<HostResponse> => {
  const getClientCredentials = clientCredentials(
    axios.create(),
    process.env.NEXT_PUBLIC_CHOREO_GPT_RESEARCHER_CONNECTION_TOKENURL,
    process.env.NEXT_PUBLIC_CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERKEY,
    process.env.NEXT_PUBLIC_CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERSECRET
  );
  console.log(process.env.NEXT_PUBLIC_CHOREO_GPT_RESEARCHER_CONNECTION_SERVICEURL);
  console.log(process.env.NEXT_PUBLIC_CHOREO_GPT_RESEARCHER_CONNECTION_TOKENURL);
  console.log(process.env.NEXT_PUBLIC_CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERKEY);
  console.log(process.env.NEXT_PUBLIC_CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERSECRET);
  const auth: AccessTokenResponse = await getClientCredentials('OPTIONAL_SCOPES');
  const accessToken: string = auth.access_token;
  const acc = process.env.NEXT_PUBLIC_CHOREO_GPT_RESEARCHER_CONNECTION_TOKEN;
  const ws = new WebSocket(`${process.env.NEXT_PUBLIC_CHOREO_GPT_RESEARCHER_CONNECTION_SERVICEURL}/ws`, ['choreo-oauth2-token',`${accessToken}`]);
  const headers: string[] = [`sec-websocket-protocol: choreo-test-key, ${accessToken}`];

  return { ws, headers };
};