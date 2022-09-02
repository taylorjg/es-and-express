# https://docs.docker.com/config/containers/multi-service_container/

# https://github.com/elastic/dockerfiles/blob/v7.17.6/elasticsearch/Dockerfile#L159
/bin/tini -s -- /usr/local/bin/docker-entrypoint.sh &

sleep 30
curl -X PUT localhost:9200/products
curl \
  -X POST \
  -H "content-type: application/json" \
  --data-binary @products.json \
  "localhost:9200/products/washers/_bulk?pretty"

sleep 5
node server &

wait -n
exit $?
