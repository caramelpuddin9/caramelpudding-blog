---
title: Python 学习笔记（五）：数据容器与内置模块
published: 2026-01-20
description: 列表/元组/字典/集合/字符串等数据容器操作，os/time/random/hashlib 等内置模块的使用。
image: ./images/new13.png
tags: [Python, 数据结构, 模块]
category: 技术
draft: false
---
# python数据容器

可以容纳多份数据的数据类型，容纳的每一份数据成为一个元素，可以是任意类型的数据 

 数据容器:根据是否支持重复元素、是否可以修改、是否有序等

列表，元组，字符串，集合，字典

## 列表



列表

定义及语法：

字面量：[元素1，元素2，元素3……]

变量

变量名称=[元素1，元素2，元素3……]

定义空列表：

变量名称=[]

变量名称=list（）

列表内的每一个数据，称之为元素

可以为不同数据类型，支持嵌套

 列表的下标索引取出特定位置的元素

0开始

Li[0]


### 列表的常用操作

（列表的方法（函数定义为class的成员，函数则小称为方法））：


查询某元素下标：列表.index（元素）

修改特定位置的元素值：列表[下标]=值

插入元素：列表.insert(下标，元素)

​                   列表.append（元素）

追加一批元素       列表.extend(其他数据容器)

删除元素：

​         del 列表[下标]

​         列表.pop(下标)  删掉的元素作为返回值得到

删掉某元素在列表中的第一个匹配项

   列表.remove(元素)

清空列表

列表.clear()

 

统计某元素在列表中的数量：

​             列表.count（元素）

 统计列表中的全部的元素数量

​              len（列表）


列表特点：


### 练习：


### 列表的遍历

while循环遍历列表

 

![img](data:image/png;base64,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)

 

 



~~~python
name=['zs','ls','wmz']
index=0
while index<len(name):
    print(name[index])
    index+=1
~~~



for循环遍历列表

~~~python
name=['zs','ls','wmz']
for i in name:
    print(i)
~~~





练习


## 元组

------

 元组一旦定义，不可更改

变量名称=（元素1，元素2，元素3，元素4…….）

定义空元组

变量名称=（）

变量名称=tuple（）

 

定义单个元素的元组，后边一定要跟  ,

元组的嵌套

（（），（））

下标索引取出元素====与列表相同

 元组的操作

1. 查找某个元素的下标

​     index（）

  2.数据在元素中出现在的次数

   count()

 3.len()

   统计元组内的元素个数

元组的遍历：

​              while

​                 for



**元组不可以改变**




## 字符串

Python中最常用的数据类型（input函数接收到的数据类型字符串类型……后边python控制文件操作中，读取写入都是字符串，爬虫爬取的数据也是字符串……）。学习关键知识点

### 定义和操作

'  '

"  "

'''      '''：保留原来的输入格式

注意事项：

' '里边只能是""

""里边只能是''

否则进行转义    'i \ 'am '



字符串输出回顾

格式化输出



### 下标

字符的容器

“openlab”

下标索引：正向索引

​                    反向索引

只读，不允许进行修改

###常用方法：

| 查找                    | index（“   ”）      |
| :-------------------- | ----------------- |
| 字符串的替换：               | replace（）         |
| 字符串的分割（本身不变），得到一个列表对象 | 字符串.split（分隔符字符串） |
| 去掉前后空格                | strip（）           |
| 统计某字符串的出现次数           | count（）           |
| 长度                    | len（）             |

## 数据容器（序列）的切片

序列：内容连续、有序，可使用下标索引的一类数据容器（列表、元组、字符串）

切片：从一个序列中，取出一个子序列
$$
序列[起始下标：结束下标（不包含，可以留空）：步长]
步长为n表示每次跳过n-1个元素取
步长为负数，反向取（起始下标和结束下标也要反向标记）
$$
切片不会影响序列本身，而是会得到一个新的序列

~~~python
list=[1,2,3,4,5,6,7,8]
print(list[0:5:2])
//::-2  等同于序列进行反转
print(list[::-2])
list2=(1,2,3,4,5,6,7,8,9,10)
print(list2[0:7:2])

~~~

切片练习题：判断字符串是否为回文字符串

```python
def is_huistr(str):
    if str[::-1]==str[::1]:
        print("True")
    else:
        print("False")
n=input("请输入待检测字符串：")

is_huistr(n)
```



## 迭代

给定一个列表或者元组，我们可以通过`for`循环来遍历这个`list`或`tuple`，这种遍历我们称为迭代（Iteration）。



python默认用for ……in……完成迭代。可以做用在其他的可迭代对象上

~~~python
>>> d = {'a': 1, 'b': 2, 'c': 3}
>>> for key in d:
...     print(key)
...
a
c
b
~~~

默认情况下，`dict`迭代的是key。如果要迭代value，可以用`for value in d.values()`，如果要同时迭代key和value，可以用`for k, v in d.items()`。

字符串也可以进行迭代





`判断对象是可迭代对象：`

通过`collections.abc`模块的`Iterable`类型判断

```python
>>> from collections.abc import Iterable
>>> isinstance('abc', Iterable) # str是否可迭代
True
>>> isinstance([1,2,3], Iterable) # list是否可迭代
True
>>> isinstance(123, Iterable) # 整数是否可迭代
False
```

`enumberate函数`，将列表变为索引-元素对

~~~python
>>> for i, value in enumerate(['A', 'B', 'C']):
...     print(i, value)
~~~

## 列表推导式

python内置的用来创建list的生成式

~~~python
[x * x for x in range(1, 11)]
~~~

还可以添加判断：

~~~python
 [x * x for x in range(1, 11) if x % 2 == 0]
~~~

多个for循环实现列表推导式：(for 循环嵌套)

~~~python
list 1 = [(i , j )for i in range(1,3) for j in range(3)]
~~~

## 字典推导式

~~~python
dict1 = {i : i ** 2 for i in range(1,5)}


list1 = ['uname','age']
list2 = ['gouxin',21]
dict2 = {list1[i] : list2[i] for i  in range(len(list1))}


counts = {'MBP':200,'HP':100,'CHD':211}

#提取字典中目标数据
count1 = {key : value for key ,value in counts.items() if value >=200}

~~~



## 集合推导式

~~~python
list = [1,1,2,3,4,4]
set ={ i**2 for i in list}
~~~



## 生成器

不创建出完整的list，而在循环中不断地推算出后续的元素

这种机制，叫做生成器

创建方式：1、将列表生成器的[]改为（）

~~~python
g = (x*x for x in range(10))

~~~

g是一个生成器

如何打印生成其中的每一个元素？？

(1)、一个一个打印出来：用next（）

~~~
next(g)
~~~

无更多的元素时，报错

(2)、使用for循环，因为`生成器也是可迭代对象`


~~~python
>>> for n in g:
...     print(n)
~~~

2、创建生成器方式2

一个函数定义中包含`yield`关键字，那么这个函数就不再是一个普通函数，而是一个generator函数，调用一个generator函数将返回一个generator

~~~python
def odd():
    print('step 1')
    yield 1
    print('step 2')
    yield 3
    print('step 3')
    yield 5


>>> o = odd()
>>> next(o)
step 1
1
>>> next(o)
step 2
3
>>> next(o)
step 3
5
>>> next(o)
~~~



捕获错误：

~~~
>>> while True:
...     try:
...         x = next(g)
...         print('g:', x)
...     except StopIteration as e:
...         print('Generator return value:', e.value)
...         break
~~~

练习：

[杨辉三角](http://baike.baidu.com/view/7804.htm)定义如下：

```ascii
          1
         / \
        1   1
       / \ / \
      1   2   1
     / \ / \ / \
    1   3   3   1
   / \ / \ / \ / \
  1   4   6   4   1
 / \ / \ / \ / \ / \
1   5   10  10  5   1
```

把每一行看做一个list，试写一个generator，不断输出下一行的list：

~~~python
def generate_pascals_triangle():
    row = [1]  # 第一行，只有一个元素1
    yield row

    while True:
        new_row = [1]  # 新行的第一个元素总是1

        for i in range(1, len(row)):
            new_element = row[i - 1] + row[i]  # 计算新行中间的元素
            new_row.append(new_element)

        new_row.append(1)  # 新行的最后一个元素总是1
        yield new_row

        row = new_row  # 更新当前行为新行


# 创建一个生成器对象
triangle_generator = generate_pascals_triangle()

# 输出前几行杨辉三角
for _ in range(10):  # 输出前5行作为示例
    row = next(triangle_generator)
    print(row)

~~~



## 迭代器









但`list`、`dict`、`str`虽然是`Iterable`，却不是`Iterator`。

~~~python
>>> from collections.abc import Iterator
>>> arr=[1,2,3]
>>> isinstance(arr,Iterator)
False
~~~

可以使用`iter()`函数将`list`、`dict`、`str`变为迭代器





原因：这是因为Python的`Iterator`对象表示的是一个数据流，Iterator对象可以被`next()`函数调用并不断返回下一个数据，直到没有数据时抛出`StopIteration`错误。可以把这个数据流看做是一个有序序列，但我们却不能提前知道序列的长度，只能不断通过`next()`函数实现按需计算下一个数据，所以`Iterator`的计算是惰性的，只有在需要返回下一个数据时它才会计算。

`Iterator`甚至可以表示一个无限大的数据流，例如全体自然数。而使用list是永远不可能存储全体自然数的。





## 集合

**不支持元素重复**，**内部元素无序**

变量名称={元素，元素，元素..........}

变量名称=**set**（）

~~~python
set={'gouxin','zhangsan','gouxin','zhangsan','gouxin','zhangsan','gouxin','zhangsan'}
print(set)
~~~


### 常用操作

不支持下标索引访问

**允许修改**

| 集合.add(元素)                 | 将指定的元素添加到集合内                            |
| -------------------------- | --------------------------------------- |
| 集合.remove（元素）              | 将指定的元素，从集合中移除                           |
| 集合.pop()                   | 随机取出一个元素                                |
| 集合.clear()                 | 清空集合                                    |
| 集合1.difference（集合二）        | 差集，取出集合一有而集合二没有的，原集合不改变                 |
| 集合一.difference_update(集合二) | 消除差集：在集合一内，删除和集合二相同的元素      集合一改变，集合二不变 |
| 集合一.union（集合二）             | 两个集合进行**合并**   ，原集合不变                   |
| len（集合）                    | 集合中元素的数量                                |
| **for     in**             | 集合的遍历                                   |

## 字典

key：value

按照key找到value

my_dict={

key：value,   //键值对

key：value,

key：value

}

my_dict={}

my_dict=dict()

字典的key不可以重复，无下标索引

查取数据：  my_dict["key"]

key和value可以为任意数据类型，key不能为字典------------字典嵌套


~~~python
my_dict={
"王力宏":{
        "语文": 77,
        "数学":66,
        "英语":33
    },
"周杰伦":{
        "语文": 88,
        "数学":86,
        "英语":55
    },
"周杰伦":{
        "语文": 99,
        "数学":96,
        "英语":66
    }
}
print(my_dict["王力宏"]["语文"])
~~~

### 字典的常用操作

| 字典[key]=value                            | 新增元素      |
| ---------------------------------------- | --------- |
| 字典[key]=value                            | 更新元素      |
| 字典.pop（key）                              | 删除元素      |
| 字典.clear()                               | 清空元素      |
| 字典.keys()                                | 获取全部key   |
| 1、for  key in keys：             2、for key in 字典 | 遍历字典      |
| len（）                                    | 统计字典的元素数量 |



### 练习



## 公共操作

### 运算符

| 运算符 | 描述           | 支持的容器类型           |
| ------ | -------------- | ------------------------ |
| +      | 合并           | 字符串、列表、元组       |
| *      | 复制           | 字符串、列表、元组       |
| in     | 元素是否存在   | 字符串、列表、元组、字典 |
| not in | 元素是否不存在 | 字符串、列表、元组、字典 |

### 公共方法

| 函数                           | 描述                 |
| ------------------------------ | -------------------- |
| len()                          | 计算容器中元素的个数 |
| del或del()                     | 删除                 |
| max()                          | 返回容器中元素最大值 |
| min()                          | 返回容器中元素最小值 |
| range(start,end,step)          | 配合for循环使用      |
| ennumerate()                   |                      |
| sorted（容器，[reverse=True]） |                      |

~~~python
ennumerate(可遍历对象，start = 1) #start:遍历的起始值
for i in ennumerate(list):
    print(i)
~~~



## 容器类型转换

容器转列表：list（容器）

容器转元组：tuple（容器）

容器转字符串：str（容器）

容器转集合：set（容器）

## 字符串大小比较

ASCII表

基于数字的码值大小进行比较





一位大，整体大



# 内置模块

## 模块

模块:用.py结尾的文件，内部存放类、函数或者数据等

导入模块的方式：

- import    模块名   【as     别名】

- from  模块名 import   成员

- from   模块名 import    *

   注意：_开头的成员，用此方法无法进行导入

   ~~~
   __all__=["",""]
   __doc__
   __name__
   __file__
   ~~~

   







注意help（）和dir（）的使用



## math

## random

## 

## os、os.path

~~~python
#os :主要用于文件管理相关的操作
os.system("ipconfig")执行命令的

os.curdir  #当前目录 获取的是相对路径
os.getcwd()   #获取绝对路径
os.path.abspath()  #返回的是绝对路径

os.path.abspath(os.curdir



os.chdir("d:\\") # 两个\，原因是字符串中的\都有含义.切换工作路径

os.cpu_count  #cpu核数
os.listdir("d:\\") #列出指定目录下的文件

os.getlogin()#  获取当前登录用户
>>> os.getpid()  #获取进程编号
21336
>>> os.getppid()   #获取当前进程的父进程编号
21852



os.sep  #获取分隔符   linux分隔符是/






#os.path   :专门针对路径，文件系统的
from os import path

l = "d:\\python\\test1.python"

path.basename()  # 返回文件名
path.dirname()  #返回路径

path.exists(l) #判断是否存在
》》》False

path.altsep  分割符

'getatime' 访问时间, 'getctime'创建时间, 'getmtime'修改时间, 'getsize'文件大小

'isabs'是否是绝对路径, 'isdir'判断是否是文件夹, 'isfile'判断是否是文件, 'islink'判断是否是链接, 'ismount'是否是挂载文件


path.join(dirname,basename)#拼接,会自行用分隔符拼接传入的两个参数






#遍历磁盘案例
# 是文件夹，再一次进行遍历，不是文件夹，直杰进行打印
import os
import os.path



def get_all_file(url):

    try:

        files = os.listdir(url)
        for i in files:
            # 重新拼接成完整的路径   join  方法，只能传入os.sep,会进行自动调用
            rel_url = os.path.join(url, i)
            if os.path.isdir(rel_url):
                get_all_file(rel_url)
            else:
                print(rel_url)
    except PermissionError:
        pass






get_all_file("d:\\")













~~~



## sys模块

~~~python
#操作python自身解释器的
>>> sys.argv  #会返回脚本名称，解释器中没有脚本名称。
['']  #可能会有多个值


#运行python脚本的本质是
#python  xxx.py
#python   xxx.py   1 2 3 4 5
#传的参数都会被接收到sys.argv


import sys
print(sys.argv)


#对遍历磁盘的代码进行更改，使用户在执行.py文件时自行传入想要进行遍历的值
# 是文件夹，再一次进行遍历，不是文件夹，直杰进行打印
import os
import os.path
import sys


def get_all_file(url):

    try:

        files = os.listdir(url)
        for i in files:
            # 重新拼接成完整的路径   join  方法，只能传入os.sep,会进行自动调用
            rel_url = os.path.join(url, i)
            if os.path.isdir(rel_url):
                get_all_file(rel_url)
            else:
                print(rel_url)
    except PermissionError:
        pass


a = sys.argv
if len(a) == 2:
    get_all_file(a[1])
else:
    print("请传入参数哦")




sys.copyright   版权
sys.getdefaultcoding()  默认编码

sys.getfilesystemencoding()文件系统的编码
sys.getrecursionlimit()获取递归限制

sys.setrecursionlimit()    设置递归限制




~~~


sys.getrefcount()   获取**引用数量**    引用计数的精确分析可能受到一些内部因素的影响，通常情况下你只需要关注相对引用的变化，而不必过于关注具体的引用次数。

 **计算机垃圾回收机制**:代码在内存中运行，函数等会进行弹栈进行内存释放，那么堆如何进行内存释放呢？

c语言的free就是程序员的手动回收垃圾

 java、python、c++不需要程序员**自行回收机制**，因为对程序员的要求太大

提供复杂的回收算法，其中引用计时法（解决80%问题，缺点，循环引用）看内存有无被其他内存引用，别人指向我，我有用。

循环引用会出现问题------出现标记、清除算法。

练习：遍历代码文件夹，在.py文件前加前缀xianoupeng







## time\datetime模块

localtime（）  年月日时分秒时间元组

time（）           时间戳

sleep（）         程序睡眠

time.strftime('%Y/%m/%d   %H:%M:%s',time.localtime())    元组转字符串

time.strptime('2017-02-23 12:00:00','%Y-%m-%d   %H:%M:%s')   字符串转元组

mktime（）元组转时间戳

asctime（）

ctime（）

gmtime（）





datetime模块里的datetime

from datetime import datetime

datetime.now()获取时间对象



calendar日历模块

calendar.month()

## calendar日历模块

~~~python
calendar.month(year, month)
~~~



## UUID模块

分布式技术：很对计算机组成一台

新的问题：如何识别不同的电脑：分布式下可能出现虚拟化。希望出现标识符让全部不一样。UUID：计算机网卡+随机数+时间戳，拿到的数都不一样



UUID4    UUID5

~~~
UUID.uuid4()
UUID.uuid4().hex  获取字符串


好处：获取不一样的
坏处：字符串进行检索时速度很慢

~~~



## 加密与hashlib模块

加密是成本与时间的问题

### 不可逆加密

哈希加密，单向性，唯一性。

### 可逆加密



对称加密：加密与解密采用同一密匙（如文件压缩时设置密码）   DES算法

非对称加密：采用一对密匙，公匙、私匙。RSA算法（复杂，CA认证）



![img](https://img-blog.csdnimg.cn/img_convert/c1c96b168989a0020677b231666ecf43.png)

(1) A 要向 B 发送信息，A 和 B 都要产生一对用于加密和解密的公钥和私钥。

(2) A 的私钥保密，A 的公钥告诉 B；B 的私钥保密，B 的公钥告诉 A。

(3) A 要给 B 发送信息时，A 用 B 的公钥加密信息，因为 A 知道 B 的公钥。

(4) A 将这个消息发给 B (已经用 B 的公钥加密消息)。

(5) B 收到这个消息后，B 用自己的私钥解密 A 的消息。其他所有收到这个报文的人都无法解密，因为只有 B 才有 B 的私钥。

 

### hashlib模块

提供标准哈希算法，标准的的主流的

~~~
import hashlib

# 创建MD5哈希对象
hash_object = hashlib.md5()

# 更新哈希对象的数据
data = b"Hello, MD5!"
hash_object.update(data)

# 获取MD5哈希值的十六进制表示
md5_hash = hash_object.hexdigest()
print(f"MD5 哈希值：{md5_hash}")

~~~




 在cmd5.com进行破解

### hmac模块

hash加密相关模块，为**加密**而设计。做哈希算法时，先进性对称加密，再转入哈希加密中去。密钥做两次加密。

## 第三方模块

1、下载第三方模块

 pip：windows有python环境就自带pip

pip list 查看下载的列表

pip从国外下载速度比较慢----------镜像

 命令行最后添加     -r



