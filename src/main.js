#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { config } from './config.js';
import { fetchVacancies } from './api/trudvsem.js';
import { normalizeVacancy } from './parser/clean.js';
import { analyzeVacancy } from './analyzer/index.js';
import { buildReport, saveReport, loadLastSuccessfulReport } from './report/report.js';
import { startScheduler } from './scheduler/scheduler.js';

/**
 * Загружает вакансии: из API или из локального JSON.
 * Адаптировано под реальный формат API: { results: { vacancies: [ { vacancy: {...} } ] } }
 */
async function loadRawVacancies(mode, filePath) {
  if (mode === 'local') {
    if (!filePath) {
      throw new Error('В режиме local необходимо указать путь к файлу: --file <путь>');
    }
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
      throw new Error(`Файл не найден: ${absPath}`);
    }

    const rawData = JSON.parse(fs.readFileSync(absPath, 'utf8'));
    let list = [];

    // Поддержка разных форматов входного JSON
    if (Array.isArray(rawData)) {
      // Формат: [ { "vacancy": {...} }, ... ] или прямой массив вакансий
      list = rawData.map(item => item.vacancy || item);
    } else if (rawData.results?.vacancies) {
      // Формат полного ответа API: { "results": { "vacancies": [ { "vacancy": {...} } ] } }
      list = rawData.results.vacancies.map(item => item.vacancy);
    } else {
      throw new Error('Неизвестный формат JSON. Ожидался массив или объект с results.vacancies');
    }

    console.log(`[Local] Загружено ${list.length} вакансий из ${absPath}`);
    return list;
  }

  // Режим API
  return await fetchVacancies();
}

/**
 * Основной пайплайн обработки: загрузка → нормализация → анализ → отчёт.
 */
async function runPipeline(mode, filePath) {
  console.log(`\n=== Запуск пайплайна (mode=${mode}) ===\n`);

  const rawVacancies = await loadRawVacancies(mode, filePath);
  
  // Нормализация данных
  const normalized = rawVacancies.map(normalizeVacancy);

  // Анализ каждой вакансии
  const analyzed = [];
  for (const v of normalized) {
    console.log(`[Analyze] ID: ${v.id} | ${v.title || '(без названия)'}`);
    const issues = await analyzeVacancy(v);
    analyzed.push({ ...v, issues });
  }

  // Сборка отчёта с дедупликацией по ID
  const report = buildReport(analyzed);
  
  // Сохранение отчёта (dated + latest.json)
  saveReport(report);
  
  const totalIssues = report.vacancies.reduce((sum, v) => sum + (v.issues?.length || 0), 0);
  console.log(`\n=== Готово. Обработано вакансий: ${report.vacancies_count}. Всего замечаний: ${totalIssues} ===\n`);
  
  return report;
}

/**
 * Обёртка с fail-safe логикой.
 * Если пайплайн падает (например, API недоступен), мы не теряем данные,
 * а сохраняем/используем последний успешный отчёт.
 */
async function safeRun(mode, filePath) {
  try {
    return await runPipeline(mode, filePath);
  } catch (error) {
    console.error(`\n[ERROR] Критическая ошибка пайплайна: ${error.message}`);
    
    const lastReport = loadLastSuccessfulReport();
    if (lastReport) {
      console.error('[FAIL-SAFE] API или данные недоступны. Используем последний успешный отчёт.');
      console.error(`[FAIL-SAFE] Дата последнего отчёта: ${lastReport.generated_at}`);
      console.error(`[FAIL-SAFE] Количество вакансий в отчёте: ${lastReport.vacancies_count}`);
      return lastReport;
    }
    
    console.error('[FAIL-SAFE] Успешных отчётов ещё нет. Невозможно продолжить.');
    process.exit(1);
  }
}

// =========================================================================
// CLI (Command Line Interface) парсер
// =========================================================================
const [, , command, ...args] = process.argv;

const getArg = (name) => {
  const index = args.indexOf(name);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : null;
};

(async () => {
  try {
    if (command === 'run') {
      const mode = getArg('--mode') ?? config.mode;
      const file = getArg('--file');
      await safeRun(mode, file);
    } 
    else if (command === 'schedule') {
      console.log(`[Scheduler] Инициализация расписания: ${config.schedule.cron}`);
      startScheduler(() => safeRun(config.mode));
    } 
    else {
      console.log('Использование:');
      console.log('  node src/main.js run --mode api');
      console.log('  node src/main.js run --mode local --file data/test_vacancies.json');
      console.log('  node src/main.js schedule');
      process.exit(1);
    }
  } catch (error) {
    console.error('[FATAL] Неожиданная ошибка:', error);
    process.exit(1);
  }
})();