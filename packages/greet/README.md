# @ryqdev/dsh-plugin-greet

[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`dsh`）的 hello world 插件：注册一个 `greet` 工具，模型传入名字，返回 `Hello, <名字>!`。

它同时是这个仓库里新插件的模板，复制本目录后改包名即可。

## 目录

```
packages/greet/
├── package.json          # dsh.bundle 声明这是一个可安装的组合包
├── cordis.patch.yml      # 安装后往 profile 里插入的插件行
├── src/index.ts          # 插件本体：导出 name / inject / Config / apply
├── tests/greet.spec.ts   # 在真实的工具注册表上挂载并调用插件
└── locale/               # 插件页显示的标题和描述
```

## 开发

在仓库根目录执行：

```bash
pnpm install
```

```bash
pnpm build
```

```bash
pnpm test
```

测试不需要模型和 API key，也不需要安装 `dsh`。

## 安装到 dsh

需要本机已安装 `dsh`（Node ≥ 24.9）和 pnpm。先 `pnpm build` 生成 `lib/`，再在仓库根目录执行：

```bash
dsh plugin --profile web add ./packages/greet
```

```bash
dsh web
```

打开 Web UI 后输入 `Use the greet tool to greet Ada.`，模型会调用 `greet` 并得到 `Hello, Ada!`。

本地路径安装只是建一个链接。之后改了代码，重新 `pnpm build` 并重启 `dsh` 即可，不用重新安装。

卸载：

```bash
dsh plugin --profile web remove @ryqdev/dsh-plugin-greet
```

## 配置

问候语可以改。在 profile 的 `~/.dsh/profiles/web/cordis.patch.yml` 里覆盖这一行的配置：

```yaml
- id: greet
  config:
    greeting: 你好
```

## 版本

- `engines.dsh` 声明支持 `>=0.2.2-rc.5 <0.3.0`，不在范围内的 `dsh` 会拒绝安装。
- 开发依赖固定在 `@deepseek-ai/dsh-tools@0.2.2-rc.5`。这些子包在 npm 上的 `latest` 标签是过时的，升级时要写明版本号。
- 包目前标了 `"private": true`，防止误发布到 npm；要发布时去掉即可。
