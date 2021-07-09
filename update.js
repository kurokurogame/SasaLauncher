if(process.argv.length > 2){
    let data = require('./package.json')
    data.version = process.argv[2]
    require('fs-extra').writeJSONSync('./package.json',data,{spaces:4})
}