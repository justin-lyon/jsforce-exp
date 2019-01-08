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
    // if (mdt.members.typeof !== 'array') {
    //   acc.package.types.push({
    //     name: mdt.type,
    //     members: [mdt.members]
    //   })
    //   return acc
    // }
    //console.log('mdt: ', JSON.stringify(mdt, null, 2))
    const members = util.readMembers(mdt)
      .filter(m => m.manageableState && m.manageableState !== 'installed')
      .map(m => {
        console.log(mdt.type, m)
        return m
      })
      .map(m => m.fullName)
      .map(name => ({'#text': name}))
    acc.package.types.push({
      name: mdt.type,
      members
    })
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