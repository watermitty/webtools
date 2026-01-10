import { defineStore } from 'pinia'

export const useComponentStore = defineStore('component', {
  //用来存放变量
  state: () => ({
    leftCom: false,
    leftComDrawer: false,
    activeCategory: '', // 新增：当前活跃的分类ID
    isJumping: false, // 新增：是否正在进行程序化滚动
  }),
  //方法
  actions: {
    //设置当前是否正在滚动跳转
    setIsJumping(status: boolean) {
      this.isJumping = status
    },
    //设置左侧组件状态
    setLeftComStatus(status: boolean) {
      // console.log(1)
      this.leftCom = status
    },
    //设置左侧组件状态(小屏)
    setleftComDrawerStatus(status: boolean) {
      // console.log(2)
      this.leftComDrawer = status
    },
    //设置当前活跃的分类
    setActiveCategory(categoryId: string) {
      this.activeCategory = categoryId
    }
  }
})