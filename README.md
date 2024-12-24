# 一个本地快速启动的文档访问服务

## 启动已配置的服务

> 启动全部服务

```shell
npm run serve
```

> 启动特定服务，如：`vueuse`

```shell
npm run vueuse
```

## 命令行接口

```shell
npx server <command>
```

### 使用配置文件启动

默认的配置文件名为 `server.config.json`。

```shell
npx server serve
```

| 选项              | 描述                          |
| ----------------- | ----------------------------- |
| `--config <file>` | 使用指定的配置文件 (`string`) |
| `-h, --help`      | 显示可用的 CLI 选项           |

> 配置文件内容

```json
{
  // 要启动的服务，指定对应的文件夹名称或通配置符号 "*"
  // "include": "*",
  "include": ["vue-cn", "vite6-cn"],
  // 被排除的文件或文件夹
  "exclude": ["scripts", "node_modules", "package*.json"],
  // 子服务配置项
  // 可配置选项有： host、port、open、strictPort、https。具体含义请参考 vite preview 的配置项。
  "viteConfig": {
    // 如果未单独给子服务配置 port，那么子服务的 prot 具体值为：根据匹配到的索引值 + 公共 port
    "port": 3000,
    "host": true,
    // 除此之外，还可以针对具体的项目进行单独配置，只需要以对应项目的文件夹名称为键即可
    "vue-cn": {}
  },
  // 主服务的配置项。除了子服务配置项之外，多了一个 run 用于控制是否启动主服务，其默认值为 true。
  "homeViteConfig": {},
  "childProcessConfig": {
    "continueOnError": false,
    "race": false
  }
}
```

### 启动指定的项目

```shell
npx server specific <target>
```

| 选项            |                                              |
| --------------- | -------------------------------------------- |
| `<target>`      | 被启动的目标 (`string`)                      |
| `--host [host]` | 指定主机名称 (`string`)                      |
| `--port <port>` | 指定端口 (`number`)                          |
| `--strictPort`  | 如果指定的端口已在使用中，则退出 (`boolean`) |
| `--open [path]` | 启动时打开浏览器 (`boolean \| string`)       |
| `--https`       | 使用 `https` 服务 (`boolean`)                |
| `-h, --help`    | 显示可用的 CLI 选项                          |

### 清除被忽略的文件

```shell
npx server clean
```

| 选项              |                                         |
| ----------------- | --------------------------------------- |
| `--stdout <file>` | 将匹配到的文件信息输出到指定文件 (`string`) |
| `-h, --help`      | 显示可用的 CLI 选项                     |

## 创建本地永久性站点

可以使用 `phpStudy` 来快速创建一个本地的服务站点进行对应网站的访问，只要你启动了 `phpStudy` 且开启了 `nginx` 或 `apache` 服务。

## 特殊说明

`miscellaneous` 是一个 `vitepress` 服务，放置的是一些只有 `README.md` 或只有 `*.md` 文档的库文档。
