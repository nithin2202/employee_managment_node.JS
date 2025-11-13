const express = require("express");
const app = express();
const dotenv = require("@dotenvx/dotenvx");
dotenv.config({ path: "./.env", envKeysFile: './.env.keys' });
app.use(express.json());
const routes=require("./src/routes/app");
app.use("/", routes);


const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});