import { useState, useEffect } from 'react';
import geckos from '@geckos.io/client';
import { GeckosChannel } from '../types/chat';

export const useGeckos = () => {
  const [channel, setChannel] = useState<GeckosChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const port = window.location.port || '8080';
    const geckosChannel = geckos({ port });

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
