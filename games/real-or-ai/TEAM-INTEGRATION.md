# 合并到小组总网站的建议

建议每个小游戏保持独立目录，避免互相覆盖代码：

```text
booth-games/
├── index.html                 # 总菜单：所有同学的游戏入口
└── games/
    ├── real-or-ai/
    │   ├── index.html
    │   ├── data/questions.js
    │   ├── js/game.js
    │   ├── css/styles.css
    │   └── assets/...
    ├── scam-checker/
    └── another-game/
```

将本项目目录内的**所有内容**复制到 `games/real-or-ai/` 后，总菜单增加：

```html
<a href="./games/real-or-ai/">Real or AI? — 60s Challenge</a>
```

请不要把所有游戏合并成一个 HTML 文件或将素材转成超长的 base64 数据；保持项目独立，对后续修改更稳定。静态网站只负责播放和计时，不会从浏览器直接写回 GitHub。需要发布修改时，请提交最新的 `data/questions.js` 和素材文件。
