FROM elasticsearch:7.17.6

# RUN apt-get update
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

COPY package.json .
COPY package-lock.json .
COPY server server

RUN npm clean-install

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

CMD ./entrypoint.sh
