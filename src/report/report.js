import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
import { VacancyReportSchema, FullReportSchema } from '../schemas.js';

export function buildReport(analyzedVacancies) {
  const byId = new Map();
  for (const v of analyzedVacancies) {
    // Валидируем каждую запись по контракту VacancyReport
    const validated = VacancyReportSchema.parse({
      id: v.id,
      url: v.url,
      issues: Array.isArray(v.issues) ? v.issues : [],
    });
    byId.set(validated.id, validated);
  }

  const report = {
    generated_at: new Date().toISOString(),
    vacancies_count: byId.size,
    vacancies: Array.from(byId.values()),
  };

  // Валидация всего отчёта
  return FullReportSchema.parse(report);
}

export function saveReport(report) {
  const dir = path.resolve(config.report.output_dir);
  fs.mkdirSync(dir, { recursive: true });

  const date = new Date().toISOString().replace(/[:.]/g, '-');
  const datedPath = path.join(dir, `report-${date}.json`);
  const latestPath = path.join(dir, config.report.latest_file);
  const tmpPath = latestPath + '.tmp';

  const json = JSON.stringify(report, null, 2);

  // Атомарная запись (как в спецификации): сначала .tmp, потом rename
  fs.writeFileSync(tmpPath, json, 'utf8');
  fs.renameSync(tmpPath, latestPath);
  fs.writeFileSync(datedPath, json, 'utf8');

  console.log(`[Report] Сохранено: ${datedPath}`);
  console.log(`[Report] Latest:   ${latestPath}`);
  return { datedPath, latestPath };
}

export function loadLastSuccessfulReport() {
  const latestPath = path.resolve(config.report.output_dir, config.report.latest_file);
  if (!fs.existsSync(latestPath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
    return FullReportSchema.parse(data);
  } catch {
    return null;
  }
}