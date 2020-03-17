// 用于获取基础token
const { appID, appsecret } = require('../config')

const rp = require('request-promise-native')

//引入fs模块
const { writeFile, readFile } = require('fs')
class BasicAccessToken {
  constructor() {
    console.log('创建了一个对象')
  }
  // 获取accessToken
  getAccessToken () {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
    // 发送请求
    return new Promise((resolve, reject) => {
      rp({ method: 'get', url, json: true })
        .then(res => {
          // 设置过期时间，提前5分钟
          res.expires_in = Date.now() + (res.expires_in - 5 * 60) * 1000
          resolve(res)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
  // 保存accessToken
  saveAccessToken (accessToken) {
    return new Promise((resolve, reject) => {
      writeFile('./resource/basicAccessToken.txt', JSON.stringify(accessToken), err => {
        if (!err) {
          resolve()
        } else {
          reject()
        }
      })
    })
  }
  // 读取accessToken
  readAccessToken () {
    return new Promise((resolve, reject) => {
      readFile('./resource/basicAccessToken.txt', (err, data) => {
        if (!err) {
          resolve(JSON.parse(data))
        } else {
          reject()
        }
      })
    })
  }
  // accessToken是否有效
  isValidAccessToken (data = this) {
    if (!data || !data.access_token || !data.expires_in) {
      return false
    }
    return data.expires_in > Date.now()
  }
  // 获取有效的accessToken
  fetchAccessToken () {
    if (this.isValidAccessToken()) {
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }
    return this.readAccessToken()
      .then(async res => {
        if (this.isValidAccessToken(res)) {
          return Promise.resolve(res)
        } else {
          const res = await this.getAccessToken()
          await this.saveAccessToken(res)
          return Promise.resolve(res)
        }
      })
      .catch(async err => {
        const res = await this.getAccessToken()
        await this.saveAccessToken(res)
        return Promise.resolve(res)
      })
      .then(res => {
        this.access_token = res.access_token
        this.expires_in = res.expires_in
        return Promise.resolve(res)
      })
  }
}

module.exports = BasicAccessToken