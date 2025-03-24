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
  const config = await fetch('/config.json').then((response) => response.json());
  const getClientCredentials = clientCredentials(
    axios.create(),
    config.CHOREO_GPT_RESEARCHER_CONNECTION_TOKENURL,
    config.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERKEY,
    config.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERSECRET
  );

  const auth: AccessTokenResponse = await getClientCredentials('OPTIONAL_SCOPES');
  const accessToken: string = auth.access_token;
  const acc = config.CHOREO_GPT_RESEARCHER_CONNECTION_TOKEN;
  const ws = new WebSocket(`${config.CHOREO_GPT_RESEARCHER_CONNECTION_SERVICEURL}/ws`, ['choreo-oauth2-token', `${accessToken}`]);
  const headers: string[] = [`sec-websocket-protocol: choreo-test-key, ${accessToken}`];

  return { ws, headers };
};