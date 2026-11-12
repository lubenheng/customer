# 开发环境

## 软件版本

| 项目 | 要求 | 说明 |
| --- | --- | --- |
| IDE | Keil MDK 5 | SDK 例程均为 MDK 工程（`.uvprojx`） |
| 编译器 | ARM Compiler 5（ARMCC V5.06 update 7） | 例程按 ARMCC 5 配置；MDK 5.37 及以后版本默认不再附带 ARMCC 5，需单独安装 |
| 器件选择 | ARM → Cortex-M0+（ARMCM0P） | 目前使用通用 Cortex-M0+ 器件，无需安装专用器件支持包 |
| CMSIS | ARM.CMSIS 5.8.0 或更高 | Keil 自带 |

::: tip 只装了新版编译器怎么办
在 **Project → Options for Target → Target → ARM Compiler** 中选择已安装的 ARMCC 5。若只有 ARM Compiler 6，例程中的部分语法和启动文件需要调整，建议安装 ARMCC 5。
:::

## 工程设置

例程工程已按以下设置配置，自建工程时可参考：

| 设置项 | 值 |
| --- | --- |
| 宏定义 | `CPU_ODS5070` |
| 头文件路径 | `system\common`、`system\cmsis\include`、`system\core`、`system\peripherals`、`system\hal`、`system\device`、`system\device\ODS_5070\include` |
| 分散加载文件 | `tools\MDK\ODS5070A_link_mdk.sct`（程序在 Flash 运行） |
| 编译后命令 | `fromelf.exe --bincombined "!L" --output="$L\@L.bin"`（生成 .bin） |

`tools\MDK` 下还提供 `ODS5070A_link_mdk_sram.sct`、`ODS5070A_run_from_sram.sct`，用于程序在 SRAM 中运行调试。

## 调试器与下载算法

1. 调试器选择 **J-Link / J-Trace Cortex**，接口选择 **SW**（SWD）。
2. Flash 下载算法使用 `tools\MDK` 下的 `.FLM` 文件：

| 文件 | 适用 |
| --- | --- |
| `ODS5070A_20260728_32.FLM` | 例程默认使用 |
| `ODS5070A_20260728_64.FLM` | 另一 Flash 容量配置 |
| `ODS5070A_20260316.FLM` | 早期版本，仅用于兼容旧工程 |

添加方法：**Options for Target → Debug → Settings → Flash Download → Add**。若列表中没有，先把 `.FLM` 复制到 Keil 安装目录的 `ARM\Flash\` 下。

3. SWD 引脚：**SWDIO = PA15**，**SWCLK = PB0**。

## 寄存器查看

调试时在 **Peripherals → System Viewer** 中查看外设寄存器，需要在 **Options for Target → Target** 中指定 `tools\MDK\ODS5070_Alpha.svd`（或 `.sfd`）。

## 量产烧录

`tools\5070_main_260820.jflash` 是 J-Flash 工程文件，可配合编译生成的 `.bin` 进行批量烧录。
