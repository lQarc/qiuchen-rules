# AI rules for QiuChenNetProxy

个人维护的 AI 服务域名规则集，初始包含 101 条规则。规则来源为用户整理的 AI payload；本仓库仅维护域名分流，不提供代理节点。

## 订阅地址

将下面的原始文件地址填入 QiuChenNetProxy 的远程规则集 URL：

```text
https://raw.githubusercontent.com/lQarc/qiuchen-rules/main/AI.list
```

仓库网页或文件预览页不能代替此原始文件 URL。

## QiuChenNetProxy 设置

新建远程规则集：

| 字段 | 值 |
| --- | --- |
| 名称 | AI |
| URL | 上面的 AI.list 原始文件地址 |
| 命中策略 | 美国节点，或你已创建的 AI Agent 策略组 |
| 格式（如有） | classical |
| 更新间隔 | 86400 秒（每天）；需要立即生效时手动刷新 |
| 启用 | 是 |

把对应的 `RULE-SET` 分流放到原有 AI 静态规则、Google 通用分流以及 `GEOIP`、`FINAL` 之前。已有的静态规则如果先匹配，可能掩盖你在远端更新后的效果。

仅供理解的 JSON 片段如下，需要合并进原配置相应字段，不能直接覆盖完整配置：

```json
{
  "ruleSets": [
    {
      "name": "AI",
      "url": "https://raw.githubusercontent.com/lQarc/qiuchen-rules/main/AI.list",
      "policy": "美国节点",
      "behavior": "classical",
      "enabled": true,
      "updateInterval": 86400
    }
  ],
  "rules": [
    { "type": "RULE-SET", "pattern": "AI", "policy": "美国节点" }
  ]
}
```

修改配置文件后，需在软件提示中确认重新载入。软件中的规则集刷新负责重新下载 AI.list；这与载入本地 config.json 是两个操作。

## 在 GitHub 上维护

1. 打开仓库中的 `AI.list`。
2. 点击编辑按钮，添加、删除或修改规则。
3. 提交到 `main` 分支。保持仓库名、文件名和分支名不变，订阅地址即可保持不变。
4. 回到 QiuChenNetProxy 手动刷新 AI 规则集，或等到下次自动刷新。

文件每行一条规则：

```text
# 精确匹配一个域名
DOMAIN,api.example.com

# 匹配根域名及其子域名
DOMAIN-SUFFIX,example.com
```

规则文件不需要 `payload:`，不需要 `- ` 前缀，也不要加入策略组名称、`FINAL`、订阅链接或个人证书。策略在客户端绑定，便于切换出口。

如需检查条数，可统计非空、非注释行。初始为 101 条；文件头的 Entries 注释只是说明，增删规则后可同步修改。

## 下载失败的区别

GitHub 托管解决维护与分发。你此前的 QiuChen 内置下载器曾出现 GitHub HTTPS 握手失败与连接超时，发布新的 URL 不保证这个问题自动消失。刷新后应确认条目数与错误信息；如果仍为 0，应处理下载链路或暂时使用此前导出的静态 AI 规则。

本规则集只含域名，不含个人节点、订阅凭据或证书。
