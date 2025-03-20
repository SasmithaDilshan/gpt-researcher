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
    process.env.CHOREO_GPT_RESEARCHER_CONNECTION_TOKENURL,
    process.env.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERKEY,
    process.env.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERSECRET
  );
  console.log(process.env.CHOREO_GPT_RESEARCHER_CONNECTION_SERVICEURL);
  console.log(process.env.CHOREO_GPT_RESEARCHER_CONNECTION_TOKENURL);
  console.log(process.env.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERKEY);
  console.log(process.env.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERSECRET);
  const auth: AccessTokenResponse = await getClientCredentials('OPTIONAL_SCOPES');
  const accessToken: string = auth.access_token;
  const acc = "eyJraWQiOiJnYXRld2F5X2NlcnRpZmljYXRlX2FsaWFzIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJjODJkMDU0Yy1kNDJkLTQyOWEtOGRjYy1mZjUwZmU5ODc2ZTlAY2FyYm9uLnN1cGVyIiwiYXVkIjoiY2hvcmVvOmRlcGxveW1lbnQ6c2FuZGJveCIsIm9yZ2FuaXphdGlvbiI6eyJ1dWlkIjoiZWRkYjRmYzUtNWJmNi00MGE1LWE1NGQtOGVhMmEzZmNiYWNhIn0sImlzcyI6Imh0dHBzOlwvXC9zdHMuY2hvcmVvLmRldjo0NDNcL2FwaVwvYW1cL3B1Ymxpc2hlclwvdjJcL2FwaXNcL2ludGVybmFsLWtleSIsImtleXR5cGUiOiJTQU5EQk9YIiwic3Vic2NyaWJlZEFQSXMiOlt7InN1YnNjcmliZXJUZW5hbnREb21haW4iOm51bGwsIm5hbWUiOiJncHQtcmVzZWFyY2hlci1iYWNrZW5kIC0gZ3B0X3Jlc2VhcmNoZXJfYmFja2VuZCIsImNvbnRleHQiOiJcL2VkZGI0ZmM1LTViZjYtNDBhNS1hNTRkLThlYTJhM2ZjYmFjYVwvcHJpc21cL2dwdC1yZXNlYXJjaGVyLWJhY2tlbmRcL3YxLjAiLCJwdWJsaXNoZXIiOiJjaG9yZW9fcHJvZF9hcGltX2FkbWluIiwidmVyc2lvbiI6InYxLjAiLCJzdWJzY3JpcHRpb25UaWVyIjpudWxsfV0sImV4cCI6MTc0MjQ2MzkxMywidG9rZW5fdHlwZSI6IkludGVybmFsS2V5IiwiaWF0IjoxNzQyNDYzMzEzLCJqdGkiOiIxMDRhZjYzNS1jZjgyLTQwYTgtYmVjNi1jOGFiYTk2N2Q0MWQifQ.imsg6Gd2L6jJGfpcBkyo2EzbMg8QO_GmuZavuJ4yzk8tqkE6W7cDrRj9EpbhG5zmD_Hh2_PDdpPp-cVXnTfnh-TKkn696JQCNGeSWyinViRNt6PWXVpT21_p3dZUrkINxenL4hQ9NYflkuJnjzAkZMnpG25PV68gbKbzMeBaNXOdsk6D4tkpOYTW4l9Bz3DCAAK5xSPAJPWdHJfIB9qjiViAVIQaiCFd4-s82gt_ELo9lzaTb8OeaHUg4FVAyMYG9x3Tty-TrHd-YyPsDFlCzt_OEZY7YU6NQsaazh0SCJ8c9BfnRq-r89M08SAdbRoERnV_CGfuXkC1H6xLGg2p3eBtE-16ZgBmiQDNIkPdJEMZMSqPudHYuESWp1RSmHeOaybVFtqVgkvUEg6uAXsx79UpEHaVhtGS3zNqFDm3Ew5t1JhBY2dW1qHm4OcZhKvl8nqvLD0XEw0a1DZcl9GKyaVNZau2wPa2bxqP6tsPR6WhVorG_la2cxN2vngtNoEn5kOwpSlqpAjvbn9Aip43Ed3MJV4ZfC-UqkxfW5uIjSQOjXybBrXuPL_pBUr_lw0gUx3EcHLyHIv0uC6k0hAc46aXVaPzjoX6EJ4AHOKkTbk3qJvIKP6P4eUtB12r98PQdMvdFnlj0VN9vfIqhd34azxd7oP2kERaIJOJlpIot5I";
  const ws = new WebSocket(`${process.env.CHOREO_GPT_RESEARCHER_CONNECTION_SERVICEURL}/ws`, `sec-websocket-protocol:choreo-test-key,${accessToken}`);
  const headers: string[] = [`sec-websocket-protocol: choreo-test-key, ${accessToken}`];

  return { ws, headers };
};