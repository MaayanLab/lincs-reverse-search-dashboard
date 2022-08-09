FROM node:alpine as builder

WORKDIR /app

ADD package.json /app/package.json
RUN set -x && npm i

ADD .babelrc /app/.babelrc
ADD webpack.config.js /app/webpack.config.js
ADD src /app/src
RUN set -x && npm run build

FROM alpine

RUN addgroup -S app --gid 1000 && adduser -S app -G app --uid 1000
WORKDIR /app

ADD prod/deps.txt /app/prod/deps.txt
RUN set -x && xargs apk add --no-cache < /app/prod/deps.txt

ADD prod/build.deps.txt /app/prod/build.deps.txt
ADD requirements.txt /app/requirements.txt
RUN set -x \
  && xargs apk add --no-cache --virtual .build-deps < /app/prod/build.deps.txt \
  && pip3 install -r /app/requirements.txt \
  && apk del .build-deps

COPY --from=builder /app/dist /app/dist
ADD . /app/

RUN set -x && chown app:app -R /app

ENV MODE=production

CMD ["supervisord", "-n", "-c", "/app/prod/supervisord.conf"]
