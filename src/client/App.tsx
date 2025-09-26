import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Wifi, WifiOff, Users } from 'lucide-react';
import { useGeckos } from './hooks/useGeckos';
import { Message } from './types/chat';

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { channel, isConnected, connectionError, users } = useGeckos();

  useEffect(() => {
    if (!channel) return;

    const handleMessage = (data: any) => {
      console.log('Received message:', data);
      
      // Handle different message types
      if (typeof data === 'string') {
        // Welcome message from server
        setMessages(prev => {
          // Check if this welcome message already exists
          const exists = prev.some(msg => 
            msg.id === 'system' && msg.message === data
          );
          if (exists) return prev;
          
          return [...prev, { 
            id: 'system', 
            message: data, 
            timestamp: new Date().toISOString() 
          }];
        });
      } else if (data && typeof data === 'object' && data.id && data.message) {
        // Chat message from other users
        setMessages(prev => {
          // Check if this exact message already exists
          const exists = prev.some(msg => 
            msg.id === data.id && 
            msg.message === data.message && 
            msg.timestamp === data.timestamp
          );
          if (exists) return prev;
          
          return [...prev, data];
        });
      }
    };

    // Add the listener
    channel.on('chat message', handleMessage);

    return () => {
      // Note: geckos.io client doesn't support removing listeners
      // The listener will be cleaned up when the component unmounts
    };
  }, [channel]);

  const sendMessage = () => {
    if (message.trim() && channel) {
      channel.emit('chat message', message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="flex gap-4 h-[600px]">
          {/* Main Chat Area */}
          <Card className="flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <CardTitle>Geckos Chat</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Badge variant="default" className="flex items-center space-x-1">
                  <Wifi className="h-3 w-3" />
                  <span>Connected</span>
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <WifiOff className="h-3 w-3" />
                  <span>Disconnected</span>
                </Badge>
              )}
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">{users.length}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col space-y-4">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-2 p-4 bg-muted/30 rounded-lg">
              {connectionError && (
                <div className="text-center text-destructive text-sm">
                  Connection error: {connectionError}
                </div>
              )}
              
              {messages.length === 0 && !connectionError && (
                <div className="text-center text-muted-foreground">
                  {isConnected ? 'Start chatting...' : 'Connecting...'}
                </div>
              )}
              
              {messages.map((msg, index) => (
                <div
                  key={`${msg.id}-${msg.timestamp}-${index}`}
                  className={`flex ${
                    msg.id === 'system' ? 'justify-center' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.id === 'system'
                        ? 'bg-muted text-muted-foreground text-sm'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <div className="font-medium text-xs mb-1">
                      {msg.id === 'system' ? 'System' : (msg.name || `User ${msg.id}`)}
                    </div>
                    <div>{msg.message}</div>
                    <div className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!isConnected || !message.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Side Panel */}
        <Card className="w-64 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Users ({users.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {users.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-4">
                No users connected
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Connected {new Date(user.connectedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
