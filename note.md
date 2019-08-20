## 功能记录

- 对某个特定的接口进行 mock 数据处理 mock.server.js 中多出一个配置项:`mockData{[{'/xxx':{data:{}}}]}`
- 对某个特定的接口进行格式处理 即中间层意义
- 设置 timeout 超时，超过 timeout 时返回假数据或者之前保存的真实接口数据，这取决于你是 1.纯 mock / 2.有后台接口

## 亮点

- hmr 热更新

  > nodemon 在目前状态下不可用，纯手写 hmr 热更新
  > 通过 node-watch 监听配置文件的变更
  > 通过开启一个守护进程来监听子进程的 process.exit(0)事件
  > 发生文件变更 立马重启子进程

- 接口数据/静态资源的请求自动备份

- 1. 纯 mock：
- 按照既定的数据结构，自动创建接口，返回对应数据
- 2. 有后台接口 只是接口速度比较慢 或者服务器不稳定
- 模式一：首次请求真实接口 拿到真实接口数据，之后每次前端请求都会重新请求真实的接口地址，拿到数据返回给前端。无任何保存数据的动作
  > 该模式就是正常请求后台接口无 mock 模式
- 模式二：首次请求真实接口 拿到真实接口数据 将其保存一份(fs.writeFile) 并返回给前端；之后该接口的每次请求 会先请求真实接口 如果超过设置的 timeout(需要在 mock.server.js 中配置该 timeout) 即会返回之前保存的请求真实接口的数据
  > 该模式依赖 mock.server.js 中配置的 timeout
  > 如果首次真实接口请求失败 会返回 mock.server.js 中配置的假数据，如果没有配置假数据，则报错
- 模式三：首次请求真实接口 拿到真实接口数据 将其保存一份(fs.writeFile) 并返回给前端；之后该接口的每次请求 都会返回第一次请求真实接口保存的数据
  > 该模式下 如果首次接口比较慢 或直接 down 掉 那么就无法获得数据
  > 如果超时 可以提醒用户写模拟数据
  > 如果首次真实接口请求失败 会返回 mock.server.js 中配置的假数据，如果没有配置假数据，则报错
- 模式四：首次不需要请求接口，直接返回在 mock.server.js 中配置的假数据 mockData 但是它会在后台等待真实接口返回的结果，如果请求到真实数据，就立马保存下来() 那么在下次请求时 就会返回真实的接口数据
  > 该模式依赖 mock.server.js 中配置的假数据，如果没有假数据 应报错

## mock.config.js 配置文件

- 1. 不指定配置文件路径情况下 自动去根目录寻找 mock.config.js 配置文件
- 2. scripts 中指定`--path`情况下 自动根据指定的`--path`寻找配置文件

## 功能点

###备份数据存放的位置

- 1.  不指定配置文件路径 或者指定的配置文件路径不包含文件夹的情况下，会自动在目录创建 mockservers-backup 目录，并创建 backup.json 文件来存放接口的备份数据
- 2.  指定配置文件路径 并且指定的配置文件路径包含文件夹的情况下，会根据配置的文件夹路径来创建 backup.json 文件来存放接口的备份数据
      > 注：source 会注明数据来源

###mock 数据编写的两种方式

- 1. 直接在 mock 的配置文件(默认在项目根目录中的 mock.config.js 或者手动指定配置文件路径)中配置 mockData

```js
//mock.config.js
module.exports = {
  mode: "just-mock",
  //...
  mockData: {
    format: {
      title: "it is a cool format"
    },
    apiList: [
      {
        path: "/xxx/xxx",
        method: "get",
        data: {
          title: "return test mock data."
        }
      }
    ]
  }
};
```

- 2. 通过指定 mock 数据的 json 文件路径

```js
//mock.config.js
module.exports = {
  mode: "just-mock",
  //...
  mockPath: require("./mock.json")
};
```

编写 mock 的 json 数据

```json
//mock.json
{
  "GET /api/mock/data1": {
    "timestamp": "2019-08-16 19:13:88",
    "code": "OK",
    "message": "mock的数据1",
    "path": "/api/home/data1",
    "data": {
      "name": "🐯🐯🐯- Mock数据-1"
    }
  },
  "GET /api/mock/data2": {
    "timestamp": "2019-08-16 19:23:99",
    "code": "OK",
    "message": "mock的数据2",
    "path": "/api/home/data2",
    "data": {
      "name": "🐯🐯🐯- Mock数据-2"
    }
  }
}
```

- 以上两种方式可混合编写

### 设置请求前缀

- /apis/ -> 接口数据
- /upload/ -> 静态资源
  > 在默认情况下只备份/api/的数据
  > 如果有/upload/静态资源数据会过滤掉

## 相关配置项

- mode 模式
  > just-mock 只 mock 不请求真实接口
  > request 只请求真实接口 不 mock 😄
  > request-timeout 首次请求真实接口，第一次不检测 timeout，之后的请求才根据 timeout 是否超时 来决定返回真实接口数据/首次请求保存的数据/假数据 <首次请求真实接口如果失败就返回 其他数据(备份数据/假数据)>
  > request-timeout-all 首次请求真实接口，第一次检测 timeout，之后的请求也根据 timeout 是否超时 来决定返回真实接口数据/首次请求保存的数据/假数据 <首次请求真实接口如果失败就返回 其他数据(备份数据/假数据)>
  > request-once 首次请求真实接口 之后的请求返回首次请求保存的数据/假数据 <首次请求真实接口如果失败就返回失败 不返回假数据>
  > request-wait 首次不请求真实接口 直接返回假数据 但是它会在后台默认等待真实接口返回数据，如果有真实数据 下次请求就会返回真实数据 <依赖配置的假数据>
- mockServer mock 服务配置相关
  > port 配置本地 mock 服务的端口
  > proxy 配置真实接口的代理地址
  > timeout 真实接口超时时间
- mockData 模拟数据配置相关
  - format 数据外层嵌套结构<可选>
  - apiList 模拟接口列表
    > path 请求路径
    > method 请求方法
    > data 返回数据 <有 format 情况下会被 format 嵌套包裹，否则直接返回 data>

## 数据优先级

- 真实数据 > 备份数据 > mock 数据
  > api > backup > mock

## 接下来要做？

- 将首次请求的数据保存起来 下次请求如果超时 直接返回首次请求保存的数据 ✅
- 添加数据标识位 用来标识当前的数据来自于 真实接口数据/备份数据/假数据 ✅
- 配置文件中添加响应体的包裹{code:0,message:'OK',data:[]} ✅
- 如果没有找到该真实接口，就去找 mock 数据中的 path ✅
- 使用指定文件的命令 类似 scripts 中 指定配置文件名 webpack.dev.config.js✅
  > 使用命令 mock-start 会去根目录寻找 mock 配置文件 mock.servers.js✅
  > 在 scripts 中配置相关命令 会根据相关命令去寻找指定的配置文件 ✅
- 备份数据的最佳方式 ✅
- 提供 hmr 热更新能力 ✅
- 考虑端口占用情况 ✅
- apiList 更改为不必须的参数 ✅
- 更改备份数据的数据结构为 `GET /home/data: {}` ✅
- 考虑更改 mock 接口数据的数据结构 `GET /home/data: {}` ✅
- 考虑是否备份 静态资源文件 /uploads/...
  > 或者前端提供可配置静态资源服务器的选项 (接口: /apis/...) (资源: /uploads/...)
- 提供配置校验某个字段是否为空的设置，来解决 statusCode 是 200，但是 data 为 null 的情况
- 提供可视化界面
- 提供一个清空备份数据的方式
- 提供配置项 是否支持跨域 / 部分跨域 / 全部跨域
- 对外暴露 api 接口编写
- 提供插入数据方式
- 提供连接远程数据库

- 遇到的问题
  - 1. 因为用了 --dirname,导致查找路径错误 从而找不到 mock.server.js
       > 使用 process.cwd() 来获取 node 工作路径
- 2. 在 mock.config.js 中配置了 mockPath，而该路径为空的时候会出错
