export interface Message {
  id: string;
  message: string;
  timestamp: string;
}

import { ClientChannel } from '@geckos.io/client';

export type GeckosChannel = ClientChannel;
