# Creates a Kafka upload service
#
# You can access the container using:
#   docker run -it kafka_upload_svc sh
# To start it stand-alone:
#   docker run -it kafka_upload_svc

FROM oven/bun:alpine
RUN mkdir -p /app
WORKDIR /app
COPY ./LICENSE ./LICENSE
COPY ./tsconfig.json ./tsconfig.json
COPY ./package.json ./package.json
COPY ./bun.lockb ./bun.lockb
RUN bun i --only=production
COPY ./src ./src
EXPOSE 3000
CMD ["bun", "src/index.mts"]
