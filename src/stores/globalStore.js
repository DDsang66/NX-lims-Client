import { defineStore } from 'pinia';

export const globalStore = defineStore('global', {
  state: () => ({
    language: 'English',
  }),
  getters: {},
  actions: {
    setLanguage(lang) {
      this.language = lang;
    },
    changeLanguage() {
      if (this.language === 'English') {
        this.language = '中文'
      } else {
        this.language = 'English'
      }
    }
  }
});
