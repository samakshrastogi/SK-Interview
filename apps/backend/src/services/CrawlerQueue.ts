import { Queue, Worker, Job } from 'bullmq';
import { redisClient } from '../config/db';
import { crawlerService } from './CrawlerService';
import { logger } from '../config/logger';

const QUEUE_NAME = 'crawler-queue';

// 1. Initialize BullMQ Queue
export const crawlerQueue = new Queue(QUEUE_NAME, {
  connection: redisClient as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  },
});

// 2. Initialize Worker to process crawler jobs
export const startCrawlerWorker = (): Worker => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      logger.info(`[BullMQ] Processing job ${job.id} of type ${job.name}`);
      if (job.name === 'crawl-exams') {
        const result = await crawlerService.runCrawlTask();
        return result;
      }
    },
    {
      connection: redisClient as any,
    }
  );

  worker.on('completed', (job: Job, result: any) => {
    logger.info(`[BullMQ] Job ${job.id} completed successfully. Crawled: ${result?.crawledCount}`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error(`[BullMQ] Job ${job?.id} failed: ${err.message}`, err);
  });

  return worker;
};

// 3. Register Scheduler Cron Job
export const scheduleCrawlerJobs = async (): Promise<void> => {
  try {
    // Remove existing repeatable jobs to avoid duplicates
    const repeatableJobs = await crawlerQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await crawlerQueue.removeRepeatableByKey(job.key);
    }

    // Schedule: Run once every day at midnight (cron: "0 0 * * *")
    await crawlerQueue.upsertJobScheduler(
      'daily-exam-crawl',
      {
        pattern: '0 0 * * *',
      },
      {
        name: 'crawl-exams',
        data: { trigger: 'cron' },
      }
    );

    logger.info('[BullMQ] Daily exam crawler cron job scheduled successfully');

    // Trigger an immediate run once during start-up to ensure database is seeded
    await crawlerQueue.add('crawl-exams', { trigger: 'startup' });
    logger.info('[BullMQ] Immediate crawl triggered to seed initial data');
  } catch (error) {
    logger.error('[BullMQ] Failed to schedule crawler jobs', error);
  }
};
