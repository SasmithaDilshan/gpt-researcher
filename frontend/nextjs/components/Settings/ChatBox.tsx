import React, { useState, useEffect } from 'react';
import ResearchForm from '../Task/ResearchForm';
import Report from '../Task/Report';
import AgentLogs from '../Task/AgentLogs';
import AccessReport from '../ResearchBlocks/AccessReport';
import { getHost } from '../../helpers/getHost';
import { ChatBoxSettings } from '@/types/data';
import axios from "axios";
import { clientCredentials } from 'axios-oauth-client';

interface AccessTokenResponse {
  access_token: string;
}
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

export default function ChatBox({ chatBoxSettings, setChatBoxSettings }: ChatBoxProps) {

  const [agentLogs, setAgentLogs] = useState<any[]>([]);
  const [report, setReport] = useState("");
  const [accessData, setAccessData] = useState({});
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      getHost().then(({ ws, headers }) => {
        const newSocket = ws;
        setSocket(newSocket);
        newSocket.onmessage = async (event) => {
          const data = JSON.parse(event.data) as WebSocketMessage;
          
          if (data.type === 'logs') {
            setAgentLogs((prevLogs: any[]) => [...prevLogs, data]);
          } else if (data.type === 'report') {
            setReport((prevReport: string) => prevReport + (data.output as string));
          } else if (data.type === 'path') {
            const output = data.output as OutputData;
            console.log('output', output);
            const newAccessData: any = {};

            const fetchAndSaveFile = async (filePath: string, fileType: string): Promise<string> => {
              const config = await fetch('/config.json').then((response) => response.json());
              const getClientCredentials = clientCredentials(
                axios.create(),
                config.CHOREO_GPT_RESEARCHER_CONNECTION_TOKENURL,
                config.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERKEY,
                config.CHOREO_GPT_RESEARCHER_CONNECTION_CONSUMERSECRET
              );

              const auth: AccessTokenResponse = await getClientCredentials('OPTIONAL_SCOPES');
              const accessToken: string = auth.access_token;

              // Remove 'outputs/' prefix from the file path if it exists
              const sanitizedFilePath = filePath.startsWith('outputs/') ? filePath.replace('outputs/', '') : filePath;

              // Fetch the file from the server
              const response = await axios.get(
                `https://47bb0b75-a54b-4d3a-ae01-17594ccde118-dev.e1-us-east-azure.choreoapis.dev/luxuryhotels/gpt-researcher-backend/gpt_researcher_backend_rest/v1.0/${sanitizedFilePath}`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                  responseType: 'blob',
                }
              );

              if (response.status < 200 || response.status >= 300) {
                throw new Error(`Failed to fetch file: ${response.statusText}`);
              }

              // Use the response data as a Blob
              const blob = response.data;

              // Create a temporary URL for the file
              const fileURL = URL.createObjectURL(blob);

              // Log the file URL for debugging
              console.log(`Generated file URL for ${fileType}:`, fileURL);

              return fileURL;
            };

            if (output.pdf) {
              newAccessData.pdf = await fetchAndSaveFile(output.pdf, 'PDF');
            }
            if (output.docx) {
              newAccessData.docx = await fetchAndSaveFile(output.docx, 'DOCX');
            }
            if (output.json) {
              newAccessData.json = await fetchAndSaveFile(output.json, 'JSON');
            }

            setAccessData(newAccessData);
          }
        };

        return () => {
          newSocket.close();
        };
      });
    }
  }, []);

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