# 实现计划：宝可梦微信小程序

## 概述

本实现计划将宝可梦微信小程序的设计转化为可执行的开发任务。应用基于Vue3 + TypeScript + Pinia构建，通过GraphQL API与PokeAPI集成。实现将按照从基础设施到核心功能再到用户界面的顺序进行，确保每个步骤都可以增量验证。

## 任务列表

- [x] 1. 项目初始化和基础配置
  - 创建微信小程序项目结构
  - 配置Vue3 + TypeScript开发环境
  - 安装依赖：vue3、pinia、axios、less
  - 配置微信小程序开发工具和编译选项
  - 创建基础目录结构（pages、components、stores、api、utils、styles）
  - _需求: 10.1, 10.2, 10.3, 10.5_

- [x] 2. 数据模型和类型定义
  - [x] 2.1 创建TypeScript类型定义文件
    - 定义PokemonSpecies、Pokemon、PokemonAbility、PokemonType接口
    - 定义Theme、ThemeColors、SearchResult接口
    - 定义GraphQL响应类型
    - _需求: 3.3, 8.2, 8.3_

- [x] 3. GraphQL客户端实现
  - [x] 3.1 实现GraphQLClient类
    - 创建axios实例，配置baseURL为https://beta.pokeapi.co/graphql/v1beta
    - 实现通用query方法处理GraphQL请求
    - 实现错误处理和响应解析
    - _需求: 3.1, 3.4, 3.5_
  
  - [x] 3.2 实现搜索物种查询方法
    - 实现searchPokemonSpecies方法
    - 构建GraphQL查询，包含id、name、capture_rate、pokemon_v2_pokemoncolor、pokemon_v2_pokemons、pokemon_v2_pokemonabilities字段
    - 实现模糊搜索（_ilike操作符）
    - 支持分页参数（limit、offset）
    - _需求: 3.2, 3.3, 5.2_
  
  - [x] 3.3 实现宝可梦详情查询方法
    - 实现getPokemonDetail方法
    - 构建GraphQL查询，获取宝可梦详细信息
    - 包含技能和类型信息
    - _需求: 3.2, 3.3, 7.2_

- [x] 4. 工具函数和组合式函数
  - [x] 4.1 实现防抖搜索组合式函数
    - 创建useDebouncedSearch组合式函数
    - 实现300毫秒延迟的防抖逻辑
    - 提供cancel和flush方法
    - _需求: 4.5, 4.6_
  
  - [x] 4.2 实现本地存储组合式函数
    - 创建useLocalStorage组合式函数
    - 支持泛型类型参数
    - 实现save、load、clear方法
    - 适配微信小程序的wx.setStorageSync和wx.getStorageSync
    - _需求: 2.4, 2.5_

- [x] 5. Pinia状态管理
  - [x] 5.1 实现WelcomeStore
    - 创建WelcomeStore，管理hasShown和shouldShow状态
    - 实现markAsShown方法，持久化到本地存储
    - 实现checkFirstLaunch方法，检查是否首次启动
    - _需求: 1.4, 1.5, 8.4_
  
  - [x] 5.2 实现ThemeStore
    - 创建ThemeStore，管理currentTheme和availableThemes状态
    - 定义三种主题配色方案（pokemon、dark、light）
    - 实现setTheme方法，应用主题到全局样式
    - 实现loadTheme和persistTheme方法
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 8.3_
  
  - [x] 5.3 实现SearchStore
    - 创建SearchStore，管理搜索状态（keyword、results、currentPage、totalPages、pageSize、isLoading、error）
    - 实现search action，调用GraphQL客户端
    - 实现setPage action，更新当前页码
    - 实现clearResults action
    - 实现paginatedResults、hasResults、isEmpty getters
    - _需求: 5.1, 5.3, 5.4, 5.5, 6.6, 8.2, 8.5_

- [x] 6. 检查点 - 确保核心逻辑完成
  - 确保所有测试通过，如有问题请询问用户

- [x] 7. 主题样式系统
  - [x] 7.1 创建Less变量和混合
    - 定义主题颜色变量
    - 创建响应式布局混合
    - 定义宝可梦风格的视觉元素（圆角、阴影、渐变）
    - _需求: 9.1, 9.3_
  
  - [x] 7.2 实现全局样式
    - 创建app.less，定义全局样式
    - 实现响应式布局基础类
    - 确保最小点击区域44x44像素
    - _需求: 9.2, 9.4_
  
  - [x] 7.3 实现主题切换样式
    - 为每个主题创建CSS类
    - 实现主题切换的过渡动画
    - _需求: 2.3_

- [x] 8. 欢迎模态框组件
  - [x] 8.1 实现WelcomeModal.vue组件
    - 创建模态框结构和样式
    - 集成多语言问候GIF图像
    - 实现魔幻背景效果
    - 绑定WelcomeStore状态
    - 实现关闭按钮和关闭逻辑
    - _需求: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 8.2 为WelcomeModal编写单元测试
    - 测试首次启动显示逻辑
    - 测试关闭后不再显示
    - _需求: 1.1, 1.4, 1.5_

- [x] 9. 主题选择器组件
  - [x] 9.1 实现ThemeSelector.vue组件
    - 创建主题选择器UI
    - 显示三种主题选项
    - 绑定ThemeStore
    - 实现主题切换交互
    - _需求: 2.1, 2.3_

- [x] 10. 搜索页面核心组件
  - [x] 10.1 实现SearchInput.vue组件
    - 创建搜索输入框
    - 绑定v-model到SearchStore的keyword
    - 集成useDebouncedSearch
    - _需求: 4.1, 4.5, 4.6_
  
  - [x] 10.2 实现SearchButton.vue组件
    - 创建搜索按钮
    - 根据输入框状态控制启用/禁用
    - 绑定点击事件到搜索操作
    - _需求: 4.2, 4.3, 4.4_
  
  - [x] 10.3 实现LoadingIndicator.vue组件
    - 创建加载指示器UI
    - 绑定SearchStore的isLoading状态
    - 实现加载动画
    - _需求: 5.3, 5.4, 9.5_

- [x] 11. 搜索结果展示组件
  - [x] 11.1 实现SpeciesCard.vue组件
    - 显示物种名称和捕捉率
    - 使用pokemon_v2_pokemoncolor.name作为背景颜色
    - 显示该物种下的Pokemon列表
    - _需求: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 11.2 实现PokemonItem.vue组件
    - 显示Pokemon名称
    - 实现点击导航到详情页
    - 应用主题样式
    - _需求: 6.5_
  
  - [x] 11.3 实现SearchResults.vue组件
    - 组合SpeciesCard组件
    - 显示搜索结果列表
    - 处理空结果状态，显示"未找到结果"消息
    - _需求: 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 11.4 实现Pagination.vue组件
    - 创建分页控件（上一页、下一页）
    - 显示当前页码和总页数
    - 绑定SearchStore的分页状态
    - 实现页码切换逻辑
    - _需求: 6.6, 6.7_

- [x] 12. 搜索页面主容器
  - [x] 12.1 实现SearchPage.vue组件
    - 组合SearchInput、SearchButton、LoadingIndicator、SearchResults、Pagination组件
    - 实现handleSearch方法
    - 实现handlePageChange方法
    - 实现navigateToDetail方法
    - 绑定SearchStore和ThemeStore
    - _需求: 4.1, 4.2, 5.1, 5.5, 6.5, 6.6, 6.7_

- [x] 13. 检查点 - 确保搜索功能完整
  - 确保所有测试通过，如有问题请询问用户

- [x] 14. 详情页面组件
  - [x] 14.1 实现PokemonHeader.vue组件
    - 显示Pokemon名称
    - 应用主题样式
    - _需求: 7.1_
  
  - [x] 14.2 实现AbilitiesList.vue组件
    - 显示技能名称列表
    - 格式化技能数据
    - _需求: 7.2_
  
  - [x] 14.3 实现BackButton.vue组件
    - 创建返回按钮
    - 实现返回导航逻辑
    - _需求: 7.3, 7.4_
  
  - [x] 14.4 实现DetailPage.vue组件
    - 组合PokemonHeader、AbilitiesList、BackButton组件
    - 接收pokemonId prop
    - 使用usePokemonDetail组合式函数获取数据
    - 实现返回时保留搜索状态的逻辑
    - _需求: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 14.5 实现usePokemonDetail组合式函数
    - 调用GraphQL客户端获取宝可梦详情
    - 管理加载状态和错误状态
    - 返回响应式数据
    - _需求: 7.1, 7.2_

- [x] 15. 应用主入口和路由
  - [x] 15.1 实现App.vue主组件
    - 集成WelcomeModal组件
    - 集成ThemeSelector组件
    - 配置路由视图
    - 初始化Pinia stores
    - _需求: 1.1, 2.1, 8.1_
  
  - [x] 15.2 配置微信小程序路由
    - 配置app.json，定义pages路径
    - 配置SearchPage和DetailPage路由
    - 实现页面导航逻辑
    - _需求: 6.5, 7.4, 7.5_

- [x] 16. 状态持久化和恢复
  - [x] 16.1 实现应用启动逻辑
    - 在App.vue的onMounted中加载持久化状态
    - 恢复主题设置
    - 检查欢迎模态框显示状态
    - _需求: 1.5, 2.5_
  
  - [x] 16.2 实现搜索状态保留
    - 在DetailPage返回时恢复搜索结果
    - 保留分页状态
    - _需求: 7.5_

- [x] 17. 最终集成和优化
  - [x] 17.1 集成所有组件
    - 确保所有组件正确连接
    - 验证数据流和状态管理
    - 测试页面导航
    - _需求: 8.5_
  
  - [x] 17.2 响应式设计优化
    - 测试不同屏幕尺寸
    - 调整布局和样式
    - 确保点击区域符合规范
    - _需求: 9.2, 9.4_
  
  - [x] 17.3 性能优化
    - 优化GraphQL查询
    - 实现组件懒加载
    - 优化图片和资源加载
    - _需求: 10.1, 10.4_
  
  - [x] 17.4 编写集成测试
    - 测试完整的搜索流程
    - 测试详情页导航和返回
    - 测试主题切换
    - _需求: 2.3, 5.1, 6.5, 7.4_

- [x] 18. 最终检查点
  - 确保所有测试通过，如有问题请询问用户

## 注意事项

- 标记为 `*` 的任务为可选任务，可以跳过以加快MVP开发
- 每个任务都引用了具体的需求编号，确保可追溯性
- 检查点任务确保增量验证和及时发现问题
- 所有代码使用TypeScript编写，遵循Vue3 Composition API规范
- 遵循微信小程序开发规范和API限制
