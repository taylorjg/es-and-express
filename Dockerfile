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

# If we don't do this, we get the following error when running
# on render.com (but not locally):
# chroot: cannot change root directory to '/': Operation not permitted
USER elasticsearch

CMD ["./entrypoint.sh"]
