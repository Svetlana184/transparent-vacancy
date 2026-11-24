import { NormalizedVacancySchema } from '../schemas.js';

/**
 * Очистка HTML и сущностей.
 * ВАЖНО: не перефразируем текст — только чистим, чтобы цитаты LLM валидировались.
 */
export function cleanText(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Приводит сырую вакансию API к контракту NormalizedVacancy.
 */
export function normalizeVacancy(raw) {
  const location = raw.addresses?.address?.[0]?.location || '';
  const shiftText = Array.isArray(raw.shift) ? raw.shift.join(', ') : '';
  const scheduleText = [raw.schedule, shiftText].filter(Boolean).join(', ');

  // salary_text — это готовая строка из API ("от 45000")
  const salaryText = raw.salary
    ? `${raw.salary} ${(raw.currency || 'руб.').replace(/[«»]/g, '')}`.trim()
    : '';

  const normalized = {
    id: String(raw.id || ''),
    url: cleanText(raw.vac_url || ''),
    job_name: cleanText(raw['job-name'] || ''),
    duty: cleanText(raw.duty || ''),
    requirements: cleanText(raw.requirements || ''),
    salary_min: raw.salary_min ?? null,
    salary_max: raw.salary_max ?? null,
    salary_text: salaryText,
    schedule: cleanText(scheduleText),
    employment: cleanText(raw.employment || ''),
    work_place: cleanText(location),
    raw_fields: {
      // Сохраняем исходники для цитирования (без очистки, чтобы quote in field работал)
      'job-name': raw['job-name'] || '',
      duty: raw.duty || '',
      requirements: raw.requirements || '',
      salary: raw.salary || '',
      schedule: raw.schedule || '',
      employment: raw.employment || '',
      location,
    },
  };

  // Валидация по Zod-схеме — если что-то не так, упадём с понятной ошибкой
  return NormalizedVacancySchema.parse(normalized);
}