const express = require('express');
const path = require('path')
const bodyParser = require('body-parser')
const sha1 = require('sha1')
// 引入appid
const { appID } = require('./config')
// 引入签名验证
const auth = require('./wechat/auth')
// 引入获取基础access_token
const BasicAccessToken = require('./wechat/basicAccessToken')
let basicAccessToken = new BasicAccessToken()
const Ticket = require('./wechat/jsapiTicket')
let ticket = new Ticket()
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

// 这2行不加则获取不到前端post请求的参数
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}))

////////////////////// 允许跨域 /////////////////////////////
// app.all('*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
//   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//   res.header("X-Powered-By",' 3.2.1')
//   if(req.method=="OPTIONS") res.send(200);/*让options请求快速返回*/
//   else  next();
// })

// 中间件，如果执行了next,则会往下匹配,use是模糊匹配，只要匹配到开头的部分即可，如路径是/index/1可以匹配到/index
// 签名验证
app.use(auth())
// 获取基础access_token和jsapi_ticket
app.use(async (req, res, next) => {
  await basicAccessToken.fetchAccessToken()
  await ticket.fetchTicket(basicAccessToken.access_token)
  next()
})
app.post('/about', (req, res)=> {
   // 验证jsapi_ticket
   noncestr = Math.random().toString(36).substr(2, 15)
   jsapi_ticket = ticket.ticket
   timestamp = parseInt(Date.now() / 1000).toString()
  //  http://localhost:8090穿透为http://33d15c67.ngrok.io
  //  url = 'http://localhost:8090/web/#/child'
  //  url = 'http://33d15c67.ngrok.io/web/#/child'
   url = req.body.url
   signature = sha1([`jsapi_ticket=${jsapi_ticket}`, `noncestr=${noncestr}`, `timestamp=${timestamp}`, `url=${url}`].sort().join('&'))
   res.json({ noncestr, timestamp, signature, appID })
})
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   // res.render('error');
//   next()
// });


module.exports = app;