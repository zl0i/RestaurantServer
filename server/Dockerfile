FROM node:12.18.4-alpine
WORKDIR /opt/server/
COPY . .
RUN npm install
RUN npm run build

FROM node:12.18.4-alpine 
EXPOSE 3000
WORKDIR /opt/server/
COPY --from=0 /opt/server/package.json ./package.json
RUN npm i --prod
COPY --from=0 /opt/server/build/ ./
CMD npm run start:prod