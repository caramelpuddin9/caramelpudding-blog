---
title: Docker 容器学习（二）：Docker的基本操作
published: 2026-02-11
description: Docker 镜像管理（搜索/拉取/导出/删除）、容器常用操作（启动/停止/日志/端口映射）、文件传输与内容提交。
image: ./images/bg003.png
tags: [Docker, Linux, 容器, 镜像]
category: 技术
draft: false
---
# 二 Docker的基本操作

## 2.1 Docker镜像管理


### 2.1.1 **搜索镜像**（挂梯子）

```bash
[root@Docker-node1 ~]# docker search  nginx
NAME           DESCRIPTION                                      STARS     OFFICIAL
nginx          Official build of Nginx.                         20094     [OK]
@@@省略内容
```

> [!NOTE]
>
> | 参数        | 说明         |
> | ----------- | ------------ |
> | NAME        | 镜像名称     |
> | DESCRIPTION | 镜像说明     |
> | STARS       | 点赞数量     |
> | OFFICIAL    | 是否是官方的 |

### 2.1.2 **拉取镜像**



```bash
#从镜像仓库中拉取镜像
[root@Docker-node1 ~]# docker pull busybox
[root@Docker-node1 ~]# docker pull nginx:1.26-alpine

#查看本地镜像
[root@Docker-node1 ~]# docker images
REPOSITORY                        TAG           IMAGE ID       CREATED         SIZE
nginx                             latest        900dca2a61f5   7 weeks ago     188MB
nginx                             1.26-alpine   b32ed582bddb   7 weeks ago     43.2MB
ubuntu                            latest        35a88802559d   2 months ago    78.1MB
busybox                           latest        65ad0d468eb1   15 months ago   4.26MB
centos                            7             eeb6ee3f44bd   2 years ago     204MB
centos                            latest        5d0da3dc9764   2 years ago     231MB
gcr.io/distroless/base-debian12   latest        7273f3276b21   N/A             20.7MB
gcr.io/distroless/base-debian11   latest        2a6de77407bf   N/A             20.6MB
```

> [!NOTE]
>
> alpine 版本：nginx镜像的最小安装发型版本



### 2.1.3 查看镜像信息

```bash
#查看系统中的镜像列表
[root@docker-node1 ~]# docker images

#查看镜像的详细信息
[root@Docker-node1 ~]# docker image inspect nginx:1.26-alpine

#查看对镜像的更改记录
[root@docker-node1 ~]# docker history  nginx:latest

```

### 2.1.4 导出镜像

```bash
#保存镜像
[root@Docker-node1 ~]# docker image save nginx:latest -o nginx-latest.tar.gz
[root@Docker-node1 ~]# docker image save nginx:latest nginx:1.26-alpine -o nginx.tag.gz

#保存所有镜像    
[root@Docker-node1 ~]# docker save  `docker images | awk 'NR>1{print $1":"$2}'` -o images.tar.gz
```

> [!NOTE]
>
> - -o：指定导出镜像的位置；
> - 可以同时导出多个镜像到一个文件中；
> - 指定.tar.gz 可以导出并压缩。


```bash
docker load -i mario-latest.tar  导入镜像
导出后存到虚拟机导入
```

### 2.1.5 删除镜像


```bash
[root@Docker-node1 ~]# docker rmi nginx:latest
[root@Docker-node1 ~]# docker rmi  `docker images | awk 'NR>1{print $1":"$2}'`
```

## 2.2 容器的常用操作

### 2.2.1 启动容器

容器的启动与删除：





后台运行：




```bash
[root@Docker-node1 ~]# docker run  -d --name mario -p 80:8080 timinglee/mario
[root@Docker-node1 ~]# docker run -it --name centos7 centos:7
[root@3ba22e59734f /]#	#进入到容器中，按<ctrl>+<d>退出并停止容器，#按<ctrl>+<pq>退出但不停止容器

#重新进入容器
[root@docker ~]# docker attach centos7
[root@3ba22e59734f /]#

#在已运行容器中执行指定命令
[root@docker-node1 ~]# docker run -d --name busybox busybox tail -f /dev/null
e02d3812280fd2ab5ad54b3f6ff4cf668dd4658fe7961028792b71a786bc9cec
[root@docker-node1 ~]# docker exec busybox touch /root/haha
[root@docker-node1 ~]# docker exec busybox ls /root
haha



[root@docker ~]# docker exec -it  test ifconfig
lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
```

> [!NOTE]
>
> ```bash
> -d			#后台运行
> -i			#交互式运行
> -t			#打开一个终端
> --name		#指定容器名称
> -p			#端口映射 -p 80：8080	把容器8080端口映射到本机80端口
> --rm		#容器停止自动删除容器
> --network 	#指定容器使用的网络
> ```

### 2.2.2 查看容器运行信息

```bash
[root@Docker-node1 ~]# docker ps					#查看当前运行容器
[root@Docker-node1 ~]# docker ps -a					#查看所有容器
[root@Docker-node1 ~]# docker inspect busybox		#查看容器运行的详细信息
```


### 2.2.3 停止和运行容器

```bash
[root@Docker-node1 ~]# docker stop busybox			#停止容器
[root@Docker-node1 ~]# docker kill busybox			#杀死容器，可以使用信号
[root@Docker-node1 ~]# docker start busybox			#开启停止的容器
```

> [!NOTE]
>
> 容器内的第一个进程必须一直处于运行的状态，否则这个容器，就会处于退出状态！

在已运行的容器中执行命令

```bash
#在已经运行的容器中执行指定命令
[root@docker-nodel ~]# docker exec busybox touch /root/haha      #非交互
[root@docker-nodel ~]# docker exec busybox 1s /root
filel
file2
haha


[root@docker-nodel ~]# docker exec-it web /bin/bashroot
@f3e369725fab:/#
#交互的
```

查看镜像提交历史

```bash
[root@docker-node1 ~]# docker history busybox:latest
IMAGE          CREATED       CREATED BY                          SIZE      COMM                                                                                                     ENT
fd8d9aa63ba2   2 weeks ago   BusyBox 1.38.0 (glibc), Debian 13   4.51MB
```




### 2.2.4 删除容器

```bash
[root@Docker-node1 ~]# docker rm centos7			#删除停止的容器

[root@Docker-node1 ~]# docker rm -f busybox			#删除运行的容器

[root@Docker-node1 ~]# docker container prune -f	#删除所有停止的容器
```



### 2.2.5 容器内容提交

默认情况下，容器被删除后，在容器中的所有操作都会被清理，包括要保存的文件

如果想永久保存，那么我们需要把动作提交，提交后会生成新的镜像

当我们在运行新镜像后即可看到我们提交的内容

```bash
#内容提交
[root@docker-nodel ~]# docker run -it --name test busybox:latest
/# touch /root/file
/# 1s /root/
file
ctrl+qp 退出当前环境并继续运行容器
[root@docker-nodel ~]# docker commit -m "add file" test busybox-file:latest
sha256:31a32089d241d025a5a54f144f15319cc6fb55be1b41d049f8905a472d5a028e
[root@docker-nodel ~]# docker images
i Info-U In Use
IMAGE
busybox-file:latest
ID
31a32089d241
DISK USAGE
6.71MB
CONTENT SIZE
2.21MB
EXTRA

[root@docker-nodel ~]# docklr run -it --name test busybox-file:latest
```



```bash
[root@Docker-node1 ~]# docker run -it --name test busybox
/ # touch leefile											#在容器中建立文件
/ # ls
bin      etc      leefile  lib64    root     tmp      var
dev      home     lib      proc     sys      usr
/ #
[root@Docker-node1 ~]# docker rm test	#删掉容器后	
test
[root@Docker-node1 ~]# docker run -it --name test busybox	#删掉容器后开启新的容器文件不存在	
/ # ls
bin    dev    etc    home   lib    lib64  proc   root   sys    tmp    usr    var
/ #

[root@Docker-node1 ~]# docker commit -m "add leefile" test  busybox:v1
sha256:c8ff62b7480c951635acb6064acdfeb25282bd0c19cbffee0e51f3902cbfa4bd
[root@Docker-node1 ~]# docker images
REPOSITORY                        TAG           IMAGE ID       CREATED          SIZE
busybox                           v1            c8ff62b7480c   12 seconds ago   4.26MB

[root@Docker-node1 ~]# docker image history busybox:v1
IMAGE          CREATED         CREATED BY                          SIZE      COMMENT
c8ff62b7480c   2 minutes ago   sh                                  17B       add leefile
65ad0d468eb1   15 months ago   BusyBox 1.36.1 (glibc), Debian 12   4.26MB
```

> [!NOTE]
>
> 此方法不利于企业审计，所以不推荐使用，在企业中我们多用Dockerfile来构建镜像

### 2.2.6 系统中的文件和容器中的文件传输

```bash
[root@Docker-node1 ~]# docker cp  test2:/leefile /mnt		#把容器中的文件复制到本机
Successfully copied 1.54kB to /mnt
[root@Docker-node1 ~]# docker cp /etc/fstab  test2:/fstab	#把本机文件复制到容器中

```

文件在镜像中的复制

```bash
#文件在镜像中的复制
[root@docker-nodel ~]# docker run -it --name test busybox-file:latest
[root@docker-nodel ~]# docker cp test:/root/file /mnt
Successfully copied 1.54ks to /mnt
[root@docker-nodel ~]# 1s /mnt/
file hgfs

[root@docker-nodel ~]# docker cp/etc/passwdtest:/root/
Successfully copied 3.07kB to test:/root/
[root@docker-nodel ~]# docker exec test 1s /root
file
passwd
```



### 2.2.7 查询容器内部日志

```bash
[root@Docker-node1 ~]# docker logs web
/docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
/docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
/docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
10-listen-on-ipv6-by-default.sh: info: Getting the checksum of /etc/nginx/conf.d/default.conf
10-listen-on-ipv6-by-default.sh: info: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
/docker-entrypoint.sh: Sourcing /docker-entrypoint.d/15-local-resolvers.envsh
/docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
/docker-entrypoint.sh: Launching /docker-entrypoint.d/30-tune-worker-processes.sh
/docker-entrypoint.sh: Configuration complete; ready for start up
2024/08/14 07:50:01 [notice] 1#1: using the "epoll" event method
2024/08/14 07:50:01 [notice] 1#1: nginx/1.27.0
2024/08/14 07:50:01 [notice] 1#1: built by gcc 12.2.0 (Debian 12.2.0-14)
2024/08/14 07:50:01 [notice] 1#1: OS: Linux 5.14.0-427.13.1.el9_4.x86_64
2024/08/14 07:50:01 [notice] 1#1: getrlimit(RLIMIT_NOFILE): 1073741816:1073741816
2024/08/14 07:50:01 [notice] 1#1: start worker processes
2024/08/14 07:50:01 [notice] 1#1: start worker process 29
2024/08/14 07:50:01 [notice] 1#1: start worker process 30
172.17.0.1 - - [14/Aug/2024:07:50:20 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/7.76.1" "-"

```

容器外部网络访问

```bash
[root@docker-node1 ~]# docker ps -a
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
[root@docker-node1 ~]# docker run  -d --name test -p 80:80 nginx:1.26-alpine
e33a85a5ec94115e16b23813269e7d5cada1836cfd352f65caba9eea745d9084

将本机的80端口映射到容器的80端口
```


端口可以访问

```bash
[root@docker-node1 ~]# docker load -i game2048-latest.tar
Loaded image: timinglee/game2048:latest

[root@docker-node1 ~]# docker run -d --name 2048 -p 80:8080 timinglee/game2048:latest
20da602c42578caa55091f7399b7295505a262cd20c09f2bae6389bb00fdacf5
#因为是Java写的文件，所以映射8080端口
```

如果文件正确就能看到部署的2048小游戏。

