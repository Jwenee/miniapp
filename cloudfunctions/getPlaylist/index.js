// 云函数入口文件
const cloud = require('wx-server-sdk')
const rp = require('request-promise')


const URL = 'http://musicapi.xiecheng.live/personalized'

cloud.init()
// 云函数端使用不需要wx开头，数据库需要在初始化后使用。
const db = cloud.database()

const playlistCollection = db.collection('playlist')
const MAX_LIMIT = 100
// 云函数入口函数
exports.main = async (event, context) => {
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)

  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if (tasks.length > 0 ) {
    list = await Promise.all(tasks).ruduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
  const playlist = await rp(URL).then((res) => {
    return JSON.parse(res).result
  })
// 获取数据和数据库中的比较去重
  const newData = []
  for (let i = 0; i < playlist.length; i++) {
    let flag = true
    for (let j = 0; j < list.data.length; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false
        break
      }     
    }
    if (flag) {
      newData.push(playlist[i])
    }
    
  }

  for (let i = 0; i < newData.length; i++) {
    await playlistCollection.add({
      data: {
        ...newData[i],
        createTime: db.serverDate(),
      }
    }).then((res) => {
      console.log('success')
    }).catch((err) => {
      console.error('fail')
    }) 
  }

  return newData.length
}