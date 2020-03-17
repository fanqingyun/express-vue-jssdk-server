// 该模块用于建立微信服务器与项目服务器的连接：当我们在微信公众号开发者界面填写项目服务器地址，点击提交时，微信服务器会向本地服务器发起验证请求
const sha1 = require('sha1')
const config = require('../config')
const { token } = config
// 微信服务器会向项目服务器发送2种请求，post和get,get请求用于验证服务器的有效性，post请求不发送echostr,前端也会向项目服务器发送请求
// 验证签名
module.exports = () => {
  return async (req, res, next) => {
    // 验证签名
    const { signature, echostr, timestamp, nonce } = req.query
    // 进行字典排序并拼接,sha1加密
    let str = sha1([timestamp, nonce, token].sort().join(''))
    // 这里应该判断请求是来自微信服务器还是前端浏览器，暂时这样判断，有误
    if (signature) {
      if (str !== signature) {
        res.end('error')
        console.log('签名验证失败')
      } else {
        if (req.method === 'GET') {
          res.send(echostr)
          console.log('签名验证成功')
        } else if (req.method === 'POST') {
          res.end('error')
          console.log('post请求')
        }
      }
    }
    next()
  }
}
//