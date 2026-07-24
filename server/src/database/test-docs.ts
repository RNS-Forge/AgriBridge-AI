import app from '../app.js';
import { redis } from '../modules/auth/service/auth.service.js';

async function runTests() {
  const port = 8021;
  const server = app.listen(port, () => {
    console.log(`[Test Server] Listening on port ${port}...`);
  });

  const baseUrl = `http://localhost:${port}`;

  try {
    console.log('\n--- Step 1: Query API Health ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    console.log('Health Status:', healthRes.status);
    const healthJson = await healthRes.json();
    console.log('Health Body:', healthJson);
    if (healthRes.status !== 200 || healthJson.status !== 'OK') throw new Error('Health check failed');

    console.log('\n--- Step 2: Query API Docs (Swagger UI) ---');
    const docsRes = await fetch(`${baseUrl}/api-docs/`);
    console.log('Swagger UI HTML Status:', docsRes.status);
    const htmlText = await docsRes.text();
    console.log('HTML slice:', htmlText.slice(0, 300));
    console.log('HTML contains swagger-ui:', htmlText.includes('swagger-ui') || htmlText.includes('swagger'));
    if (docsRes.status !== 200 || !(htmlText.includes('swagger-ui') || htmlText.includes('swagger'))) {
      throw new Error('Swagger UI page rendering failed');
    }

    console.log('\n[SUCCESS] Swagger Docs serving verified successfully!');
  } catch (error) {
    console.error('\n[ERROR] Integration tests failed:', error);
  } finally {
    server.close();
    await redis.quit();
    process.exit(0);
  }
}

runTests();
