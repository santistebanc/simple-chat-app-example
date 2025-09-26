export interface Message {
  id: string;
  name?: string;
  message: string;
  timestamp: string;
}

import { ClientChannel } from '@geckos.io/client';

export type GeckosChannel = ClientChannel;
