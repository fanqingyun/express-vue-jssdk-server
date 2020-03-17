//引入xml2js，将xml数据转化成js对象
const {parseString} = require('xml2js')
module.exports = {
  getUserDataAsync (req) {
    // 接收流式数据
    let xmlData = ''
    return new Promise((resolve, reject) => {
      req.on('data', data => {
        // 接收的是buffer,使用toString转为字符串
        xmlData += data.toString()
      }).on('end', () => {
        resolve(xmlData)
      }) 
    })
  },
  parseXMLAsync (xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, {trim: true}, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject('parseXMLAsync方法出了问题:' + err)
        }
      })
    })
  },
  formatMessage (jsData) {
    let message = {};
    //获取xml对象
    jsData = jsData.xml
    //判断数据是否是一个对象
    if (typeof jsData === 'object') {
      //遍历对象
      for (let key in jsData) {
        //获取属性值
        let value = jsData[key]
        //过滤掉空的数据
        if (Array.isArray(value) && value.length > 0) {
          //将合法的数据复制到message对象上
          message[key] = value[0]
        }
      }
    
    }
    return message
  }
}