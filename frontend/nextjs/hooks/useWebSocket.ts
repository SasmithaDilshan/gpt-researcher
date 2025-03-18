import { useRef, useState, useEffect } from 'react';
import { Data, ChatBoxSettings, QuestionData } from '../types/data';
import { getHost } from '../helpers/getHost';
import oauth from 'axios-oauth-client'
import axios from 'axios';
export const useWebSocket = (
  setOrderedData: React.Dispatch<React.SetStateAction<Data[]>>,
  setAnswer: React.Dispatch<React.SetStateAction<string>>, 
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setShowHumanFeedback: React.Dispatch<React.SetStateAction<boolean>>,
  setQuestionForHuman: React.Dispatch<React.SetStateAction<boolean | true>>
) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const heartbeatInterval = useRef<number>();

  // Cleanup function for heartbeat
  useEffect(() => {
    return () => {
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, []);

  const startHeartbeat = (ws: WebSocket) => {
    // Clear any existing heartbeat
    if (heartbeatInterval.current) {
      clearInterval(heartbeatInterval.current);
    }
    
    // Start new heartbeat
    heartbeatInterval.current = window.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 30000); // Send ping every 30 seconds
  };

  const initializeWebSocket = async (promptValue: string, chatBoxSettings: ChatBoxSettings) => {
    const serviceURL = process.env.CHOREO_GPT_BACKEND_SERVICEURL;
    const tokenURL = process.env.CHOREO_GPT_BACKEND_TOKENURL;
    const consumerKey = process.env.CHOREO_GPT_BACKEND_CONSUMERKEY;
    const consumerSecret = process.env.CHOREO_GPT_BACKEND_CONSUMERSECRET;
    const choreoApiKey = process.env.CHOREO_GPT_BACKEND_APIKEY;

    async function getAccessToken(tokenUrl, clientId, clientSecret) {
      try {
        // Request payload
        const payload = new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        });

        // Make a POST request to the token endpoint
        const response = await axios.post(tokenUrl, payload, {
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
      } catch (error) {
        // Handle errors
        const errorMessage = error.response
          ? `HTTP ${error.response.status}: ${error.response.data}`
          : error.message;
        throw new Error(`Failed to fetch access token: ${errorMessage}`);
      }
    }

    const accessToken = await getAccessToken(tokenURL, consumerKey, consumerSecret);

    const url = `${serviceURL}/ws?access_token=${accessToken}&Choreo-API-Key=${choreoApiKey}`;
    const storedConfig = localStorage.getItem('apiVariables');
    const apiVariables = storedConfig ? JSON.parse(storedConfig) : {};

    if (!socket && typeof window !== 'undefined') {
      const fullHost = getHost();
      const host = fullHost.replace('http://', '').replace('https://', '');
      const ws_uri = `${fullHost.includes('https') ? 'wss:' : 'ws:'}//${host}/ws`;

      const newSocket = new WebSocket(url);
      setSocket(newSocket);

      newSocket.onopen = () => {
        console.log('chatBoxSettings', chatBoxSettings);
        const domainFilters = JSON.parse(localStorage.getItem('domainFilters') || '[]');
        const domains = domainFilters ? domainFilters.map((domain: any) => domain.value) : [];
        const { report_type, report_source, tone } = chatBoxSettings;
        let data = "start " + JSON.stringify({ 
          task: promptValue,
          report_type, 
          report_source, 
          tone,
          query_domains: domains
        });
        newSocket.send(data);
        startHeartbeat(newSocket);
      };

      newSocket.onmessage = (event) => {
        try {
          // Handle ping response
          if (event.data === 'pong') return;

          // Try to parse JSON data
          const data = JSON.parse(event.data);
          if (data.type === 'human_feedback' && data.content === 'request') {
            setQuestionForHuman(data.output);
            setShowHumanFeedback(true);
          } else {
            const contentAndType = `${data.content}-${data.type}`;
            setOrderedData((prevOrder) => [...prevOrder, { ...data, contentAndType }]);

            if (data.type === 'report') {
              setAnswer((prev: string) => prev + data.output);
            } else if (data.type === 'path' || data.type === 'chat') {
              setLoading(false);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, event.data);
        }
      };

      newSocket.onclose = () => {
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
        }
        setSocket(null);
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
        }
      };
    }
  };

  return { socket, setSocket, initializeWebSocket };
};