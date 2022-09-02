const express = require("express")

const PORT = process.env.PORT ?? 3045

const main = () => {
  const app = express()
  app.get("*", (req, res) => {
    const { method, url } = req
    console.log(`${method} ${url}`)
    res.send("Hello")
  })
  app.listen(PORT, () => console.log(`listening on port ${PORT}`))
}

main()
