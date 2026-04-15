import axios from 'axios';
import qs from 'qs'

//旧的请求配置
const oldConfig={
  baseURL: 'http://localhost:5051/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
}
//工厂函数
function createAxiosInstance(config){
  const instance = axios.create({
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    ...config // 允许覆盖其他默认配置
  });
  // 请求拦截器：自动带上 Access Token
  instance.interceptors.request.use(config => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['accessToken'] = accessToken;
    }
    if (config.method === 'get') {
      config.paramsSerializer = function(params) {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    }
    return config;
  }, error => {
    return Promise.reject(error);
  });
  instance.interceptors.response.use(
    res => res,
    error => {
      console.log(error);
      const { response } = error;
      if (!response) {
        // 后端没有任何响应
        console.log('后端没有任何响应');
        return Promise.reject(error)
      }
      errorHandle(response.status, response.info)
      return Promise.reject(error)
    }
  )
  return instance
}
const api = createAxiosInstance(oldConfig)
api.documentSrc="http://192.168.179.8:5130/web-apps/apps/api/documents/api.js"

const newRequest=createAxiosInstance({baseURL:"http://localhost:5102"})

//错误处理的方法
const errorHandle = (status, info) => {
  switch (status) {
    case 400:
      console.log("语义有误");
      break;
    case 401:
      console.log("服务器认证失败");
      break;
    case 403:
      console.log("服务器拒绝访问");
      break;
    case 404:
      console.log("地址错误");
      break;
    case 500:
      console.log("服务器遇到意外");
      break;
    case 502:
      console.log("服务器无响应");
      break;
    default:
      console.log(info);
      break;
  }
}
export {newRequest};
export default api;

