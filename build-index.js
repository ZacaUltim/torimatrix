const fs = require("fs")
const dir = "topics"

const names = fs.readdirSync(dir)
    .filter(f => f.endsWith(".json") && f !== "topics.json")
    .map(f => f.slice(0, -5))
    .sort()

fs.writeFileSync(`${dir}/topics.json`, JSON.stringify(names, null, 4) + "\n")
console.log(names)