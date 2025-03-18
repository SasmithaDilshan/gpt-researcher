import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ResearchForm from '../Task/ResearchForm';
import Report from '../Task/Report';
import AgentLogs from '../Task/AgentLogs';
import AccessReport from '../ResearchBlocks/AccessReport';
import { getHost } from '../../helpers/getHost';
import { ChatBoxSettings } from '@/types/data';

interface ChatBoxProps {
  chatBoxSettings: ChatBoxSettings;
  setChatBoxSettings: React.Dispatch<React.SetStateAction<ChatBoxSettings>>;
}

interface OutputData {
  pdf?: string;
  docx?: string;
  json?: string;
}

interface WebSocketMessage {
  type: 'logs' | 'report' | 'path';
  output: string | OutputData;
}

interface AccessTokenResponse {
  access_token: string;
}

export default function ChatBox({ chatBoxSettings, setChatBoxSettings }: ChatBoxProps) {

  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [report, setReport] = useState("");
  const [accessData, setAccessData] = useState({});
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fullHost = getHost()
      const host = fullHost.replace('http://', '').replace('https://', '')
      
      const ws_uri = `${fullHost.includes('https') ? 'wss:' : 'ws:'}//${host}/ws`;
      const serviceURL = process.env.CHOREO_GPT_BACKEND_SERVICEURL;
      const tokenURL = process.env.CHOREO_GPT_BACKEND_TOKENURL;
      const consumerKey = process.env.CHOREO_GPT_BACKEND_CONSUMERKEY;
      const consumerSecret = process.env.CHOREO_GPT_BACKEND_CONSUMERSECRET;
      const choreoApiKey = process.env.CHOREO_GPT_BACKEND_APIKEY;

      if (!tokenURL || !consumerKey || !consumerSecret) {
        throw new Error('Missing required environment variables for authentication.');
      }
      const initializeWebSocket = async () => {
        const accessToken = await getAccessToken(tokenURL, consumerKey, consumerSecret);

        const url = `${serviceURL}/ws?access_token=${accessToken}&Choreo-API-Key=${choreoApiKey}`;
        const newSocket = new WebSocket(url);
        setSocket(newSocket);

        newSocket.onmessage = (event) => {
          const data = JSON.parse(event.data) as WebSocketMessage;
          
          if (data.type === 'logs') {
            setAgentLogs((prevLogs: any[]) => [...prevLogs, data]);
          } else if (data.type === 'report') {
            setReport((prevReport: string) => prevReport + (data.output as string));
          } else if (data.type === 'path') {
            const output = data.output as OutputData;
            setAccessData({
              ...(output.pdf && { pdf: `outputs/${output.pdf}` }),
              ...(output.docx && { docx: `outputs/${output.docx}` }),
              ...(output.json && { json: `outputs/${output.json}` })
            });
          }
        };

        return () => {
          newSocket.close();
        };
      };

      initializeWebSocket();
    }
  }, []);

  async function getAccessToken(tokenUrl: string, clientId: string, clientSecret: string): Promise<string> {
    try {
      // Request payload
      const payload = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      // Make a POST request to the token endpoint
      const response = await axios.post<AccessTokenResponse>(tokenUrl, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Extract and return the access token
      if (response.data && response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new Error('Access token not found in the response.');
      }
    } catch (error: any) {
      // Handle errors
      const errorMessage = error.response
        ? `HTTP ${error.response.status}: ${error.response.data}`
        : error.message;
      throw new Error(`Failed to fetch access token: ${errorMessage}`);
    }
  }

  return (
    <div>
      <main className="static-container" id="form">
        <ResearchForm 
          chatBoxSettings={chatBoxSettings} 
          setChatBoxSettings={setChatBoxSettings}
        />

        {agentLogs?.length > 0 ? <AgentLogs agentLogs={agentLogs} /> : ''}
        <div className="margin-div">
          {report ? <Report report={report} /> : ''}
          {Object.keys(accessData).length > 0 && 
            <AccessReport 
              accessData={accessData} 
              chatBoxSettings={chatBoxSettings} 
              report={report}
            />
          }
        </div>
      </main>
    </div>
  );
}