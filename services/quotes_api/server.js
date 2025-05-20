const tracer = require("dd-trace").init();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const quotes = [
  '"Why don\'t programmers like nature? It has too many bugs." - Jonny Java',
  '"I was gonna tell you a joke about UDP... ...but you might not get it." - Ursula UDP',
  '"Why do programmers always mix up Christmas and Halloween? Because Oct 31 == Dec 25." - Octavia Octal',
  '"There are 10 types of people in the world: those who understand binary, and those who don\'t." - Bianca Binary',
  '"Why do programmers prefer iOS development? Because on iOS, there are no Windows or Gates." - Isaac iOS',
  '"Why don\'t programmers like to go outside? The sunlight causes too many glares on their screens." - Sidney Screen',
  '"I would love to change the world, but they won\'t give me the source code." - Sasha Source',
  '"How do you comfort a JavaScript bug? You console it." - Jerry JavaScript',
  '"Why did the web developer walk out of the restaurant? Because of the table layout." - Wendy Webdev',
  '"Why was the JavaScript developer sad? Because he didn\'t Node how to Express himself." - Noah Node.js',
  '"Why did the programmer go broke? Because he used up all his cache." - Casey Cache',
  '"Why did the React class component feel relieved? Because it was now off the hook." - Rachel React',
  "\"Why couldn't the programmer dance at the party? He didn't get Arrays.\" - Arthur Array",
];

app.get("/quote", async (req, res) => {
  let randomIndex = Math.floor(Math.random() * quotes.length);

  // 1 in 10 chance of error
  if (Math.random() < 0.1) {
    console.log("Error: 500");
    res.status(500).json({ error: "Internal Server Error" });
    return;
  }

  // add 1 in 20 chance of delay
  if (Math.random() < 0.05) {
    console.log("Delay: 3000");
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  res.json({ quote: quotes[randomIndex] });
});

app.listen(port, () => {
  console.info(`Server is running at http://localhost:${port}`);
});
