import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

dotenv.config();

const settingsPath = path.resolve('config/settings.yaml');
const settings = yaml.load(fs.readFileSync(settingsPath, 'utf8'));

export const config = {
  api: settings.api,
  schedule: settings.schedule,
  mode: settings.mode,
  report: settings.report,
  llm: {
    provider: process.env.LLM_PROVIDER || '',
    model: process.env.LLM_MODEL || '', //название модели
    apiKey: process.env.LLM_API_KEY || '',      // нужен только для облачных провайдеров
    baseUrl: process.env.LLM_BASE_URL || '',    // для локальных 
  },
};