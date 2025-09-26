import { useState, useEffect } from 'react';
import geckos from '@geckos.io/client';
import { GeckosChannel } from '../types/chat';

export const useGeckos = () => {
  const [channel, setChannel] = useState<GeckosChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Get the current hostname and protocol
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Configure geckos client for the current environment
    let geckosConfig: any = {};

    // For development (localhost), connect to backend server on port 3000
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      geckosConfig = {
        port: '3000',
        url: `${protocol}//${hostname}:3000`,
      };
    } else {
      // For production deployments behind reverse proxy, use the current origin
      const port = window.location.port || (protocol === 'https:' ? '443' : '80');
      geckosConfig = {
        port: port,
        url: window.location.origin,
      };
    }

    console.log('Connecting to geckos with config:', geckosConfig);
    const geckosChannel = geckos(geckosConfig);

    geckosChannel.onConnect((error) => {
      if (error) {
        console.error('Connection error:', error);
        setConnectionError(error.message);
        setIsConnected(false);
        return;
      }

      console.log('Connected to server');
      setChannel(geckosChannel);
      setIsConnected(true);
      setConnectionError(null);
    });

    geckosChannel.onDisconnect(() => {
      console.log('Disconnected from server');
      setChannel(null);
      setIsConnected(false);
    });

    return () => {
      try {
        if (geckosChannel && typeof geckosChannel.close === 'function') {
          geckosChannel.close();
        }
      } catch (error) {
        console.warn('Error closing geckos channel:', error);
      }
    };
  }, []);

  return {
    channel,
    isConnected,
    connectionError,
  };
};
