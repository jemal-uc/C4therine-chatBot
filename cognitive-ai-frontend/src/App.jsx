import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loadingDone, setLoadingDone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingDone(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) return;

    const handleScroll = () => {
      const isNearBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 100;
      setShowScrollBtn(!isNearBottom);
    };

    chatBox.addEventListener('scroll', handleScroll);
    return () => chatBox.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    const userQuestionHistory = messages
      .filter((message) => message.role === 'user')
      .map((message) => message.content)
      .slice(-20);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiURL = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const response = await axios.post(`${apiURL}/api/chat`, {
        prompt: userMessage.content,
        history: userQuestionHistory
      });

      const aiData = response.data.data || response.data;
      const messageContent = aiData.respons_pengguna || aiData.response || aiData.message || "Gue capek, datanya ga nyampe!";

      const aiMessage = {
        role: "ai",
        content: messageContent,
        metadata: aiData.metadata || {}
      };

      setMessages((prev) => [...prev, aiMessage]);
      if (aiData.metadata?.mood_level) {
        setMoodHistory((prev) => [...prev, aiData.metadata.mood_level]);
      }
    } catch (error) {
      console.error("Detail Error:", error);
      const errorMessage = error.response?.data?.message
        || "Server lagi pusing, coba cek koneksi internet atau link backend-mu.";

      setMessages((prev) => [...prev, {
        role: "ai",
        content: errorMessage,
        metadata: { mood_level: "Meledak" }
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const currentMood = moodHistory.length > 0 ? moodHistory[moodHistory.length - 1] : "Ketus";
  const userHistory = messages.filter((message) => message.role === 'user');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSuggestionClick = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const getMoodIcon = (mood) => {
    if (mood === 'Meledak') return '!';
    if (mood === 'Sarkas') return '~';
    if (mood === 'Baik') return ':)';
    return '>';
  };

  return (
    <div className="app-root">
      <div className={`durian-loader ${loadingDone ? 'durian-hidden' : ''}`}>
        <div className="durian-container">
          <div className="durian-aura"></div>
          <div className="durian-spike s1"></div>
          <div className="durian-spike s2"></div>
          <div className="durian-spike s3"></div>
          <div className="durian-spike s4"></div>
          <div className="durian-spike s5"></div>
          <div className="durian-spike s6"></div>
          <div className="durian-spike s7"></div>
          <div className="durian-spike s8"></div>
          <div className="durian-spike s9"></div>
          <div className="durian-spike s10"></div>
          <div className="durian-spike s11"></div>
          <div className="durian-spike s12"></div>
          <div className="durian-body"></div>
          <div className="durian-particle p1"></div>
          <div className="durian-particle p2"></div>
          <div className="durian-particle p3"></div>
          <div className="durian-particle p4"></div>
          <div className="durian-particle p5"></div>
          <div className="durian-particle p6"></div>
        </div>
        <div className="durian-loading-text">
          <h2>PMS</h2>
          <p>Personal Mood System sedang bangkit...</p>
        </div>
        <div className="durian-progress">
          <div className="durian-progress-bar"></div>
        </div>
      </div>

      <div className={`app-layout ${loadingDone ? 'app-visible' : ''}`}>
        <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
          <div className="sidebar-header">
            <div className="logo-small">PMS</div>
            {sidebarOpen && <h2>Memory Bank</h2>}
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              type="button"
            >
              {sidebarOpen ? '<' : '>'}
            </button>
          </div>
          <div className="history-list">
            {userHistory.length === 0 ? (
              <div className="no-history">
                {sidebarOpen ? 'Belum ada obrolan. Awas aja nanya yang aneh-aneh.' : '...'}
              </div>
            ) : (
              userHistory.map((msg, i) => (
                <div key={`${msg.content}-${i}`} className="history-item" title={msg.content}>
                  <span className="history-icon">chat</span>
                  {sidebarOpen && <p>{msg.content}</p>}
                </div>
              ))
            )}
          </div>
        </aside>

        <main className="chat-container">
          <header className="chat-header">
            <div className="header-text">
              <h1>C4Therine (PMS Mode)</h1>
              <p>Hati-hati dalam bertanya.</p>
            </div>
            <div className="header-right">
              <span className={`mood-badge ${currentMood === 'Meledak' ? 'meledak' : ''}`}>
                {getMoodIcon(currentMood)}
                {currentMood}
              </span>
            </div>
          </header>

          <div className="chat-box" ref={chatBoxRef}>
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">!</div>
                <h2>Mau nanya apa?</h2>
                <p>Langsung *to the point* aja, gue lagi males basa-basi.</p>
                <div className="empty-suggestions">
                  <button onClick={() => handleSuggestionClick("Halo, apa kabar?")} className="suggestion-chip" type="button">
                    Halo
                  </button>
                  <button onClick={() => handleSuggestionClick("Jelaskan tentang AI")} className="suggestion-chip" type="button">
                    Tentang AI
                  </button>
                  <button onClick={() => handleSuggestionClick("Apa itu PMS?")} className="suggestion-chip" type="button">
                    Apa itu PMS
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={`${msg.role}-${index}`} className={`message-wrapper ${msg.role}`}>
                  {msg.role === 'ai' && <div className="ai-avatar">!</div>}

                  <div className={`message-bubble ${msg.metadata?.mood_level === 'Meledak' ? 'exploded' : ''}`}>
                    {msg.role === 'ai' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {msg.metadata && (
                    <div className="meta-info">
                      <span className={`meta-tag mood-${msg.metadata.mood_level?.toLowerCase()}`}>
                        {getMoodIcon(msg.metadata.mood_level)}
                        {msg.metadata.mood_level}
                      </span>
                      <span className="meta-tag">{msg.metadata.klasifikasi_pertanyaan}</span>
                      <span className="meta-tag sarcasm-bar">
                        Fire
                        <span className="sarcasm-track">
                          <span className="sarcasm-fill" style={{ width: `${msg.metadata.sarcasm_score || 0}%` }}></span>
                        </span>
                        <span>{msg.metadata.sarcasm_score || 0}%</span>
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="message-wrapper ai">
                <div className="ai-avatar">!</div>
                <div className="loading-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  Gue lagi mikir... sabar napa!
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <button
            className={`scroll-bottom-btn ${showScrollBtn ? 'scroll-visible' : ''}`}
            onClick={scrollToBottom}
            type="button"
          >
            v
          </button>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaanmu di sini..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="send-btn"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}

export default App;
