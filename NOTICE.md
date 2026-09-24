# 第三方素材

代码以 [MIT](LICENSE) 许可开源；`public/` 下的素材不在此列，各自沿用下面的许可。

- **插画与分类图标**（`public/images/`，颜色 / 形状 / 数字 / 草除外）以及 **PWA 图标里的小狗**（`public/icons/`）来自 [Twemoji](https://github.com/jdecked/twemoji)：Copyright 2019 Twitter, Inc and other contributors；图形以 [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) 许可，代码以 MIT 许可。由 `npm run images` / `npm run icons` 从 `@twemoji/svg` 包拷出或合成，未改动图形本身。
- **自绘的 SVG**（颜色蜡笔、形状、数字与苹果计数、草，由 `scripts/draw.ts` 生成；数字卡里的苹果复用 Twemoji 🍎）与代码同为 MIT 许可。
- **真实照片**（`public/photos/`）来自 [Wikimedia Commons](https://commons.wikimedia.org/)，只收 CC0 / 公有领域 / CC BY / CC BY-SA 许可的图，由 `npm run photos` 挑选、裁成 480×360。每张照片的文件名、作者、许可与来源页面在 `public/photos/credits.json`，应用内「家长设置 → 素材来源」也能看到；本项目对照片只做了裁切与缩放，CC BY-SA 的照片裁切后的版本仍按原许可提供。
- **发音**（`public/audio/`）由 `npm run audio` 用微软 Edge 朗读接口（Edge-TTS，Azure 神经音色 `zh-CN-XiaoxiaoNeural` / `en-US-JennyNeural`）合成，仅作本应用的朗读之用；合成语音的使用条款以微软的为准，不随本仓库的 MIT 许可一并授权。
