const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const routes = require('./routes');
const { setupWebsocket } = require('./websocket');

const app = express();

const server = http.Server(app);

setupWebsocket(server);


mongoose.connect('url_do_mongo_db/dd', {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  });

app.use(cors());
app.use(express.json());
app.use(routes);


server.listen(3333);