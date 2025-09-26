import { useState, useEffect } from 'react';
import geckos from '@geckos.io/client';
import { GeckosChannel, User } from '../types/chat';

// Global connection tracker to prevent duplicates across React Strict Mode
let globalConnection: GeckosChannel | null = null;
let globalConnectionPromise: Promise<GeckosChannel> | null = null;

export const useGeckos = () => {
  const [channel, setChannel] = useState<GeckosChannel | null>(globalConnection);
  const [isConnected, setIsConnected] = useState(!!globalConnection);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // If we already have a global connection, use it
    if (globalConnection) {
      setChannel(globalConnection);
      setIsConnected(true);
      
      // Ensure user list listener is set up
      globalConnection.on('user list', (data: any) => {
        console.log('Received user list:', data);
        if (Array.isArray(data)) {
          setUsers(data as User[]);
        }
      });
      return;
    }

    // If we're already connecting, wait for that connection
    if (globalConnectionPromise) {
      globalConnectionPromise.then((conn) => {
        setChannel(conn);
        setIsConnected(true);
        
        // Ensure user list listener is set up
        conn.on('user list', (data: any) => {
          console.log('Received user list:', data);
          if (Array.isArray(data)) {
            setUsers(data as User[]);
          }
        });
      });
      return;
    }

    // Start new connection
    globalConnectionPromise = new Promise((resolve, reject) => {
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

      geckosChannel.onConnect((error) => {
        if (error) {
          console.error('Connection error:', error);
          setConnectionError(error.message);
          setIsConnected(false);
          globalConnectionPromise = null;
          reject(error);
          return;
        }

        console.log('Connected to server');
        globalConnection = geckosChannel;
        setChannel(geckosChannel);
        setIsConnected(true);
        setConnectionError(null);
        globalConnectionPromise = null;
        resolve(geckosChannel);

        // Listen for user list updates
        geckosChannel.on('user list', (data: any) => {
          console.log('Received user list:', data);
          if (Array.isArray(data)) {
            setUsers(data as User[]);
          }
        });

        // Request initial user list
        geckosChannel.emit('request user list');
      });

      geckosChannel.onDisconnect(() => {
        console.log('Disconnected from server');
        globalConnection = null;
        setChannel(null);
        setIsConnected(false);
      });
    });

    globalConnectionPromise.catch((error) => {
      console.error('Connection failed:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });
  }, []);

  return {
    channel,
    isConnected,
    connectionError,
    users,
  };
};
