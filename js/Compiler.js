class Compiler {
  constructor (vm) {
    this.el = vm.$el
    this.vm = vm
    // 初始化模板编译
    this.compile(this.el)
  }
  // 封装模板编译方法
  compile (el) {
    // 获取所有子节点
    const childNodes = el.childNodes
    // 伪数组转数组，遍历节点，检测类型
    Array.from(childNodes).forEach(node => {
      if (isTextNode(node)) {
        // 编译文本节点内容
        this.compileText(node)
      } else if (isElementNode(node)) {
        // 编译元素节点内容
        this.compileElement(node)
      }
      // 进行元素节点操作时还需要考虑，如果存在子节点，则需要递归调用 compile
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  // 封装文本节点编译方法
  compileText (node) {
    // 文本节点直接检测是否存在插值表达式 {{}} 即可，此处使用正则
    // 考虑到一个文本节点中可能存在多个插值表达式，应处理所有满足规则的情况
    // 需要给正则添加匹配模式 g，并通过 exec() 处理
    const reg = /\{\{(.+?)\}\}/g
    // 去除内容中不必要的空格
    const value = node.textContent.replace(/\s/g, '')
    // 声明数据存储多段文本
    const tokens = []
    // 记录操作已经处理过的位置的索引
    let lastIndex = 0
    // 记录当前提取值得初始索引
    let index
    // 用于 exec() 结果处理
    let result
    while (result = reg.exec(value)) {
      index = result.index
      console.log(index, lastIndex, 'index-lastIndex');
      if (index > lastIndex) {
        // 说明当前内容在以保存内容右侧，需要存储当前内容到上次记录位置直接得内容（普通文本）
        tokens.push(value.slice(lastIndex, index))
      }
      // 提取插值表达式中的属性名
      const key = result[1].trim()
      // 获取属性值，并存入数组
      tokens.push(this.vm[key])

      // 更新 lastIndex 的位置（注意这里使用原始的结构计算长度）
      lastIndex = index + result[0].length
      
      // 创建 Watcher 实例订阅数据变化
      //   - 变化时修改数组中对应索引位置的数据
      const pos = tokens.length - 1
      new Watcher(this.vm, key, newValue => {
        // 数据变化，更新视图
        tokens[pos] = newValue
        node.textContent = tokens.join('')
      })
    }
    // 所有数据处理完毕，将内容拼接，并设置给元素
    node.textContent = tokens.join('')
  }
  // 封装元素节点处理方法
  compileElement (node) {
    // 获取属性节点并进行遍历
    Array.from(node.attributes).forEach(attr => {
      let attrName = attr.name
      // 检测是否为指令
      if (!isDirective(attrName)) return
      // 获取指令的具体名称（不含 v- 的部分）
      attrName = attrName.slice(2)
      // 获取指令的值，代表对应的响应式属性名称
      const key = attr.value
      // 调用 update 方法进行更新
      this.update(node, key, attrName)
    })
  }
  // 用于进行指令分配的方法
  update (node, key, attrName) {
    // 处理指令为对应的处理函数名
    let updateFn = this[attrName + 'Updater']
    // 检测并调用
    updateFn && updateFn.call(this, node, this.vm[key], key)
  }
  // v-text 指令处理
  //   - 参数为：指令所在的节点，要设置的值，响应式属性的名称
  textUpdater (node, value, key) {
    // 将数据设置给元素
    node.textContent = value
    // 创建 Watcher 实例，订阅数据变化
    new Watcher(this.vm, key, newValue => {
      node.textContent = newValue
    })
  }
  // v-model 指令处理
  //   - 与 v-text 的区别为，内容采用 value 属性设置，同时监听 input 事件
  modelUpdater (node, value, key) {
    // 将数据设置给元素
    node.value = value
    // 创建 Watcher 实例，订阅数据变化
    new Watcher(this.vm, key, newValue => {
      node.value = newValue
    })
    // 监听 input 事件，实现双向数据绑定
    node.addEventListener('input', () => {
      // input 事件触发，将输入内容设置给对应属性
      this.vm[key] = node.value
    })
  }
}

// 判断节点是否为元素节点
function isElementNode (node) {
  return node.nodeType === 1
}
// 判断节点是否为文本节点
function isTextNode (node) {
  return node.nodeType === 3
}
// 判断属性名是否为指令
function isDirective (attrName) {
  return attrName.startsWith('v-')
}
