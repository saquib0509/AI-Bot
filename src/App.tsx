import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Send, Bot, Sparkles, Zap } from 'lucide-react';

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
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        method: 'post',
        data: {
          system_instruction: {
            parts: [{ text: 'You are a helpful, concise assistant developed by Saquib using Google\'s LLM model. Keep responses brief and to the point (2-3 sentences maximum). Avoid markdown formatting and bullet points. If asked who developed you, explicitly state that you were developed by Saquib.' }],
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
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={28} />
          </div>
          <h1 className="brand-title">AI Assistant</h1>
        </div>
        <div className="status-badge">
          <div className={`status-dot ${isLoading ? 'thinking' : ''}`} />
          <span>{isLoading ? 'Thinking...' : 'Online'}</span>
        </div>
      </header>

      {/* Chat Card */}
      <div className="chat-card">
        {/* Messages Area */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Bot size={64} strokeWidth={1.5} />
              </div>
              <h2>How can I help you today?</h2>
              <p>Ask me anything, and I'll do my best to assist you.</p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message-wrapper ${message.sender}`}
                >
                  <div className={`message-bubble ${message.sender}`}>
                    <div className="message-text">{message.text}</div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message-wrapper bot">
                  <div className="message-bubble bot">
                    <div className="flex items-center gap-2">
                      <Zap className="animate-spin text-yellow-400" size={16} />
                      <span className="text-sm opacity-70">Generating response...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="input-area">
          <div className="input-group">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && generateAnswers()}
              disabled={isLoading}
            />
            <button
              className="send-btn"
              onClick={generateAnswers}
              disabled={isLoading || !input.trim()}
            >
              <Send size={20} />
            </button>
          </div>
          <div className="footer-text">
            Saquib's AI Assistant Bot. AI may produce inaccurate information.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;