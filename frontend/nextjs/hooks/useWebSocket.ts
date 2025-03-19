import { useRef, useState, useEffect } from 'react';
import { Data, ChatBoxSettings, QuestionData } from '../types/data';
import { getHost } from '../helpers/getHost';
import axios ,{AxiosResponse} from "axios";

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
    
  
    if (!socket && typeof window !== 'undefined') {
      const fullHost = await getHost(); 
      
      const serviceURL: string = process.env.CHOREO_GPT_RESEARCHER_SERVICEURL || '';
      const choreoApiKey: string = process.env.CHOREO_GPT_RESEARCHER_CHOREOAPIKEY || '';

      console.log('Inside getHost - serviceURL:', serviceURL);
      console.log('Inside getHost - choreoApiKey:', choreoApiKey);
  
      const newSocket = new WebSocket(fullHost);
      
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
            setOrderedData((prevOrder: Data[]) => [...prevOrder, { ...data, contentAndType }]);

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