const parseTypes = orgDescribe => {
  return orgDescribe.metadataObjects.map(mdt => {
    return {
      name: mdt.xmlName,
      ...mdt
    }
  })
}