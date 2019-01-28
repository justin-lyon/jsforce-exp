const fs = require('fs')

const typesPath = './metadata/types.json'
const membersRoot = './metadata/members/'

const writeMetadataTypes = orgDescribe => {
  return new Promise((resolve, reject) => {
    const typesWriter = fs.createWriteStream(typesPath)

    typesWriter.write(JSON.stringify(orgDescribe, null, 2))
    typesWriter.end()
    resolve(orgDescribe)
  })
}

const writeMember = mdt => {
  return new Promise((resolve, reject) => {
    const memberWriter = fs.createWriteStream(membersRoot + mdt.type + '.json')
    memberWriter.write(JSON.stringify(mdt, null, 2))
    memberWriter.end()
    resolve()
  })
}

module.exports = {
  writeMetadataTypes,
  writeMember
}