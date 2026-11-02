# QiuChenNetProxy 流媒体检测

原生 JavaScript 模块，按本机 QiuChenNetProxy 内置 SDK 改写。功能参考 [KOP-XIAO 原脚本](https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/streaming-ui-check.js)，不再依赖 Quantumult X 的 `$task`、`$environment`、`$configuration`、`$done`。

原始脚本链接：

https://raw.githubusercontent.com/lQarc/qiuchen-rules/main/streaming-ui-check.js

## 使用

这是脚本，不是规则集；请勿放入远程规则集列表。

如果客户端脚本管理提供 URL 导入，填上面的原始脚本链接。当前本机 SDK 的 script-save 接口只有源码字段，尚未确认此版本具备远程脚本订阅/自动更新功能；链接托管不代表客户端一定支持订阅。没有 URL 导入时，打开链接复制全文，在脚本管理/Web IDE 新建 JavaScript 脚本后粘贴保存。

- 启用 `onSchedule`（定时钩子），自动周期建议 3600 秒。
- 不启用 `onRequest` / `onResponse`；hosts 留空；无需 MITM。
- 结果在脚本日志查看，最新 JSON 保存在脚本存储键 `streaming-check:last-result`。
- 使用当前分流规则出站，检测不同服务时可能走不同节点。SDK 未提供指定 policy 或读取节点名的接口，不能作为逐节点测试。

## 判读

包含 YouTube Premium、Netflix、Disney+、DAZN、Paramount+、Discovery+、ChatGPT。每个请求超时 10 秒，每批并发两项，一项失败不会阻断其他检测。

“网页可访问”只代表相关网页可访问；“地区已识别”只代表服务返回地区。这两者都不保证付费内容可播放或账号可登录。明确地区限制才显示“受限制”；验证码、403、接口变更和响应缺失显示“无法判定”。Netflix 404 不推断为仅自制剧，无法识别地区时也不会默认美国。

Disney+、Paramount+ 使用主页可达性检查；不声称等价于原脚本的完整解锁判断。DAZN、Discovery+ 沿用原作接口地址，服务端可能已调整接口，届时会显示无法判定。

验证：已使用本机 TypeScript 解析器通过语法检查，模拟反爬和超时验证七项均结束并保存结果。尚未在秋晨引擎中完成真实网络联测；实际结果以客户端运行日志为准。
