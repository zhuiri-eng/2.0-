# 🚀 自动化收款系统使用说明

## 📋 系统概述

这是一个基于Payma支付网关的自动化收款系统，支持多种支付方式，包括支付宝、微信支付、QQ钱包和银联支付。系统采用前后端分离架构，提供完整的支付流程管理和订单监控功能。

### 🎯 主要功能
- 💳 多支付方式支持（支付宝、微信、QQ钱包、银联）
- 📊 实时订单管理和状态监控
- 🔒 安全的MD5签名验证
- 📱 响应式设计，支持移动端
- 🔄 自动订单状态更新
- 📈 订单统计和数据分析

## 🛠️ 系统架构

```
自动化收款系统/
├── payment-system.html      # 支付页面（前端）
├── order-management.html    # 订单管理页面（前端）
├── payment-api.js          # 支付API服务器（后端）
├── package.json            # 项目依赖配置
├── 启动支付系统.bat        # Windows启动脚本
└── README.md              # 项目说明文档
```

### 技术栈
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **支付网关**: Payma API
- **安全**: MD5签名算法
- **通信**: HTTP/HTTPS, CORS

## 🚀 快速启动

### 环境要求
- Node.js 14.0.0 或更高版本
- npm 或 yarn 包管理器
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

1. **克隆或下载项目文件**
   ```bash
   # 确保所有文件在同一目录下
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动系统**
   ```bash
   # 方法1：使用启动脚本（Windows）
   双击运行 "启动支付系统.bat"
   
   # 方法2：手动启动
   npm start
   ```

4. **访问系统**
   - 支付页面：`http://localhost:3000/payment-system.html`
   - 订单管理：`http://localhost:3000/order-management.html`
   - API健康检查：`http://localhost:3000/api/health`

## 📱 访问页面

### 支付页面 (`payment-system.html`)
- **功能**: 创建支付订单，选择支付方式
- **访问**: 直接在浏览器中打开文件
- **特性**: 
  - 支持自定义金额和商品名称
  - 自动生成订单号
  - 实时显示支付二维码和支付链接
  - 支付状态实时更新

### 订单管理页面 (`order-management.html`)
- **功能**: 查看和管理所有支付订单
- **访问**: 直接在浏览器中打开文件
- **特性**:
  - 订单列表展示
  - 状态筛选和搜索
  - 订单详情查看
  - 实时统计数据

## 💳 支付配置

### Payma网关配置
```javascript
const PAYMA_CONFIG = {
    apiUrl: 'https://pay.payma.cn/',
    pid: '145297917',                    // 商户ID
    key: '677g7etdq4GTqFB11e6bah1aEh1AbBmb'  // 商户密钥
};
```

### 支持的支付方式
- **支付宝** (`alipay`): 支付宝扫码支付
- **微信支付** (`wechat`): 微信扫码支付
- **QQ钱包** (`qqpay`): QQ钱包支付
- **银联支付** (`unionpay`): 银联在线支付

## 🔧 API接口说明

### 1. 创建支付订单
```http
POST /api/create-payment
Content-Type: application/json

{
    "amount": 100.00,
    "orderName": "测试商品",
    "orderId": "ORDER123456",
    "paymentMethod": "alipay"
}
```

**响应示例**:
```json
{
    "success": true,
    "code": 1,
    "msg": "支付订单创建成功",
    "data": {
        "trade_no": "PAY123456789",
        "out_trade_no": "ORDER123456",
        "money": "100.00",
        "pay_url": "https://pay.payma.cn/pay/ORDER123456",
        "qr_code": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=..."
    }
}
```

### 2. 支付回调通知
```http
POST /api/payment-notify
```

### 3. 支付返回页面
```http
GET /api/payment-return
```

### 4. 查询订单状态
```http
GET /api/order-status/:orderId
```

### 5. 获取所有订单
```http
GET /api/orders
```

### 6. 健康检查
```http
GET /api/health
```

## 📊 功能特性

### 支付流程
1. **创建订单**: 用户输入金额和商品信息
2. **选择支付方式**: 支持支付宝、微信、QQ钱包、银联
3. **生成支付链接**: 系统调用Payma API生成支付链接
4. **显示支付二维码**: 自动生成二维码供用户扫码支付
5. **状态监控**: 实时监控支付状态
6. **订单管理**: 完整的订单生命周期管理

### 安全特性
- **MD5签名**: 所有API请求都使用MD5签名验证
- **参数验证**: 严格的输入参数验证
- **CORS配置**: 安全的跨域请求配置
- **错误处理**: 完善的错误处理机制

### 用户体验
- **响应式设计**: 适配桌面和移动设备
- **实时反馈**: 支付状态实时更新
- **简洁界面**: 直观易用的用户界面
- **快速响应**: 优化的加载速度

## 🔒 安全特性

### 签名算法
```javascript
function generateMD5Sign(data) {
    const sortedKeys = Object.keys(data).sort();
    let signStr = '';
    
    sortedKeys.forEach(key => {
        if (key !== 'sign' && data[key] !== '' && data[key] != null) {
            signStr += key + '=' + data[key] + '&';
        }
    });
    
    signStr += 'key=' + PAYMA_CONFIG.key;
    return crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();
}
```

### 安全措施
- 所有敏感数据使用MD5加密
- 请求参数严格验证
- 防止重放攻击
- 安全的会话管理

## 📱 支持的支付方式

| 支付方式 | 代码 | 图标 | 说明 |
|---------|------|------|------|
| 支付宝 | `alipay` | 💰 | 支付宝扫码支付 |
| 微信支付 | `wechat` | 💚 | 微信扫码支付 |
| QQ钱包 | `qqpay` | 💙 | QQ钱包支付 |
| 银联支付 | `unionpay` | 💳 | 银联在线支付 |

## 🛠️ 开发说明

### 项目结构
```
├── 前端文件
│   ├── payment-system.html    # 支付页面
│   └── order-management.html  # 订单管理页面
├── 后端文件
│   └── payment-api.js        # API服务器
├── 配置文件
│   ├── package.json          # 项目配置
│   └── 启动支付系统.bat      # 启动脚本
└── 文档
    └── README.md             # 项目说明
```

### 开发环境设置
```bash
# 安装开发依赖
npm install

# 启动开发模式（自动重启）
npm run dev

# 启动生产模式
npm start
```

### 代码规范
- 使用ES6+语法
- 遵循JavaScript标准规范
- 添加适当的注释
- 错误处理完善

## 🔧 自定义配置

### 修改支付配置
在 `payment-api.js` 中修改 `PAYMA_CONFIG`:
```javascript
const PAYMA_CONFIG = {
    apiUrl: 'https://pay.payma.cn/',
    pid: '你的商户ID',
    key: '你的商户密钥'
};
```

### 自定义端口
```javascript
const PORT = process.env.PORT || 3000; // 修改默认端口
```

### 添加新的支付方式
1. 在支付页面添加新的支付方式选项
2. 在API中处理新的支付方式逻辑
3. 更新支付网关配置

## 📝 部署说明

### 本地部署
1. 确保Node.js环境已安装
2. 运行 `npm install` 安装依赖
3. 运行 `npm start` 启动服务
4. 访问相应页面

### 服务器部署
1. 上传项目文件到服务器
2. 安装Node.js和npm
3. 运行 `npm install --production`
4. 使用PM2或类似工具管理进程
5. 配置反向代理（如Nginx）

### 环境变量配置
```bash
# 设置端口
export PORT=3000

# 设置环境
export NODE_ENV=production
```

## 🐛 故障排除

### 常见问题

**1. 端口被占用**
```bash
# 查看端口占用
netstat -ano | findstr :3000

# 杀死进程
taskkill /PID <进程ID> /F
```

**2. 依赖安装失败**
```bash
# 清除npm缓存
npm cache clean --force

# 重新安装
npm install
```

**3. 支付API调用失败**
- 检查网络连接
- 验证Payma配置信息
- 确认签名算法正确性

**4. 跨域问题**
- 确保CORS配置正确
- 检查浏览器安全设置

### 日志查看
```bash
# 查看服务器日志
node payment-api.js

# 查看错误信息
# 检查浏览器控制台
```

## 📞 技术支持

### 联系方式
- 项目维护者: [您的联系方式]
- 技术支持: [技术支持邮箱]

### 问题反馈
1. 检查常见问题列表
2. 查看错误日志
3. 联系技术支持

### 更新日志
- **v1.0.0**: 初始版本发布
  - 基础支付功能
  - 订单管理
  - 多支付方式支持

## 📄 许可证

本项目采用 MIT 许可证，详情请查看 LICENSE 文件。

---

**注意**: 本系统仅用于学习和测试目的，生产环境使用前请确保符合相关法律法规和支付行业标准。 