---
title: Python 学习笔记（六）：文件操作与异常处理
published: 2026-01-21
description: 文件读写、with 上下文管理、异常捕获 try/except/finally、正则表达式 re 模块、数据可视化基础。
image: ./images/bg015.png
tags: [Python, 文件, 异常, 正则]
category: 技术
draft: false
---
# python的文件操作



i/o流(input output stream)：输入输出流:在广义上指的是：计算机中数据的输入输出，包括网络通信

狭义上：指内存中的输入输出

`内存`数据和磁盘这种可以永久存储数据的设备间的数据流动问题。

磁盘---内存----cpu----内存---磁盘

包括网络上的数据请求……

内存是最重要的缓冲设备



**I/O流分类:**		**数据的流动方向：(站在内存、cpu的角度)**

​											输入流：磁盘上的文件读取到内存中，是输入流

​                                              输出流：将数据从内存存储在磁盘中，输出流

**数据的类型**

​						字节流（01010101二进制）：媒体文件等	

​						字符流：字符串。读取的效率较高，但字节流是根本。



`python通过open函数操作io流`







## 文件的编码

计算机只认识0-1，使用编码技术（密码本）将内容翻译成0和1存入硬盘


计算机有很多的可用编码（不同的密码本）：




读写文件编码必须一致

utf-8：目前全球通用的编码格式

gbk;`````

.........................

## 文件的读取操作


打开、读、写、关闭

**打开：open函数**

​         open（name，mode，encoding）

name：目标文件名的字符串

mode：打开文件的模式          只读  r、写入、追加

返回一个数字，标识文件




![在这里插入图片描述](https://img-blog.csdnimg.cn/20201008101837740.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzc5NDMxMQ==,size_16,color_FFFFFF,t_70#pic_center)



encoding：编码格式（UTF-8）

~~~
f = open("D:\python.txt", "r", encoding="UTF-8")
# print(type(f))
~~~

f为文件对象，有方法

**read方法：**

文件对象.read(读取的数据的长度)   为空：读取全部内容 默认是-1，即读取到最后一位

**readlines（）方法**（针对字符流）

返回一个列表，每一行的数据为一个元素




~~~
print(f.read(2))

print(f.readlines())
~~~

**`fileno`**:os亲自维护的，描述符

**name**:返回文件位置

**readable()**

**writable()**

**seek**：指针，第一次读取数据之后，指针移动到最后边，无法再读取


**f.seek(0)**



**readline（）方法**（针对字符数据的）

一次读取一行





for循环读取文件行


**关闭文件**

因为python会占用文件

f.close（）

with  open  语法操作文件


with  open 自动将文件关闭


文件的写入

打开文件

open（）

文件写入

f.write()  --------积攒在程序的内存中

内容刷新

f.flush()--------内容真正写入文件



文件的**追加**，将w模式替换称a模式即可，不会把原来内容进行覆盖

##对象的序列化

序列化：将面向对象编程中的对象存储的过程。

对象是逻辑上存在的抽象的概念，是虚构出来的东西。想象中的东西，无法进行存储。想象中，你是百亿总裁，现实中能够复现吗？

list = [1,2,3,4,5]   是python自身构建的对象

~~~
f = open("a.txt","w")
f.write(list)

报错
ff = open("a.txt","bw")
f.write(list)
报错


列表是双向链表组成的，逻辑上组成的，不是真实存在的。本质是大量的内存地址。无法存储在磁盘这些存储设备中

要存储：转换为字符串、二进制这种计算机能够确切识别的
~~~



- 对象序列化

   将对应编程语言的抽象概念----object转换为可以存储和传输的真实数据（字节、字符串）

- 对象持久化

   将对象永久保存下来，只有序列化之后的对象才可以进行正常的存储

- 对象反序列化

   将真实的数据（字符串、字节）准换为对应的对象的过程

- 对象反持久化

   将永久存储的真实对象数据，重新读取到内存，转换为对象



===》进行序列化

提供了两个模块

1. pickle模块

   python提供给开发者进行序列化和反序列化的模块。注意：：：在序列化过程中，会将对象序列化为字节。字符串可能存在格式的问题（主流的字符串格式：json……     .ini    等比较通用）

   dump（持久化）\dumps（序列化）  ：用于做序列化和持久化的

   load（持久化）、loads（序列化）（：主要用于做反序列化和反持久化的

   ~~~python
    ls = [1,2,3,4,5]
   >>> import pickle
   >>> pickle.dumps(ls)
   b'\x80\x04\x95\x0f\x00\x00\x00\x00\x00\x00\x00]\x94(K\x01K\x02K\x03K\x04K\x05e.'
   >>> res = pickle.dumps(ls)   #序列化
   >>> with open("E:\\a.dat","bw")  as f:
   ...     f.write(res)
   
   
   
   
   >>> pickle.dump(ls,open("E:\\b.txt","wb"))  #持久化，直接就会进行序列化ls，并且存储到指定的位置
   
   
   
   >>> f = open("E:\\a.dat","rb")
   >>> c = f.read()
   >>> c
   b'\x80\x04\x95\x0f\x00\x00\x00\x00\x00\x00\x00]\x94(K\x01K\x02K\x03K\x04K\x05e.'
   >>> pickle.loads(c)   #反序列化    
   [1, 2, 3, 4, 5]
   
   
   
   
   
   
   >>> pickle.load(open("E:\\a.dat","rb"))   #反持久化
   [1, 2, 3, 4, 5]
   ~~~

   

2. JSON

   ![image-20240415162033238](https://zzq-1258460726.cos.ap-nanjing.myqcloud.com//typora-pic/image-20240415162033238.png)

~~~python
>>> import json
>>> d = {"name":"zhangsan","age":21}
>>> json.dumps(d)
'{"name": "zhangsan", "age": 21}'
>>> json.dump(d,open("E:\\a.json","w"))
>>> json.load(open("E:\\a.json","r"))
{'name': 'zhangsan', 'age': 21}
~~~



# python异常

异常：检测到错误，解释器无法继续执行，出现错误提示，即为异常（BUG   小虫子）


## 捕获异常

即为异常处理

1. 整个程序因为BUG停止运行
2. 对BUG进行提醒，整个程序继续运行

**捕获异常作用：提前假设某处会出现异常，提前做好准备，当真的出现异常时，有后续手段**

**基本语法**：

try：

​      可能发生错误的代码

except：

​      如果出现异常的代码

~~~python
try:
    file1 = open('D:\yfile.txt', 'r', encoding="UTF-8")
except:
    print("出错了！！！，文件不存在，请以w模式打开文件")
~~~



捕获指定的异常：

try：

​       有可能出现异常的代码

except   NameError（特定错误） as  e：

//e   异常的具体信息

​            print（e）

捕获多个异常


捕获全部异常


else：没有出现异常执行的代码（可不写）


finally：无论如何，我都要执行的代码


## 异常的传递

异常具有传递性


## python的模块

模块：一个python文件，模块能定义函数、类和变量，也能包含可执行的代码

当作工具包使用

### 模块的导入


**import  模块名**

time 模块：import time

sleep函数：time.sleep(5)  暂停5s



**from   模块名   import   功能名**    （针对某一个功能去使用）           from   time   import   sleep

​                                                                       sleep（5）

from time   import   *    ：导入全部功能           使用时，不需要time.sleep()   ,直接sleep()



### 自定义模块

个性化模块------自定义模块的实现


自定义模块中的测试不想导入模块时使用——main——变量


——all——变量：



## python包

模块太多，会混乱，python包相当于文件夹

### 自定义包





控制       import  *


### 安装第三方包

python没有内置的，非官方的包

pip install  包名称   默认链接的国外的网


## 综合案例


# 正则表达式

re模块

search：只返回匹配到的第一个

findall

match

sub

finditer   返回迭代器

split（）分割字符串



## 元字符



元字符：具有固定含义的特殊符号

.                    匹配任意字符，除了\n

\d                  匹配数字，一位

\w                  匹配有效字符。数字、字母、下划线、语言符号

^         

$

+

*

[]                  列举括号中的某一符号

[^]匹配除了……的符号





a|b   或者



## 反义符：



\W                 特殊字符

 \S                  非空白位

\D                   非数字

[^]                    非列举，不能有[]中字符出现，与列举相反

## 转义符

>>> a=10
>>> b=3
>>> print("%s % %s=%s"%(a,b,a%b))
>>> Traceback (most recent call last):
>>>   File "<stdin>", line 1, in <module>
>>> ValueError: unsupported format character '%' (0x25) at index 5
>>> print("%s %% %s=%s"%(a,b,a%b))
>>> 10 % 3=1

加%进行转义

print("")

## 位数问题

*

+

？           0,n

{n}          n

{n，}           >n

{n，m}        [n,m]



练习：匹配59127_ab@openlab.com,@前为4-20位

## 分组

：在正则中充当二次筛选



```
>>> re.match(r"<([a-zA-Z]+).*>(.*)</\1>","<a>我是一个链接</a>")

>>>re.match(r"<([a-zA-Z]+).*>(.*)</\1>","<a>我是一个链接</b>")
 
>>> res.group(2)
'我是一个链接'
#findall直接返回分组的匹配结果
>>> re.findall(r"<([a-zA-Z]+).*>(.*)</\1>","<a>我是一个链接</a>")
[('a', '我是一个链接')]
```



~~~
res='''
... <div>div的内容</div>
... <div>div的内容</div>
... <div>div的内容</div>
... '''
'''res
'\n<div>div的内容</div>\n<div>div的内容</div>\n<div>div的内容</div>\n'
re.sub(r"\n|\r|\t","",res)
'<div>div的内容</div><div>div的内容</div><div>div的内容</div>'
'''

re.sub(r"\n|\r|\t","",res)     替换
~~~



## 贪婪匹配懒惰匹配

~~~
import re

text = "<p>first</p><p>second</p>"
pattern = r"<p>(.*)</p>"  # 使用贪婪匹配 .* 来匹配内容

matches = re.findall(pattern, text)
print(matches)  # 输出: ['first</p><p>second']

~~~



2、

+、*、？、{n，}存在贪婪匹配，尽可能多进行匹配



~~~
pattern = r"<p>(.*?)</p>"  # 使用非贪婪匹配 .*? 来匹配内容

matches = re.findall(pattern, text)
print(matches)  # 输出: ['first', 'second']

~~~



？有或者没有/



## re模块

导入re模块

1、re.findall()

匹配字符串中所有的符合正则的内容

~~~python
import re

lst = re.findall(r"\d+" , "我的电话号码是1008611")

print(lst)#结果是list
~~~

2、re.finditer()匹配字符串中所有的符合正则的内容

返回一个迭代器

~~~python
it = re.finditer(r"\d+" , "我的电话号码是1008611")

for i in it:
	print(i.group（）)
~~~



3、re.search() 找到一个结果就返回

~~~
i = re.search（）
print（i.group()）
~~~



4、re . match()从头开始匹配

5、预加载正则表达式

~~~python
obj = re.compile(r"\d+")

ret = obj.finditer("我的电话号码是1008611")

for i  in ret:
    print(i.group())

~~~



~~~python
import re


s = '''
<div class = 'a'><span>黄子韬</span></div>
<div class = 'a'><span>张杰</span></div>
<div class = 'a'><span>菜菜</span></div>




'''
# patter = re.compile("<div class = '.*?'><span>(.*?)<\/span><\/div>")
# re.S:让. 能够匹配到换行符
patter = re.compile(
    r"<div class = '.*?'><span>(?P<wahaha>.*?)<\/span><\/div>", re.S)

ret = patter.finditer(s)
# print(next(ret).group(1))
print(next(ret).group("wahaha"))
print(next(ret).group("wahaha"))
print(next(ret).group("wahaha"))
~~~



# 数据可视化

## JSON

轻量级的数据交互格式，可以按照json指定的格式去组织和封装技术

有特定格式的字符串

不同编程语言中数据传递和交互，不同语言之间的中转站


python数据和json数据相互转换

1. 导入json模块
2. 准备符合json格式的python数据
3. 数据转化为json数据        json.dumps(数据)   含中文
5. 数据转化为python数据     json.loads(数据)

## pyecharts模块

帮助完成数据可视化效果

pip install  pyecharts

