FROM node:5

RUN mkdir -p /opt/cloud-vision-explorer
WORKDIR /opt/cloud-vision-explorer

COPY . /opt/cloud-vision-explorer

RUN npm install --production

ENV NODE_ENV production
ENV PORT 80
EXPOSE 80

CMD [ "npm", "start" ]
