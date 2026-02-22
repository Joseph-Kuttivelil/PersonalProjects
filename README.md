# Electron GPT App

A skeleton Electron application that connects to the OpenAI ChatGPT API with a **configurable prompt ruleset engine** that processes every message before it is sent.

---

## Project Structure

```
electron-gpt-app/
├── package.json
└── src/
    ├── main.js              ← Electron main process + IPC handlers
    ├── preload.js           ← Secure bridge between main & renderer
    ├── chatgpt-service.js   ← OpenAI API wrapper
    ├── ruleset-engine.js    ← ⭐ Prompt ruleset engine (add your rules here)
    ├── index.html           ← UI layout
    └── renderer.js          ← UI logic (chat, ruleset toggles)
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development mode

```bash
npm run dev
```

### 3. Build for distribution

```bash
npm run build
```

---

## How the Ruleset Engine Works

Every message the user types goes through `ruleset-engine.js` **before** being sent to ChatGPT.

Rules are processed **in order** and can:

| Type        | What it does                                      |
|-------------|---------------------------------------------------|
| `block`     | Reject the prompt and return an error to the user |
| `transform` | Modify the prompt text (e.g. trim whitespace)     |
| `append`    | Add text to the end of the prompt                 |
| `prepend`   | Add text to the beginning of the prompt           |

### Adding a new rule

Open `src/ruleset-engine.js` and add an entry to the `this.rules` array:

```js
{
  id: 'my-custom-rule',
  name: 'My Custom Rule',
  description: 'What this rule does.',
  enabled: true,
  type: 'transform', // block | transform | append | prepend
  apply: (prompt) => {
    // Your logic here
    const modified = prompt.replace(/foo/g, 'bar');
    return { allowed: true, prompt: modified };
    // To block: return { allowed: false, prompt, reason: 'Why it was blocked.' };
  },
},
```

Rules can also be **toggled on/off from the UI** at runtime.

---

## Architecture Highlights

- **Context isolation ON** — the renderer process has zero access to Node.js APIs directly.  
- **`preload.js`** exposes a safe, typed API (`window.electronAPI`) via `contextBridge`.  
- **`chatgpt-service.js`** is model-agnostic — swap `gpt-4o` for any OpenAI model.  
- **`ruleset-engine.js`** is completely decoupled from the UI and API — easy to unit-test.

---

## Configuration

| Setting | Where to change |
|---------|----------------|
| OpenAI model | `chatgpt-service.js` → `this.model` |
| System prompt | `chatgpt-service.js` → `this.systemPrompt` |
| Max token limit | `chatgpt-service.js` → `max_tokens` |
| Prompt rules | `ruleset-engine.js` → `this.rules` |
| Forbidden keywords | `block-forbidden-topics` rule in `ruleset-engine.js` |
