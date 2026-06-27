---
title: Python 学习笔记（七）：面向对象与综合应用
published: 2026-01-22
description: 类与对象、继承与多态、封装与属性、SQL 数据库操作、多任务/三器一闭、Excel/Word/PDF 操作等。
image: ./images/new15.png
tags: [Python, 面向对象, SQL, 综合]
category: 技术
draft: false
---
# 面向对象

对象对应着现实中具体的事物

生活中=========程序中

设计表格--------------设计类

打印表格---------------创建对象

填写表格---------------对象属性赋值

## 类的成员方法

写在类中的函数成为类的成员方法，必须包含形参self，self.name调用类的属性，传参是可以进行忽略

## 面向对象编程

使用对象进行编程

设计一个类，基于类去创建对象，并使用对象完成具体的操作

## 构造方法

由于类可以起到模板的作用，因此，可以在创建实例的时候，把一些我们认为`必须绑定的属性强制填写进去`。通过定义一个特殊的`__init__`方法，在创建实例的时候，就把`name`，`age`,`title`等属性绑上去：



构造方法：

_   _ _init_    _  _

注意到`__init__`方法的第一个参数永远是`self`，表示创建的实例本身，因此，在`__init__`方法内部，就可以把各种属性绑定到`self`，因为`self`就指向创建的实例本身。

有了`__init__`方法，在创建实例的时候，就不能传入空的参数了，必须传入与`__init__`方法匹配的参数，但`self`不需要传，Python解释器自己会把实例变量传进去

```python
class Student:
    name=None
    age=None
    tel=None
    def __init__(self,name,age,tel):
        self.name=name
        self.age=age
        self.tel=tel
        print(f"{self.name}{self.age}{self.tel}")

stu1=Student("openlab",11,13024920)
```

## 魔术方法

python的内置方法各自有各自的特殊功能，这些内置方法我们称之为：魔术方法



```
class Student:
    name=None
    age=None
    tel=None
    def __init__(self,name,age,tel):
        self.name=name
        self.age=age
        self.tel=tel
        print(f"{self.name}{self.age}{self.tel}")
    def __str__(self):
        return f"Student类对象，name={self.name},age={self.age}"
stu1=Student("openlab",11,13024920)
print(stu1)
```



```
class Student:
    name=None
    age=None

    def __init__(self,name,age):
        self.name=name
        self.age=age
        print(f"{self.name}{self.age}")
    def __lt__(self, other):
        return  self.age<other.age
stu1=Student("zs",12)
stu2=Student("zs",15)
print(stu1>stu2)  #true
```

## 封装

面向对象的三大特征：封装、继承、多态（有的人认为抽象也是）

### 封装

在面向对象中，认为定义在类中的属性外界可以更改是不安全的，封装指一种安全机制，不让外界直接修改或操作属性，因此，将属性私有化（封装），不让外界访问，如果要访问提供公开的方法：（getter、setter）

思想：如何将现实世界的事物描述成程序中的类

私有化成员（属性、方法）   sys模块查看

在成员变量或者成员方法前面加 _   _  即可，私有成员类对象无法访问，而**类中的其他成员可以使用**



**不能直接访问`_ _name`是因为Python解释器对外把`_ _name`变量改成了`_Student_ _name`，所以，仍然可以通过`_Student_ _name`来访问`_ _name`变量**

```python
class Student:
    name=None
    age=None
    __userroot="123456"
    def __init__(self,name,age):
        self.name=name
        self.age=age
        # print(f"{self.name}{self.age}")
    def start(self):
        if self.__userroot=="123456":
            print("开始运行了")
    def get_password(self):
       return self.__userroot
    def set_password(self,password):
        self.__userroot= password
name=Student("12",12)
name.start()
#print(name.__userroot) #私有成员外界访问不到
# python时动态语言，此时userroot私有相当于没有，会动态创建
name.userroot="123"



# 外界要访问私有化成员  get         set方法，在类中定义
name.set_password("222222")
print(name.get_password())
```

python时动态语言，类中没有的属性，外边会动态创建，不会报错。



练习：

```
class Phone:
     __is_5g_enable="True"
     def __check_5g(self):
         if self.__is_5g_enable=="True":
             print("5g开启")
         else:
             print("5g关闭，使用4g")
     def call_by_5g(self):
         self.__check_5g()
         print("正在通话中~")
phone=Phone()
phone.call_by_5g()
```

## 继承

```
class Father:
    def father_say(self):
        print("我是父亲")

class Son(Father):
    def son_say(self):
        print("我是erzi")

obj1=Son()
obj1.father_say()
```

如果子类不想写自己的成员属性成员方法，用pass关键字进行代码规范化

**复写**，直接在子类重写即可

**子类调用父类同名成员**：

方式1、父类名.成员变量

​               父类名.成员方法（**self**）

方式二、使用super（）调用父类成员

​                 super().成员变量

​                 super().成员方法（）

## 类型注解

### 变量的类型注解

pychram无法通过代码确定传入的类型，所以没有提示，我们需要类型注解

数据类型进行注解

变量：类型=变量值




wu无法直接看出变量类型时，会添加变量注解

提示性的，不是强硬性的





### 函数（方法）形参列表和返回值类型进行注解

def 函数方法名（形参名：类型，形参名：类型，，，，，）- >f返回值类型：

​           pass

### Union类型注解

联合类型注解 



## 多态

多种状态，即完成某种行为，使用不同的对象会得到不同的状态

常作用在继承关系上



父类确定提供什么方法



 

抽象类： 

# 面向对象高级编程

##使用 _ _ _slots_ _ _

限定实例可以创建的属性。

比如：Student的实例对象只允许创建uname、age两个属性，别的不允许

~~~python
class Student():
    _ _slots _ _ = ('uname' , 'age')

   
   
stu = Student()
stu.uname = 'oupeng'
stu.age = 21
stu.tel=1302589908        //报错
~~~




## 使用@property







# sql

开发人员人人必备

基础的sql语句

mysql数据库软件的基本使用



记录数据  库-》表--》数据

常用mysql数据库

sql语言，就是对数据库、数据进行操作，管理，查询的工具

## mysql安装



社区版mysql

https://downloads.mysql.com/archives/installer

要进行配置哦

 命令：mysql  -uroot -p



命令行提示符进行mysql操作不太方便，用图形化工具进行操作   DBeaver

https://dbeaver.io/download

sql语言：

大小写不敏感

以；表示结束

支持注释

--空格   要注释的代码

#

/*     */

## ddl库管理

查看数据库    show databases;

使用数据库        use 数据库名称;

创建新的数据库   create database 数据库名称  [charset utf8];

删除数据库

drop database;

查看当前使用的数据库：select database();

## ddl表管理

查看表：show tables;

创建表：create table 表名称（

​    列名称  列类型，

​     列名称   列类型，

‘’‘’‘’‘

）

列类型有：

int

float

varchar()

date

timestamp  时间戳



删除表：drop table 表名称;

​                 drop table if exists 表名称；

## dml数据操作语言

插入数据

insert into 表(列1，列2，’‘’‘’‘)    values（值1，值2.，，，，）[,(值1，，，，，，，，)，。。。。。，（值1，，，，，，，，，，）]；





数据删除：

delete   from  表名称  while 条件判断；



数据更新

update 表明名    set 列=值   where   条件判断；



## dql  数据查询

基础查询： select 字段列表  *from  表

进行过滤   select  字段列表   *from 表   where   条件判断



分组聚合

基础语法：

select 字段，聚合函数   from  表[where 条件]  group    by   列

grounp  by写了谁，select的非聚合中就能出现谁，聚合函数中不限制



聚合函数有：

sum（）

avg （）  平均值

min （）   最小值

max  （）  最大值

count（） 求数量





排序和分页限制语法

select  列|聚合函数|*from 表

where，，，

group  by  ，，，

order   by  ，，，[asc |desc]      (升序，降序排列)

limit  n[,m]#擦汗寻结果进行数量限制或者分页显示  从第n条开始向后显示m条





## python&mysql

### 基础使用

第三方库：pymysql

pip install pymysql

```
import pymysql

conn = pymysql.Connection(
    host='localhost',
    port=3306,
    user='root',
    password='123456'

)
print(conn.get_server_info())
# 关闭链接
conn.close()
```



```
# 非查询性质的sql语句
# 获取游标对象
cur=conn.cursor()
# 选择数据库
conn.select_db("gouxin")
# 使用游标对象，执行sql语句
cur.execute("create table student(id int, uname varchar(20))")
```

  ~~~
cur=conn.cursor()
#
conn.select_db("gouxin")
cur.execute("select * from movie")
results:tuple=cur.fetchall()
for r in results:
    print(r)
conn.close()
  ~~~







### 数据插入



需要通过commit的成员方法进行确认提交

连接对象.commit()

不想手动提交

在conn里追加自动提交的属性

**autoCommit=True**

## 综合案例

使用sql语句和pymusql库完成综合案例的开发



将记事本里边的数据插入到数据库中







# 闭包

atm存取款代码，定义全局变量money

功能ok，但：

***全局变量存在被修改的风险*，别的代码引入一下也可以改**



闭包进行解决：

```
def outer(logo):
    def inner(msg):
        print(f"<{logo}><{msg}><{logo}>")
    return inner
fn1=outer("openlab")
fn1("大家好")
```

logo对于outer是内部变量，即临时变量，logo对于inner，是全局变量，outer外部没有办法修改logo

想改logo，只能重新调用outer

要在闭包修改外部变量，**加   nanlocal 变量名称**，利用nanlocal改logo

def outer(logo):

    def inner(msg):
        nanlocal logo
        logo="dksdds"
        print(f"<{logo}><{msg}><{logo}>")
    return inner
    
    fn1=outer("openlab")
    fn1("大家好")



# 装饰器

遵循开放封闭原则，不改变原函数的情况下，扩展了函数的功能

```
'''
装饰器：装饰了house，功能丰富了。
原函数不能动，加功能
'''


# 定义装饰器
def decorater(func):  # function house at 0x000001DF57842520   func=house
    print("--------------------------------1")
    print(func)
    def wrapper():
        func()   #原函数进行调用
        print("刷一刷")
        print("铺地板")
        print("装修")
        print("入住")
    print("----------------------------------2")
    return wrapper    #@装饰器下边的函数接收     wrapper函数给house赋值了，house地址变为wrapper地址



# 给谁加，给谁上边@装饰器
@decorater    #对装饰器函数默认进行调用了
def house():    #原地址<function house at 0x000001E840F12520>    #加装饰器后地址：<function decorater.<locals>.wrapper at 0x0000018885E225C0>
    print("毛胚")    #底层地址已经改变，其实在第哦啊用wrapper
print(house)

if __name__ == '__main__':
    house()
```

功能：1、调用函数日志    2、函数执行时间统计  3、函数执行结束后的清理工作4、执行前预备处理5、权限校验

# 常见排序算法

## 冒泡排序

以下以找最大值为例子：

```python
# 冒泡排序       大数上浮法、小数下沉法（每次找最小值往最前边排或每次找最大值往最后排）
arr = [30,8,-10,22,26,3,2,9,11]

def bubble_sort(arr):
    for i in range(0,len(arr)-1):
        for j in range(0,len(arr)-1-i):
            if arr[j] >= arr[j+1]:
                arr[j],arr[j+1] = arr[j+1],arr[j]
            else:
                pass
    return arr

if __name__ == '__main__':#python的main函数     防止被别的模块导入时执行
     a = bubble_sort(arr)
    print(a)
```



![img](https://img-blog.csdnimg.cn/e902b8a1d16f4f7395a9e8a0ebf98080.png)




## 选择排序

每次找最小值，以假设的最小值进行位置互换。

[30,8,-10,22,26,3,2,9,11]

​                             第一次 假设30最小，在其他当中找最小值，即-10，进行位置互换

​                                                               [-10,8,30,22,26,3,2,9,11]

​                             第二次  假设8最小，在其他当中找最小值，即-2，进行位置互换

​                                                                [-10,2,30,22,26,3,8,9,11]



![动图](https://pic1.zhimg.com/v2-44be35da53ae9ee564ce444542a43d10_b.webp)

```python
# 选择排序
# 类似于冒泡排序，每一次找到最小值
arr = [8,3,2,6,1,4,9,7]
def xuanze(arr):
    for i in range(0,len(arr)-1):
        min=i
        for j in range(i+1,len(arr)):
            if arr[j]<arr[min]:
                min = j
        if i !=min:
            arr[i],arr[min]=arr[min],arr[i]
    return arr
if __name__ == '__main__':
    a = xuanze(arr)
    print(a)    
```
## 插入排序

默认第一个值为有序的，之后一次插入后面的每一个值（多次比较），最终得出排序结果。保证i前面的数都是有序



![在这里插入图片描述](https://img-blog.csdnimg.cn/20191125213346517.gif)

```python
def insert_sort(num):
    for i in range(0,len(num)-1):
        for j in range(i+1,0,-1):
            if num[j] < num[j-1]:
                num[j],num[j-1] = num[j-1],num[j]
        return num   
```

## 二分查找



```python
def binary_search(list,item):
    """二分查找方法"""
    left = 0  # 定义最小下标
    right = len(list)-1   # 定义最大下标
    while left <= right:   #while循环，保证可以遍历到指定区域的元素，直到被被寻找的值和中间值相等
        mid = int((left + right)/2)    # 寻找数组的中间值
        guess = list[mid]   # 获取列表最中间的元素
        if guess == item:
            return mid     # 进行条件判断，将中间值和被寻找的值进行比较，相等则返回该值
        if guess > item:
            right = mid-1  # 如果被寻找的值小于中间值，则最大下标变化为中间值的前一个元素下标
        else:
            left = mid + 1   # 如果被寻找的值大于中间值，则最小下标变化为中间值的后一个元素下标
    return None
```
# pygame（选修）

# 多任务

## 多任务介绍

提高程序的执行效率，多个函数同时一起执行，就需要使用多任务

同一时间执行多个任务-----------------》电脑的任务管理



多任务表现形式：

并发：在一段时间内**交替**去执行多个任务--------单核cpu

并行：在一段时间内，真正的同时一起执行多个任务-------》多核cpu



## 进程介绍

**python中，多任务依赖进程完成**

进程:**资源分配的最小单位**，os进行资源分配和调度运行的基本单位。一个正在运行的程序，都是一个进程



多进程的作用：

执行py文件，默认创建主进程，逐行执行代码

程序运行后，又创建一个进程，新创建的进程称之为**子进程**

两个进程，便可以同时执行函数1，函数2



## 多进程完成多任务

1、创建进程

1>导入模块              **import multiprocessing**

2>通过进程类创建进程对象

​          **进程对象=multiprocessing.Process()**

3>启动进程执行任务

​       **进程对象.start()**



注意：

通过进程类创建进程对象中，有很多参数：

target：执行的目标任务名，这里可以为函数名

name：进程名--------一般不设置

group：进程组，None



```python
import multiprocessing
import time

def fn_1():
    for i in range(4):
        print('i love you')
        time.sleep(3)


def fn_2():
    for i in range(4):
        print('哈哈,我和你同时执行了哦')
        time.sleep(3)





if __name__ == '__main__':
    fn_1_process = multiprocessing.Process(target=fn_1)
    fn_2_process = multiprocessing.Process(target=fn_2)
    fn_1_process.start()#只是设置初始状态标识可以进行执行，具体执行时间由CPU决定
    fn_2_process.start()






```



进程执行带有参数的任务：

args：以**元组**的方式给执行任务传参

```
fn_1_process = multiprocessing.Process(target=fn_1,args=(2,4))
```

kwargs：以**字典**的形式给执行任务传参

```
fn2process = multiprocessing.Process(target=fn_2,kwargs={"a":3,"b":3})
```



## 获取进程编号

进程太多，无法区分主进程和子进程还有不同的子进程。为了方便管理，每个进程都有自己的编号快速区分不同的进程





获取当前进程的编号：（导入os模块）

getpid（）

```
import multiprocessing
import time
import os


def fn_1(a,b):
    print(os.getpid())
    for i in range(4):
        print(a+b)
        time.sleep(3)


def fn_2(a,b):
    print(os.getpid())
    for i in range(4):
        print(a*b)
        time.sleep(3)


if __name__ == '__main__':
    fn_1_process = multiprocessing.Process(target=fn_1,args=(2,4))
    fn_2_process = multiprocessing.Process(target=fn_2,kwargs={"a":3,"b":3})

    fn_1_process.start()
    fn_2_process.start()
```

获取当前父进程编号（导入os模块）

getppid（）

```
import multiprocessing
import time
import os


def fn_1(a,b):
    print(os.getpid())
    print(os.getppid())#获取子进程的父进程编号

    for i in range(4):
        print(a+b)
        time.sleep(3)


def fn_2(a,b):
    print(os.getpid())
    for i in range(4):
        print(a*b)
        time.sleep(3)


if __name__ == '__main__':
    fn_1_process = multiprocessing.Process(target=fn_1,args=(2,4))
    fn_2_process = multiprocessing.Process(target=fn_2,kwargs={"a":3,"b":3})
    print(os.getpid())#获取主进程的编号

    fn_1_process.start()
    fn_2_process.start()


```



子进程是主进程进行操作的



## 进程间不共享变量

创建子进程，实际上是将主进程的资源进行**拷贝产生新的进程**，主进程与子进程之间相互独立



```python
import  multiprocessing
import time

list=[]
def write_data():
    for i in range(3):
        list.append(i)
        print('add',i)

def read_data():
    print(list)




if __name__ == '__main__':
    write_process=multiprocessing.Process(target=write_data)

    read_process=multiprocessing.Process(target=read_data)

    write_process.start()
    time.sleep(2)
```

## 主进程和子进程谁先结束

主进程等待所有子进程结束后结束

```python
import multiprocessing
import time


def son_process():
    for i in range(10):
        print(i)
        time.sleep(0.5)


if __name__ == '__main__':
    my_process=multiprocessing.Process(target=son_process)
    my_process.start()
    time.sleep(1)
    print("主线程执行完毕")
```



如何让主进程完毕后子进程也直接结束？

1、子进程设置守护主进程

```
import multiprocessing
import time


def son_process():
    for i in range(10):
        print(i)
        time.sleep(0.5)


if __name__ == '__main__':
    my_process=multiprocessing.Process(target=son_process)
    
    
    my_process.daemon=True#设置主进程守护
    
    
    my_process.start()
    time.sleep(1)
    print("主线程执行完毕")
```
2、手动销毁子进程

```
import multiprocessing
import time


def son_process():
    for i in range(10):
        print(i)
        time.sleep(0.5)


if __name__ == '__main__':
    my_process=multiprocessing.Process(target=son_process)

    my_process.start()
    time.sleep(1)
    
    my_process.terminate()#销毁所有子进程
    
    print("主线程执行完毕")
```

## 线程

**程序执行的最小单位**，每一个进程最少有一个线程。线程可以和同进程的其他线程共享所拥有的全部资源

进程默认具有一个线程，即**主线程**思密达~

### 多线程完成多任务

1、import  threading

2、线程对象=threading.Thread(target="")

3、线程对象.start()

### 线程间共享全局变量



```python
import threading

array=[1,2,3]
def sayHi():
    array.append(100)
    print(array)

def sayHello():
    print(array)

if __name__ == '__main__':
    fn_1=threading.Thread(target=sayHi)
    fn_2=threading.Thread(target=sayHello)


    fn_1.start()
    fn_2.start()

```

出现问题：





解决办法：使用线程同步：保证同一时刻只能有一个线程去操作全局变量。

**互斥锁**





### 线程执行带有参数的任务

args

kwargs



### 主线程和子线程的结束顺序

对比进程：主线程会等待所有的子线程执行完毕后结束

```python
import threading
import time


def work():
    for i in range(10):
        print('working~')
        time.sleep(0.5)

if __name__ == '__main__':
    my_work=threading.Thread(target=work)
    my_work.start()
    time.sleep(1)
    print('主线程结束~')
```

解决办法：主线程结束时，子线程自动销毁

```
import threading
import time


def work():
    for i in range(10):
        print('working~')
        time.sleep(0.5)

if __name__ == '__main__':
    my_work=threading.Thread(target=work，daemon=True)
    
    #my_work.setDaemon（True）
    #子线程设置守护主线程

    my_work.start()
    time.sleep(1)
    print('主线程结束~')
```

### 线程间的执行顺序

一个进程间，创建多个线程，这些**线程之间无序的**

threading.current_thread()获取线程对象，拿到线程的相关信息，例如被创建的顺序



# 三器一闭

## 迭代器

迭代：访问元素的一种方式

知道刚才访问的元素是哪一个，下一个该访问哪一个

可迭代对象：

能用for循环遍历的都是

列表、字符串、元组、字典

判断对象是否是可迭代对象：

~~~python
from _collections_abc import Iterable


stu=[11,22,33,44]
isinstance(stu,Iterable)
~~~



`迭代器`：可以记住遍历位置的对象，从第一个元素访问直到所有元素访问结束，只往前，不后退

for i in [11,22,33,44]:

​	print(i)

理论上应该有一个“人”帮忙记录当前遍历到哪一个元素了，方便查找下一个元素，而可迭代对象中的这个人，就是迭代器（iterator）



可迭代对象的本质就是，提供了迭代器帮助我们对其迭代遍历使用

可迭代对象可以通过`iter()`函数获取其迭代器，通过`next()`函数不断获取下一条数据

~~~python
list = [11,22,33,44]
iter = iter(list)
num1 = next(iter)
print(num1)
~~~



for循环过程：

1、先调用iter()函数，将nums当做参数获取可迭代对象的迭代器

2、调用next（），将上一步的迭代器进行取值

3、将取出的值赋值给num

4、执行for循环体中的代码

5、重复234，当可迭代对象的元素遍历完毕之后，会报错stopIteration，不过for循环自带异常处理，发现错误会自动结束for循环



### 自定义迭代器_ _ iter _ _     _ _   next  _ _

~~~python
from _collections_abc import Iterable
from _collections_abc import Iterator


class Student(object):
    def __init__(self):
        self.items = []

    def add(self, uname, age):
        dict = {
            "uname": uname,
            "age": age
        }
        self.items.append(dict)

    def __iter__(self):
        return myIter(self)   #迭代器对象的调用


class myIter(object):
    def __init__(self):
        pass

    def __next__(self):#调用next（）时，自动调用该方法，标识迭代器（当然，还必须有__iter__）
        pass

    def __iter__(self):
        pass


if __name__ == '__main__':
	stu=Student()
	print(isinstance(stu,Iterable))
	print(iter(stu))##自动调用了stu对象里边的__iter__方法，该方法返回的东西就当做iter()的返回值
	print(isinstance(iter(stu),Iterator))

~~~



总结：迭代器对象一定是可迭代对象，可迭代对象，不一定是迭代器对象

~~~python
from collections.abc import Iterable
from collections.abc import Iterator

nums = [11,22,33,44]
nums_iter = iter(nums)

print('nums是否是可迭代对象'，isinstance(nums,Iterable))

print('nums是否是迭代器'，isinstance(nums,Iterator))


print('nums_iter是否是可迭代对象'，isinstance(nums_iter,Iterable))

print('nums_iter是否是迭代器'，isinstance(nums_iter,Iterator))

~~~





自定义迭代器练习：

```python
from _collections_abc import Iterable
from _collections_abc import Iterator


class student(object):
    def __init__(self):
        self.items = []

    def add(self,age):

        self.items.append(age)

    def __iter__(self):
        return myIter(self)


class myIter(object):
    def __init__(self, student):
        self.student = student
        self.current = 0

    def __next__(self):
        if self.current < len(self.student.items):
            item = self.student.items[self.current]
            self.current += 1
            return item
        else:
            raise StopIteration  #抛出异常

    def __iter__(self):
        pass


stu = student()

stu.add(12)
stu.add(17)
stu.add(14)
stu_iter = iter(stu)
print(next(stu_iter))
print(next(stu_iter))
print(next(stu_iter))
print(next(stu_iter))
print(next(stu_iter))
print(next(stu_iter))
```

抛出异常:for循环只会识别stop异常，自己重新定义异常，得该for自带的异常捕获



练习问题：必须两个类吗？用一个类

~~~python
from _collections_abc import Iterable
from _collections_abc import Iterator


class student(object):
    def __init__(self):
        self.items = []
        self.current = 0

    def add(self, age):

        self.items.append(age)

    def __iter__(self):
        return self    #将自身设置为iter()函数调用的方法

    def __next__(self):
        if self.current < len(self.items):
            item = self.items[self.current]
            self.current += 1
            return item
        else:
            raise StopIteration

if __name__ =='__main__':
	stu = student()

	stu.add(12)
	stu.add(17)

	for i in stu:
    	print(i)
    
	print('-'*30)
	for i in stu:
    	print(i)

~~~



问题：第二次for循环时不循环

并不是只有for循环可以接受可迭代对象，list、tuple等也可以

要转换，肯定是每一个元素取出来追加

list（可迭代对象）

只要是可迭代对象，就可以放在list里面

~~~python
from _collections_abc import Iterable
from _collections_abc import Iterator


class student(object):
    def __init__(self):
        self.items = []
        self.current = 0

    def add(self, age):

        self.items.append(age)

    def __iter__(self):
        return self

    def __next__(self):
        if self.current < len(self.items):
            item = self.items[self.current]
            self.current += 1
            return item
        else:
            raise StopIteration




if __name__ =='__main__':
    stu = student()

    stu.add(12)
    stu.add(17)
    num = list(stu)
    print(num)
~~~





最初的问题解决：





迭代器本身的特性：

​	1、只能向前，不能往复

​	2、特别节省内存

​	3、惰性机制



## 生成器

迭代器为基础，生成器的 本质就是迭代器

目的：y=2x+1

如下需求：


~~~python
尝试解决1：
point_x_y_list = []
i = 0 
x = 0
while i < 5:
	y = 2 * x + 1
	point_x_y_list.append((x,y))
	x = y
	i +=1

print(point_x_y_list)

~~~

**未解决生成不确定个数**

考虑使用迭代器：

~~~python
class PointXY(object):
    def __init__(self):
        self.x = 0

    def __iter__(self):
        return self

    def __next__(self):  #存储的是算法，生成数据的方案，不是生成的数据。
        temp_y = 2 * self.x + 1
        temp_point_x_y = (self.x, temp_y)
        self.x = temp_y
        return temp_point_x_y


point_x_y = PointXY()
point_x_y_iter = iter(point_x_y)
num1 = next(point_x_y_iter)
print(num1)

	
	 
		
~~~



问题：第x次时，2x+1的2、1进行改变


~~~python
class PointXY(object):
    def __init__(self):
        self.x = 0
        self.k = 2
        self.b = 1

    def __iter__(self):
        return self

    def __next__(self):
        temp_y = self.k * self.x + self.b
        temp_point_x_y = (self.x, temp_y)
        self.x = temp_y
        return temp_point_x_y

    def change_k_b(self, k, b):
        self.k = k
        self.b = b


point_x_y = PointXY()
point_x_y_iter = iter(point_x_y)
num1 = next(point_x_y_iter)
print(num1)
point_x_y.change_k_b(3, 1)
print(next(point_x_y_iter))
~~~

添加一个方法，改一次，所有的都改



过于繁琐---------生成器

### 生成器

通过列表推导式（生成式），可以直接创建一个列表，但是，由于内存限制，列表的容量必然是有限的。如果创建了10000个元素的列表，占用大量的内存，最终只访问前几个，那么资源浪费。

如果列表元素可以按照某种算法推算出来，通过循环的过程不断推算后续的元素-------在python中，这种一遍循环一遍计算的机制叫做生成器：`generator`



`什么是生成器`

指记录生成数据的方式（算法），而不是事先生成且存储这些数据，这种方式，就叫做生成器



事实上，利用迭代器，我们也可以每次迭代获取数据（通过next()方法）。但稍微复杂一点，生成器具有迭代器功能，且简单

**生成器是一类特殊的迭代器**

### 生成器与迭代器的关系

生成器：指记录生成数据的方式（算法），而不是事先生成且存储这些数据，这种方式，就叫做生成器

生成器，之所以能够计算出下一个数据，一定能够记录上一个数据，因此，生成器是一种迭代器，只不过与普通自定义的迭代器定义方式不相同

~~~python
from _collections_abc import Iterator

g = (x for x in range(100))
print(isinstance(g, Iterator))

~~~





1. 语法和编写复杂度：生成器相对于手动编写迭代器的语法更简洁，因为生成器可以通过函数和`yield`语句来定义。
2. 内存占用：生成器逐个生成元素，避免一次性生成整个序列，因此对于大型数据或者无限序列的情况，生成器更节省内存。
3. 计算延迟：生成器支持延迟计算，只在需要时生成元素，而迭代器在迭代开始时就需要提前计算出所有元素。
4. 适用场景：迭代器适用于需要随机访问和状态维护的情况，生成器适用于需要逐个产生元素、延迟计算、减少内存使用的情况。



### 创建生成器

1、列表推导式的[]改成()----生成器表达式


都能循环遍历，区别：生成器会立即生成


2、定义函数，用yield关键字进行返回----生成器函数

####练习

斐波那契：下边是迭代器生成的

~~~python
# num1 = 1
# num2 = 1
# print("第一个数", num1)
# num1, num2 = num2, num1 + num2  # (1,2)
# print("第二个数", num1)
# num1, num2 = num2, num1 + num2  # (2,3)
# print("第3个数", num1)
# num1, num2 = num2, num1 + num2  # (3,5)
# print(num1)


class fib(object):
    def __init__(self):
        self.num1 = 1
        self.num2 = 1

    def __next__(self):
        tm1=self.num1
        self.num1, self.num2 = self.num2, self.num1 + self.num2
        return tm1

    def __iter__(self):
        return self


fib = fib()
g = iter(fib)

print(next(g))
print(next(g))
print(next(g))
print(next(g))
print(next(g))



#和上边的区别：重复代码

#下边的可以进行for迭代，进行了封装




~~~

迭代器复杂，用生成器：

~~~python
def fib():
    num1 = 1
    num2 = 2
    while True:
        tm1 = num1
        num1, num2 = num2, num1 + num2
        yield tm1


g = fib()
print(g)
print(next(g))
print(next(g))
print(next(g))
print(next(g))

~~~



只要有yield关键字，那么虽然看上去是调用函数，实际上变成了创建一个生成器对象

yield作用：

1、可以返回数据

2、可以分段的执行函数中的内容



next调用生成器，会执行代码块，从上一次yield关键字的下一个语句开始执行，直到再次遇到yield



研究含有yield关键字的代码块的执行过程

~~~python
def f():
    print("11111111111")
    yield "1"
    print("2222222222222222222")
    yield "2"
    print("33333333333")
    yield "3"


f = f()
print(next(f))
print(next(f))
print(next(f))
    
~~~



###获取return返回值

~~~python
def fib():
    num1 = 1
    num2 = 2

    tm1 = num1
    num1, num2 = num2, num1 + num2
    yield tm1
    num1, num2 = num2, num1 + num2
    yield num1
    num1, num2 = num2, num1 + num2
    yield num1
    return "执行完毕，没有yield关键字了"



g = fib()
print(next(g))
print(next(g))
print(next(g))
try:
	print(next(g))
expect StopIteration as ret: 
	print(ret.value)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    


~~~

如果在调用next()的时候，从上一次暂停的位置，继续向下运行时 ，遇不到yield，就会报错

如果在调用next()的时候，从上一次暂停的位置，继续向下运行时 ，遇不到yield，却遇到了return，那么也会产生异常，并且把return的数值，用异常暂时存储起来（异常信息中的value属性中）

### send()

除了用next()唤醒，让生成器继续执行外，还可以使用send()函数来唤醒执行

好处:可以在唤醒的同时向断点处传入一个附加数据

~~~python
# 区别：send()可以在唤醒的同时向断点处传入一个附加数据
def generator():
    while True:
        print("11111111111111")
        num = yield 10
        print("22222222222222", "num=", num)


g = generator()
print(next(g))

print(g.send(11))##11当做第一次调用next停时， yield 10  的结果，在这里就是给了num
print(g.send(1314))   #生成器.send()
~~~



如果不调用next（）

第一次：

g.send(None)

### 回归作业

~~~python
def creat_point():
    x = 0
    k = 2
    b = 1
    while True:
        # y = 2 * x + 1
        y = k * x + b

        temp = (x, y)
        change = yield temp
        if change:
            k, b = change
        x = y


g = creat_point()
print(next(g))
print(next(g))
print(next(g))
print(g.send((3, 1)))
~~~

装饰器

本质上是函数闭包的一个语法糖

1、函数闭包

2、语法糖

3、装饰器









# python简单操作Excel、Word、Pdf

## Excel

python针对excel有很多的第三方库进行使用。xlwings、pandas、Win102com、xlutils……

可以轻松的实现excel文件的增删改查格式修改……



**xlrd：用于读取excel文件**

**xlwt：用于写入excel文件**

**xlutils：用于操作excel文件的实用工具，如复制、分割、筛选……**



创建excel:

~~~

# 前提必须现有xlwt第三方模块   pip install xlwt
import xlwt
wb = xlwt.Workbook()
# 添加工作簿
st1 = wb.add_sheet('图书')


# 繁琐
# st1.write(0, 0, "书名")
# st1.write(0, 1, "作者")
# st1.write(0, 2, "出版社")

# st1.write(1, 0, "python入门")
# st1.write(1, 1, "欧鹏")
# st1.write(1, 2, "新华……")

# st1.write(2, 0, "python入门")
# st1.write(2, 1, "欧鹏")
# st1.write(2, 2, "新华……")

db = [["python入门", "欧鹏", "欧鹏……"], ["python入门", "欧鹏", "欧鹏……"],
      ["python入门", "欧鹏", "欧鹏……"], ["python入门", "欧鹏", "欧鹏……"]]
for i in range(0, len(db)):
    for j in range(0, len(db[i])):
        st1.write(i, j, db[i][j])

st2 = wb.add_sheet("班级")
st2.write(0, 0, "101021902")


wb.save('excel01.xls')
# 报错：excel事实上创建时会有工作簿
# 填充一些数据
# 小格子的位置（D5……）
~~~


运行时文件不能是打开状态的

预览方式






读取excel：

~~~python
import xlrd

#读取
wb = xlrd.open_workbook('excel01.xls')

#print(wb)#对象
#获取sheets数量
print(wb.nsheets)
#获取工作簿名称
print(wb.sheet_names())
#获取工作簿
sh1 = wb.sheet_by_index(0)
sh2 = wb.sheet_by_name('图书')

#获取内容
#获取行列个数
print(sh1.nrows)
print(sh2.ncols)


#获取一行
print(sh1.row_values(0))
print(sh1.row_values(1))

#获取一列
print(sh1.col_values(1))
print(sh1.col_values(2))


#获取某一单个单元格
print(sh1.cell_value(0,1))

print(sh1.cell(0,1).value)

#获取所有数据
for sh in wb.sheets():
    for row in range(sh.nrows):
        print(sh.row_values(row))


~~~





更新excel

pip install xlutils



## word

~~~python
pip install python-docx
~~~

~~~
#创建新的word文档
from docx import Document

# 创建一个新文档
doc = Document()

# 添加段落
doc.add_paragraph("Hello, this is a new Word document created with Python.")

# 保存文档
doc.save("my_document.docx")

~~~



读取并修改现有的文档

~~~python
from docx import Document

# 打开现有文档
doc = Document("existing_document.docx")

# 遍历段落并输出内容
for paragraph in doc.paragraphs:
    print(paragraph.text)

# 修改第一个段落的内容
doc.paragraphs[0].text = "This is the modified content."

# 保存更改后的文档
doc.save("modified_document.docx")

~~~



## 操作pdf

1. **创建 PDF 文件**（使用 `reportlab` 库）：

   ```
   pythonCopy codefrom reportlab.lib.pagesizes import letter
   from reportlab.pdfgen import canvas
   
   # 创建 PDF 文档
   c = canvas.Canvas("my_pdf.pdf", pagesize=letter)
   
   # 添加文本
   c.drawString(100, 750, "Hello, this is a PDF document created with Python.")
   
   # 保存 PDF
   c.save()
   ```

2. **读取 PDF 文件内容**（使用 `PyPDF2` 库）：

   ```
   pythonCopy codeimport PyPDF2
   
   # 打开 PDF 文件
   pdf_file = open("my_pdf.pdf", "rb")
   
   # 创建 PDF 读取对象
   pdf_reader = PyPDF2.PdfFileReader(pdf_file)
   
   # 读取每一页的文本内容
   for page_num in range(pdf_reader.numPages):
       page = pdf_reader.getPage(page_num)
       text = page.extractText()
       print(text)
   
   # 关闭文件
   pdf_file.close()
   ```

3. **修改 PDF 文件**（使用 `PyPDF2` 库）：

   ```
   pythonCopy codeimport PyPDF2
   
   # 打开 PDF 文件
   pdf_file = open("existing_pdf.pdf", "rb")
   
   # 创建 PDF 读取对象
   pdf_reader = PyPDF2.PdfFileReader(pdf_file)
   
   # 创建 PDF 写入对象
   pdf_writer = PyPDF2.PdfFileWriter()
   
   # 复制除了第一页以外的所有页面到新文件
   for page_num in range(1, pdf_reader.numPages):
       page = pdf_reader.getPage(page_num)
       pdf_writer.addPage(page)
   
   # 保存新文件
   new_pdf_file = open("modified_pdf.pdf", "wb")
   pdf_writer.write(new_pdf_file)
   
   # 关闭文件
   pdf_file.close()
   new_pdf_file.close()
   ```

4. **提取图像**（使用 `PyMuPDF` 库）：

   ```
   pythonCopy codeimport fitz
   
   # 打开 PDF 文件
   pdf_document = fitz.open("my_pdf.pdf")
   
   # 遍历页面并提取图像
   for page_num in range(pdf_document.page_count):
       page = pdf_document.load_page(page_num)
       image_list = page.get_images(full=True)
       for img_index, img_info in enumerate(image_list):
           xref = img_info[0]
           base_image = pdf_document.extract_image(xref)
           image_data = base_image["image"]
           with open(f"image_{page_num}_{img_index}.png", "wb") as img_file:
               img_file.write(image_data)
   
   # 关闭文件
   pdf_document.close()
   ```

这些示例涵盖了一些常见的 PDF 操作，具体操作取决于您的需求。在执行这些操作之前，请确保已安装相应的库（如 `reportlab`、`PyPDF2`、`PyMuPDF`……）





# 全局方法

在Python中，有一些全局内置函数可以在任何地方使用，而无需导入额外的模块。以下是一些常用的全局内置函数：

1. **print()**：用于将文本或变量的值输出到控制台。

2. **len()**：返回容器（如字符串、列表、元组等）中元素的数量。

3. **input()**：用于从用户获取输入的数据，返回用户输入的字符串。

4. **type()**：返回对象的类型。

5. **int()、float()、str()**：将数据转换为整数、浮点数、字符串类型。

6. **range()**：生成一个范围内的整数序列，常用于迭代循环。

7. **max()、min()**：返回容器中的最大值和最小值。

8. **sum()**：返回容器中数字的总和。

9. **sorted()**：对容器进行排序，返回一个新的已排序的容器。

10. `sorted()`函数也是一个高阶函数，它还可以接收一个`key`函数来实现自定义的排序，例如按绝对值大小排序：

    ~~~
    sorted([36, 5, -12, 9, -21], key=abs)
    [5, 9, -12, -21, 36]
    ~~~

 11 .**enumerate()**：用于在迭代过程中同时获取元素和索引。

12.**zip()**：将多个可迭代对象打包成一个元组序列。

13.**all()、any()**：用于判断迭代对象中的所有元素是否为真（all）或至少有一个元素为真（any）。14.**abs()**：返回一个数字的绝对值。

15.**dir()**：返回一个对象的属性和方法列表。

16.**globals()、locals()**：返回全局和局部命名空间中的变量和值。

这些是一些常见的全局内置函数，它们在Python中无需导入模块即可使用。





 
