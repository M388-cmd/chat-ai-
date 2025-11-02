import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Chat } from '@google/genai';

type Message = {
  role: 'user' | 'gemini';
  content: string;
};

const UserIcon = () => <div className="message-icon profile-avatar">M</div>;

const GeminiIcon = () => (
    <div className="message-icon" style={{background: 'linear-gradient(135deg, #4285f4, #9b72cb)'}}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 4.75C12.4142 4.75 12.75 5.08579 12.75 5.5V6.65759C14.4848 7.02871 15.9713 7.9545 16.9292 9.25302C17.1812 9.58013 17.0232 10.0531 16.6372 10.121C16.2512 10.189 15.8622 9.92316 15.6882 9.57621C14.9432 8.57242 13.6272 7.84241 12 7.84241C10.3728 7.84241 9.05679 8.57242 8.31182 9.57621C8.13783 9.92316 7.74884 10.189 7.36285 10.121C6.97685 10.0531 6.81886 9.58013 7.07085 9.25302C8.02873 7.9545 9.51518 7.02871 11.25 6.65759V5.5C11.25 5.08579 11.5858 4.75 12 4.75ZM6.65759 11.25C7.02871 9.51522 7.9545 8.02875 9.25302 7.07086C9.58013 6.81887 10.0531 6.97686 10.121 7.36285C10.189 7.74884 9.92316 8.13783 9.57621 8.31182C8.57242 9.05679 7.84241 10.3728 7.84241 12C7.84241 13.6272 8.57242 14.9432 9.57621 15.6882C9.92316 15.8622 10.189 16.2512 10.121 16.6372C10.0531 17.0232 9.58013 17.1812 9.25302 16.9292C7.9545 15.9713 7.02871 14.4848 6.65759 12.75H5.5C5.08579 12.75 4.75 12.4142 4.75 12C4.75 11.5858 5.08579 11.25 5.5 11.25H6.65759ZM17.3424 12.75C16.9713 14.4848 16.0455 15.9713 14.747 16.9292C14.4199 17.1812 13.9469 17.0232 13.879 16.6372C13.811 16.2512 14.0768 15.8622 14.4238 15.6882C15.4276 14.9432 16.1576 13.6272 16.1576 12C16.1576 10.3728 15.4276 9.05679 14.4238 8.31182C14.0768 8.13783 13.811 7.74884 13.879 7.36285C13.9469 6.97686 14.4199 6.81887 14.747 7.07086C16.0455 8.02875 16.9713 9.51522 17.3424 11.25H18.5C18.9142 11.25 19.25 11.5858 19.25 12C19.25 12.4142 18.9142 12.75 18.5 12.75H17.3424ZM12.75 17.3424C14.4848 16.9713 15.9713 16.0455 16.9292 14.747C17.1812 14.4199 17.0232 13.9469 16.6372 13.879C16.2512 13.811 15.8622 14.0768 15.6882 14.4238C14.9432 15.4276 13.6272 16.1576 12 16.1576C10.3728 16.1576 9.05679 15.4276 8.31182 14.4238C8.13783 14.0768 7.74884 13.811 7.36285 13.879C6.97685 13.9469 6.81886 14.4199 7.07085 14.747C8.02873 16.0455 9.51518 16.9713 11.25 17.3424V18.5C11.25 18.9142 11.5858 19.25 12 19.25C12.4142 19.25 12.75 18.9142 12.75 18.5V17.3424Z" fill="white"></path>
      </svg>
    </div>
);

const App = () => {
  const [history, setHistory] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatRef = useRef<Chat | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [history, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setHistory(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
        });
      }
      
      const response = await chatRef.current.sendMessage({ message: currentMessage });
      const geminiMessage: Message = { role: 'gemini', content: response.text };
      setHistory(prev => [...prev, geminiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = { role: 'gemini', content: 'Sorry, something went wrong. Please try again.' };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChipClick = (text: string) => {
    setInputValue(text);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <svg className="sidebar-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
        <svg className="sidebar-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M9 3v15h11V3H9zm-2-2C5.34 1 4 2.34 4 4v16c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3H7zM3 18h1v-2H3v2zm0-5h1v-2H3v2zm0-5h1V6H3v2z"></path></svg>
      </aside>
      <div className="main-panel">
        <header className="app-header">
            <span className="header-title">Gėminis</span>
            <div className="header-actions">
                <button className="upgrade-btn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{color: 'currentColor'}}><path d="M12 2.5L14.68 8.02L21 9.27L16.82 13.73L18.18 20L12 16.5L5.82 20L7.18 13.73L3 9.27L9.32 8.02L12 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  Mejora
                </button>
                <div className="profile-avatar">M</div>
            </div>
        </header>

        <main className="content-area">
          {history.length === 0 ? (
            <div className="welcome-screen">
                <h1>Hola, Miguel</h1>
                <div className="suggestion-chips">
                    <div className="chip" onClick={() => handleChipClick('Crear una imagen de un astronauta')}>Crear imagen</div>
                    <div className="chip" onClick={() => handleChipClick('Escribir un poema sobre la lluvia')}>Escribir</div>
                    <div className="chip" onClick={() => handleChipClick('Construir un plan de entrenamiento')}>Construir</div>
                    <div className="chip" onClick={() => handleChipClick('Investigación profunda sobre IA')}>Investigación profunda</div>
                </div>
            </div>
          ) : (
            <div className="chat-history" ref={chatHistoryRef}>
                {history.map((msg, index) => (
                    <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'gemini-message'}`} role="log">
                        {msg.role === 'gemini' ? <GeminiIcon /> : <UserIcon />}
                        <div className="message-content">
                            <p>{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="message gemini-message loading-indicator" role="status">
                        <GeminiIcon />
                        <p>Gemini is thinking...</p>
                    </div>
                )}
            </div>
          )}
          
          <div className="chat-input-form-container">
              <form className="chat-input-form" onSubmit={handleSubmit}>
                  <input
                      type="text"
                      className="chat-input"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask Gemini"
                      aria-label="Chat input"
                      disabled={isLoading}
                  />
                  <button type="submit" className="send-button" disabled={isLoading || !inputValue.trim()}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M15 6L21 12L15 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                  </button>
              </form>
          </div>
        </main>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
