// src/renderer.js — Renderer Process (UI Logic)
// Runs in the browser context; communicates with main via window.electronAPI

const messagesEl   = document.getElementById('messages');
const userInputEl  = document.getElementById('userInput');
const sendBtn      = document.getElementById('sendBtn');
const clearBtn     = document.getElementById('clearBtn');
const apiKeyInput  = document.getElementById('apiKeyInput');
const saveKeyBtn   = document.getElementById('saveKeyBtn');
const apiStatus    = document.getElementById('apiStatus');
const rulesListEl  = document.getElementById('rulesList');

/** Conversation history sent to the API on each turn */
let conversationHistory = [];
let apiKeySet = false;

// ─── API Key ──────────────────────────────────────────────────────────────────

saveKeyBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;
  const result = await window.electronAPI.setApiKey(key);
  if (result.success) {
    apiStatus.textContent = '✓ Key saved';
    apiStatus.className = 'api-status ok';
    apiKeySet = true;
    sendBtn.disabled = false;
    apiKeyInput.value = '';
  }
});

// ─── Ruleset ──────────────────────────────────────────────────────────────────

async function loadRules() {
  const rules = await window.electronAPI.getRules();
  rulesListEl.innerHTML = '';

  rules.forEach((rule) => {
    const card = document.createElement('div');
    card.className = `rule-card${rule.enabled ? '' : ' disabled'}`;
    card.id = `rule-${rule.id}`;
    card.innerHTML = `
      <div class="rule-info">
        <div class="rule-name">${rule.name}</div>
        <div class="rule-desc">${rule.description}</div>
        <span class="rule-badge ${rule.type}">${rule.type}</span>
      </div>
      <label class="toggle">
        <input type="checkbox" ${rule.enabled ? 'checked' : ''} data-rule-id="${rule.id}" />
        <span class="toggle-slider"></span>
      </label>
    `;
    rulesListEl.appendChild(card);
  });

  // Attach toggle listeners
  rulesListEl.querySelectorAll('input[type=checkbox]').forEach((cb) => {
    cb.addEventListener('change', async (e) => {
      const ruleId  = e.target.dataset.ruleId;
      const enabled = e.target.checked;
      await window.electronAPI.toggleRule(ruleId, enabled);
      const card = document.getElementById(`rule-${ruleId}`);
      card.classList.toggle('disabled', !enabled);
    });
  });
}

loadRules();

// ─── Chat ─────────────────────────────────────────────────────────────────────

function appendMessage(role, content, isError = false) {
  // Remove welcome screen on first message
  const welcome = messagesEl.querySelector('.welcome');
  if (welcome) welcome.remove();

  const wrap = document.createElement('div');
  wrap.className = `message ${role}${isError ? ' error' : ''}`;

  const avatarLabel = role === 'user' ? 'U' : 'AI';
  wrap.innerHTML = `
    <div class="avatar">${avatarLabel}</div>
    <div class="bubble">${escapeHtml(content)}</div>
  `;

  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return wrap;
}

function showTyping() {
  const wrap = document.createElement('div');
  wrap.className = 'message assistant typing';
  wrap.id = 'typing-indicator';
  wrap.innerHTML = `
    <div class="avatar">AI</div>
    <div class="bubble"><div class="dots">
      <div class="dot"></div><div class="dot"></div><div class="dot"></div>
    </div></div>
  `;
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
  document.getElementById('typing-indicator')?.remove();
}

async function sendMessage() {
  const text = userInputEl.value.trim();
  if (!text || !apiKeySet) return;

  userInputEl.value = '';
  userInputEl.style.height = 'auto';
  sendBtn.disabled = true;

  // Show user message in UI
  appendMessage('user', text);

  // Show loading indicator
  showTyping();

  const result = await window.electronAPI.sendMessage({
    userMessage: text,
    conversationHistory,
  });

  hideTyping();

  if (result.success) {
    conversationHistory.push({ role: 'user', content: text });
    conversationHistory.push({ role: 'assistant', content: result.message });
    appendMessage('assistant', result.message);
  } else {
    appendMessage('assistant', `⚠ ${result.error}`, true);
  }

  sendBtn.disabled = false;
  userInputEl.focus();
}

sendBtn.addEventListener('click', sendMessage);

userInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-grow textarea
userInputEl.addEventListener('input', () => {
  userInputEl.style.height = 'auto';
  userInputEl.style.height = Math.min(userInputEl.scrollHeight, 160) + 'px';
});

clearBtn.addEventListener('click', () => {
  conversationHistory = [];
  messagesEl.innerHTML = `
    <div class="welcome">
      <div class="welcome-icon">⚡</div>
      <h2>Ready to chat</h2>
      <p>Set your API key, then send a message.</p>
    </div>
  `;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
