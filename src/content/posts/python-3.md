---
title: Python 学习笔记（三）：判断语句与循环
published: 2026-01-18
description: if/elif/else 条件判断、while/for 循环控制、break/continue 跳转、循环嵌套与综合案例。
image: ./images/bg012.png
tags: [Python, 编程, 流程控制]
category: 技术
draft: false
---
# 判断语句

## 布尔类型和比较运算符

真和假

True 真 1

False 假 0

 变量名=”布尔类型“

 通过比较运算符进行内容比较得到


*#**变量定义存储布尔类型的数据*

bool_1=True

bool_2=False

print(bool_1,type(bool_1))

*#**比较运算符的使用*

*#==!=><>=<=*

 print(2==3)

 print(2!=3)

## if语句

条件语句：去网吧要身份证，可能会发生什么？判断是否成年~

所谓判断就是条件语句，即条件成立执行某些代码，不成立，则不执行代码

### 单语句

语法：

~~~
if 要判断的条件：
      条件成立时，要执行的代码1
      条件成立时，要执行的代码2
      ……
print('你可管不住我哦')
~~~

 注意：if下方未加缩进的代码不是if里的代码，始终会执行




### 双语句

语法：

~~~python
if 条件：
	条件成立执行的代码
else：
	条件不成立时的代码
~~~




四个空格缩进不要忘记



if语句执行流程：（debug查看）

某些条件执行了相关代码，则其他情况的代码解释器根本就不会执行



## 多条件判断语法

<18童工、18-60、>60退休


```python
age = int(input("请输入您的年龄："))
#if (age > 18) and (age < 60)
if 40 > age > 18:
print("恭喜你，你成年了")
elif age > 40:
print("哇偶，水木年华")
else:
print("你是未成年")
```



## 判断语句终极--嵌套使用




坐公交：有钱，上车，没钱，不上，上车，有空位置，坐下，没有，站着

~~~python
#案例：
money = 1
seat = 1
if money ===1 :
    print('上车')
    if seat ===1 :
        print('有空位置，快坐下')、
    else：
    	print('没位置了，站一会儿吧')
else:
    print('没钱，跟着跑')

~~~


## 实战演习

### 猜拳游戏

玩家：手动出

电脑：随机出

输赢：玩家胜、电脑胜、平局

~~~python
import random
player = input('请输入：0：石头、1：剪刀、2：布')
computer = random.randint(0,2)
if (player == 0 and computer == 1) or (player == 1 and computer == 2) or (player == 2 and computer == 0):
	print('玩家获胜')
elif player == computer：
	print('平局')
else：
	print('电脑获胜')
~~~



扩展：随机数的获取

1、import random

2、random.randint(start , end) 包含起始和结束



## 三目运算符

三元运算符、三元表达式

`条件成立执行的表达式  if  条件  else  条件不成立执行的表达式`

~~~python
a = 1
b = 2
print(a) if a > b else print(b)
~~~





# 循环

应用：循环轮播图  最基础、最核心

## while循环



规划好条件

练习：求1-100的累加和（终止条件  1-100）

猜数字游戏:



```python
import random
random = random.randint(1,100)#获取随机数字
print(random)
flag = True
while flag:
    n = int(input("请猜一猜数字吧"))
    if n==random:
        print("猜对了")
        flag = False
    elif n > random:
        print("猜大了")
    else:
        print("猜小了")

```

## 循环嵌套

```python
while i <= 100:
    print(f"今天是第{i}天，准备表白思密达~")
    j = 1
    while j <= 10:
        print(f"送她第{j}朵花花")
        j += 1
    i += 1
print(f"坚持到{i-1}天表白成功")
```

练习：99乘法表

```python
i = 1
while i <= 9:
    j = 1
    while j <= i:
        print(f"{i}*{j}={i*j}\t",end="" )
        j += 1
    i += 1
    print()
```


## for循环

### 基础语法：

 轮询机制

   对一批内容进行挨个处理---待办事项逐个完成的机制

   for 临时变量 in 待处理数据集：

​      循环满足条件时执行的代码


遍历循环，一次取出 

无法定义循环条件，理论上，无法构建无限循环





**练习：** ”xianoupeng“ 判断是否有a，几个

```
name='xianoupeng'
count=0
for I in name:
If i=="a":
count+=1


print(f"一共有{count}个a")
```

### range语句


### range语句：获得一个简单的数字序列

从0开始，到5结束的数字序列，不包含5本身

 range（5）===>[0,1,2,3,4]

range（1，5）===>[1,2,3,4]  从1-5，不包含5

range（1，10，2）===>[1,3,5,7,9]第三个数字代表数字之间的步长，不含10本身


练习


### for循环变量的作用域

临时变量在编程规范上，作用范围，只限定在for循环内部

实际上，for循环外部可以访问到，编程规范上，是不允许，不建议的


想要使用，在循环之前将该变量定义

### for循环的嵌套使用

空格缩进


练习：

for循环打印九九乘法表


### 循环中断

continue:终端本次循环，直接进入下一次循环



### 循环综合案例


```python
import random
money=10000
foriinrange(1,21):
score=random.randint(1,10)
ifscore<5:
print(f"员工{i}绩效为{score},不发工资")
continue
#判断余额
if money>=1000:
money-=1000
print(f"员工{i}发放工资1000，公司账户剩余{money}")
else:
print(f"当前余额剩余{money}，不发了，下个月吧")
break
```


## 循环和else配合使用

### while……else

`else后面的代码：当循环正常结束之后要执行的代码·`

~~~python
i = 1 
while i<=5:
    if i == 3:
        print('不真诚')
        i += 1
        continue
	print('我错了，思密达~')
else:
	print('她原谅我了')
~~~

只有代签执行完毕了，才会被原谅

中途break，else下边缩进的代码不会执行

中途continue，else下边缩进的代码会执行

### for……else

同上

