const tracer = require("dd-trace").init();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const quotes = [
  "In the coding world, patience is not a virtue. It is a requirement. - Bob the Debugger",
  "If at first you don't succeed; call it version 1.0. - Tommy Trials",
  "Programming is 1% inspiration, 99% trying to make that inspiration work. - Patty Persistence",
  "Hardware: The part of a computer that you can kick. - Rocky Relations",
  "The best thing about a boolean is even if you are wrong, you are only off by a bit. - Billy the Bit",
];

app.get("/quote", (req, res) => {
  let randomIndex = Math.floor(Math.random() * quotes.length);
  res.json({ quote: quotes[randomIndex] });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
