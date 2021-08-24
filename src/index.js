const express = require('express');

const server = express();
server.use(express.json());


require('./app/controllers/index')(server);

const port = 3000;


server.listen(port, () =>{
    console.log('API ONLINE - PORTA 3000');
});
