const fs = require('fs')
const xmlbuilder = require('xmlbuilder')

const util = require('../salesforcer')

const packagePath = './metadata/package.xml'
const config = {
  version: '1.0',
  encoding: 'UTF-8'
}

const initPackage = apiVersion => {
  return {
    package: {
      version: apiVersion,
      types: []
    }
  }
}

const createDocument = (metadata, apiVersion) => {
  const stub = initPackage(apiVersion)

  // console.log('metadata: ', JSON.stringify(metadata, null, 2))
  return metadata.reduce((acc, mdt) => {
    // console.log('xmlwriter mdt: ', JSON.stringify(mdt, null, 2))

    const members = []
    if (mdt.members.length === 0) {
      members.push({ '#text': '*' })
      acc.package.types.push({
        name: mdt.type,
        members
      })
    }

    // const members = mdt.members
    //   .map(m => ({'#text': m.fullName || '*'}))

    if(members.length === 0) {
      members.push({ '#text': '*' })
    }
    // acc.package.types.push({
    //   name: mdt.type,
    //   members
    // })
    return acc
  }, stub)
}

const buildPackage = (metadata, apiVersion) => {
  return new Promise((resolve, reject) => {
    try {

      const writer = fs.createWriteStream(packagePath)
      const pkg = createDocument(metadata, apiVersion)
      const document = xmlbuilder.create(pkg, config)
      writer.write(document.end({ pretty: true }))
      resolve()
    } catch(e) {
      reject(e)
    }
  })
}

module.exports = {
  buildPackage
}