const jsforce = require('jsforce')
const fs = require('fs')

const typesPath = './src/metadata/types.json'
const itemsPath = './src/metadata/items.json'
const itemsRoot = './src/metadata/items/'

const config = require('./config/sf.config')
const creds = require('./config/sf.creds')
const ignoredTypes = require('./config/ignored.types')

const conn = new jsforce.Connection(config)

const testTypes = [
  { type: 'ApexClass', folder: null },
  { type: 'AuraDefinitionBundle', folder: null },
  { type: 'StaticResource', folder: null }
]

const describeTypes = conn => {
  return new Promise((resolve, reject) => {
    conn.metadata.describe(config.version, (err, result) => {
      if (err) reject(err)

      resolve(result)
    })
  })
}

const writeTypes = orgDescribe => {
  return new Promise((resolve, reject) => {
    const typesWriter = fs.createWriteStream(typesPath)

    typesWriter.write(JSON.stringify(orgDescribe, null, 2))
    typesWriter.end()
    resolve(orgDescribe)
  })
}

const listByType = (conn, types) => {
  return new Promise((resolve, reject) => {
    conn.metadata.list(types, config.version, (err, metadata) => {
      if (err) reject(err)

      resolve(metadata)
    })
  })
}

const writeLists = fileDescribe => {
  return new Promise((resolve, reject) => {
    const itemsWriter = fs.createWriteStream(itemsPath)

    itemsWriter.write(JSON.stringify(fileDescribe, null, 2))
    itemsWriter.end()
    resolve()
  })
}

const promisifyType = (conn, type) => {
  return new Promise((resolve, reject) => {
    conn.metadata.list([type], config.version, (err, result) => {
      if (err) reject(err)

      resolve({
        type: type.type,
        items: result
      })
    })
  })
}

const promisifyDescribes = (conn, orgDescribe) => {
  return Promise.all(orgDescribe.metadataObjects
    .filter(mdt => !mdt.inFolder)
    .map(mdt => ({
      type: mdt.xmlName,
      folder: null
    }))
    .map(type => {
      return promisifyType(conn, type)
    }))
}

console.log('logging in')
conn.login(creds.username, creds.password, (err, userInfo) => {
  if (err) {
    console.error('Error logging in: ', err)
    return
  }

  console.log('UserInfo: ', JSON.stringify(userInfo, null, 2))

  describeTypes(conn)
    .then(result => {
      return promisifyDescribes(conn, result)
    })
    .then(results => {

      const hasResults = results
        .filter(r => !ignoredTypes.includes(r.type))
        .filter(r => !!r.items)
        .map(r => {
          return new Promise((resolve, reject) => {
            const itemWriter = fs.createWriteStream(itemsRoot + r.type + '.json')
            itemWriter.write(JSON.stringify(r, null, 2))
            itemWriter.end()
            resolve()
          })
        })

      return Promise.all(hasResults)
    })
    .then(() => {
      console.log('done.')
    })
})