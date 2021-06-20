FROM node:alpine

WORKDIR /yukikaze

ARG DATABASE_URL

ADD . .

RUN yarn && yarn build && yarn migrate

CMD ["yarn", "start"]
