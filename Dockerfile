FROM mhart/alpine-node:8

RUN apk update && apk add imagemagick && rm -rf /var/cache/apk/*

RUN mkdir -p /usr/src
WORKDIR /usr/src

COPY . .
RUN rm -rf node_modules

WORKDIR /usr/src/client-react

RUN rm -rf node_modules
RUN npm install
RUN npm run build
RUN rm -rf node_modules

WORKDIR /usr/src
RUN npm install

CMD npm start
