# https://docs.docker.com/config/containers/multi-service_container/

# https://github.com/elastic/dockerfiles/blob/v7.17.6/elasticsearch/Dockerfile#L159
/bin/tini -s 1>es-logs-1.txt 2>es-logs-2.txt -- /usr/local/bin/docker-entrypoint.sh &

node server
