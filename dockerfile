FROM node:20-alpine

WORKDIR /app

COPY . .

RUN yarn install
RUN yarn run build
RUN chmod +x ./run

ENTRYPOINT [ "/app/run" ]
CMD [ "." ]
