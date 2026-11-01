# Google 远程规则集（QiuChenNetProxy）

订阅地址：

```text
https://raw.githubusercontent.com/lQarc/qiuchen-rules/main/Google.list
```

## 转换内容

来源：[blackmatrix7 的 Loon Google.list](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Loon/Google/Google.list)。保留原作者署名与来源，转换日期为 2026-11-02。

原列表 698 条；转换后 695 条：1 条 DOMAIN、684 条 DOMAIN-SUFFIX、5 条 DOMAIN-KEYWORD、4 条 IP-CIDR、1 条 IP-CIDR6。

QiuChen 不支持的 3 条 USER-AGENT 规则未纳入，包括 Google Drive 的客户端标识。域名和 IP 分流仍保留。IP 行只保留规则类型和 CIDR，去掉客户端专用附加参数；不要把策略组名写进规则文件。

## 客户端设置

- 名称：Google
- URL：上面的原始文件地址
- 格式：**classical**，不要使用 domain
- 策略：美国节点（可在 QiuChen 自行改为其他已有策略组）
- 更新间隔：86400 秒，每天一次
- 规则顺序：**AI → Google → GEOIP CN → FINAL**，使 Google AI 服务优先匹配 AI 专用清单。

如果界面没有格式入口，在 config.json 对应 ruleSets 对象中设置 `"behavior": "classical"`，修改后重新载入配置，再刷新规则集。正常应显示 695 条。

## 后续维护

编辑同仓库的 `Google.list` 并提交到 main；客户端手动刷新可立即尝试下载，或等待每日刷新。该文件是转换后的独立快照，不会自动同步 blackmatrix7 上游更新。

添加规则请使用 `DOMAIN,host.example`、`DOMAIN-SUFFIX,example.com`、`DOMAIN-KEYWORD,keyword`、`IP-CIDR,192.0.2.0/24` 或 `IP-CIDR6,2001:db8::/32`。本文件不含节点订阅或证书。
