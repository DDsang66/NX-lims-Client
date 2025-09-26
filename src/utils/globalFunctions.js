var globalFunctions={
    //时间格式化
    formatTime:(date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')  // 月份从0开始，+1
      const day = String(date.getDate()).padStart(2, '0')
      const hour = String(date.getHours()).padStart(2, '0')
      const minute = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hour}:${minute}`
    },
    //空值展示处理
    emptyDisplay:(row,column,value) => {
      if (!value) {
        return '-'
      }
      return value
    }
}
export default globalFunctions;
