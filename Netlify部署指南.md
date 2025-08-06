# 🌐 Netlify部署指南

## 📋 部署前准备

### 1. 确保文件完整性
确保以下文件都在项目根目录：
- ✅ `index.html` - 主页面
- ✅ `styles.css` - 样式文件
- ✅ `script.js` - JavaScript逻辑
- ✅ `privacy.html` - 隐私协议
- ✅ `terms.html` - 服务条款
- ✅ `netlify.toml` - Netlify配置
- ✅ `package.json` - 项目配置

### 2. 代码仓库准备
- 将项目上传到GitHub、GitLab或Bitbucket
- 确保仓库是公开的（免费版Netlify要求）

## 🚀 部署步骤

### 方法一：通过Netlify网站部署（推荐）

1. **访问Netlify**
   - 打开 [https://www.netlify.com/](https://www.netlify.com/)
   - 点击 "Sign up" 注册账号（可用GitHub账号登录）

2. **创建新站点**
   - 点击 "New site from Git"
   - 选择你的Git提供商（GitHub/GitLab/Bitbucket）

3. **选择仓库**
   - 授权访问你的Git账号
   - 选择包含项目的仓库
   - 选择要部署的分支（通常是 `main` 或 `master`）

4. **配置部署设置**
   ```
   Build command: 留空（静态网站无需构建）
   Publish directory: . （当前目录）
   ```

5. **点击部署**
   - 点击 "Deploy site"
   - 等待部署完成（通常1-2分钟）

### 方法二：拖拽部署

1. **准备文件**
   - 将所有项目文件打包成ZIP文件
   - 或直接拖拽文件夹

2. **拖拽到Netlify**
   - 访问 [https://app.netlify.com/drop](https://app.netlify.com/drop)
   - 将文件拖拽到指定区域
   - 自动部署完成

## ⚙️ 配置选项

### 1. 自定义域名
- 在Netlify控制台点击 "Domain settings"
- 点击 "Add custom domain"
- 输入你的域名
- 按照提示配置DNS记录

### 2. 环境变量（如需要）
- 在 "Site settings" > "Environment variables"
- 添加需要的环境变量

### 3. 重定向规则
已在 `netlify.toml` 中配置：
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔧 故障排除

### 常见问题

1. **部署失败**
   - 检查 `netlify.toml` 配置是否正确
   - 确认所有必需文件都存在
   - 查看部署日志中的错误信息

2. **页面显示空白**
   - 检查 `index.html` 文件路径
   - 确认JavaScript文件正确引用
   - 查看浏览器控制台错误

3. **样式不显示**
   - 确认 `styles.css` 文件存在
   - 检查CSS文件路径是否正确
   - 清除浏览器缓存

4. **功能不正常**
   - 检查 `script.js` 文件
   - 查看浏览器控制台JavaScript错误
   - 确认所有依赖文件都已上传

### 调试步骤

1. **查看部署日志**
   - 在Netlify控制台点击部署记录
   - 查看详细的构建和部署日志

2. **本地测试**
   - 在部署前先在本地测试
   - 使用 `直接运行.html` 文件测试

3. **浏览器调试**
   - 按F12打开开发者工具
   - 查看Console、Network、Elements标签页

## 📱 移动端优化

### 检查要点
- ✅ 响应式设计是否正常
- ✅ 触摸交互是否流畅
- ✅ 字体大小是否合适
- ✅ 按钮大小是否便于点击

### 测试方法
- 使用浏览器开发者工具的移动端模拟器
- 在不同设备上实际测试
- 检查各种屏幕尺寸的显示效果

## 🔄 更新部署

### 自动部署
- 如果连接了Git仓库，每次推送代码会自动重新部署
- 在Netlify控制台可以看到部署历史

### 手动更新
- 重新拖拽文件到Netlify
- 或在控制台触发重新部署

## 📊 性能优化

### 已配置的优化
- ✅ 静态文件压缩
- ✅ 浏览器缓存
- ✅ HTTPS强制重定向
- ✅ 安全头部设置

### 进一步优化建议
- 压缩图片文件
- 合并CSS和JavaScript文件
- 使用CDN加速

## 🌐 访问地址

部署成功后，你的网站将获得：
- **默认域名**：`https://your-app-name.netlify.app`
- **自定义域名**：`https://your-domain.com`（如配置）

## 📞 技术支持

如果部署过程中遇到问题：
1. 查看Netlify官方文档
2. 检查项目文件完整性
3. 参考 `问题诊断和解决方案.txt`
4. 查看浏览器控制台错误信息

---

**恭喜！** 🎉 部署完成后，你的命理测算系统就可以在全球范围内访问了！ 