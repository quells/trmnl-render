FROM docker.io/zenika/alpine-chrome:100-with-playwright

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY src/ src

ENV PORT=8000
CMD [ "node", "src/index.js" ]
