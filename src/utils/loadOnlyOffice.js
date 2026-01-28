import request from "@/utils/request.js";
if (window.DocsAPI) {
  console.log('OnlyOffice SDK already loaded');
}else{
  const script = document.createElement('script');
  script.src = request.documentSrc;
  script.async = true;
  script.onload = () => {
    // console.log('OnlyOffice SDK loaded successfully');
  };
  script.onerror = () => {
    console.error('Failed to load OnlyOffice SDK');
  };

  document.head.appendChild(script);
}

