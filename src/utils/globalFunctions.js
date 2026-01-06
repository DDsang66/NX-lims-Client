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
  //日期格式化
  formatDate: (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },
  //先转换为Date对象，再格式化
  stringTimeFormat(date){
    return globalFunctions.formatTime(new Date(date))
  },
  //无论是Date还是String，转化为datetimeoffset格式
  toDateTimeOffset: (date) => {
    if (!date) return '';
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
    if (!value) {
      return '-'
    }
    return globalFunctions.formatTime(new Date(value))
  },
  //表格空值处理和日期格式化
  strDateColumnFormatter: (row, column, value) => {
    if (!value) {
      return '-'
    }
    return globalFunctions.formatDate(new Date(value))
  },
  //买家名转小写，并去除空格
  cleanAndLowercase:(str)=> {
  if (typeof str !== 'string') {
    throw new Error('输入必须是字符串');
  }
  return str.replace(/\s+/g, '').toLowerCase();
  },
  // 二分排序插入(默认字典升序排序)修改原数组
  sortInsertArray:(array, item, compareFn)=>{
  // 如果没有提供比较函数，默认按本地语言环境字符串排序
  const comparator = compareFn || ((a, b) => String(a).localeCompare(String(b)));
  // 处理空数组情况
  if (array.length === 0) {
    array.push(item);
    return;
  }
  // 二分查找：找到第一个 >= item 的位置（即插入点）
  let left = 0;
  let right = array.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    // 如果 array[mid] < item，则插入点在右半部分
    if (comparator(array[mid], item) < 0) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  // 在 left 位置插入 item
  array.splice(left, 0, item);
}
}
export default globalFunctions;
