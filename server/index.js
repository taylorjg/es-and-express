const express = require("express")
const axios = require("axios")

const PORT = process.env.PORT ?? 3045

const main = async () => {
  try {
    const response = await axios.get("http://localhost:9200/products/_search?pretty")
    console.log("response.data", response.data)
  } catch (error) {
    console.log("error.message:", error.message)
  }

  const app = express()
  app.get("*", (req, res) => {
    const { method, url } = req
    console.log(`${method} ${url}`)
    res.send("Hello")
  })
  app.listen(PORT, () => console.log(`listening on port ${PORT}`))
}

main()
