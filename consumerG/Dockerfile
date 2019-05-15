FROM ubuntu

WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update

RUN apt-get -y upgrade

RUN apt-get install -y npm

RUN apt-get install -y nodejs

RUN npm install amqplib



COPY . .

#EXPOSE 8000

CMD ["npm","start"]

