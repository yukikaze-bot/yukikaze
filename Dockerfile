FROM node:alpine

WORKDIR /yukikaze

COPY ["package.json", "yarn.lock", ".yarnrc.yml", "./"]

ADD .yarn /yukikaze/.yarn

RUN apk add --no-cache build-base alpine-sdk python3-dev gcc wget curl cairo-dev jpeg-dev pango-dev giflib-dev font-noto-emoji graphicsmagick imagemagick tini libsodium && \
	yarn

COPY . .

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["yarn", "start"]
