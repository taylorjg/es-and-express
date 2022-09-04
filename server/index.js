const express = require("express")
const axios = require("axios")
const fs = require("fs").promises
const path = require("path")
const packageJson = require("../package.json")

const PORT = process.env.PORT ?? 3045

const ES_URL = "http://localhost:9200"

axios.defaults.baseURL = ES_URL

const range = n => Array.from(Array(n).keys())
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const waitForElasticsearchToComeUp = async () => {
  const MAX_RETRIES = 60
  const attempts = range(MAX_RETRIES).map(n => n + 1)
  for (const attempt of attempts) {
    try {
      console.log(`[waitForElasticsearchToComeUp] attempt ${attempt}`)
      await axios.get()
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
  await axios.put("/products")
  await axios.post("/products/washers/_bulk", data, config)
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
  const env = process.env
  res.json({ version, description, env })
}

const getCreateProducts = async (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  try {
    await waitForElasticsearchToComeUp()
    await createProductsIndex()
    res.json({ success: true })
  } catch (error) {
    console.log(`[getCreateProducts] ERROR: ${error.message}`)
    res.json({ success: false, errorMessage: error.message })
  }
}

const getProducts = async (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  try {
    const response = await axios.get("/products/_search?size=1")
    res.json(response.data)
  } catch (error) {
    console.log(`[getProducts] ERROR: ${error.message}`)
    res.json({ errorMessage: error.message })
  }
}

const getCat = async (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  try {
    const response = await axios.get("/_cat")
    res.send(response.data)
  } catch (error) {
    console.log(`[getCat] ERROR: ${error.message}`)
    res.json({ errorMessage: error.message })
  }
}

const getInfo = async (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  try {
    const response = await axios.get()
    res.json(response.data)
  } catch (error) {
    console.log(`[getInfo] ERROR: ${error.message}`)
    res.json({ errorMessage: error.message })
  }
}

const getLogs = async (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  try {
    const fileName1 = path.resolve(__dirname, "..", "es-logs-1.txt")
    const fileName2 = path.resolve(__dirname, "..", "es-logs-2.txt")
    const buffer1 = await fs.readFile(fileName1)
    const buffer2 = await fs.readFile(fileName2)
    const logs1 = buffer1.toString()
    const logs2 = buffer2.toString()
    const divider = "\n" + "-".repeat(80) + "\n"
    const combinedLogs = logs1 + divider + logs2
    res.send(combinedLogs)
  } catch (error) {
    console.log(`[getLogs] ERROR: ${error.message}`)
    res.json({ errorMessage: error.message })
  }
}

const getWildcard = (req, res) => {
  const { method, url } = req
  console.log(`${method} ${url}`)
  res.send("Hello")
}

const main = async () => {
  const app = express()
  app.get("/health", getHealth)
  app.get("/version", getVersion)
  app.get("/create-products", getCreateProducts)
  app.get("/products", getProducts)
  app.get("/cat", getCat)
  app.get("/info", getInfo)
  app.get("/logs", getLogs)
  app.get("*", getWildcard)
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
  // await waitForElasticsearchToComeUp()
  // await createProductsIndex()
}

main()
