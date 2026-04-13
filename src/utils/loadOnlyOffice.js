import request from "@/utils/request.js";
//if (window.DocsAPI) {
//  console.log('OnlyOffice SDK already loaded');
//}else{
//  const script = document.createElement('script');
//  script.src = request.documentSrc;
//  script.async = true;
//  script.onload = () => {
//    // console.log('OnlyOffice SDK loaded successfully');
//  };
//  script.onerror = () => {
//    console.error('Failed to load OnlyOffice SDK');
//  };

//  document.head.appendChild(script);
//}

let loadPromise = null; // 缓存 Promise，避免重复加载

export default function loadOnlyOfficeScript() {
  // 1. 如果已经加载完成，直接返回成功
  if (window.DocsAPI) {
    return Promise.resolve(window.DocsAPI);
  }

  // 2. 如果正在加载中，返回同一个 Promise 实例
  if (loadPromise) {
    return loadPromise;
  }

  // 3. 开始加载，并创建 Promise
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = request.documentSrc; // 确保这个 URL 是正确的
    script.async = true;

    script.onload = () => {
      // 加载成功后，检查全局变量是否存在
      if (window.DocsAPI) {
        console.log('OnlyOffice SDK loaded successfully');
        resolve(window.DocsAPI);
      } else {
        reject(new Error('Script loaded but DocsAPI not found'));
      }
    };

    script.onerror = () => {
      console.error('Failed to load OnlyOffice SDK');
      reject(new Error('Failed to load script'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

