FROM node:5

RUN mkdir -p /opt/cloud-vision-explorer
WORKDIR /opt/cloud-vision-explorer

COPY . /opt/cloud-vision-explorer

# npm-zepto doesn't work with "--production"
#RUN npm install --production
RUN npm install

ENV MYSQL_DATABASE vision_explorer
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80

CMD [ "npm", "start" ]
