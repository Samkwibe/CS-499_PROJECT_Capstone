/* MunchiesAI Floating Chatbot Widget */
(function () {
  'use strict';

  const STORAGE_KEY = 'munchies-chat-history';
  let messages = [];
  let isOpen = false;
  let isTyping = false;

  // ── Inject styles ──────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .mchat-btn {
      position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9000;
      width: 3.5rem; height: 3.5rem; border-radius: 50%;
      background: linear-gradient(135deg, #082241 0%, #0f3f70 100%);
      color: #f3d014; border: 0; cursor: pointer;
      box-shadow: 0 6px 28px rgba(8,34,65,0.42);
      font-size: 1.3rem; display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .mchat-btn:hover { transform: scale(1.1); box-shadow: 0 10px 36px rgba(8,34,65,0.52); }
    .mchat-btn .mchat-notif {
      position: absolute; top: -3px; right: -3px;
      width: 0.75rem; height: 0.75rem; border-radius: 50%;
      background: #f3d014; border: 2px solid #fff; display: none;
    }
    .mchat-btn.has-notif .mchat-notif { display: block; }

    .mchat-panel {
      position: fixed; bottom: 5.8rem; right: 1.5rem; z-index: 8999;
      width: 380px; max-height: 560px; border-radius: 22px;
      background: #fff; box-shadow: 0 28px 72px rgba(8,34,65,0.22);
      display: flex; flex-direction: column; overflow: hidden;
      transform: scale(0.88) translateY(28px); opacity: 0;
      pointer-events: none;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.22s ease;
    }
    .mchat-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
    body.dashboard-dark .mchat-panel { background: #1a2332; border: 1px solid #2a3a52; }

    /* Header */
    .mchat-header {
      display: flex; align-items: center; gap: 0.65rem;
      padding: 0.9rem 1rem;
      background: linear-gradient(135deg, #082241 0%, #0f3f70 100%);
      color: #fff; flex-shrink: 0;
    }
    .mchat-header-icon {
      width: 2.2rem; height: 2.2rem; border-radius: 50%;
      background: rgba(243,208,20,0.2); display: flex; align-items: center;
      justify-content: center; color: #f3d014; font-size: 1rem; flex-shrink: 0;
    }
    .mchat-header-title { flex: 1; }
    .mchat-header-title strong { display: block; font-size: 0.9rem; font-weight: 800; }
    .mchat-header-title span { font-size: 0.72rem; opacity: 0.72; }
    .mchat-live-dot {
      width: 0.48rem; height: 0.48rem; border-radius: 50%; background: #4ade80;
      box-shadow: 0 0 0 3px rgba(74,222,128,0.25); flex-shrink: 0;
      animation: mchat-pulse 2s infinite;
    }
    @keyframes mchat-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    .mchat-header-actions { display: flex; gap: 0.15rem; align-items: center; }
    .mchat-hbtn {
      background: none; border: none; color: rgba(255,255,255,0.6);
      cursor: pointer; font-size: 0.8rem; padding: 0.3rem 0.4rem; border-radius: 6px;
      transition: color 0.15s, background 0.15s; line-height: 1;
    }
    .mchat-hbtn:hover { color: #f3d014; background: rgba(255,255,255,0.1); }
    .mchat-hbtn.close { font-size: 1.05rem; }

    /* Messages */
    .mchat-messages {
      flex: 1; overflow-y: auto; padding: 1rem 0.9rem; display: flex;
      flex-direction: column; gap: 0.7rem; scroll-behavior: smooth;
    }
    .mchat-messages::-webkit-scrollbar { width: 4px; }
    .mchat-messages::-webkit-scrollbar-track { background: transparent; }
    .mchat-messages::-webkit-scrollbar-thumb { background: rgba(8,34,65,0.13); border-radius: 4px; }
    body.dashboard-dark .mchat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

    .mchat-msg { display: flex; gap: 0.5rem; align-items: flex-end; animation: mchat-in 0.22s ease; max-width: 100%; }
    @keyframes mchat-in { from { opacity: 0; transform: translateY(8px); } }
    .mchat-msg.user { flex-direction: row-reverse; }
    .mchat-avatar {
      width: 1.7rem; height: 1.7rem; border-radius: 50%; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 0.68rem;
    }
    .mchat-msg.ai .mchat-avatar { background: linear-gradient(135deg,#082241,#0f3f70); color: #f3d014; }
    .mchat-msg.user .mchat-avatar { background: #f3d014; color: #082241; font-weight: 800; }

    .mchat-bubble-wrap { display: flex; flex-direction: column; max-width: 82%; }
    .mchat-msg.user .mchat-bubble-wrap { align-items: flex-end; }

    .mchat-bubble {
      padding: 0.6rem 0.88rem; border-radius: 18px;
      font-size: 0.83rem; line-height: 1.6; font-weight: 500;
    }
    .mchat-msg.ai .mchat-bubble {
      background: #f1f5fb; color: #172033; border-bottom-left-radius: 4px;
    }
    .mchat-msg.user .mchat-bubble {
      background: #082241; color: #fff; border-bottom-right-radius: 4px;
    }
    body.dashboard-dark .mchat-msg.ai .mchat-bubble { background: #243044; color: #eef4ff; }

    /* Markdown inside bubble */
    .mchat-bubble strong { font-weight: 800; }
    .mchat-bubble em { font-style: italic; }
    .mchat-bubble ul { margin: 0.35rem 0 0.1rem 1rem; padding: 0; }
    .mchat-bubble li { margin-bottom: 0.2rem; }
    .mchat-bubble p { margin: 0 0 0.3rem; }
    .mchat-bubble p:last-child { margin-bottom: 0; }

    .mchat-ts {
      font-size: 0.65rem; color: #9aa8bf; margin-top: 0.2rem; padding: 0 0.15rem;
    }
    .mchat-msg.user .mchat-ts { text-align: right; }

    /* Copy button */
    .mchat-copy {
      display: none; background: none; border: 1px solid rgba(8,34,65,0.12);
      border-radius: 6px; padding: 0.15rem 0.4rem; font-size: 0.65rem;
      color: #657085; cursor: pointer; font-family: inherit; margin-top: 0.2rem;
      transition: all 0.15s; align-self: flex-start;
    }
    .mchat-bubble-wrap:hover .mchat-copy { display: block; }
    .mchat-copy:hover { background: #f1f5fb; color: #082241; }
    body.dashboard-dark .mchat-copy { border-color: rgba(255,255,255,0.12); color: #7a8ba0; }
    body.dashboard-dark .mchat-copy:hover { background: #243044; color: #eef4ff; }

    /* Typing indicator */
    .mchat-typing .mchat-bubble {
      display: flex; gap: 0.32rem; align-items: center; padding: 0.75rem 0.9rem;
      background: #f1f5fb;
    }
    body.dashboard-dark .mchat-typing .mchat-bubble { background: #243044; }
    .mchat-dot {
      width: 0.44rem; height: 0.44rem; border-radius: 50%; background: #82909f;
      animation: mchat-bounce 1.3s ease-in-out infinite;
    }
    .mchat-dot:nth-child(2) { animation-delay: 0.18s; }
    .mchat-dot:nth-child(3) { animation-delay: 0.36s; }
    @keyframes mchat-bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

    /* Empty / suggestions */
    .mchat-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; gap: 0.55rem; color: #8a98b2; text-align: center; padding: 1.2rem;
    }
    .mchat-empty-icon {
      width: 3.5rem; height: 3.5rem; border-radius: 50%;
      background: linear-gradient(135deg,#082241,#0f3f70);
      display: flex; align-items: center; justify-content: center;
      color: #f3d014; font-size: 1.4rem; margin-bottom: 0.3rem;
    }
    .mchat-empty strong { color: #2c3e55; font-size: 0.9rem; }
    body.dashboard-dark .mchat-empty strong { color: #eef4ff; }
    .mchat-empty p { font-size: 0.78rem; line-height: 1.55; margin: 0; }
    .mchat-suggestions { display: flex; flex-wrap: wrap; gap: 0.38rem; justify-content: center; margin-top: 0.6rem; }
    .mchat-sug-btn {
      border: 1.5px solid #d5dde9; background: #f7f9fc; color: #082241;
      border-radius: 999px; padding: 0.32rem 0.72rem; font-size: 0.74rem;
      font-weight: 700; cursor: pointer; font-family: inherit;
      transition: all 0.18s ease;
    }
    .mchat-sug-btn:hover { background: #082241; color: #f3d014; border-color: #082241; transform: translateY(-1px); }
    body.dashboard-dark .mchat-sug-btn { background: #1e2f44; border-color: #354358; color: #a8c7f0; }
    body.dashboard-dark .mchat-sug-btn:hover { background: #f3d014; color: #082241; border-color: #f3d014; }

    /* Error */
    .mchat-error-msg {
      font-size: 0.76rem; color: #b42318; background: #fee4e2; border: 1px solid #fca5a5;
      border-radius: 10px; padding: 0.5rem 0.75rem; text-align: center;
      animation: mchat-in 0.2s ease;
    }
    body.dashboard-dark .mchat-error-msg { background: rgba(180,35,24,0.16); border-color: rgba(252,165,165,0.3); color: #fca5a5; }

    /* Sign-in CTA (public pages) */
    .mchat-signin-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: linear-gradient(135deg,#082241,#0f3f70);
      color: #f3d014; border: 0; border-radius: 999px;
      padding: 0.65rem 1.3rem; font-size: 0.82rem; font-weight: 800;
      text-decoration: none; cursor: pointer; font-family: inherit;
      transition: opacity 0.15s, transform 0.15s; margin-top: 0.6rem;
    }
    .mchat-signin-btn:hover { opacity: 0.88; transform: translateY(-1px); }

    /* Footer */
    .mchat-footer {
      display: flex; gap: 0.5rem; padding: 0.75rem 0.85rem; flex-shrink: 0;
      border-top: 1px solid #e8edf4; background: #fff;
    }
    body.dashboard-dark .mchat-footer { border-color: #2a3a52; background: #1a2332; }
    .mchat-input {
      flex: 1; border: 1.5px solid #d5dde9; border-radius: 999px;
      padding: 0.55rem 0.9rem; font: inherit; font-size: 0.84rem;
      color: #172033; background: #f7f9fc; outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
    }
    .mchat-input:focus { border-color: #082241; box-shadow: 0 0 0 3px rgba(8,34,65,0.08); }
    body.dashboard-dark .mchat-input { background: #243044; color: #eef4ff; border-color: #354358; }
    body.dashboard-dark .mchat-input:focus { border-color: #6ba3e8; box-shadow: 0 0 0 3px rgba(107,163,232,0.12); }
    .mchat-send {
      width: 2.3rem; height: 2.3rem; border-radius: 50%; border: 0;
      background: linear-gradient(135deg,#082241,#0f3f70); color: #f3d014;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 0.84rem; transition: opacity 0.15s, transform 0.15s; flex-shrink: 0;
    }
    .mchat-send:hover:not(:disabled) { opacity: 0.88; transform: scale(1.06); }
    .mchat-send:disabled { opacity: 0.35; cursor: not-allowed; }

    @media (max-width: 440px) {
      .mchat-panel { width: calc(100vw - 2rem); right: 1rem; }
    }
  `;
  document.head.appendChild(style);

  // ── Build DOM ──────────────────────────────────────────────────────────────
  const btn = document.createElement('button');
  btn.className = 'mchat-btn';
  btn.title = 'MunchiesAI — Sustainability Assistant';
  btn.innerHTML = '<i class="fas fa-robot"></i><span class="mchat-notif"></span>';

  const panel = document.createElement('div');
  panel.className = 'mchat-panel';
  panel.innerHTML = `
    <div class="mchat-header">
      <div class="mchat-header-icon"><i class="fas fa-robot"></i></div>
      <div class="mchat-header-title">
        <strong>MunchiesAI</strong>
        <span>Powered by Claude · Live campus data</span>
      </div>
      <span class="mchat-live-dot" title="Connected to live data"></span>
      <div class="mchat-header-actions">
        <button class="mchat-hbtn" title="Clear conversation" id="mchatClearBtn"><i class="fas fa-trash-can"></i></button>
        <button class="mchat-hbtn close" title="Close" id="mchatCloseBtn"><i class="fas fa-xmark"></i></button>
      </div>
    </div>
    <div class="mchat-messages" id="mchatMessages"></div>
    <div class="mchat-footer">
      <input class="mchat-input" id="mchatInput" type="text"
        placeholder="Ask about waste data, composting, tips…"
        maxlength="600" autocomplete="off" />
      <button class="mchat-send" id="mchatSend" title="Send message">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>`;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const messagesEl = document.getElementById('mchatMessages');
  const inputEl    = document.getElementById('mchatInput');
  const sendBtn    = document.getElementById('mchatSend');

  // ── Persistence ───────────────────────────────────────────────────────────
  function loadHistory() {
    try { messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { messages = []; }
  }
  function saveHistory() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40))); } catch {}
  }

  // ── Simple markdown renderer ──────────────────────────────────────────────
  function renderMarkdown(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code style="background:rgba(8,34,65,0.08);padding:0.1em 0.35em;border-radius:4px;font-family:monospace;font-size:0.9em;">$1</code>')
      .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.+)$/, '<p>$1</p>');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function formatTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ── Suggestions ────────────────────────────────────────────────────────────
  const SUGGESTIONS = [
    'What is our current diversion rate?',
    'Which location wastes the most food?',
    'How can we improve our composting?',
    'What happened this week vs last week?',
    'Which bin needs attention first?',
    'Give me 3 tips to reduce waste'
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  function renderMessages() {
    if (!messages.length) {
      if (!window.MunchiesAuth) {
        messagesEl.innerHTML = `
          <div class="mchat-empty">
            <div class="mchat-empty-icon"><i class="fas fa-robot"></i></div>
            <strong>Hi, I'm MunchiesAI!</strong>
            <p>I have live access to campus food waste data and can answer questions about sustainability, composting rates, and waste trends — sign in to start chatting.</p>
            <a href="login.html" class="mchat-signin-btn"><i class="fas fa-arrow-right-to-bracket"></i> Sign In to Chat</a>
          </div>`;
        return;
      }
      messagesEl.innerHTML = `
        <div class="mchat-empty">
          <div class="mchat-empty-icon"><i class="fas fa-robot"></i></div>
          <strong>Hi, I'm MunchiesAI!</strong>
          <p>I have live access to your campus food waste data.<br>Ask me anything about sustainability, composting, or your current numbers.</p>
          <div class="mchat-suggestions">
            ${SUGGESTIONS.map(s => `<button class="mchat-sug-btn" data-sug="${s.replace(/"/g, '&quot;')}">${s}</button>`).join('')}
          </div>
        </div>`;
      return;
    }

    messagesEl.innerHTML = messages.map((m, i) => {
      const isAI = m.role === 'ai';
      const content = isAI ? renderMarkdown(m.content) : escapeHtml(m.content);
      const ts = formatTime(m.ts);
      return `
        <div class="mchat-msg ${m.role}">
          <div class="mchat-avatar"><i class="fas ${isAI ? 'fa-robot' : 'fa-user'}"></i></div>
          <div class="mchat-bubble-wrap">
            <div class="mchat-bubble">${content}</div>
            ${isAI ? `<button class="mchat-copy" data-copy="${i}" title="Copy response"><i class="fas fa-copy"></i> Copy</button>` : ''}
            ${isAI && m.provider ? `<div class="mchat-ts">${m.provider}${ts ? ' · ' + ts : ''}</div>` : ts ? `<div class="mchat-ts">${ts}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    if (isTyping) {
      messagesEl.innerHTML += `
        <div class="mchat-msg ai mchat-typing">
          <div class="mchat-avatar"><i class="fas fa-robot"></i></div>
          <div class="mchat-bubble-wrap">
            <div class="mchat-bubble">
              <span class="mchat-dot"></span><span class="mchat-dot"></span><span class="mchat-dot"></span>
            </div>
          </div>
        </div>`;
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendError(text) {
    const div = document.createElement('div');
    div.className = 'mchat-error-msg';
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Delegated click handler for dynamically rendered buttons ────────────
  messagesEl.addEventListener('click', e => {
    const sug = e.target.closest('[data-sug]');
    if (sug) { sendMessage(sug.dataset.sug); return; }
    const copy = e.target.closest('[data-copy]');
    if (copy) { window._mchatCopy(Number(copy.dataset.copy)); }
  });

  // ── Send message ──────────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (!window.MunchiesAuth) {
      window.location.href = 'login.html';
      return;
    }
    text = (text || inputEl.value || '').trim();
    if (!text || isTyping) return;
    inputEl.value = '';
    sendBtn.disabled = true;

    messages.push({ role: 'user', content: text, ts: Date.now() });
    isTyping = true;
    renderMessages();

    const apiMessages = messages.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    }));

    let headers = { 'Content-Type': 'application/json' };
    if (window.MunchiesAuth) {
      Object.assign(headers, window.MunchiesAuth.getAuthHeaders());
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: apiMessages })
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        messages.pop();
        isTyping = false;
        renderMessages();
        appendError(data.error || 'Something went wrong. Please try again.');
      } else {
        const providerLabel = data.provider === 'groq' ? '🦙 Llama · Groq' : '✦ Claude · Haiku';
        messages.push({ role: 'ai', content: data.reply, ts: Date.now(), provider: providerLabel });
        isTyping = false;
        saveHistory();
        renderMessages();
      }
    } catch {
      messages.pop();
      isTyping = false;
      renderMessages();
      appendError('Network error — make sure the server is running and try again.');
    }

    sendBtn.disabled = false;
    inputEl.focus();
  }

  // ── Global helpers ────────────────────────────────────────────────────────
  window._mchatSend = sendMessage;

  window._mchatClear = () => {
    messages = [];
    saveHistory();
    renderMessages();
  };

  window._mchatCopy = (index) => {
    const msg = messages[index];
    if (!msg) return;
    navigator.clipboard.writeText(msg.content).then(() => {
      const btns = messagesEl.querySelectorAll('.mchat-copy');
      const btn = btns[Math.floor(index / 2)];
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => { btn.innerHTML = orig; }, 1500);
      }
    });
  };

  // ── Toggle panel ──────────────────────────────────────────────────────────
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    btn.classList.remove('has-notif');
    renderMessages();
    setTimeout(() => inputEl.focus(), 300);
  }

  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
  }

  btn.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  document.getElementById('mchatCloseBtn').addEventListener('click', closePanel);
  document.getElementById('mchatClearBtn').addEventListener('click', () => {
    window._mchatClear();
  });

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  sendBtn.addEventListener('click', () => sendMessage());

  // ── Init ──────────────────────────────────────────────────────────────────
  loadHistory();
  if (!window.MunchiesAuth) {
    messages = [];
    inputEl.placeholder = 'Sign in to chat with MunchiesAI…';
  }
  if (messages.length) btn.classList.add('has-notif');
})();
