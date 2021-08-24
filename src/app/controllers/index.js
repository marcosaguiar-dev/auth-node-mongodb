const fs = require('fs');
const path = require('path');

module.exports = server =>{
    fs
        .readdirSync(__dirname) // ler um diretório, nesse caso a pasta atual
        //começa filtrando arquivos que não começam com ponto, tipo .env, e nem o
        // arquivo index.js, que é o arquivo atual
        .filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
        .forEach(file => require(path.resolve(__dirname, file))(server));
}