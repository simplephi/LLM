const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const commandRoutes = require("./commands/command");

const app = express();
const port = 3000;

const middleware = require('./auth/middlewares');
const auth = require('./auth');


app.use(bodyParser.json());
app.use(middleware.checkTokenSeetUser);

app.use(cors({
  // origin : 'http://localhost:8081'
  origin : '*'
}));


app.get('/', (req, res) => {
  res.json({
    message: 'Hello LLM'
  });
});


app.use('/auth', auth);

// app.use("/commands", commandRoutes);

app.use("/commands", middleware.isLoggedIn, commandRoutes);



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
