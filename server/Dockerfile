FROM node:12.18.4-alpine AS build
WORKDIR /opt/server/
COPY package.json package-lock.json ./
RUN npm install
COPY ./ ./
RUN npm run build

FROM node:12.18.4-alpine 
EXPOSE 3000
WORKDIR /opt/server/
COPY --from=build /opt/server/build/ ./
CMD npm run start:prod