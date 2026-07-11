import { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:8000";

// ─── tiny icon helpers ────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);
const PlaneIcon = () => <Icon d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" size={18} />;
const SendIcon = () => <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={18} />;
const MapIcon = () => <Icon d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z" size={18} />;
const CalendarIcon = () => <Icon d="M8 2v4M16 2v4M3 10h18M21 8H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1z" size={18} />;
const UsersIcon = () => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" size={18} />;
const StarIcon = () => <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" size={16} />;
const ChevronIcon = ({ open }) => (
  <Icon d={open ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} size={16} />
);

// ─── typewriter effect hook ───────────────────────────────────────────────────
function useTypewriter(text, speed = 8, active = false) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!active) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, active]);
  return displayed;
}

// ─── Itinerary Day Card ───────────────────────────────────────────────────────
function DayCard({ day }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="day-card">
      <button className="day-header" onClick={() => setOpen(o => !o)}>
        <span className="day-badge">Day {day.day_number}</span>
        <span className="day-title">{day.title}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="day-body">
          {day.activities?.map((act, i) => (
            <div className="activity" key={i}>
              <div className="activity-time">{act.time}</div>
              <div className="activity-dot" />
              <div className="activity-info">
                <div className="activity-name">{act.name}</div>
                {act.description && <div className="activity-desc">{act.description}</div>}
                {act.cost && <div className="activity-cost">~${act.cost}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────
function Message({ msg, isLatest }) {
  const [tab, setTab] = useState("itinerary");
  const text = useTypewriter(
    msg.role === "assistant" ? (msg.summary || "") : "",
    6,
    isLatest && msg.role === "assistant"
  );

  if (msg.role === "user") {
    return (
      <div className="msg user-msg">
        <div className="bubble user-bubble">{msg.content}</div>
      </div>
    );
  }

  if (msg.loading) {
    return (
      <div className="msg ai-msg">
        <div className="ai-avatar"><PlaneIcon /></div>
        <div className="bubble ai-bubble loading-bubble">
          <span className="dot" /><span className="dot" /><span className="dot" />
        </div>
      </div>
    );
  }

  const data = msg.data;
  return (
    <div className="msg ai-msg">
      <div className="ai-avatar"><PlaneIcon /></div>
      <div className="ai-content">
        {msg.summary && (
          <div className="bubble ai-bubble summary-bubble">
            {isLatest ? text : msg.summary}
          </div>
        )}
        {data?.itinerary && (
          <div className="itinerary-card">
            <div className="itin-header">
              <div className="itin-meta">
                {data.destination && <span className="itin-dest">📍 {data.destination}</span>}
                {data.duration_days && <span className="itin-days"><CalendarIcon /> {data.duration_days} days</span>}
                {data.travelers && <span className="itin-travelers"><UsersIcon /> {data.travelers}</span>}
                {data.budget_estimate && <span className="itin-budget">💰 {data.budget_estimate}</span>}
              </div>
              <div className="itin-tabs">
                {["itinerary", "tips", "hotels"].map(t => (
                  <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`}
                    onClick={() => setTab(t)}>{t}</button>
                ))}
              </div>
            </div>

            {tab === "itinerary" && data.itinerary.map((day, i) => (
              <DayCard key={i} day={day} />
            ))}

            {tab === "tips" && (
              <ul className="tips-list">
                {(data.tips || ["No tips available."]).map((tip, i) => (
                  <li key={i}><StarIcon /> {tip}</li>
                ))}
              </ul>
            )}

            {tab === "hotels" && (
              <div className="hotels-grid">
                {(data.hotels || []).map((h, i) => (
                  <div key={i} className="hotel-card">
                    <div className="hotel-name">{h.name}</div>
                    <div className="hotel-stars">{"★".repeat(h.stars || 3)}</div>
                    <div className="hotel-price">{h.price_per_night}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ trips, onSelect, active, onNew }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <MapIcon />
        <span>VoyageAI</span>
      </div>
      <button className="new-btn" onClick={onNew}>+ New Trip</button>
      <div className="sidebar-label">Recent Trips</div>
      <div className="trip-list">
        {trips.map((t, i) => (
          <button key={i} className={`trip-item ${active === i ? "active" : ""}`}
            onClick={() => onSelect(i)}>
            <span className="trip-dest">{t.destination || "Untitled Trip"}</span>
            <span className="trip-date">{t.date}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

// ─── Quick Prompts ────────────────────────────────────────────────────────────
const QUICK = [
  "5-day solo trip to Tokyo under $2000",
  "Romantic weekend in Paris with museums & dining",
  "Family vacation in Bali for 7 days, budget-friendly",
  "Backpacking Southeast Asia for 2 weeks",
];

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [trips, setTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text) {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    setMessages(m => [...m, userMsg, { role: "assistant", loading: true }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/itinerary/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text, session_id: `session_${Date.now()}` }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();

      const destination = data.destination || extractDest(text);
      const aiMsg = {
        role: "assistant",
        summary: data.summary || `Here's your personalized travel plan for ${destination}!`,
        data: data,
      };

      setMessages(m => [...m.slice(0, -1), aiMsg]);
      setTrips(prev => {
        const updated = [...prev];
        updated[activeTrip] = { destination, date: new Date().toLocaleDateString() };
        return updated;
      });
    } catch {
      // Fallback to mock data when backend not connected
      const destination = extractDest(text);
      const mock = buildMock(destination, text);
      setMessages(m => [...m.slice(0, -1), { role: "assistant", ...mock }]);
      setTrips(prev => {
        const t = [...prev];
        if (!t[activeTrip]) t[activeTrip] = {};
        t[activeTrip] = { destination, date: new Date().toLocaleDateString() };
        return t;
      });
    } finally {
      setLoading(false);
    }
  }

  function newTrip() {
    setTrips(t => [...t, {}]);
    setActiveTrip(trips.length);
    setMessages([]);
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <Sidebar trips={trips} onSelect={setActiveTrip} active={activeTrip} onNew={newTrip} />
        <main className="main">
          <div className="chat-area">
            {messages.length === 0 && (
              <div className="empty-state">
                <div className="globe-ring">
                  <div className="globe-inner"><MapIcon /></div>
                </div>
                <h1>Where to next?</h1>
                <p>Describe your dream trip and I'll build a full itinerary, hotel picks, and local tips.</p>
                <div className="quick-prompts">
                  {QUICK.map((q, i) => (
                    <button key={i} className="quick-btn" onClick={() => sendMessage(q)}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} isLatest={i === messages.length - 1} />
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="input-bar">
            <textarea
              className="input-field"
              placeholder="Describe your dream trip..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }}}
              rows={1}
            />
            <button className="send-btn" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}>
              <SendIcon />
            </button>
          </div>
        </main>
      </div>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function extractDest(text) {
  const m = text.match(/to\s+([A-Z][a-zA-Z\s]+?)(?:\s+for|\s+under|\s+with|$)/);
  return m ? m[1].trim() : "Your Destination";
}

function buildMock(dest, query) {
  const days = query.match(/(\d+)[\s-]day/) ? parseInt(query.match(/(\d+)[\s-]day/)[1]) : 5;
  return {
    summary: `I've crafted a ${days}-day adventure to ${dest} tailored just for you. Here's your complete itinerary with activities, tips, and hotel recommendations.`,
    data: {
      destination: dest,
      duration_days: days,
      travelers: query.includes("solo") ? "Solo" : query.includes("family") ? "Family" : "2 travelers",
      budget_estimate: query.includes("budget") ? "$800–$1,200" : "$1,500–$2,500",
      itinerary: Array.from({ length: Math.min(days, 4) }, (_, i) => ({
        day_number: i + 1,
        title: ["Arrival & Exploration", "Cultural Immersion", "Hidden Gems", "Local Life & Farewell"][i],
        activities: [
          { time: "09:00", name: `${dest} Old Town Walk`, description: "Explore the historic center on foot.", cost: 0 },
          { time: "12:30", name: "Local Market Lunch", description: "Try authentic street food.", cost: 15 },
          { time: "15:00", name: "Main Landmark Visit", description: `${dest}'s most iconic sight.`, cost: 20 },
          { time: "19:00", name: "Rooftop Dinner", description: "Sunset dinner with panoramic views.", cost: 45 },
        ]
      })),
      tips: [
        `Book ${dest} accommodations at least 3 weeks in advance for the best rates.`,
        "Always carry local currency for markets and street vendors.",
        "Download offline maps before arrival — saves data and stress.",
        "Visit major attractions early morning to avoid crowds.",
        "Learn 5–10 phrases in the local language — locals love the effort.",
      ],
      hotels: [
        { name: `${dest} Grand Heritage`, stars: 5, price_per_night: "$180/night" },
        { name: "City Center Boutique", stars: 4, price_per_night: "$95/night" },
        { name: "Backpacker's Haven", stars: 3, price_per_night: "$35/night" },
      ]
    }
  };
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0d1117;
    --ink-2: #1c2333;
    --ink-3: #2d3748;
    --paper: #f5f0e8;
    --paper-2: #ede8dc;
    --paper-3: #e3dccf;
    --gold: #c9a84c;
    --gold-light: #e8c97a;
    --teal: #2a7c7c;
    --teal-light: #3a9e9e;
    --coral: #c45c3a;
    --text: #2c2118;
    --text-2: #5a4a3a;
    --text-3: #8a7a6a;
    --sidebar-w: 260px;
    --radius: 14px;
    --font-display: 'Fraunces', Georgia, serif;
    --font-body: 'DM Sans', sans-serif;
  }

  html, body, #root { height: 100%; }

  body {
    font-family: var(--font-body);
    background: var(--paper);
    color: var(--text);
    font-size: 15px;
    line-height: 1.6;
  }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* ── Sidebar ── */
  .sidebar {
    width: var(--sidebar-w);
    background: var(--ink);
    color: var(--paper);
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
    flex-shrink: 0;
    gap: 4px;
  }
  .sidebar-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--font-display);
    font-size: 20px; font-weight: 700;
    color: var(--gold);
    padding: 0 4px 20px;
    border-bottom: 1px solid #2d3748;
  }
  .new-btn {
    margin: 16px 0 8px;
    background: var(--gold);
    color: var(--ink);
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-family: var(--font-body);
    font-size: 13px; font-weight: 500;
    cursor: pointer;
    transition: background .2s;
  }
  .new-btn:hover { background: var(--gold-light); }
  .sidebar-label {
    font-size: 10px; letter-spacing: .12em; text-transform: uppercase;
    color: #4a5568; padding: 12px 4px 6px;
  }
  .trip-list { overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .trip-item {
    background: none; border: none; text-align: left; cursor: pointer;
    padding: 10px 12px; border-radius: 8px;
    display: flex; flex-direction: column; gap: 2px;
    color: #a0aec0; transition: all .15s;
  }
  .trip-item:hover { background: #1a2332; color: var(--paper); }
  .trip-item.active { background: #1a2332; color: var(--gold); }
  .trip-dest { font-size: 13px; font-weight: 500; }
  .trip-date { font-size: 11px; opacity: .6; }

  /* ── Main ── */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .chat-area {
    flex: 1; overflow-y: auto;
    padding: 40px 32px 24px;
    display: flex; flex-direction: column; gap: 24px;
  }

  /* ── Empty State ── */
  .empty-state {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 40px 20px; gap: 16px;
  }
  .globe-ring {
    width: 96px; height: 96px; border-radius: 50%;
    border: 2px solid var(--paper-3);
    display: flex; align-items: center; justify-content: center;
    animation: spin 20s linear infinite;
  }
  .globe-inner {
    width: 72px; height: 72px; border-radius: 50%;
    background: var(--ink);
    display: flex; align-items: center; justify-content: center;
    color: var(--gold);
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .empty-state h1 {
    font-family: var(--font-display);
    font-size: 42px; font-weight: 700;
    color: var(--text); letter-spacing: -.02em;
    margin-top: 8px;
  }
  .empty-state p { color: var(--text-2); max-width: 400px; font-size: 15px; }
  .quick-prompts {
    display: flex; flex-wrap: wrap; gap: 10px;
    justify-content: center; margin-top: 8px; max-width: 560px;
  }
  .quick-btn {
    background: var(--paper-2); border: 1px solid var(--paper-3);
    border-radius: 24px; padding: 8px 18px;
    font-family: var(--font-body); font-size: 13px;
    color: var(--text-2); cursor: pointer;
    transition: all .15s;
  }
  .quick-btn:hover {
    background: var(--ink); color: var(--gold);
    border-color: var(--ink);
  }

  /* ── Messages ── */
  .msg { display: flex; gap: 12px; max-width: 860px; }
  .user-msg { justify-content: flex-end; align-self: flex-end; }
  .ai-msg { align-self: flex-start; width: 100%; }
  .bubble {
    padding: 12px 18px;
    border-radius: var(--radius);
    line-height: 1.65;
  }
  .user-bubble {
    background: var(--ink); color: var(--paper);
    border-bottom-right-radius: 4px;
    max-width: 520px; font-size: 14px;
  }
  .ai-bubble {
    background: white;
    border: 1px solid var(--paper-3);
    border-bottom-left-radius: 4px;
    color: var(--text); font-size: 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,.06);
  }
  .summary-bubble { margin-bottom: 12px; }

  .ai-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: var(--ink); color: var(--gold);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 4px;
  }
  .ai-content { flex: 1; display: flex; flex-direction: column; }

  /* loading dots */
  .loading-bubble { display: flex; gap: 6px; align-items: center; padding: 16px 20px; }
  .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--text-3);
    animation: bounce .9s ease-in-out infinite;
  }
  .dot:nth-child(2) { animation-delay: .2s; }
  .dot:nth-child(3) { animation-delay: .4s; }
  @keyframes bounce { 0%,80%,100%{transform:scale(.8);opacity:.5} 40%{transform:scale(1.2);opacity:1} }

  /* ── Itinerary Card ── */
  .itinerary-card {
    background: white;
    border: 1px solid var(--paper-3);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,.07);
  }
  .itin-header {
    background: var(--ink);
    padding: 20px 24px 0;
  }
  .itin-meta {
    display: flex; gap: 20px; flex-wrap: wrap;
    color: #a0aec0; font-size: 13px; padding-bottom: 16px;
  }
  .itin-dest { color: var(--gold); font-size: 16px; font-weight: 600; font-family: var(--font-display); }
  .itin-days, .itin-travelers, .itin-budget {
    display: flex; align-items: center; gap: 6px;
  }
  .itin-tabs { display: flex; gap: 0; border-bottom: none; }
  .tab-btn {
    background: none; border: none; cursor: pointer;
    padding: 10px 20px; font-size: 13px;
    color: #4a5568; border-radius: 8px 8px 0 0;
    font-family: var(--font-body); text-transform: capitalize;
    transition: all .15s;
    border-bottom: 2px solid transparent;
  }
  .tab-btn:hover { color: var(--paper); }
  .tab-btn.active { color: var(--gold); border-bottom-color: var(--gold); }

  /* ── Day Cards ── */
  .day-card { border-bottom: 1px solid var(--paper-3); }
  .day-card:last-child { border-bottom: none; }
  .day-header {
    width: 100%; background: none; border: none; cursor: pointer;
    display: flex; align-items: center; gap: 12px;
    padding: 16px 24px; text-align: left;
    transition: background .12s; color: var(--text);
  }
  .day-header:hover { background: var(--paper); }
  .day-header svg { margin-left: auto; color: var(--text-3); }
  .day-badge {
    background: var(--ink); color: var(--gold);
    font-size: 11px; font-weight: 600; letter-spacing: .08em;
    padding: 3px 10px; border-radius: 20px; text-transform: uppercase;
    flex-shrink: 0;
  }
  .day-title {
    font-family: var(--font-display); font-size: 16px;
    font-weight: 500; color: var(--text);
  }
  .day-body { padding: 0 24px 16px 24px; }

  /* ── Activities ── */
  .activity {
    display: flex; gap: 16px; align-items: flex-start;
    padding: 10px 0; border-bottom: 1px dashed var(--paper-3);
    position: relative;
  }
  .activity:last-child { border-bottom: none; }
  .activity-time {
    font-size: 12px; color: var(--text-3); font-weight: 500;
    min-width: 50px; padding-top: 2px;
  }
  .activity-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--gold); flex-shrink: 0; margin-top: 6px;
  }
  .activity-info { flex: 1; }
  .activity-name { font-size: 14px; font-weight: 500; color: var(--text); }
  .activity-desc { font-size: 13px; color: var(--text-2); margin-top: 2px; }
  .activity-cost {
    display: inline-block; margin-top: 4px;
    font-size: 12px; color: var(--teal);
    background: #f0faf9; border-radius: 4px; padding: 1px 8px;
  }

  /* ── Tips ── */
  .tips-list { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; list-style: none; }
  .tips-list li {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 14px; color: var(--text-2);
  }
  .tips-list li svg { color: var(--gold); flex-shrink: 0; margin-top: 2px; }

  /* ── Hotels ── */
  .hotels-grid { display: flex; gap: 12px; flex-wrap: wrap; padding: 20px 24px; }
  .hotel-card {
    flex: 1; min-width: 140px;
    border: 1px solid var(--paper-3);
    border-radius: 10px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .hotel-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .hotel-stars { color: var(--gold); font-size: 13px; letter-spacing: 1px; }
  .hotel-price { font-size: 13px; color: var(--teal); font-weight: 500; }

  /* ── Input Bar ── */
  .input-bar {
    display: flex; align-items: flex-end; gap: 12px;
    padding: 16px 32px 24px;
    background: var(--paper);
    border-top: 1px solid var(--paper-3);
  }
  .input-field {
    flex: 1; resize: none; border: 1.5px solid var(--paper-3);
    border-radius: 12px; padding: 14px 18px;
    font-family: var(--font-body); font-size: 15px; color: var(--text);
    background: white; outline: none;
    max-height: 140px; min-height: 52px;
    transition: border-color .15s;
    line-height: 1.5;
  }
  .input-field:focus { border-color: var(--gold); }
  .input-field::placeholder { color: var(--text-3); }
  .send-btn {
    width: 52px; height: 52px; border-radius: 12px;
    background: var(--ink); border: none;
    color: var(--gold); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all .15s;
  }
  .send-btn:hover:not(:disabled) { background: var(--teal); color: white; }
  .send-btn:disabled { opacity: .4; cursor: not-allowed; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--paper-3); border-radius: 8px; }
`;
