// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const wxacodeResult = await cloud.openapi.wxacode.getUnlimited({
    scene: wxContext.OPENID
  })

  const uploadResult = await cloud.uploadFile({
    cloudPath: `wxcode/${Date.now()}-${Math.random()*10000}.png`,
    fileContent: wxacodeResult.buffer
  })

  return uploadResult.fileID
}