import * as Minio from 'minio';

describe('MinIO Object Storage Integration', () => {
  const minioClient = new Minio.Client({
    endPoint: process.env.STORAGE_ENDPOINT || '127.0.0.1',
    port: Number(process.env.STORAGE_PORT || 9000),
    useSSL: false,
    accessKey: process.env.STORAGE_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.STORAGE_SECRET_KEY || 'minioadmin',
  });

  const testBucket = 'solaros-documents';
  const testObjectName = `audit-test-${Date.now()}.json`;
  const testPayload = JSON.stringify({
    system: 'SolarOS',
    purpose: 'Phase 0 Closure Verification',
    timestamp: new Date().toISOString(),
  });

  beforeAll(async () => {
    const exists = await minioClient.bucketExists(testBucket);
    if (!exists) {
      await minioClient.makeBucket(testBucket, 'us-east-1');
    }
  });

  afterAll(async () => {
    try {
      await minioClient.removeObject(testBucket, testObjectName);
    } catch {
      // Ignore cleanup error if object not present
    }
  });

  it('should verify MinIO bucket creation', async () => {
    const exists = await minioClient.bucketExists(testBucket);
    expect(exists).toBe(true);
  });

  it('should upload an object to MinIO and download it with byte-exact match', async () => {
    const uploadBuffer = Buffer.from(testPayload, 'utf8');

    // 1. Upload Object
    await minioClient.putObject(testBucket, testObjectName, uploadBuffer, uploadBuffer.length, {
      'Content-Type': 'application/json',
    });

    // 2. Download Object
    const stream = await minioClient.getObject(testBucket, testObjectName);
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('error', reject);
      stream.on('end', () => resolve());
    });

    const downloadedText = Buffer.concat(chunks).toString('utf8');
    expect(downloadedText).toBe(testPayload);

    const parsed = JSON.parse(downloadedText);
    expect(parsed.system).toBe('SolarOS');
  });
});
