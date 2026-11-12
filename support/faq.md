# 常见问题

## 编译

### 提示找不到头文件（cannot open source input file）

例程通过相对路径 `..\..\system\...` 引用公共代码。请确认：

- SDK 解压后的目录结构没有改动，例程仍在 `demo/` 或 `motor_application/` 下；
- 路径中尽量不要包含中文或空格。

### 提示编译器未安装（ARM Compiler 5 not found）

例程使用 ARMCC V5.06。MDK 5.37 及以后版本默认不附带 ARMCC 5，需要单独安装，然后在 **Options for Target → Target → ARM Compiler** 中选择。详见 [开发环境](./dev-env)。

## 下载与调试

### 提示 No Algorithm found / Flash Download failed

没有添加 Flash 下载算法。在 **Options for Target → Debug → Settings → Flash Download** 中添加 `tools\MDK\ODS5070A_20260728_32.FLM`，详见 [开发环境 → 调试器与下载算法](./dev-env#调试器与下载算法)。

### J-Link 连接不上芯片（No Cortex-M device found）

1. 检查接线：SWDIO = PA15，SWCLK = PB0，GND 共地；
2. 确认芯片已上电，电压在 2.2V~3.6V；
3. 把 SWD 速率降到 1MHz 以下再试；
4. 如果程序把 PA15 / PB0 配置成了普通 GPIO，SWD 会失效：在复位状态下连接（**Connect: under Reset**），或先擦除芯片。

### 启用 Flash 加密后无法读取程序

这是正常现象：配置 Flash 加密后，调试模式下 Flash 不可读。需要整片擦除后才能重新下载。

## 运行

### 下载后程序不运行

- 下载后按一次复位，或在 Keil 的 Flash Download 设置中勾选 **Reset and Run**；
- 检查分散加载文件是否为 `ODS5070A_link_mdk.sct`（Flash 运行）。如果用了 `run_from_sram` 版本，程序只在调试时运行于 SRAM，断电即失。

### 串口没有输出

- 核对例程 `main.c` 中 `uart0_gpio_init()` 配置的 TX/RX 引脚，不同例程可能不同；
- 核对串口工具的波特率与例程设置一致；
- 系统时钟在 `sys_config.h` 中修改后，需要重新编译全部文件（Rebuild）。

## 没有找到答案？

请通过首页「联系我们」中的方式与我们联系，并提供芯片型号、SDK 版本和问题现象。
