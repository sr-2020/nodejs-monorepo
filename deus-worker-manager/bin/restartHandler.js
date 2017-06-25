const fs = require('fs');

setTimeout(()=>{
    fs.writeFileSync("./models/test/reloadFlag.ts","{ }",{ flag: "w"});
}, 5000);