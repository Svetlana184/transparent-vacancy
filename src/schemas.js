import { z } from 'zod';

// ============================================================
// 1. Контракт между Парсером (Роль 2) и Анализаторами (Роли 3–4)
// ============================================================
export const NormalizedVacancySchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  job_name: z.string().default(''),           // Название должности
  duty: z.string().default(''),               // Обязанности (очищенные от HTML)
  requirements: z.string().default(''),       // Требования
  salary_min: z.number().int().nullable().default(null),
  salary_max: z.number().int().nullable().default(null),
  salary_text: z.string().default(''),        // Текстовая зарплата ("от 45000")
  schedule: z.string().default(''),           // График
  employment: z.string().default(''),         // Тип занятости
  work_place: z.string().default(''),         // Место работы / адрес
  raw_fields: z.record(z.any()).default({}),  // Исходные значения для цитирования
});

// ============================================================
// 2. Контракт одного замечания (выход анализатора)
// ============================================================
export const VacancyIssueSchema = z.object({
  topic: z.string().describe('Тема: должность, обязанности, требования, оплата, график, место работы, тип занятости'),
  field: z.string().describe('Поле источника, например: "schedule" или "salary_min vs duty"'),
  quote: z.string().default('').describe('Точная цитата. Пустая строка для пропусков. Оба значения через "|" для противоречий'),
  issue: z.string().describe('Суть проблемы без вымысла и юридических выводов'),
  recommendation: z.string().describe('Конкретный вопрос/уточнение для работодателя'),
});

// ============================================================
// 3. Итоговый контракт отчёта по одной вакансии
// ============================================================
export const VacancyReportSchema = z.object({
  id: z.string(),
  url: z.string().optional(),
  issues: z.array(VacancyIssueSchema).default([]),
});

// ============================================================
// 4. Финальный отчёт (весь массив)
// ============================================================
export const FullReportSchema = z.object({
  generated_at: z.string(),
  vacancies_count: z.number(),
  vacancies: z.array(VacancyReportSchema),
});

// Экспортируем типы для TypeScript/JSDoc
export const parseVacancy = (data) => NormalizedVacancySchema.parse(data);
export const parseIssue = (data) => VacancyIssueSchema.parse(data);
export const parseReport = (data) => VacancyReportSchema.parse(data);