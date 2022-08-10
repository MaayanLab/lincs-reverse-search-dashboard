FROM node as builder

WORKDIR /app

ADD package.json /app/package.json
RUN set -x && npm i

ADD .babelrc /app/.babelrc
ADD webpack.config.js /app/webpack.config.js
ADD src /app/src
RUN set -x && npm run build

FROM python

RUN useradd app --uid 1000
WORKDIR /app

ADD prod/deps.txt /app/prod/deps.txt
RUN set -x \
  && apt-get update -y \
  && xargs apt-get install -y < /app/prod/deps.txt \
  && rm -rf /var/lib/apt/lists/*

ADD requirements.txt /app/requirements.txt
RUN set -x && pip install -r /app/requirements.txt

COPY --from=builder /app/dist /app/dist
ADD . /app/

RUN set -x && chown app:app -R /app

ENV MODE=production

CMD ["supervisord", "-n", "-c", "/app/prod/supervisord.conf"]
