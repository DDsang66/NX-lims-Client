import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.235.8:5051/api',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' }
});

// 请求拦截器：自动带上 Access Token
api.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers['accessToken'] = accessToken;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  res => res,
  error => {
    console.log(error);
    const { response } = error;
    if (!response) {
      // 后端没有任何响应
      console.log('后端没有任何响应');
      return Promise.reject(error)
    }
    // 错误的处理才是我们需要最关注的
    errorHandle(response.status, response.info)
    return Promise.reject(error)
  }
)
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

export default api;

