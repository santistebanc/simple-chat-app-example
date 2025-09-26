export interface Message {
  id: string;
  name?: string;
  message: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  connectedAt: string;
}

import { ClientChannel } from '@geckos.io/client';

export type GeckosChannel = ClientChannel;
