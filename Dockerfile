FROM node:5

RUN mkdir -p /opt/cloud-vision-explorer
WORKDIR /opt/cloud-vision-explorer

COPY . /opt/cloud-vision-explorer

# npm-zepto doesn't work with "--production"
#RUN npm install --production
RUN npm install

ENV PORT 80
ENV MYSQL_SERVER xxx.xxx.xxx.xxx
ENV MYSQL_USER xxx
ENV MYSQL_PASSWORD xxx
ENV MYSQL_DATABASE xxx

EXPOSE 80

CMD [ "npm", "start" ]
