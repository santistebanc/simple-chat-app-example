export interface Message {
  id: string;
  message: string;
  timestamp: string;
}

export interface GeckosChannel {
  id: string;
  emit: (event: string, data?: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  room: {
    emit: (event: string, data?: any) => void;
  };
}
