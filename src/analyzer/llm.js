// =================================================================
// LLM-анализатор вакансий.
// Подключится на Этапе 3, когда команда выберет провайдера и модель.
// Пока все реализации закомментированы — analyzeWithLLM() возвращает [].
// =================================================================

import { config } from '../config.js';

/*
import { Ollama } from 'ollama';

const SYSTEM_PROMPT = `Ты — редактор вакансий. Найди неоднозначности,
противоречия и пропуски в тексте вакансии. Верни СТРОГО JSON-массив:
[{ "topic": "...", "field": "...", "quote": "...", "issue": "...", "recommendation": "..." }]
Если проблем нет — верни [].`;

function buildUserPrompt(v) {
  return `Вакансия:
- title: ${v.title}
- duties: ${v.duties}
- requirements: ${v.requirements}
- salary: ${v.salary}
- schedule: ${v.schedule}
- employment: ${v.employment}
- location: ${v.location}
- description: ${v.description}`;
}

function extractJson(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try { return JSON.parse(match[0]); } catch { return []; }
}

function verifyQuotes(issues, vacancy) {
  const haystack = [
    vacancy.title, vacancy.duties, vacancy.requirements,
    vacancy.salary, vacancy.schedule, vacancy.employment,
    vacancy.location, vacancy.description,
  ].join(' ').toLowerCase();
  return issues.filter((it) => {
    if (!it.quote || it.quote.trim() === '') return true;
    return haystack.includes(it.quote.toLowerCase());
  });
}

async function callOllama(prompt) {
  const ollama = new Ollama({ host: config.llm.baseUrl || 'http://localhost:11434' });
  const resp = await ollama.chat({
    model: config.llm.model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    options: { temperature: 0.2 },
  });
  return resp.message.content;
}

async function callOpenAICompatible(prompt) {
  const url = config.llm.baseUrl || 'https://api.groq.com/openai/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.llm.apiKey}`,
    },
    body: JSON.stringify({
      model: config.llm.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    }),
  });
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? '';
}
*/

/**
 * Заглушка. На Этапе 3 здесь будет реальный вызов выбранной LLM.
 */
export async function analyzeWithLLM(vacancy) {
  // eslint-disable-next-line no-unused-vars
  const _provider = config.llm.provider; // зарезервировано для Этапа 3
  return [];
}