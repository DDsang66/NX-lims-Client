declare module '*.png' {
  const value: string;
  export default value;
}
declare module '*.svg';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.webp';
import axios from 'axios';

declare module 'vue/types/vue' {
  interface Vue {
    $axios: typeof axios;
  }
}
