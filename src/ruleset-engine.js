// src/ruleset-engine.js — Prompt Ruleset Engine
//
// Rules are applied in ORDER. Each rule can:
//   • BLOCK   a prompt (allowed: false)
//   • MUTATE  a prompt (transformedPrompt gets updated)
//   • PASS    through unchanged
//
// Add, remove, or reorder rules as your product requires.

class RulesetEngine {
  constructor() {
    /**
     * Rule shape:
     * {
     *   id:          string   — unique identifier
     *   name:        string   — human-readable label (shown in UI)
     *   description: string   — what the rule does
     *   enabled:     boolean  — can be toggled at runtime
     *   type:        'block' | 'transform' | 'append' | 'prepend'
     *   apply:       (prompt: string) => { allowed: boolean, prompt: string, reason?: string }
     * }
     */
    this.rules = [
      // ── BLOCK rules ──────────────────────────────────────────────────────────

      {
        id: 'block-empty',
        name: 'Block empty prompts',
        description: 'Prevents sending blank or whitespace-only messages.',
        enabled: true,
        type: 'block',
        apply: (prompt) => {
          if (!prompt || prompt.trim().length === 0) {
            return { allowed: false, prompt, reason: 'Prompt cannot be empty.' };
          }
          return { allowed: true, prompt };
        },
      },

      {
        id: 'block-too-long',
        name: 'Block excessively long prompts',
        description: 'Rejects prompts longer than 4000 characters.',
        enabled: true,
        type: 'block',
        apply: (prompt) => {
          if (prompt.length > 4000) {
            return {
              allowed: false,
              prompt,
              reason: `Prompt is too long (${prompt.length} chars). Maximum is 4000.`,
            };
          }
          return { allowed: true, prompt };
        },
      },

      {
        id: 'block-forbidden-topics',
        name: 'Block forbidden topics',
        description: 'Blocks prompts containing disallowed keywords.',
        enabled: true,
        type: 'block',
        apply: (prompt) => {
          // ✏️  Customise this list to match your product's policies.
          const forbidden = ['forbidden_word_1', 'forbidden_word_2'];
          const lower = prompt.toLowerCase();
          const hit = forbidden.find((w) => lower.includes(w));
          if (hit) {
            return {
              allowed: false,
              prompt,
              reason: `Prompt contains a disallowed term: "${hit}".`,
            };
          }
          return { allowed: true, prompt };
        },
      },

      // ── TRANSFORM rules ───────────────────────────────────────────────────────

      {
        id: 'trim-whitespace',
        name: 'Trim whitespace',
        description: 'Strips leading and trailing whitespace from every prompt.',
        enabled: true,
        type: 'transform',
        apply: (prompt) => ({ allowed: true, prompt: prompt.trim() }),
      },

      {
        id: 'sanitize-special-chars',
        name: 'Sanitize special characters',
        description: 'Removes null bytes and other control characters.',
        enabled: true,
        type: 'transform',
        // eslint-disable-next-line no-control-regex
        apply: (prompt) => ({ allowed: true, prompt: prompt.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') }),
      },

      // ── APPEND / PREPEND rules ────────────────────────────────────────────────

      {
        id: 'append-language-instruction',
        name: 'Append language instruction',
        description: 'Asks the model to always reply in the same language as the user.',
        enabled: true,
        type: 'append',
        apply: (prompt) => ({
          allowed: true,
          prompt: `${prompt}\n\n[Please respond in the same language as this message.]`,
        }),
      },

      {
        id: 'prepend-context',
        name: 'Prepend context reminder',
        description: 'Prepends a short reminder about the application context.',
        enabled: false, // disabled by default — toggle on as needed
        type: 'prepend',
        apply: (prompt) => ({
          allowed: true,
          prompt: `[Context: You are assisting a user inside MyApp.]\n\n${prompt}`,
        }),
      },
    ];
  }

  /**
   * Run all enabled rules against a prompt in sequence.
   * Returns { allowed, transformedPrompt, reason }.
   */
  process(rawPrompt) {
    let currentPrompt = rawPrompt;

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const result = rule.apply(currentPrompt);

      if (!result.allowed) {
        return {
          allowed: false,
          transformedPrompt: currentPrompt,
          reason: `[${rule.name}] ${result.reason}`,
        };
      }

      currentPrompt = result.prompt;
    }

    return { allowed: true, transformedPrompt: currentPrompt };
  }

  /** Return a serialisable snapshot of the rules (no function refs). */
  getRules() {
    return this.rules.map(({ id, name, description, enabled, type }) => ({
      id, name, description, enabled, type,
    }));
  }

  toggleRule(ruleId, enabled) {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (rule) rule.enabled = enabled;
  }
}

module.exports = { RulesetEngine };
