FROM node:alpine

WORKDIR /yukikaze

ARG DATABASE_URL

ADD . .

RUN apk add --no-cache build-base alpine-sdk python3-dev gcc wget curl cairo-dev jpeg-dev pango-dev giflib-dev font-noto-emoji && \
	yarn && \
	yarn build && \
	yarn migrate

CMD ["yarn", "start"]
