class Vue {
  // 创建 Vue 实例传入选项对象
  constructor (options) {
    // 1. 将选项对象中的属性保存为实例属性
    this.$options = options || {}
    this.$data = options.data || {}
    // - el 属性需要判断是否为 DOM，如果不是，则获取 DOM
    const { el } = options
    this.$el = typeof el === 'string' ? document.querySelector(el) : el

    // 2. 将 data 的属性转换为 Getter、Setter 并注入到 Vue 实例中
    _proxyData(this, this.$data)
  }
}

// 用于将 data 的属性代理给 Vue 实例的私有函数
function _proxyData (target, data) {
  Object.keys(data).forEach(key => {
    // 注入到 Vue 实例中
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get () {
        return data[key]
      },
      set (newValue) {
        data[key] = newValue
      }
    })
  })
}