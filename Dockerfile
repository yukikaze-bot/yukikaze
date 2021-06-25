FROM node:alpine

WORKDIR /yukikaze

COPY ["package.json", "yarn.lock", ".yarnrc.yml", "./"]

ADD .yarn /yukikaze/.yarn

RUN apk add --no-cache build-base alpine-sdk python3-dev gcc wget curl cairo-dev jpeg-dev pango-dev giflib-dev font-noto-emoji && \
	yarn

COPY . .

CMD ["yarn", "start"]
