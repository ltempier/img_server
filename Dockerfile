FROM mhart/alpine-node:8

RUN apk update && apk add imagemagick && rm -rf /var/cache/apk/*

WORKDIR /usr/src

CMD npm start
