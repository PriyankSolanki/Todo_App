FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG REACT_APP_GRAPHQL_URL=http://localhost:3001/graphql
ENV REACT_APP_GRAPHQL_URL=$REACT_APP_GRAPHQL_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
