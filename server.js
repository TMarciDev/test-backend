import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { readdirSync } from "fs";
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// //db
mongoose
  .connect(process.env.DATABASE, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // dbName: 'myFirstDatabase'
  })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB ERROR", err));

//middleware
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
  })
);
// It wont allow any 3rd party URL. Maybe use simple app.use(cors()); ?
app.use("/api/subs/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "5mb" }));

//autoload routes
// app.get('/api/register', (req, res) => {
//     res.send('Hey man')
// });

readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Port is running on port ${port}`));
