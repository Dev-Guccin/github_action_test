const { randomInt } = require('crypto')
const data = require('./food.json')

let random = randomInt(data.length)
console.log(data[random])
