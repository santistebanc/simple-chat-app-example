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
    const port = window.location.port || (protocol === 'https:' ? '443' : '8080');
    
    // Configure geckos client for the current environment
    const geckosConfig: any = {
      port: port,
      url: `${protocol}//${hostname}:${port}`,
    };

    // For production deployments behind reverse proxy, use the current origin
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      geckosConfig.url = window.location.origin;
      geckosConfig.port = window.location.port || (protocol === 'https:' ? '443' : '80');
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
      geckosChannel.close();
    };
  }, []);

  return {
    channel,
    isConnected,
    connectionError,
  };
};
