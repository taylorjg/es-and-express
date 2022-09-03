FROM elasticsearch:7.17.6

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

COPY package.json .
COPY package-lock.json .
RUN npm clean-install

COPY products.json .
COPY server server

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# from /etc/passwd:
# elasticsearch:x:1000:1000:,,,:/usr/share/elasticsearch:/bin/bash
# USER 1000:0
USER elasticsearch

CMD ["./entrypoint.sh"]
