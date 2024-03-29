// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()
const db = cloud.database()
const blogCollection = db.collection('blog')

const MAX_LIMIT  = 100
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({event})

  app.router('list', async(ctx, next) => {
    const keyword = event.keyword
    let w = {}

    if (keyword.trim() != '') {
      w = {
        content: db.RegExp({
          regexp: keyword,
          options: 'i'
        })
      }
    }
    const total = await blogCollection.count().then((res) => res.total)
    const data = await blogCollection.where(w)
    .skip(event.start)
    .limit(event.count)
    .orderBy('createTime', 'desc')
    .get()
    .then((res) => {
      return res.data
    })
    ctx.body = {
      total,
      data
    }
  })

  app.router('detail', async(ctx, next) => {
    let blogId = event.blogId
    let detail = await blogCollection.where({
      _id: blogId
    }).get().then((res) => {
      return res.data
    })

    const countResult = await blogCollection.count()
    const total = countResult.total
    let commentList = {
      data: []
    }
    if (total > 0) {
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        let promise = db.collection('blog-comment').skip(i * MAX_LIMIT)
          .limit(MAX_LIMIT).where({blogId}).orderBy('createTime', 'desc').get()
        tasks.push(promise)
      }
      if (tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }
    }

    ctx.body = {
      detail,
      commentList
    }
  })

  app.router('listbyopenid', async(ctx, next) => {
    const total = await blogCollection.where({ _openid: wxContext.OPENID}).count().then((res) => res.total)
    const data = await blogCollection.where({ _openid: wxContext.OPENID })
      .skip(event.start)
      .limit(event.count)
      .orderBy('createTime', "desc")
      .get()
      .then((res) => {
        return res.data
      })

    ctx.body = {
      total,
      data
    }
  })

  return app.serve()
}