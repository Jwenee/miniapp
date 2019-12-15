// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const rp = require('request-promise')

const BASE_URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({ event })

  app.router('playlist', async(ctx, next) => {
    const total = await cloud.database().collection('playlist').count().then((res) => res.total)
    const data = await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.count)
      .orderBy("createTime", "desc")
      .get()
      .then((res) => {
        return res.data
      })

    ctx.body = {
      total,
      data
    }
  })

  app.router('musiclist', async(ctx, next) => {
    const url = `${BASE_URL}/playlist/detail?id=${parseInt(event.playlistId)}`
    ctx.body = await rp(url).then((res) => {
      return JSON.parse(res)
    })
  })

  app.router('musicurl', async(ctx, next) => {
    const url = `${BASE_URL}/song/url?id=${event.musicId}`
    ctx.body = await rp(url).then((res) => {
      return res
    })
  })

  app.router('lyric', async(ctx, next) => {
    const url = `${BASE_URL}/lyric?id=${event.musicId}`
    ctx.body = await rp(url).then((res) => {
      return res
    })
  })

  return app.serve()
}