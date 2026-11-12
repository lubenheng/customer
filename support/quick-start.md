# 快速上手

本文以 SDK 中的 `gpio_toggle` 例程为例，从解压 SDK 到在芯片上运行程序，约需 15 分钟。

## 准备

| 项目 | 说明 |
| --- | --- |
| 硬件 | ODS507x / 505x / 503x 芯片或演示板、J-Link 调试器（SWD 接口） |
| 软件 | Keil MDK 5，安装 ARM Compiler 5（ARMCC V5.06），详见 [开发环境](./dev-env) |
| SDK | 在 [代码下载](/code/) 页面下载 SDK 压缩包 |

## 1. 解压 SDK

解压后目录结构如下：

```text
to_customer_sdk/
├── demo/                 外设例程（GPIO、ADC、PGA、MCPWM、HALL、QEP、UART、SPI、IIC、CAN、LIN 等）
├── motor_application/    电机应用例程（mcpwm_vf_demo：V/F 开环；mcpwm_if_demo：I/F 电流开环）
├── system/               公共代码
│   ├── cmsis/            CMSIS 头文件
│   ├── core/             内核相关
│   ├── device/           器件头文件与启动文件
│   ├── peripherals/      外设底层驱动
│   ├── hal/              外设 HAL 接口
│   └── common/           系统配置 sys_config.h、串口命令行等
├── tools/
│   └── MDK/              Flash 下载算法（.FLM）、分散加载文件（.sct）、寄存器描述（.svd/.sfd）
└── release_tools/        清理编译中间文件的脚本
```

::: tip
请保持目录结构不变。例程工程使用相对路径 `..\..\system\...` 引用公共代码，移动单个例程目录会导致编译找不到文件。
:::

## 2. 打开例程

用 Keil MDK 打开 `demo/gpio_toggle/gpio_demo.uvprojx`。

该例程将 PA2~PA14、PB1~PB15、PC0~PC6 配置为输出并循环翻转，可用示波器或逻辑分析仪在任意引脚上观察到方波。

## 3. 编译

点击 **Rebuild**（或按 `F7`）。编译成功时输出窗口最后一行为：

```text
".\Objects\gpio_demo.axf" - 0 Error(s), 0 Warning(s).
```

编译后会自动执行 `fromelf` 生成 `Objects\gpio_demo.bin`，可用于量产烧录。

## 4. 连接与下载

1. J-Link 连接芯片的 **SWDIO（PA15）**、**SWCLK（PB0）**、**GND**，芯片单独供电（2.2V~3.6V）。
2. 在 Keil 中点击 **Download**（`F8`）。
3. 下载完成后按复位，或在调试模式下点击运行。

例程已配置好 J-Link 与 Flash 下载算法。若下载报错，参见 [开发环境 → 调试器与下载算法](./dev-env#调试器与下载算法) 和 [常见问题](./faq)。

## 5. 下一步

- **修改系统时钟**：打开 `system/common/sys_config.h`，默认使用内部 32MHz 高速时钟（HIRC），可切换为 PLL 或外部晶振。
- **使用串口打印**：大部分例程通过 UART0 输出调试信息，引脚和波特率见各例程 `main.c` 中的 `uart0_gpio_init()`。
- **驱动电机**：从 `motor_application/mcpwm_vf_demo` 开始，先以 V/F 开环方式让电机转起来，再参考 `mcpwm_if_demo`。
- **查阅寄存器**：完整的外设说明见用户手册，可在 [资料下载](/resources/) 获取。
