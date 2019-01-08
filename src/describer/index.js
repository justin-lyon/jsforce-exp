const getMembers = members => {
  if(Array.isArray(members)) {
    return members
  }
  return [members]
}

const filterToUnmanaged = members => {
  if (!members) console.log('members', members)
  return getMembers(members).filter(m => !!m.manageableState && m.manageableState !== 'installed')
}

module.exports = (conn, apiVersion) => {
  const describeMetadata = () => {
    return new Promise((resolve, reject) => {
      conn.metadata.describe(apiVersion, (err, result) => {
        if (err) reject(err)

        resolve(result)
      })
    })
  }

  const describeOneMember = type => {
    return new Promise((resolve, reject) => {
      conn.metadata.list([type], apiVersion, (err, allMembers) => {
        if (err) reject(err)

        try {
          //const members = filterToUnmanaged(allMembers)
          resolve({
            type: type.type,
            members: allMembers
          })

        } catch(e) {
          console.error(`Error for type: ${type.type}`, e)
          reject(e)
        }
      })
    })
  }

  const describeMembers = orgDescribe => {
    return Promise.all(orgDescribe.metadataObjects
      .filter(mdt => !mdt.inFolder)
      .map(mdt => ({
        type: mdt.xmlName,
        folder: null
      }))
      .map(type => {
        return describeOneMember(type)
      }))
  }

  return {
    describeMetadata,
    describeMembers
  }
}