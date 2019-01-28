const fs = require('fs')
const xmlbuilder = require('xmlbuilder')

const packagePath = './metadata/package.xml'
const config = {
  version: '1.0',
  encoding: 'UTF-8'
}

const initPackage = apiVersion => {
  return {
    Package: {
      '@xmlns': 'http://soap.sforce.com/2006/04/metadata',
      version: apiVersion,
      types: []
    }
  }
}

const createDocument = (metadata, apiVersion) => {
  const stub = initPackage(apiVersion)

  return metadata.reduce((acc, mdt) => {
    const members = mdt.members
      .map(m => {
        if(mdt.type === m.fullName) {
          return { '#text': '*' }
        }
        return { '#text': m.fullName }
      })

    if (members.length > 0) {
      acc.Package.types.push({
        name: mdt.type,
        members
      })
    }
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