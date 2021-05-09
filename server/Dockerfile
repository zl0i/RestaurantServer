FROM node:12.18.4-alpine

EXPOSE 3000

WORKDIR /opt/server/

COPY ./ ./

RUN npm install --prod

CMD npm run start:prod