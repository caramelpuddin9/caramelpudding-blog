---
title: Python 学习笔记（四）：函数与函数进阶
published: 2026-01-19
description: 函数定义与调用、参数类型、返回值、匿名函数 lambda、装饰器、闭包等高阶函数用法。
image: ./images/bg013.png
tags: [Python, 函数, 编程]
category: 技术
draft: false
---
# python函数

组织好的，可以重复使用的，用于实现特定功能的代码块

 len（name）内置函数 len 官方写好的  input  print。。。。都是内置函数

避免重复的进行代码书写，提高代码的复用率

## 函数的定义语法

~~~    python
def 函数名（传入参数）：

  函数体

  return 返回值`

~~~





 

 

练习：

定义函数，调用后输出“我叫XXX”

 



案例：  

定义两数相加函数，将结果返回出去

 可接收一个或多个数并计算乘积





return后边的代码不会再执行了哦

 None类型：NoneType的字面量，函数不使用return，返回的是None：返回值没有意义

 

在if判断中：None===False

 



 

None声明无意义的变量

name=None

 在函数体之前，通过多行注释进行函数说明，方便之后查看

"""



"""



在调用时，会显示出说明文档

## 函数的嵌套调用


## 函数中变量的作用域

局部变量：定义在函数体内部的变量，即在函数体内部生效

​        外部访问不到

全局变量：在函数体内函数体外都能生效的变量

​        

在函数内部修改全局变量，无法对全局变量进行修改，要在函数内部对全局变量进行修改，用**global关键字**

即：

 

 

![img](data:image/png;base64,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)

## 函数综合案例

```python
"""
演示函数综合案例开发
"""

#定义全局变量moneyname
money=5000000
name=None
#要求客户输入姓名
name=input("请输入您的姓名：")
#定义查询函数
def query(show_header):
ifshow_header:
print("-------------查询余额------------")
print(f"{name}，您好，您的余额剩余：{money}元")


#定义存款函数
def saving(num):
globalmoney#money在函数内部定义为全局变量
money+=num
print("-------------存款------------")
print(f"{name}，您好，您存款{num}元成功。")

#调用query函数查询余额
query(False)

#定义取款函数
defget_money(num):
globalmoney
money-=num
print("-------------取款------------")
print(f"{name}，您好，您取款{num}元成功。")

#调用query函数查询余额
query(False)
#定义主菜单函数
defmain():
print("-------------主菜单------------")
print(f"{name}，您好，欢迎来到openlabATM。请选择操作：")
print("查询余额\t[输入1]")
print("存款\t\t[输入2]")
print("取款\t\t[输入3]")#通过\t制表符对齐输出
print("退出\t\t[输入4]")
returninput("请输入您的选择：")

#设置无限循环，确保程序不退出
while True:
keyboard_input=main()
if keyboard_input=="1":
query(True)
continue#通过continue继续下一次循环，一进来就是回到了主菜单
elifkeyboard_input=="2":
num=int(input("您想要存多少钱？请输入："))
saving(num)
continue
elif keyboard_input=="3":
num = int(input("您想要取多少钱？请输入："))
get_money(num)
continue
else:
print("程序退出啦")
break#通过break退出循环

```

# python函数进阶

## 递归函数

函数自身调用自身，就成为函数的递归

9！

~~~python
def fact(n):
    if n==1:
        return 1
    return n * fact(n - 1)
~~~



递归在使用时，注意防止栈溢出。栈的大小是有限的，如果递归调用次数太多，会导致栈溢出

sys.getrecursionlimit()


fact(1000):会报错

`尾递归`：为了解决递归调用栈溢出的方法。

调用函数时，调用自身本身，并且，return语句不能包含表达式。编译器或者解释器就可以把尾递归做优化，使递归本身无论调用多少次，都只占用一个栈帧，不会出现栈溢出的情况。

~~~python
def fact(n):
    return fact_iter(n, 1)

def fact_iter(num, product):
    if num == 1:
        return product
    return fact_iter(num - 1, num * product)
~~~

遗憾的是，大多数编程语言没有针对尾递归做优化，Python解释器也没有做优化，所以，即使把上面的`fact(n)`函数改成尾递归方式，也会导致栈溢出。





练习：汉诺塔



## 函数多返回值

不允许多个return=====》return   返回值1，返回值2


## 函数的传参

函数的参数：函数进行计算时，接受外部（调用时）提供的数据



### `位置参数`



两个数字相加的函数的定义

![img](data:image/png;base64,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)

 a，b形式参数

1，2：实际参数

数量不受限制

 函数的返回值 将结果返回给调用者



### `默认参数`：



~~~python
def power(x, n=2):
    s = 1
    while n > 0:
        n = n - 1
        s = s * x
    return s
~~~

默认值参数设置的注意点：
1、必选参数在前，默认参数在后（原因：）

2、多个参数时，把变化小的放在后面。变化小的参数就可以作为默认值参数

好处：降低调用函数的难度



默认参数的坑：

~~~python
def add_end(L=[]):
    L.append('END')
    return L


>>> add_end()
['END', 'END']
>>> add_end()
['END', 'END', 'END']
~~~



第一次调用add_end()时没有错误，第二次时，就会出现函数似乎记住了第一次调用的函数添加的end的列表

 解释：

默认参数必须指向不变对象！





###`可变参数`：传入的形参个数是可变的。

如：求一组数字的和

参数个数不确定，

1、用列表或者元组-------但是调用时，需要先组成列表或者元组



2、可变参数

~~~python
def calc(*numbers):
    sum = 0
    for n in numbers:
        sum = sum + n * n
    return sum
~~~

如果要传进的是元组或者列表：

在元组或者列表前面添加（*num）：即把`nums`这个list的所有元素作为可变参数传进去



### 关键字参数：



允许传入0个或者多个含参数名的参数

~~~python
def person(name, age, **kw):
    print('name:', name, 'age:', age, 'other:', kw)
~~~

~~~python
 person('Adam', 45, gender='M', job='Engineer')
~~~

~~~python
简写：
>>> extra = {'city': 'Beijing', 'job': 'Engineer'}
>>> person('Jack', 24, **extra)
name: Jack age: 24 other: {'city': 'Beijing', 'job': 'Engineer'}
~~~

### 命名关键字参数：



~~~python
def person(name, age, *, city, job):
    print(name, age, city, job)
~~~



只接受city、job关键字参数

命名关键字参数可以有缺省值，用于简化调用：

~~~python
def person(name, age, *, city='Beijing', job):
    print(name, age, city, job)
~~~



参数可以进行组合使用：

~~~python
def f1(a, b, c=0, *args, **kw):
    print('a =', a, 'b =', b, 'c =', c, 'args =', args, 'kw =', kw)

def f2(a, b, c=0, *, d, **kw):
    print('a =', a, 'b =', b, 'c =', c, 'd =', d, 'kw =', kw)
~~~



##高阶函数

map()、reduce()函数

`map()`函数接收两个参数，一个是函数，一个是`Iterable`，`map`将传入的函数依次作用到序列的每个元素，并把结果作为新的`Iterator`返回。


~~~python
>>> def f(x):
...     return x * x
...
>>> r = map(f, [1, 2, 3, 4, 5, 6, 7, 8, 9])
>>> list(r)
[1, 4, 9, 16, 25, 36, 49, 64, 81]
~~~

map(函数本身，数据)：由于结果r是Iterator惰性序列（仅仅在迭代至某个元素时才计算该元素，而在这之前或之后，元素可以不存在或者被销毁。），所以用list（）函数让把整个序列都计算出来并返回一个list

事实上它把运算规则抽象了

map()可以计算复杂的函数

~~~python
#将所有list里边的元素转换为字符
list(map(str,[1,2,3,4,5]))
~~~



练习：利用`map()`函数，把用户输入的不规范的英文名字，变为首字母大写，其他小写的规范名字。输入：`['adam', 'LISA', 'barT']`，输出：`['Adam', 'Lisa', 'Bart']`



`reduce()`：`reduce`把一个函数作用在一个序列`[x1, x2, x3, ...]`上，这个函数必须接收两个参数，`reduce`把结果继续和序列的下一个元素做累积计算

~~~python
reduce(f, [x1, x2, x3, x4]) = f(f(f(x1, x2), x3), x4)
~~~



~~~python
>>> from functools import reduce
>>> def add(x, y):
...     return x + y
...
>>> reduce(add, [1, 3, 5, 7, 9])
25
~~~



练习：

Python提供的`sum()`函数可以接受一个list并求和，请编写一个`prod()`函数，可以接受一个list并利用`reduce()`求积





`filter`：

过滤序列：

和`map()`类似，`filter()`也接收一个函数和一个序列。和`map()`不同的是，`filter()`把传入的函数依次作用于每个元素，然后根据返回值是`True`还是`False`决定保留还是丢弃该元素。

~~~python
def is_odd(s):
	return n%2==1

list(filter(is_odd,[1,2,3,4,5,6]))

>>>1,3,5
~~~



练习：

回数是指从左向右读和从右向左读都是一样的数，例如`12321`，`909`。请利用`filter()`筛选出回数：





`sorted`排序算法：

`sorted()`函数也是一个高阶函数，它还可以接收一个`key`函数来实现自定义的排序



~~~
>>> sorted([36, 5, -12, 9, -21], key=abs)
[5, 9, -12, -21, 36]
~~~





字母排序实际上是比较ascii。忽略大小写可通过直接全部大写或小写

~~~
>>> sorted(['bob', 'about', 'Zoo', 'Credit'], key=str.lower)
['about', 'bob', 'Credit', 'Zoo']
~~~

要进行反向排序，不必改动key函数，直接传入第三个参数：`reverse=True`：

~~~python
>> sorted(['bob', 'about', 'Zoo', 'Credit'], key=str.lower, reverse=True)
['Zoo', 'Credit', 'bob', 'about']
~~~

## 函数嵌套、闭包……

函数作为返回值：

~~~python
def lazy_sum(*args):
    def sum():
        ax = 0
        for n in args:
            ax = ax + n
        return ax
    return sum
~~~

调用一次lazy_sum，返回一个新的函数，即使歘如相同的参数，两次调用生成的函数也不一样

###作用域

变量的访问权限

全局变量-----------》全局作用域

函数内部的变量------局部变量----》局部作用域

顶格创建的函数也是全局的

### 函数的嵌套

~~~python
def fun1():
	b = 20
	def fun2():
	pass

函数的嵌套，此时的fun2是局部变量.想像成：
#fun2 = def():
	
    注意:局部的东西，一般都是局部自己访问使用的
~~~

局部变量，就想在外边使用:

return    

想在外边访问fun2，可以将fun2像变量一样进行返回

return fun2

~~~python
def fun1():
	b = 20
	def fun2():
	pass
	return fun2  #此时我们把函数当做变量进行返回的

b1 = fun1()#此时的b1事实上就是函数fun2（）
b1()
~~~



`函数作为参数进行传递`


此时的实参可以是函数

`代理模式：`函数test_func代理了compute

**综上：函数可以作为返回值进行返回**

**函数可以当做参数进行传递**

**函数名本质上就是变量名，都是内存地址**

### 闭包

nonlocla：内层变量想要更改外部变量的值，

在内层函数添加x的声明：

nonlocal x



语法结构和规则：

~~~python
def func():
	a=10
	def inner():
		nonlocal a
		print(a)
		return a

ret = func()
r1 = ret() #a = 11
r2 = ret()  #a = 12
#事实上实现了在全局作用域(外层)对局部变量进行更改

#局部变量的好处：外界很难更改
#不通过inner去更改a:改不了

~~~



闭包：1、可以让一个变量常驻在内存当中

2、可以避免全局变量被修改

本质：内层函数对外层函数的局部变量的使用，内层函数被称为闭包

### 装饰器

回顾内容：1、函数可以作为参数进行传递

2、函数可以作为返回值

3、函数名称可以像变量一样进行赋值操作

装饰器：要求记住结论

#### 引入



~~~python
def play_dnf():
	print("你好啊，我是赛利亚，今天又是美好的一天")
	
def play_lol():
print("德玛西亚")


print("开挂")
play_dnf()
print("关闭外挂")

print("开挂")
play_lol()
print("关闭外挂")
~~~



太麻烦，聘请管家帮我开启外挂

~~~python
#函数作为参数进行传递
def guanjia(fn):
	print("开挂")
	fn()
	print("关闭外挂")


def play_dnf():
	print("你好啊，我是赛利亚，今天又是美好的一天")
	
def play_lol():
print("德玛西亚")


    
guanjia(play_dnf)
~~~



成了管家在打游戏了，办法：

~~~python
#函数作为参数进行传递
def guanjia(fn):
	def inner():
		print("开挂")
		fn()
		print("关闭外挂")
	return inner

def play_dnf():
	print("你好啊，我是赛利亚，今天又是美好的一天")
	
def play_lol():
print("德玛西亚")


    
play_dnf = guanjia(play_dnf)
#让管家把游戏重新封装了，我这边把原来的游戏替换掉
play_dnf()#此时运行的是内部函数inner


play_lol = guanjia(play_lol)
play_lol()

~~~

还是太麻烦：

~~~python
#函数作为参数进行传递
def guanjia(fn):
	def inner():
		print("开挂")
		fn()
		print("关闭外挂")
	return inner

@guanjia#相当于play_dnf = guanjia(play_dnf)
def play_dnf():
	print("你好啊，我是赛利亚，今天又是美好的一天")
    
@guanjia#相当于play_lol = guanjia(play_lol)
def play_lol():
	print("德玛西亚")
    
    
play_dnf()
play_lol()
~~~

#### 本质

装饰器本质上是一个闭包，作用是在不改变原有函数的前提下，为函数添加新的功能，可以在函数的前后添加新的功能，但是源代码不改变

运用：在用户登录的地方

​              日志

​               ……



雏形：

~~~python
def wrapper(目标函数):
	def inner:
		之前，添加事情
		目标函数执行 fn()
		之后，添加功能
	return inner#千万别家（）
	
~~~

#### 问题：被装饰函数的参数问题



~~~python
# def guanjia(fn):
#     def inner(uname,password):
#         print("开挂")
#         fn(uname,password)
#         print("停止游戏，关闭外挂")
#
#     return inner


def guanjia(fn):
    def inner(*args, **kwargs):#*  ,**   表示借助所有传进来的实参,打包成元组和字典
        print("开挂")
        fn(*args, **kwargs)#*,**表示把元组和字典打散成位置参数以及关键字参数传递进去
        print("停止游戏，关闭外挂")

    return inner


@guanjia  # 相当于play_wz=gunajia(play_wz)
def play_wz(uname, password):
    print(f"用户名是{uname},密码是{password}")
    print("来和妲己玩耍吧")


@guanjia
def play_cj(uname, password, hero):
    print(f"用户名是{uname},密码是{password},英雄是{hero}")
    print("注意标记点")


play_wz('gouxin', 123456)
play_cj("gouxin", 123456, 'daji')

~~~



#### 返回值

通用装饰器的写法：



~~~python
def guanjia(fn):
    def inner(*args, **kwargs):
        print("开挂")
        ret = fn(*args, **kwargs)  # 这里是目标函数的执行，这里是能够拿到从目标函数中拿回的返回值的

        print("停止游戏，关闭外挂")
        return ret

    return inner


def rizhi(fn):
    def inner(*args, **kwargs):
        print("玩了一次游戏")
        fn(*args, **kwargs)

    return inner


@guanjia  # 相当于play_wz=gunajia(play_wz)
def play_wz(uname, password):
    print(f"用户名是{uname},密码是{password}")
    print("来和妲己玩耍吧")
    return "妲己玩的很666"

play_wz('gouxin', 123456)
~~~



#### 一个函数可以被多个装饰器装饰

~~~python
def wrapper1(fn):  # fn = target= wrapper2.inner
    def inner(*args, **kwargs):
        print("第一个装饰器")
        ret = fn()
        print("第一个装饰器结束")
        return ret

    return inner


def wrapper2(fn):  # fn = target
    def inner(*args, **kwargs):
        print("第二个装饰器")
        ret = fn()
        print("第二个装饰器结束")
        return ret

    return inner


# target = wrapper1(target)=wrapper1(wrapper2.inner)================>wrapper1.inner
@wrapper1
@wrapper2  # target = wrapper2(target)============>target:wrapper2.inner
def target():
    print("我是函数")


target()

# 规律
'''
wrapper1
wrapper2
target
wrapper2
wrapper1

'''
~~~



#### 装饰器实战

~~~python
'''
员工信息的管理系统
'''

login_flat = False  # 是否登录


def login_verify(fn):
    def inner(*args, **kwargs):
        global login_flat
        while 1:
            if login_flat:
                break
            username = input('用户名：')
            pwd = input("密码：")
            if username == "gouxin" and pwd == "123456":
                print("登录成功")
                login_flat = True  # 表示登陆成功
                break
            else:
                print("登录失败")
        ret = fn(*args, **kwargs)
        return ret
    return inner


@login_verify
def add():
    print("添加员工信息")


@login_verify
def delete():
    print("删除员工信息")


@login_verify
def upd():
    print("更新员工信息")


@login_verify
def search():
    print("查找员工信息")


add()
search()


# 简单的模拟

~~~





## lambda匿名函数

匿名函数：临时使用一次

lambda   传入参数 ：函数体  函数体**只能写一行**，不能写多行






## 偏函数

Python的`functools`模块提供了很多有用的功能，其中一个就是偏函数（Partial function）。要注意，这里的偏函数和数学意义上的偏函数不一样。

在介绍函数参数的时候，我们讲到，通过设定参数的默认值，可以降低函数调用的难度。而偏函数也可以做到这一点。举例如下：

`int()`函数可以把字符串转换为整数，当仅传入字符串时，`int()`函数默认按十进制转换：

```
>>> int('12345')
12345
```

但`int()`函数还提供额外的`base`参数，默认值为`10`。如果传入`base`参数，就可以做N进制的转换：

```
>>> int('12345', base=8)
5349
>>> int('12345', 16)
74565
```

假设要转换大量的二进制字符串，每次都传入`int(x, base=2)`非常麻烦，于是，我们想到，可以定义一个`int2()`的函数，默认把`base=2`传进去：

```
def int2(x, base=2):
    return int(x, base)
```

这样，我们转换二进制就非常方便了：

```
>>> int2('1000000')
64
>>> int2('1010101')
85
```

`functools.partial`就是帮助我们创建一个偏函数的，不需要我们自己定义`int2()`，可以直接使用下面的代码创建一个新的函数`int2`：

```
>>> import functools
>>> int2 = functools.partial(int, base=2)
>>> int2('1000000')
64
>>> int2('1010101')
85
```

所以，简单总结`functools.partial`的作用就是，把一个函数的某些参数给固定住（也就是设置默认值），返回一个新的函数，调用这个新函数会更简单。

注意到上面的新的`int2`函数，仅仅是把`base`参数重新设定默认值为`2`，但也可以在函数调用时传入其他值：

```
>>> int2('1000000', base=10)
1000000
```

最后，创建偏函数时，实际上可以接收函数对象、`*args`和`**kw`这3个参数，当传入：

```
int2 = functools.partial(int, base=2)
```

实际上固定了int()函数的关键字参数`base`，也就是：

```
int2('10010')
```

相当于：

```
kw = { 'base': 2 }
int('10010', **kw)
```

当传入：

```
max2 = functools.partial(max, 10)
```

实际上会把`10`作为`*args`的一部分自动加到左边，也就是：

```
max2(5, 6, 7)
```

相当于：

```
args = (10, 5, 6, 7)
max(*args)
```

结果为`10`。

### 小结

当函数的参数个数太多，需要简化时，使用`functools.partial`可以创建一个新的函数，这个新函数可以固定住原函数的部分参数，从而在调用时更简单。

