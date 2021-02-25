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
        // this.compileElement(node)
      }
    })
  }
  // 封装文本节点编译方法
  compileText (node) {
    // 文本节点直接检测是否存在插值表达式 {{}} 即可，此处使用正则
    const reg = /\{\{(.+?)\}\}/
    const value = node.textContent.trim()
    // 检测
    if (reg.test(value)) {
      // 提取插值表达式中的属性
      const key = RegExp.$1.trim()
      // 将插值表达式替换为 vm.data 中的数据
      node.textContent = value.replace(reg, this.vm[key])
      // 创建 Watcher 实例订阅数据变化
      new Watcher(this.vm, key, newValue => {
        // 数据变化，更新视图
        node.textContent = newValue
      })
    }
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
