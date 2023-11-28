# Upload to Kafka

Simple REST API using [bun](https://bun.sh) to upload messages to Kafka (using the AVRO format).

## Requirements

```bash
npm install -g bun
```

Docker image: `oven/bun:alpine`

## Usage

```bash
bun start
# Or, alternatively,
bun src/index.mts
```

Or using Docker:

```yaml
---
version: "3.9"

services:
  kafka_upload_svc:
    image: docker.io/drivereu/kafka_upload_svc:latest
    environment:
      GROUP_ID: kafka_upload_svc
      KAFKA_HOST: redpanda-0:9092
      SCHEMA_REGISTRY: http://redpanda-0:8081/
```

POST a JSON body message to `http://localhost:<PORT>/<TOPIC>?format=json`.

When the format is `json` or not specified, a proper JSON object is expected. In case you use RedPanda's console, you may notice that the message value is a JSON object containing type annotations. In that case, specify the format as `avro`, and this service tries to remove the type annotations and create a proper JSON message.

## Environment variable
 
| Environment variables | Default value      |
| --------------------- | ------------------ |
| `PORT`                | 3000               |
| `HOSTNAME`            | `0.0.0.0`          |
| `GROUP_ID`            | `kafka_upload_svc` |
| `KAFKA_HOST`          | `localhost:3501`   |
| `SCHEMA_REGISTRY`     | `localhost:3502`   |

## Development

```bash
bun run dev
# Or, alternatively,
bun --watch src/index.mts
```

## Testing

In the `test` folder, several test messages are present in the [Bruno format](https://www.usebruno.com/). 

### WSL2

Please note that, as of this writing, the Windows client cannot deal with WSL2 folders, so instead, you should install it in WSL2, e.g. by using `snap install bruno`. 