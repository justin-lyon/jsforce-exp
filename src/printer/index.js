const jsonWriter = require('./json-writer')
const xmlWriter = require('./xml-writer')

module.exports = {
  ...jsonWriter,
  ...xmlWriter
}