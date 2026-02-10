# FROM node:16.20-bullseye-slim

# RUN mkdir -p  /usr/src/hnmapi
# ADD ./package.json package-lock.json /hnmapi/
# WORKDIR /hnmapi
# RUN npm install
# ADD . /hnmapi/
# ENV PORT=80
# EXPOSE 80
# CMD ["npm","start"]

FROM node:18-alpine

RUN mkdir -p  /usr/src/hnmtest
ADD ./package.json package-lock.json /hnmtest/
WORKDIR /hnmtest
RUN npm install
ADD . /hnmtest/
ENV PORT=80
EXPOSE 80
CMD ["npm","start"]