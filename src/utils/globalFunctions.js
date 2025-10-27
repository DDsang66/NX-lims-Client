var globalFunctions={
  //时间格式化
  formatTime: (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')  // 月份从0开始，+1
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${minute}`
  },
  //先转换为Date对象，再格式化
  stringTimeFormat(date){
    return globalFunctions.formatTime(new Date(date))
  },
  //转化为datetimeoffset格式
  toDateTimeOffset: (date) => {
    if (!date) return '-';
    if (date instanceof Date) {
      return date.toISOString();
    } else {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
      return parsedDate.toISOString();
    }
  },
  //表格空值展示处理
  emptyDisplay: (row, column, value) => {
    if (!value) {
      return '-'
    }
    return value
  },
  //表格空值处理和时间格式化
  strTimeColumnFormatter: (row, column, value) => {
    return globalFunctions.formatTime(new Date(value))
  }
}
export default globalFunctions;
