import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Send, Bot, Loader2 } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const generateAnswers = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      const response = await axios({
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDkWiSorvtIEVEyj7cjT_XYfbb-QEKoino',
        method: 'post',
        data: {
          system_instruction: {
            parts: [{ text: 'You are a helpful, concise assistant. Keep responses brief and to the point (2-3 sentences maximum). Avoid markdown formatting and bullet points.' }],
          },
          contents: [
            {
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          },
        },
      });

      let botResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response.';

      // Enhanced cleanup for concise responses
      botResponse = botResponse
        .replace(/\*\*\*\*+/g, '')
        .replace(/\*\*/g, '')
        .replace(/^•\s*/gm, '')
        .replace(/^\*\s*/gm, '')
        .replace(/^\d+\.\s*/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s*\n\s*\n\s*/g, '\n\n')
        .replace(/\s*\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Truncate if still too long
      if (botResponse.length > 300) {
        botResponse = botResponse.substring(0, 300).trim() + '...';
      }

      addMessage(botResponse, 'bot');
    } catch (error) {
      console.error('Error generating response:', error);
      addMessage('Sorry, there was an error. Please try again.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header className="text-white py-3 shadow-sm header-gradient">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between">
            <h1 className="h4 mb-0 fw-bold">AI Chat Assistant</h1>
            <div className="badge bg-white text-primary px-3 py-2">
              {isLoading ? 'Thinking...' : 'Online'}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-grow-1 container py-4 overflow-hidden d-flex flex-column">
        <div className="card shadow-sm flex-grow-1 d-flex flex-column" style={{ background: '#fff', borderRadius: '12px' }}>
          {/* Messages Area */}
          <div className="flex-grow-1 p-4 overflow-auto message-container" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {messages.length === 0 ? (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <Bot size={48} className="mb-3 text-primary" />
                <h2 className="h4 mb-2">How can I help you today?</h2>
                <p className="text-center text-muted">Ask me anything, and I'll do my best to assist you.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`d-flex ${message.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
                  >
                    <div
                      className={`message-bubble ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                    >
                      <div className="message-text">
                        {message.text}
                      </div>
                      <div className="message-time">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="d-flex justify-content-start">
                    <div className="message-bubble bot-message loading-bubble">
                      <Loader2 className="animate-spin text-primary" size={18} />
                      <span className="text-muted small ms-2">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-top p-3 bg-white" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', borderColor: '#f0f0f0' }}>
            <div className="input-group rounded-lg" style={{ overflow: 'hidden', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)' }}>
              <input
                type="text"
                className="form-control border-0 py-3 ps-4"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAnswers()}
                disabled={isLoading}
                style={{ boxShadow: 'none', fontSize: '0.95rem' }}
              />
              <button
                className="btn d-flex align-items-center gap-2 px-4 fw-500"
                onClick={generateAnswers}
                disabled={isLoading || !input.trim()}
                style={{
                  background: isLoading || !input.trim() ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  color: 'white',
                }}
              >
                <Send size={18} />
                <span className="d-none d-sm-inline">Send</span>
              </button>
            </div>
            <div className="text-muted small mt-2 text-center" style={{ fontSize: '0.8rem' }}>
              AI Assistant Bot by Saquib. AI may produce inaccurate information.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;