import { useState, useEffect, useRef } from 'react';

const WebSocketTester = () => {
  const [status, setStatus] = useState('Disconnected');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const wsRef = useRef(null);
  
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
  const connect = () => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
    
    setStatus('Connecting...');
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      setStatus('Connected');
      addMessage('System', 'Connected to WebSocket server');
    };
    
    wsRef.current.onclose = () => {
      setStatus('Disconnected');
      addMessage('System', 'Disconnected from WebSocket server');
    };
    
    wsRef.current.onerror = (error) => {
      setStatus('Error');
      addMessage('System', `WebSocket error: ${error.message || 'Unknown error'}`);
    };
    
    wsRef.current.onmessage = (event) => {
      addMessage('Server', event.data.substring(0, 100) + '...');
    };
  };
  
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };
  
  const sendMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(inputMessage);
      addMessage('Client', inputMessage);
      setInputMessage('');
    } else {
      addMessage('System', 'Cannot send message: WebSocket is not connected');
    }
  };
  
  const sendTestImage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Create a small test image (1x1 pixel base64 encoded)
      const smallTestImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/2wBDAQMDAwQDBAgEBAgQCwkLEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBD/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AA//Z';
      wsRef.current.send(smallTestImage);
      addMessage('Client', 'Sent test image');
    } else {
      addMessage('System', 'Cannot send test image: WebSocket is not connected');
    }
  };
  
  const sendModeChange = (mode) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = mode === 'beginner' ? 'mode_beginner' : 'mode_pro';
      wsRef.current.send(message);
      addMessage('Client', `Sent mode change: ${message}`);
    } else {
      addMessage('System', 'Cannot send mode change: WebSocket is not connected');
    }
  };
  
  const addMessage = (sender, content) => {
    setMessages(prev => [
      ...prev, 
      { 
        id: Date.now(), 
        sender, 
        content, 
        time: new Date().toLocaleTimeString() 
      }
    ]);
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WebSocket Tester</h1>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="font-semibold">
          Status: <span className={`${
            status === 'Connected' ? 'text-green-600' : 
            status === 'Connecting...' ? 'text-yellow-600' : 
            'text-red-600'
          }`}>{status}</span>
        </p>
        
        <div className="mt-2 flex space-x-2">
          {status !== 'Connected' ? (
            <button 
              onClick={connect}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
            >
              Connect
            </button>
          ) : (
            <button 
              onClick={disconnect}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
            >
              Disconnect
            </button>
          )}
          
          <button 
            onClick={() => sendModeChange('beginner')}
            disabled={status !== 'Connected'}
            className={`py-1 px-3 rounded ${
              status === 'Connected' 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send Beginner Mode
          </button>
          
          <button 
            onClick={() => sendModeChange('pro')}
            disabled={status !== 'Connected'}
            className={`py-1 px-3 rounded ${
              status === 'Connected' 
                ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send Pro Mode
          </button>
          
          <button 
            onClick={sendTestImage}
            disabled={status !== 'Connected'}
            className={`py-1 px-3 rounded ${
              status === 'Connected' 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send Test Image
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex">
        <input
          type="text"
          className="flex-1 p-2 border rounded-l"
          placeholder="Type a message to send..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={status !== 'Connected' || !inputMessage}
          className={`px-4 rounded-r ${
            status === 'Connected' && inputMessage
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Send
        </button>
      </div>
      
      <div className="border rounded p-2 h-96 overflow-y-auto bg-gray-50">
        <h2 className="font-semibold mb-2">Message Log:</h2>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`p-2 rounded ${
                  msg.sender === 'System' 
                    ? 'bg-gray-200' 
                    : msg.sender === 'Client' 
                    ? 'bg-blue-100' 
                    : 'bg-green-100'
                }`}
              >
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium">{msg.sender}</span>
                  <span>{msg.time}</span>
                </div>
                <div className="text-sm break-words">{msg.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketTester;