# MVP 首页设计预览

当前版本：2026-10-27。独立入口为 `/design-preview/`，原 `/home/`、其他页面及公共样式不变。

## 页面结构

- 首屏采用居中 MVP 标识、软件介绍与 Download / Tutorial / Issues 三个原版按钮，背景为克制的浅色层叠曲线。移除了早期的 GWAS 流程卡片、染色体与曼哈顿装饰元素。
- 紧接首屏保留 M / V / P 三项特点入口，分别跳转到内存、可视化和并行计算板块。
- **Memory-efficient**：介绍内存映射、基因型分块处理与混合精度，以数据块到工作内存的示意图展示过程。减少基因型数据的内存占用不等同于所有模型都只需要一个数据块的内存；关系矩阵等仍影响总内存。
- **Visualization-enhanced**：展示环形 Manhattan、Q–Q 与 SNP density 三类示例图。透明底配图分别提供日间与夜间版本，保留完整坐标及色标。
- **Parallel-accelerated**：保留 Intel MKL、Kunpeng [鲲鹏] KML、OpenBLAS、Apple Accelerate 与 OpenMP 的 CPU 说明，补充可选 CUDA GPU 加速和受支持系统上的多 GPU 特征分解。图中直接并列 CPU / GPU，移除上方 MVP 执行后端节点。
- 导航、字体、品牌渐变、三个按钮与页脚复用原页面；分区使用统一的字号、留白和较沉稳的蓝色。

当前首屏介绍覆盖 GWAS、群体结构、Meta 分析、高维表型分析与可视化。这里的高维表型分析指多个表型的关联分析能力，不表示任意高维统计模型。

## 本地预览

运行 `npm run dev`，然后打开：

- `/design-preview/`：跟随系统外观。
- `/design-preview/?theme=light`：日间。
- `/design-preview/?theme=dark`：夜间。

顶部切换器以 URL 参数保存外观选择，不写永久存储。页面带有 `noindex, nofollow`。首屏按桌面网页比例设计，本轮不以移动端比例适配作为验收目标。仅合并此目录不会替换现有首页。

## 配图来源与表述边界

科研图示来自 CMplot 官方仓库的示例，并非本次运行 MVP 生成的输出，也不是性能测试结果。原始来源、指纹与透明底处理记录保存在 `assets/sources.json`。原 WebP 与日夜透明 PNG 一并保留，便于追溯处理前后内容。

| 原始资源 | 来源 |
| --- | --- |
| `circular-manhattan.webp` | https://github.com/YinLiLin/CMplot/blob/master/Figure/9.jpg |
| `qq-multitrait.webp` | https://github.com/YinLiLin/CMplot/blob/master/Figure/8.jpg |
| `snp-density.webp` | https://github.com/YinLiLin/CMplot/blob/master/Figure/illumilla_60K_Qc.jpg |

内存与 CPU/GPU 架构使用 HTML、CSS 和内嵌 SVG 绘制。CPU/GPU 柱形仅示意并行工作，不代表核心数量、实测耗时、吞吐率或性能倍数。GPU 需要 CUDA 构建及兼容的 NVIDIA 硬件/运行环境，不代表所有任务都默认在 GPU 上执行。

文案核对依据包括仓库内 `tutorial/introduction/`、`tutorial/running-himvp/`、`tutorial/meta-analysis/`，以及用户提供的 MVP 源码中的内存映射、分块解码、float/double 与 CPU/CUDA 路径。此设计变更没有运行 GWAS 或计算性能测试。

## 验证范围

桌面日间/夜间外观、主题切换、锚点跳转、图文对齐、图片加载、本地链接及教程锚点；保留原版首页及页脚内容。历次审阅截图、布局采样文件与系统文件不提交。
