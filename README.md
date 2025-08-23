# Markdown 文档生成器

一个简单的 Node.js 脚本，用于借助大模型生成 Markdown 格式的文档文件。

## 启动

进入根目录

```shell
npm run start
```

## 接口

### 文档生成接口

1. 生成文档提纲

```shell
curl http://localhost:3000/api/doc/genOutline \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "用户管理系统需要实现对系统用户的全生命周期管理功能，包括用户注册、登录认证、权限分配、信息编辑、状态管理等核心模块，系统应支持多角色权限控制（如管理员、普通用户、VIP用户等），提供用户数据的增删改查操作，具备安全的身份验证机制（如JWT令牌、密码加密存储），同时需要集成用户行为日志记录、账户锁定/解锁、密码重置等功能，并支持批量导入导出用户数据，确保系统的安全性、可扩展性和易用性。"
  }'
```

2. 根据提纲生成文档

```shell
curl http://localhost:3000/api/doc/gen \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "用户管理系统需要实现对系统用户的全生命周期管理功能，包括用户注册、登录认证、权限分配、信息编辑、状态管理等核心模块，系统应支持多角色权限控制（如管理员、普通用户、VIP用户等），提供用户数据的增删改查操作，具备安全的身份验证机制（如JWT令牌、密码加密存储），同时需要集成用户行为日志记录、账户锁定/解锁、密码重置等功能，并支持批量导入导出用户数据，确保系统的安全性、可扩展性和易用性。"
  }'
```

3. 下载文档接口

```shell
curl http://localhost:3000/api/doc/download?filename=output.md
```


### 其他接口

- 聊天接口

```shell
curl http://localhost:3000/api/llm/chat \
  -H "Content-Type: application/json" \
  -d '{
    "keywords": "你好"
  }'
```

## 输出

- 生成的提纲：files/outline.json
- 生成的文档：files/output.md