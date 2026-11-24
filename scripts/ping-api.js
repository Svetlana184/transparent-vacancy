#!/usr/bin/env node
/**
 * Быстрая проверка доступности API «Работа в России».
 * Запуск: node scripts/ping-api.js
 */

const URL = 'http://opendata.trudvsem.ru/api/v1/vacancies?region=39&offset=0&count=1';

console.log(`Проверяем: ${URL}\n`);

(async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const res = await fetch(URL, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    console.log(`Статус: ${res.status} ${res.statusText}`);
    console.log(`Content-Type: ${res.headers.get('content-type')}`);

    const text = await res.text();
    console.log(`\nПервые 500 символов ответа:\n${text.slice(0, 500)}`);

    if (res.ok) {
      try {
        const json = JSON.parse(text);
        const count = json?.results?.vacancy?.length ?? 0;
        console.log(`\n✅ API работает. Вакансий на странице: ${count}`);
      } catch {
        console.log('\n⚠️  Ответ получен, но это не JSON');
      }
    } else {
      console.log('\n❌ API вернул ошибку');
    }
  } catch (e) {
    console.error('\n❌ Ошибка соединения:');
    console.error(e.message);
    console.error('\nВозможные причины:');
    console.error('  1. Используется HTTPS вместо HTTP');
    console.error('  2. Нет доступа к opendata.trudvsem.ru из сети');
    console.error('  3. API временно недоступен');
    console.error('  4. Блокировка провайдером/файрволом');
  }
})();