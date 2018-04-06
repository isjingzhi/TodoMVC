;
(function (vue, window) {
	const todos = JSON.parse(window.localStorage.getItem('todos') || '[]')
	//获取鼠标光标
	//实例对象的指令(因为是进入页面触发的所以卸载全局):参数一:绑定元素(参数随意应当语义话,参数2:对象)
	//当被绑定的元素插入到Dom中时...
	Vue.directive('focus', {
		inserted: function (el) {
			//聚焦元素
			el.focus()
		}
	})
	const todoapp = new Vue({
		el: '#todoapp',
		data: {
			todos,
			inputText: '',
			currentEdit: null,
			filterTodos: [],
			backTitle: '',
			hash: ''
		},
		methods: {
			//回车完成编辑
			addTodo(e) {
				//判断是否为空
				const {
					inputText,
					todos
				} = this
				if (inputText.trim().length === 0) {
					return
				}

				const lastItem = todos[todos.length - 1]
				const id = lastItem ? lastItem['id'] + 1 : 1
				console.log(id)
				todos.push({
					id,
					title: inputText,
					done: false
				})
				//添加后清空
				this.inputText = ''
			},
			//功能2点击删除
			removeEdit(item) {
				// Es6新增语法 findIndex
				//他会遍历数组,对数组的每一项调用你传递的回调函数
				//当某个元素满足t.id === item.id 条件的时候遍历停止,返回改元素项在数组中的索引
				//如果什么也没有找到返回 -1
				const index = this.todos.findIndex(function (t) {
					return t.id === item.id
				})
				//判断是否为-1(就是没有找到)
				if (index !== -1) {
					this.todos.splice(index, 1)
				}
			},
			//功能3双击获取文本框内容
			getEdit(item) {
				// console.log(item.title)
				this.currentEdit = item
				//转存title
				this.backTitle = item.title
			},
			//功能4点击回车保存内容
			//判断文本框是否为空,如果为空则直接删除
			saveEdit(item, index) {
				// console.log(1)
				if (item.title.trim().length === 0) {
					//直接删除
					this.todos.splice(index, 1)
				}
				//键盘按下,文本框去掉样式
				this.currentEdit = null
			},
			//功能5
			cancel() {
				//  console.log(222)
				this.currentEdit.title = this.backTitle
				this.currentEdit = null
			},
			//-----------------功能6获取未完成的数量
			//第一种方案使用方法来获取:缺点是使用一次一次调用一次,增加缓存,不够直接,可以用计算属性,计算使用只需要渲染一次
			// getRemaining() {
			// 	// console.log(item)
			// 	return this.todos.filter(item => !item.done).length
			// },
			// =====================
			//功能7点击清空全部
			clearAlldone() {
				const todos = this.todos
				for (let i = 0; i < todos.length; i++) {
					//执行删除操作
					if (todos[i].done === true) {
						todos.splice(i, 1)
						//因为每删除一个,后面的将会取代前面的索引,为了防止有没有删除的所以要执行返回前面的而操作
						i--
					}
				}
			},
			//功能8
		},
		//剩余方案2计算属性computed,他是一种带有属性的行为,单不可以用作事件对象来处理另外要注意的是使用的时候
		computed: {
			getRemaining() {
				return this.todos.filter(function (item) {
					return !item.done
				}).length
				// return this.todos.filter(item=>!item.done).length
			},
			//切换全选
			toggleAllStat: {
				get: function () {
					console.log('get方法被调用了')
					//every 方法会对每一个元素执行的条件进行判定
					//如果每个元素.done===true,every返回就是true
					//只要其中一个元素===false则返回的是false
					const toggleAll = this.todos.every(function (item) {
						return item.done === true
					})
					return toggleAll
				},
				//当计算属性 赋值的时候,会自动调用这里的方法
				set: function (val) {

					this.todos.forEach(function (item) {
						item.done = val
					})
				}
			}
		},
		//watch 实例选项
		//watch要监视的是data中的数据成员,或者是计算属性中的成员
		watch: {
			//要监视的数组
			todos: {
				handler: function () {
					//当todos发生改变的时候,会自动调用handler方法
					//当todos发生该变的时候将数据同步存储到本地存储当中
					window.localStorage.setItem('todos', JSON.stringify(this.todos))
					//根据hash值来检测数组的变化
					//当数据发生改变的时候,重新让filterTodos从数据源中获取一下
					//因为在过滤数组中错删除的时候要从todos数据源删除,todos的数据源并不会影响filterTOdos因为没次过滤都会重新获得一个新的数组
					//最简单的方式是在todos发生改变的时候重新再filtersTodos中获取数据
					window.onhashchange()
				},
				//deep 默认只能监视对象或者数组的一层数据,如果需要后代监视,则需要配置为深度监视
				deep: true
			},
		},
		directives: {
			//对象的key就是自定义指令的名字
			//选项对象用来配置指令的声明周期钩子制造函数
			'todo-focus': {
				update(el, binding) {
					//找到双击的el
					// console.log(update)
					// console.log(binding)
					// console.log(binding.value)
					if (binding.value === true) {
						el.focus()
					}
				}
			}
		}
	})
	// ==========================================
	//把 app 挂载到全局,这样就可以在控制台访问调试
	window.todoapp = todoapp
	//只有锚点发生改变的时候才会调用,如果没有改变咋不回调用
	window.onhashchange = function () {
		// const hash = window.location.hash
		// 解构赋值
		const {
			hash
		} = window.location

		// console.log(hash)
		//根据hash的不同过滤数据的展示
		switch (hash) {
			//方案1:设置case为空,不添加break,当登录页面没有hash值得时候直接执行到下一步
			// case '':
			// case '#/':
			// 	todoapp.filterTodos = todoapp.todos
			// 	break
			case '#/active':
				todoapp.filterTodos = todoapp.todos.filter(function (item) {
					return item.done === false
				})
				break
			case '#/completed':
				todoapp.filterTodos = todoapp.todos.filter(function (item) {
					return item.done === true
				})
				break
				//方案2;当没有以上hash值得时候终止直接进入hash值为'#/'的网页
			default:
				case '#/':
				todoapp.filterTodos = todoapp.todos
				break
		}
	}
	window.onhashchange()
})(Vue, window)
