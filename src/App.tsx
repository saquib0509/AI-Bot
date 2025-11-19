import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Send, Bot, Sparkles, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
            parts: [{ text: 'You are a helpful assistant developed by Saquib using Google\'s LLM model. Use Markdown formatting for tables, lists, and code blocks when appropriate. If asked to tabulate data, use a Markdown table. If asked for a list, use bullet points or numbered lists. Keep responses concise but formatted.' }],
          },
          contents: [
            {
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
          },
        },
      });

      let botResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response.';

      // Minimal cleanup, preserving markdown
      botResponse = botResponse.trim();

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
                    <div className="message-text">
                      {message.sender === 'bot' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.text}
                        </ReactMarkdown>
                      ) : (
                        message.text
                      )}
                    </div>
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