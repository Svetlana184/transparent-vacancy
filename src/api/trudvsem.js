import { config } from '../config.js';

/**
 * Клиент API «Работа в России».
 * ВАЖНО: API работает ТОЛЬКО по HTTP.
 */
export async function fetchVacancies() {
  const { url, region, pages_limit, page_size, max_vacancies } = config.api;
  const baseUrl = String(url).replace(/^https:\/\//i, 'http://');
  const all = [];

  for (let page = 0; page < pages_limit; page++) {
    const offset = page * page_size;
    const fullUrl = `${baseUrl}?region=${region}&offset=${offset}&count=${page_size}`;

    console.log(`[API] Страница ${page + 1}/${pages_limit}: GET ${fullUrl}`);

    let res;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20_000);
      res = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TransparentVacancy/1.0',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
      clearTimeout(timeout);
    } catch (e) {
      throw new Error(`[API] Сетевая ошибка на странице ${page + 1}: ${e.message}`);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`[API] HTTP ${res.status} на странице ${page + 1}. Тело: ${body.slice(0, 200)}`);
    }

    let json;
    try {
      json = await res.json();
    } catch (e) {
      throw new Error(`[API] Не удалось распарсить JSON на странице ${page + 1}`);
    }

    // РЕАЛЬНАЯ СТРУКТУРА: json.results.vacancies — массив объектов { vacancy: {...} }
    const rawList = json?.results?.vacancies ?? [];
    if (!Array.isArray(rawList) || rawList.length === 0) {
      console.log(`[API] Страница ${page + 1} пуста — останавливаемся.`);
      break;
    }

    // Извлекаем внутренний объект 'vacancy' из каждой записи
    const vacancies = rawList.map(item => item.vacancy).filter(Boolean);
    all.push(...vacancies);
    console.log(`[API] Получено ${vacancies.length} вакансий (всего: ${all.length})`);

    if (all.length >= max_vacancies) break;
  }

  const limited = all.slice(0, max_vacancies);
  console.log(`[API] Итого загружено: ${limited.length} вакансий`);
  return limited;
}