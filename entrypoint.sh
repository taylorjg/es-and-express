# https://docs.docker.com/config/containers/multi-service_container/

echo "Hello from entrypoint.sh"
ls -al

# https://github.com/elastic/dockerfiles/blob/v7.17.6/elasticsearch/Dockerfile#L159
# /bin/tini -s -- /usr/local/bin/docker-entrypoint.sh &

node server &

wait -n
exit $?
