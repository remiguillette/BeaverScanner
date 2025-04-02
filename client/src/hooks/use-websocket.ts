import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketMessage } from '@shared/schema';

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.addEventListener('open', () => {
      setConnected(true);
      console.log('WebSocket connection established');
    });
    
    socket.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        setMessages((prev) => [...prev, message]);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    socket.addEventListener('close', () => {
      setConnected(false);
      console.log('WebSocket connection closed');
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (socketRef.current?.readyState === WebSocket.CLOSED) {
          socketRef.current = null;
        }
      }, 5000);
    });
    
    socket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    return () => {
      socket.close();
    };
  }, []);
  
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);
  
  return { connected, messages, sendMessage };
}
