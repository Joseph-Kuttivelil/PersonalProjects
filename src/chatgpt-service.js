// src/chatgpt-service.js — OpenAI / ChatGPT API Wrapper

const { OpenAI } = require('openai');

class ChatGPTService {
  constructor() {
    this.client = null;
    this.model = 'gpt-4o'; // Change to 'gpt-3.5-turbo' if needed

    /**
     * System prompt injected at the START of every conversation.
     * This is separate from the ruleset — think of it as the AI's persona/role.
     */
    this.systemPrompt = `You are a helpful, concise, and professional assistant.
Always respond in clear, structured language.`;
  }

  setApiKey(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Send a message to ChatGPT.
   *
   * @param {string} userMessage          - The (ruleset-processed) user prompt.
   * @param {Array}  conversationHistory  - Previous messages: [{ role, content }, ...]
   * @returns {Promise<string>}           - Assistant reply text.
   */
  async sendMessage(userMessage, conversationHistory = []) {
    if (!this.client) {
      throw new Error('API key not set. Please configure your OpenAI API key first.');
    }

    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0].message.content;
  }
}

module.exports = { ChatGPTService };
