import { analyzeWithLLM } from './llm.js';

/**
 * Анализатор вакансий.
 *
 * Этап 2: возвращает пустой массив (заглушка).
 * Этап 3: подключит
 *   - applyRules()    — жёсткие проверки без ИИ
 *   - analyzeWithLLM() — LLM-анализ неоднозначностей
 * и объединит их результаты с дедупликацией.
 */
export async function analyzeVacancy(vacancy) {
  // На Этапе 3 здесь будет:
  // const ruleIssues = applyRules(vacancy);
  // const llmIssues  = await analyzeWithLLM(vacancy);
  // return dedupe([...ruleIssues, ...llmIssues]);

  // Пока LLM не подключена — тихий вызов заготовки:
  await analyzeWithLLM(vacancy);
  return [];
}