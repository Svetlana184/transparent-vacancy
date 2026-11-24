import { CronJob } from 'cron';
import { config } from '../config.js';

export function startScheduler(task) {
  const job = new CronJob(config.schedule.cron, async () => {
    console.log(`\n[Scheduler] Запуск в ${new Date().toISOString()}`);
    try {
      await task();
    } catch (e) {
      console.error('[Scheduler] Ошибка:', e.message);
    }
  });
  job.start();
  console.log(`[Scheduler] Активен. Следующий запуск: ${job.nextDate().toISO()}`);
}