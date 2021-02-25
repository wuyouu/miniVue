class Dep {
  constructor () {
    // 存储订阅者
    this.subs = []
  }
  // 封装添加订阅者方法
  addSub (sub) {
    // 订阅者需要在接到通知后进行更新操作，必需存在 update()
    if (sub && sub.update) {
      // 将订阅者添加
      this.subs.push(sub)
    }
  }
  // 封装通知订阅者的方法
  notify () {
    this.subs.forEach(sub => {
      // 通知订阅者进行更新
      sub.update()
    })
  }
}