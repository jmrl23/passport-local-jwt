FROM node:22-alpine

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn run build
RUN chmod +x ./run

ENTRYPOINT [ "/app/run" ]
CMD [ "." ]
