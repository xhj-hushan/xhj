# XHJ 个人主页

轻量响应式静态站点，技术、项目、生活三者结合。Docker + Nginx，无数据库。

本地预览：直接双击 `index.html` 即可打开首页。页面、样式和图片都使用相对路径，也可通过下述 Docker + Nginx 方式访问。

导航按页面区分：首页显示个人介绍，游戏页介绍升级、斗地主及其技术实现，博客、生活和关于分别显示各自的内容。各页导航、页面主标题和开场文字使用统一字号规则；站内切换使用固定遮罩淡入淡出，图片进入视口时轻微淡入；系统设置“减少动态效果”时关闭这些动画。

移动端已按 320px 和 390px 视口检查五个页面的横向溢出、折叠菜单和生活页照片详情；小屏游戏语音头像做了缩放适配。

## Ubuntu Docker 部署

在项目目录执行：

```bash
docker build -t xhj-homepage:1.0 .
docker run -d --name xhj-homepage --restart unless-stopped -p 8088:80 xhj-homepage:1.0
```

浏览器打开 `http://服务器IP:8088`。如果无法访问，请检查云服务商安全组以及 Ubuntu 防火墙是否允许 TCP 8088。

查看状态：

```bash
docker ps --filter name=xhj-homepage
docker logs --tail 50 xhj-homepage
```

更新版本（构建前确保已备份）：

```bash
docker build -t xhj-homepage:1.1 .
docker stop xhj-homepage
docker rm xhj-homepage
docker run -d --name xhj-homepage --restart unless-stopped -p 8088:80 xhj-homepage:1.1
```

## 修改内容

- `index.html`：首页个人介绍与入口
- `projects.html`：升级、斗地主玩法，以及用短标题和可视化拼贴卡片展示的音乐、语音、牌桌聚焦、道具、排行榜、规则逻辑和部署方式；聚焦演示使用游戏的灯罩与光束样式，照向“开麦”卡片中的三位 AI 头像；点击番茄、鲜花或烤鸡会随机送给一位 AI 头像并播放游戏音效；排行榜展示 Jerry、Tom、娜娜及游戏原头像，胜场为静态演示数据；规则卡片使用游戏牌面样式与游戏中的黑桃、大王图案展示 A、大王、K；两个游戏入口均指向 `https://game.xhj66.cn`
- `blog.html`：八篇可展开的技术文章，补充了检查命令、故障分层和解决思路；Docker、Nginx、网络安全等内容结合本站配置，Kubernetes 和 GitHub Actions 明确标为实验与设计笔记
- `life.html`：2018 年泰山云海、2023 年川西和 2025 年三峡之旅的图文记录；三组照片可轮播，点击打开大图
- `about.html`：个人介绍及 RHCE、HCIE、HCIP 认证展示
- `styles.css`：所有页面共用的配色、字体、移动端布局和图片动效；合并为单一样式文件，避免页面切换时先后应用两套规则
- `script.js`：手机导航、页面转场和图片入场交互
- `game-props.js`：游戏页道具的随机目标、飞行动画、命中效果和音效
- `music-demo.js`：游戏页音乐卡片的播放、暂停和进度控制；示例曲目读取 `music/BadRomance.mp3`，音乐服务仍在游戏项目中单独部署
- `table-focus.js`：游戏页“牌桌聚焦”演示；灯罩沿聚焦卡片中的八分之一椭圆滑轨运动，光束跨过中间卡片照向“开麦”头像，每 5 秒在 Jerry、Tom、娜娜之间平滑切换
- `life-gallery.js`：生活页照片可见时每 3 秒自动轮播，支持按钮、键盘方向键、手机滑动和点击查看大图；悬停或打开大图时暂停
- `nginx/default.conf`：容器内 Nginx 配置

注意：博客中的 Kubernetes 和 GitHub Actions 内容是实验与流程设计，不代表本站已经使用这些技术上线；其他文章中的命令和排障路径可按实际环境复核。

替换博客内容：在 `blog.html` 中找到对应文章的 `id`（`docker`、`kubernetes`、`linux`、`nginx`、`automation`、`troubleshooting`、`network`、`network-security`），修改 `h2` 标题、`post-summary` 摘要、`post-body` 正文和图片 `src`。示例封面在 `assets/blog-*.svg`，可替换为自己的 JPG/PNG 图片。

## 图片

网站图片放在 `assets/` 下，断网时也能显示。首页宽幅主图使用 `hero-landscape.jpg`，下方两张示例图是 `home-workspace.jpg` 和 `home-outdoors.jpg`；建议分别换成约 1600×800 和 1200×675 的横向照片，同名覆盖即可。圆形头像示例是 `profile-placeholder.svg`，换成自己的 JPG/PNG 后需同步修改 `index.html` 里的头像路径。临时 JPG 从 `assets/design-reference.png` 设计参考图中裁出，分辨率较低。游戏项目使用从 `G:\latest` 复制的 `game-upgrade-logo.png` 和 `game-doudizhu-avatar.png`。语音卡片中的 Jerry、Tom、Nana 头像分别来自游戏的 `image/杰瑞.png`、`image/汤姆.png`、`image/娜娜.png`，本项目副本为 `voice-jerry.png`、`voice-tom.png`、`voice-nana.png`。互动道具的 SVG 和 MP3 也从 `G:\latest` 的 `image/` 与 `dajuvoice/` 复制到 `assets/`，以 `game-prop-` 开头。

生活页展示 `shenghuo/` 中泰山 3 张、川西 4 张、三峡 6 张，共 13 张原照；Docker 构建会复制该目录。照片的标题和游记文字可在 `life.html` 中直接修改。

`assets/design-reference.png` 是先前确认的设计参考图。

关于页使用 `assets/certificate-*-public.jpg` 三张公开版证书图片；RHCE 的二维码、验证链接和编号，以及 HCIE、HCIP 的证书编号已遮挡。`zhengshu/` 保留原图供本地保存，不进入 Docker 构建上下文，也不会复制到网站容器。

## 生产环境

推荐使用现有 Nginx/Caddy 将域名 HTTPS 反代到 `127.0.0.1:8088`，此时运行容器时改用 `-p 127.0.0.1:8088:80`，不要直接暴露 8088。无需修改已有游戏容器。
