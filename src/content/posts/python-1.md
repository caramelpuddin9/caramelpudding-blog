---
title: Python 学习笔记（一）：简介与安装
published: 2026-01-16
description: Python 的诞生历史、语言特点、应用场景，以及 Python 解释器的下载安装与环境配置。
image: ./images/new09.png
tags: [Python, 编程, 教程]
category: 技术
draft: false
---
ctrl+alt+l

# python

# 准备阶段

## python

编程语言：人与计算机之间进行交流的工具

c、c++、java、python、php、go……

python：解释性编程语言，不用进行编译。直接运行出结果。胶水语言，其他语言制作i的模块，尤其是c、c++很轻松的连接在一起

诞生：

1989年，为了打发圣诞节假期，Gudio van Rossum吉多· 范罗苏姆（龟叔）决心开发一个新的解释程序（Python雏形）

1991年，第一个Python解释器诞生

Python这个名字，来自龟叔所挚爱的电视剧Monty Python's Flying Circus



Python------大蟒蛇

解释器用c语言进行编写的。

简单、易学、开发效率高



## 安装

Python.org 下载  安装

https://www.python.org/downloads/windows/

在下载页面可以看到很多不同版本的下载链接。其中，标记 x86 的为 32 位安装包，x86-64 为 64 位安装包。executable installer为完整的安装包，下载完即可安装；web-based installer 体积更小，但安装时仍需联网下载其他部分。一般网络不好时选择 executable installer，以保证安装过程不会中断。

[操作系统](https://so.csdn.net/so/search?q=操作系统&spm=1001.2101.3001.7020)的位数可通过以下操作确定：右击此电脑 -> 点击属性 -> 查看位数；一般是64位

**安装时，勾选add pythonxx  to  PATH**




选择下方的Customize installation（自定义安装）







安装路径 更改一下


点击disable path length limit

 

window+r           -------------》输入cmd-----》输入python检验是否安装成功





 https://www.jetbrains.com/pycharm/download/#section=windows



出现问题（未勾选add pythonxx  to  PATH）环境变量配置：

 ***可能出现的问题*：**

Win+r-----cmd-----python-->>>python代码


解决办法1：卸载，重新安装---勾选

解决办法2：

1、点击此电脑，单击属性


2、点击高级系统设置


3、在高级下边点击环境变量


4、选中path点击编辑


5、打开 python 的安装路径（安装时设置的，可能跟笔者不同） -> 点击地址栏 -> “Ctrl+C” 复制路径




6、编辑环境点击新建，将路径复制粘贴，点击确定即可

C:\Users\21195\AppData\Local\Programs\Python\Python311\Scripts\





有时候配置了环境变量，在命令行输入 “python” 会弹出微软商店。解决办法是将 python 的路径上移到微软商店前面：




## 第一个python程序

cmd-----python

\>>>写python

print("hello World")

回车执行

print（“”） 英文的"" （）

 

练习：自己输出自己的性命在屏幕上



## python解释器

计算机只认识0、1



 为什莫print（“”）计算机认识----》python有解释器程序(翻译成二进制，提交给计算机运行python.exe文件，就是python解释器

\>>>本质就是在python解释器中运行

.py的文件，通过python 文件路径

进行多行的运行

## Pycharm集成开发工具



