class Observer {
  constructor (data) {
    this.data = data
    // 对传入的 data 进行遍历
    this.walk(data)
  }
  // 封装用于数据遍历的方法
  walk (data) {
    // 遍历，并对所有属性调用转换方法进行数据劫持
    Object.keys(data).forEach(key => this.convert(key, data[key]))
  }
  // 封装用于将对象转换为响应式数据的方法（数据劫持）
  convert (key, value) {
    // 通过私有函数进行处理
    defineReactive(this.data, key, value)
  }
}

// 定义私有函数用于对当前 属性值 进行数据劫持
function defineReactive (data, key, value) {
  // * 引入 Dep 并创建实例
  const dep = new Dep()

  // 检测当前属性值，如果为对象，则创建新的 Observer 实例处理
  // if (typeof value === 'object' && value !== null) { return new Observer(value) }
  observer(value)

  // 非对象类型进行正常处理，对 data 的属性进行数据劫持
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get () {
      console.log('访问了属性')
      // * 在触发 Getter 同时 Dep.target 为 Watcher 实例时添加订阅者
      Dep.target && dep.addSub(Dep.target)
      return value
    },
    set (newValue) {
      // 检测新旧值是否相同
      if (newValue === value) return
      // 如果不相同，则赋值
      data[key] = value
      // 检测新值是否为对象，并进行相应处理（与前面的操作相同，封装）
      observer(newValue)
      // * 引入 Dep，通知订阅者
      dep.notify()
    }
  })
}

function observer (value) {
  if (typeof value === 'object' && value !== null) { return new Observer(value) }
}