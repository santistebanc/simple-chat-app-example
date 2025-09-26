import { useState, useEffect, useRef } from 'react';
import geckos from '@geckos.io/client';
import { GeckosChannel, User } from '../types/chat';

export const useGeckos = () => {
  const [channel, setChannel] = useState<GeckosChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const channelRef = useRef<GeckosChannel | null>(null);
  const isConnectingRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate connections in React Strict Mode
    if (isConnectingRef.current || channelRef.current) {
      return;
    }

    isConnectingRef.current = true;

    // Get the current hostname and protocol
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Configure geckos client for the current environment
    let geckosConfig: any = {};

    // For development (localhost), connect to backend server on port 3000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      geckosConfig = {
        port: 3000,
        url: `${protocol}//${hostname}`,
      };
    } else {
      // For production deployments behind reverse proxy, use the current origin
      const port = window.location.port || (protocol === 'https:' ? '443' : '80');
      geckosConfig = {
        port: parseInt(port),
        url: window.location.origin,
      };
    }

    console.log('Connecting to geckos with config:', geckosConfig);
    const geckosChannel = geckos(geckosConfig);
    channelRef.current = geckosChannel;

    geckosChannel.onConnect((error) => {
      if (error) {
        console.error('Connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        isConnectingRef.current = false;
        return;
      }

      console.log('Connected to server');
      setChannel(geckosChannel);
      setIsConnected(true);
      setConnectionError(null);
      isConnectingRef.current = false;

      // Listen for user list updates
      geckosChannel.on('user list', (data: any) => {
        console.log('Received user list:', data);
        if (Array.isArray(data)) {
          setUsers(data as User[]);
        }
      });
    });

    geckosChannel.onDisconnect(() => {
      console.log('Disconnected from server');
      setChannel(null);
      setIsConnected(false);
      channelRef.current = null;
      isConnectingRef.current = false;
    });

    return () => {
      // Simply clean up our refs - geckos.io will handle connection cleanup
      channelRef.current = null;
      isConnectingRef.current = false;
    };
  }, []);

  return {
    channel,
    isConnected,
    connectionError,
    users,
  };
};
