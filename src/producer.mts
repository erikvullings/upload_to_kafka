import {
  TestBedAdapter,
  AdapterLogger,
  LogLevel,
  AdapterProducerRecord,
  RecordMetadata,
  AvroMessage,
} from 'node-test-bed-adapter';

const log = AdapterLogger.instance;

export class Producer {
  private id =
    process.env.GROUP_ID || process.env.CLIENT_ID || 'kafka_upload_svc';
  private adapter: TestBedAdapter;
  private registeredProducerTopics = new Set<string>();

  constructor() {
    this.adapter = new TestBedAdapter({
      kafkaHost: process.env.KAFKA_HOST || 'localhost:3501',
      schemaRegistry: process.env.SCHEMA_REGISTRY || 'localhost:3502',
      // sslOptions: {
      //   pfx: fs.readFileSync('../certs/other-tool-1-client.p12'),
      //   passphrase: 'changeit',
      //   ca: fs.readFileSync('../certs/test-ca.pem'),
      //   rejectUnauthorized: true,
      // },
      groupId: this.id,
      fetchAllSchemas: true,
      fetchAllVersions: true,
      autoRegisterSchemas: false,
      wrapUnions: 'auto',
      stringBasedKey: true,
      autoCreateTopics: true,
      logging: {
        logToConsole: LogLevel.Info,
        logToKafka: LogLevel.Warn,
      },
    });
    this.adapter.on('error', (e) => console.error(e));
    this.adapter.on('ready', () => {
      log.info(`${this.id.toUpperCase()} is connected`);
    });
    this.adapter.connect();
  }

  public addTopic(topic: string) {
    if (this.registeredProducerTopics.has(topic)) return;
    this.registeredProducerTopics.add(topic);
    return this.adapter.addProducerTopics(topic);
  }

  public getSubscribedTopics() {
    return Array.from(this.registeredProducerTopics.values());
  }

  public send(topic: string, json: AvroMessage | Record<string, any>) {
    const message = (
      Object.keys(json).length <= 2 && json.hasOwnProperty('value')
        ? json
        : { value: json }
    ) as AvroMessage;
    const payload: AdapterProducerRecord = {
      topic,
      messages: [message],
    };
    return new Promise<{ error?: any; data?: RecordMetadata[] }>(
      (resolve, reject) => {
        this.adapter.send(payload, (error, data) => {
          if (error) {
            log.error(error);
            reject({ error });
          }
          if (data) {
            log.info(data);
            resolve({ error: null, data });
          }
        });
      }
    );
  }
  // private sendGeoJSON() {
  //   const geojson = geojsonToAvro(
  //     (crowdTaskerMsg as unknown) as IFeatureCollection
  //   );
  //   const payloads: AdapterProducerRecord[] = [
  //     {
  //       topic: 'standard_geojson',
  //       messages: geojson,
  //       attributes: 1, // Gzip
  //     },
  //   ];
  //   this.adapter.send(payloads, (error, data) => {
  //     if (error) {
  //       log.error(error);
  //     }
  //     if (data) {
  //       log.info(data);
  //     }
  //   });
  // }
}
