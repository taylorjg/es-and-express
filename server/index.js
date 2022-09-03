const express = require("express")
const axios = require("axios")
const fs = require("fs").promises
const path = require("path")
const packageJson = require("../package.json")

const PORT = process.env.PORT ?? 3045

const range = n => Array.from(Array(n).keys())
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const waitForElasticsearchToComeUp = async () => {
  const MAX_RETRIES = 60
  const attempts = range(MAX_RETRIES).map(n => n + 1)
  for (const attempt of attempts) {
    try {
      console.log(`[waitForElasticsearchToComeUp] attempt ${attempt}`)
      await axios.get("http://localhost:9200")
      console.log("[waitForElasticsearchToComeUp] Elasticsearch is up")
      return
    } catch (error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.log("[waitForElasticsearchToComeUp] waiting for Elasticsearch...")
        await delay(1000)
      } else {
        console.log(`[waitForElasticsearchToComeUp] ERROR: ${error.message}`)
        return
      }
    }
  }
}

const createProductsIndex = async () => {
  const fileName = path.resolve(__dirname, "..", "products.json")
  const buffer = await fs.readFile(fileName)
  const data = buffer.toString()
  const config = {
    headers: {
      "content-type": "application/x-ndjson"
    }
  }
  await axios.put("http://localhost:9200/products")
  await axios.post("http://localhost:9200/products/washers/_bulk", data, config)
}

const getHealth = (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  res.json({ status: "available" })
}

const getVersion = (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  const { version, description } = packageJson
  res.json({ version, description })
}

const getCreateProducts = async (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  try {
    await waitForElasticsearchToComeUp()
    await createProductsIndex()
    res.json({ success: true })
  } catch (error) {
    res.json({ success: false, errorMessage: error.message })
  }
}

const getProducts = async (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  try {
    const response = await axios.get("http://localhost:9200/products/_search?size=1")
    res.json(response.data)
  } catch (error) {
    res.json({ errorMessage: error.message })
  }
}

const getCat = async (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  try {
    const response = await axios.get("http://localhost:9200/_cat")
    res.send(response.data)
  } catch (error) {
    res.json({ errorMessage: error.message })
  }
}

const getWildcard = (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  res.send("Hello")
}

const main = async () => {
  // await waitForElasticsearchToComeUp()
  // await createProductsIndex()

  const app = express()

  app.get("/health", getHealth)
  app.get("/version", getVersion)
  app.get("/create-products", getCreateProducts)
  app.get("/products", getProducts)
  app.get("/cat", getCat)
  app.get("*", getWildcard)

  app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
}

main()
