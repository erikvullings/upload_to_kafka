import { serve } from 'bun';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Producer } from './producer.mts';
import { config } from 'dotenv';
import { convertAvroToJson } from './utils.mts';

config();

type Format = 'json' | 'avro';

const openApi = resolve(process.cwd(), './src/openapi.json');
const openApiDef = readFileSync(openApi).toString();

const PORT = +(process.env.PORT || 3000);
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

const producer = new Producer();

const server = serve({
  port: PORT,
  hostname: HOSTNAME,
  async fetch(request) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/openapi.json') {
      return new Response(openApiDef, {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const topic = pathname.split('/').pop();
    const format = (
      url.searchParams.get('format') || 'json'
    ).toLowerCase() as Format;
    console.table({ format });
    if (topic && request.method === 'POST' && pathname.startsWith('/upload/')) {
      const json = await request.json();
      if (!json)
        return new Response('No JSON body provided!', {
          status: 400, // client error: bad request
        });
      await producer.addTopic(topic);
      const message = format === 'avro' ? convertAvroToJson(json) : json;
      const { error, data } = await producer.send(topic, message);
      if (error)
        return new Response(
          `Error sending message to topic ${topic}: ${error}`,
          {
            status: 400, // client error: bad request
          }
        );

      return new Response(
        `Received POST request for topic "${topic}" and request ${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    }

    return new Response('Not found', { status: 404 });
  },
});

// import { serve } from 'bun/http';

// const server = serve({
//   port: 3000,
//   fetch(request) {
//     const { pathname } = new URL(request.url);
//     const topic = pathname.split('/').pop();
//     if (request.method === 'POST' && pathname.startsWith('/upload/')) {
//       return new Response(`Received POST request for topic ${topic}`);
//     }
//     return new Response('Not found', { status: 404 });
//   },
// });

console.log(`Server started on http://localhost:${server.port}`);
