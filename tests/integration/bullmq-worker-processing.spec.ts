import { Queue, Worker } from 'bullmq';

describe('BullMQ Background Worker Job Processing', () => {
  const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
  };

  const queueName = `test-notifications-${Date.now()}`;
  let queue: Queue;
  let worker: Worker;

  beforeAll(async () => {
    queue = new Queue(queueName, { connection });
    worker = new Worker(
      queueName,
      async (job) => {
        return {
          status: 'PROCESSED',
          jobId: job.id,
          tenantId: job.data.tenantId,
          processedAt: new Date().toISOString(),
        };
      },
      { connection }
    );
    await worker.waitUntilReady();
  });

  afterAll(async () => {
    await worker.close();
    await queue.obliterate({ force: true }).catch(() => {});
    await queue.close();
  });

  it('should dispatch, pick up, and successfully process a background BullMQ job', async () => {
    const jobData = {
      tenantId: 'tenant-test-123',
      action: 'NOTIFY_SITE_SURVEY_SCHEDULED',
      payload: { systemKw: 5, customerName: 'Solar Customer' },
    };

    // 1. Listen for completion event
    const completionPromise = new Promise<{ status: string; jobId: string; tenantId: string }>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Job processing timed out after 5s')), 5000);
      worker.on('completed', (job, returnvalue) => {
        clearTimeout(timeout);
        resolve(returnvalue);
      });
      worker.on('failed', (job, err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // 2. Dispatch job to Redis
    const job = await queue.add('test-audit-notification', jobData);
    expect(job.id).toBeDefined();

    // 3. Await worker completion
    const result = await completionPromise;

    expect(result).toBeDefined();
    expect(result.status).toBe('PROCESSED');
    expect(result.jobId).toBe(job.id);
    expect(result.tenantId).toBe(jobData.tenantId);

    // 4. Verify completed state directly from queue
    const completedJob = await queue.getJob(job.id!);
    expect(completedJob).not.toBeNull();
    const state = await completedJob!.getState();
    expect(state).toBe('completed');
  });
});
