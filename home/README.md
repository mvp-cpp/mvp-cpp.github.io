# MVP 首页

正式入口为 `/home/`，根路径重定向到该入口。

## 页面结构

- 居中 MVP 标识、精简的软件介绍、Download / Tutorial / Issues 三个原版按钮，以及浅色层叠背景。
- M / V / P 三项入口分别跳转到内存、可视化与并行计算板块。
- **Memory-efficient**：内存映射、基因型分块处理和混合精度，配合数据块到工作内存的示意图。减少基因型数据内存占用不意味着关系矩阵和模型不再需要额外内存。
- **Visualization-enhanced**：环形 Manhattan、Q–Q 与 SNP density 示例，保留坐标和色标，透明底图片按系统明暗主题切换。
- **Parallel-accelerated**：CPU 多线程、数值库与 OpenMP，以及可选 CUDA GPU 加速和受支持系统上的多 GPU 特征分解。
- 导航、字体、品牌渐变、按钮与页脚沿用公共样式。首屏按桌面网页比例设计，本轮不以移动端比例优化作为验收目标。

首屏中的高维表型分析指多个表型的关联分析，不代表任意高维统计模型。CPU/GPU 柱形是并行工作示意，不是核心数量或性能基准。GPU 需要 CUDA 构建及兼容的 NVIDIA 硬件/运行环境。

## 文件

- `home/index.html`：正式首页。
- `assets/css/style.css`：原有公共样式。
- `assets/css/home.css`：首页布局与图示样式，仅在首页加载。
- `assets/js/home.js`：跟随系统外观，监听系统明暗模式变更；没有预览工具条或 URL 模式参数。
- `assets/img/*-transparent*.png`：日间/夜间科研图示。
- `assets/img/home-plot-sources.json`：原始图和透明底衍生图的来源与处理记录；原始 WebP 同目录保留。

科研配图来自 CMplot 官方仓库的示例，并非本次运行 MVP 生成的结果，也不是性能测试。内存与 CPU/GPU 图使用 HTML/CSS/内嵌 SVG 绘制。文案核对参考本仓库教程及用户提供的 MVP 源码；本轮没有运行 GWAS 或性能测试。

## 本地检查

运行 `npm run dev` 后打开 `/home/`。核对桌面系统日间/夜间外观、锚点跳转、图文对齐、图片与本地链接、教程锚点和页脚。独立设计预览入口已移除，设计直接应用于正式首页。
