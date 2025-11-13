# TMDB Proxy - EdgeOne Pages 版本

基于 [danmu_api](https://github.com/huangxd-/danmu_api) 项目的EdgeOne Pages部署方式创建的TMDB代理服务。

## 🚀 部署步骤

### 方法1: GitHub仓库部署（推荐）

1. **创建GitHub仓库**
   - 将此文件夹内容上传到GitHub仓库
   - 确保文件结构：
     ```
     your-repo/
     ├── node-functions/
     │   ├── index.js
     │   └── [[...path]]..js
     └── edgeone.json
     ```

2. **EdgeOne Pages部署**
   - 登录 [EdgeOne控制台](https://console.cloud.tencent.com/edgeone)
   - 进入 Pages 服务
   - 点击"新建站点" → "连接Git仓库"
   - 选择你的GitHub仓库

3. **构建配置**
   - 框架预设: `Other`
   - 根目录: `/`
   - 输出目录: `./` （重要！）
   - 编译命令: 留空
   - 安装命令: 留空

### 方法2: 一键部署

使用EdgeOne Pages的一键部署功能：
```
https://edgeone.ai/pages/new?template=https://github.com/your-username/your-repo&project-name=tmdb-proxy&root-directory=./&outputDirectory=./
```

## 📁 文件说明

- `node-functions/index.js` - 主要的代理逻辑文件
- `node-functions/[[...path]]..js` - 路由重定向文件
- `edgeone.json` - EdgeOne配置文件（重写规则和缓存策略）

## 🎯 使用方法

### 图片代理
```bash
# 原始TMDB图片
https://image.tmdb.org/t/p/w500/bcP7FtskwsNp1ikpMQJzDPjofP5.jpg

# 通过代理访问
https://your-edgeone-domain.com/t/p/w500/bcP7FtskwsNp1ikpMQJzDPjofP5.jpg
```

### API代理
```bash
# 需要提供API Key
curl -H "X-API-Key: your_tmdb_api_key" https://your-edgeone-domain.com/3/movie/popular

# 或使用URL参数
https://your-edgeone-domain.com/3/movie/popular?api_key=your_tmdb_api_key
```

### JavaScript调用
```javascript
// 图片使用
<img src="https://your-edgeone-domain.com/t/p/w500/poster.jpg" />

// API调用
fetch('https://your-edgeone-domain.com/3/movie/popular', {
  headers: { 'X-API-Key': 'your_tmdb_api_key' }
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🔧 管理端点

### 健康检查
```bash
curl https://your-edgeone-domain.com/health
```

### 服务状态（需要API Key）
```bash
curl -H "X-API-Key: your_tmdb_api_key" https://your-edgeone-domain.com/admin/status
```

## ⚡ 功能特性

- ✅ **基于成功案例**: 使用弹幕API项目的成功部署方式
- ✅ **完美伪装**: 主页显示404错误页面
- ✅ **智能缓存**: 图片7天，API根据类型缓存
- ✅ **CORS支持**: 完美的跨域访问支持
- ✅ **安全防护**: API Key保护和错误隐藏
- ✅ **路由重写**: 使用EdgeOne的重写规则处理所有请求
- ✅ **全球CDN**: EdgeOne全球节点加速

## 📊 缓存策略

| 路径 | 缓存时间 | 说明 |
|------|---------|------|
| `/t/p/*` | 7天 | 图片资源长期缓存 |
| `/3/configuration*` | 1小时 | 配置信息 |
| `/3/search*` | 5分钟 | 搜索结果 |
| `/3/movie/popular*` | 30分钟 | 热门内容 |
| `/3/*` | 10分钟 | 其他API |

## 🛡️ 安全特性

- 🔒 **API Key保护**: API请求需要提供有效的TMDB API Key
- 🎭 **404伪装**: 主页和错误都伪装成404页面
- 🌍 **客户端信息**: 获取真实客户端IP地址
- 🔍 **错误隐藏**: 不暴露内部错误信息
- 📝 **日志记录**: 详细的请求日志（控制台可见）

## 🎉 部署成功后

访问你的EdgeOne域名，你将看到：
- 主页显示404页面（正常，这是伪装）
- 按F12打开控制台可以看到服务信息
- 图片和API代理功能正常工作

## 📝 注意事项

1. **输出目录必须设置为 `./`**: 这是关键配置
2. **API Key必须**: API请求必须提供有效的TMDB API Key
3. **404是正常的**: 主页显示404是安全伪装，不是错误
4. **控制台信息**: 真正的服务信息在浏览器控制台中

## 🔍 测试方法

部署成功后测试：

```bash
# 1. 健康检查
https://your-domain.edgeone.run/health

# 2. 图片代理测试
https://your-domain.edgeone.run/t/p/w500/bcP7FtskwsNp1ikpMQJzDPjofP5.jpg

# 3. API代理测试（需要API Key）
curl -H "X-API-Key: your_api_key" https://your-domain.edgeone.run/3/configuration

# 4. 主页（应该显示404伪装页面）
https://your-domain.edgeone.run/
```

现在你有了一个完全基于成功案例的TMDB代理服务！
