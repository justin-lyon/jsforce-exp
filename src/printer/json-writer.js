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

const writeMember = member => {
  return new Promise((resolve, reject) => {
    const memberWriter = fs.createWriteStream(membersRoot + member.type + '.json')
    memberWriter.write(JSON.stringify(member, null, 2))
    memberWriter.end()
    resolve()
  })
}

module.exports = {
  writeMetadataTypes,
  writeMember
}