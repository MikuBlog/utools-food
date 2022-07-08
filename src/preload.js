const axios = require('axios');

function transform(value) {
   switch (value) {
      case 1:
         return {
            level: '推荐',
            icon: './assets/good.png'
         };
      case 2:
         return {
            level: '适量',
            icon: './assets/just.png'
         };
      case 3:
         return {
            level: '少吃',
            icon: './assets/bad.png'
         };
   }
}

function handleOutput(searchWord, callbackSetList) {
   axios({
      url: `https://www.mxnzp.com/api/food_heat/food/search?keyword=${encodeURIComponent(searchWord)}&page=1&app_id=lmbtgpeqlcmqmxii&app_secret=T0RmWDBaSmppQXorbFFOSXdQU0ozZz09`,
      method: "get",
   }).then(res => {
      const { code, data } = res.data;
      if (code && data.list.length) {
         callbackSetList(data.list.map(val => {
            const transformObj = transform(val.healthLevel);
            return {
               title: val.name,
               description: `卡路里：${val.calory}千卡/100g\t推荐指数：${transformObj.level}`,
               url: `https://www.baidu.com/s?wd=${encodeURIComponent(val.name)}`,
               icon: transformObj.icon,
            }
         }))
      } else {
         callbackSetList([{
            title: '暂无查询结果'
         }])
      }
   }).catch(err => {
      callbackSetList([{
         title: '暂无查询结果'
      }])
   })
}


window.exports = {
   "utools-food": {
      mode: "list",
      args: {
         enter: (action, callbackSetList) => {
            // 设置初始值
            setTimeout(() => {
               utools.setSubInputValue(action.payload);
            });
            handleOutput(action.payload, callbackSetList);
         },
         search: async (action, searchWord, callbackSetList) => {
            handleOutput(searchWord, callbackSetList);
         },
         // 用户选择列表中某个条目时被调用
         select: (action, itemData) => {
            window.utools.hideMainWindow()
            require('electron').shell.openExternal(itemData.url)
            // 保证网页正常跳转再关闭插件
            setTimeout(() => {
               window.utools.outPlugin()
            }, 500);
         },
         placeholder: '请输入食物名称',
      },
   }
}