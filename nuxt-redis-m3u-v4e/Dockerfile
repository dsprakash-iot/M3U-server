FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm i
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tini ffmpeg
COPY --from=build /app/.output /app/.output
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/public /app/public
EXPOSE 3000
VOLUME ["/data"]
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node",".output/server/index.mjs"]
