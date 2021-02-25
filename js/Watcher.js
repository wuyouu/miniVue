class Watcher {
  constructor (vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb

    // 由于 Dep 是在 Observer 中定义的，
    // 为了能够通知 Dep 添加当前观察者，需要触发 Getter

    // 为了避免其他操作导致 Getter 触发也会添加观察者，将 Watch 实例记录在 Dep 属性中
    Dep.target = this
    this.oldValue = vm[key]
    // 操作完毕后清除
    Dep.target = null
  }
  // 封装数据变化时更新视图的功能
  update () {
    const newValue = this.vm[this.key]
    // 如果数据不变，无需更新
    if (newValue === this.oldValue) return
    // 调用更新后的回调
    this.cb(newValue)
  }
}