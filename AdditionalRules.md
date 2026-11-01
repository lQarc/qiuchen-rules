# 附加远程规则集

以下文件已转换为 QiuChenNetProxy 的 classical 格式，规则不携带策略名，客户端统一绑定策略。

| 规则集 | 条数 | 原作者 | 客户端策略 |
| --- | ---: | --- | --- |
| [PanVod.list](PanVod.list) | 47 | eulac-dev | DIRECT（与原 QX 国内网盘分流用途一致） |
| [ResourceSite.list](ResourceSite.list) | 25 | eulac-dev | DIRECT（与原 QX 视频资源分流用途一致） |
| [Crypto.list](Crypto.list) | 201 | blackmatrix7 | 自行选择已有代理策略组 |

## 原始文件订阅地址

```text
https://raw.githubusercontent.com/lQarc/qiuchen-rules/main/PanVod.list
https://raw.githubusercontent.com/lQarc/qiuchen-rules/main/ResourceSite.list
https://raw.githubusercontent.com/lQarc/qiuchen-rules/main/Crypto.list
```

分别新建远程规则集，设置 `"behavior": "classical"`，更新间隔可用 86400 秒；将业务规则放在 GEOIP 与 FINAL 之前。配置外部修改后确认重新载入，再刷新对应规则集。

PanVod 与 ResourceSite 的 HOST、HOST-SUFFIX、HOST-KEYWORD 分别改为 DOMAIN、DOMAIN-SUFFIX、DOMAIN-KEYWORD，移除行尾 QX 策略名。ResourceSite 的两条 IPv4 CIDR 保留。Crypto 原文已为可用的基础规则类型，保留其规则正文。所有规则均完整保留，未跳过任何条目；各文件头保留原作者、原来源和转换日期。

## 后续维护

编辑对应的 .list 文件并提交到 main，客户端刷新即可读取更新。保持文件路径不变。文件是转换后的独立快照，不会自动同步原作者上游；需要同步时应重新转换上游内容。

这些文件只包含公开分流条目，不含个人代理节点、订阅凭据或证书。
