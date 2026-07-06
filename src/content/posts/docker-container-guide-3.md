---
title: Docker 容器学习（三）：Docker镜像构建
published: 2026-02-12
description: Docker 镜像结构原理、Dockerfile 构建参数详解（FROM/COPY/ADD/ENV/EXPOSE/VOLUME/WORKDIR/RUN/CMD/ENTRYPOINT）、镜像优化策略与多阶段构建。
image: ./images/bg004.png
tags: [Docker, Linux, Dockerfile, 镜像构建]
category: 技术
draft: false
---
# 三 docker镜像构建

## 3.1 docker镜像结构


- 共享宿主机的kernel
- base镜像提供的是最小的Linux发行版
- 同一docker主机支持运行多种Linux发行版
- 采用分层结构的最大好处是：共享资源

## 3.2 镜像运行的基本原理


- Copy-on-Write 可写容器层
- 容器层以下所有镜像层都是只读的
- docker从上往下依次查找文件
- 容器层保存镜像变化的部分，并不会对镜像本身进行任何修改
- 一个镜像最多127层

## 3.3 镜像获得方式

- 基本镜像通常由软件官方提供

- 企业镜像可以用官方镜像+Dockerfile来生成

- 系统关于镜像的获取动作有两种：

  - docker pull 镜像地址

  - docker load –i 本地镜像包

## 3.4 镜像构建

### 3.4.1 构建参数

| FROM           | 指定base镜像 eg：FROM busybox:version                        |
| -------------- | ------------------------------------------------------------ |
| **COPY**       | **复制文件   eg：COPY file /file 或者 COPY [“file”,”/”]**    |
| **MAINTAINER** | **指定作者信息，比如邮箱 eg：MAINTAINER user@example.com**<br />在最新版的docker中用LABEL KEY="VALUE"代替 |
| **ADD**        | **功能和copy相似，指定压缩文件或url  eg: ADD  test.tar /mnt 或者 eg：ADD http://ip/test.tar /mnt** |
| **ENV**        | **指定环境变量 eg：ENV  FILENAME test**                      |
| **EXPOSE**     | **暴漏容器端口 eg：EXPOSE  80**                              |
| **VOLUME**     | **申明数据卷，通常指数据挂载点 eg：VOLUME [“/var/www/html”]** |
| **WORKDIR**    | **切换路径 eg：WORKDIR  /mnt**                               |
| **RUN**        | **在容器中运行的指令 eg: touch file**                        |
| **CMD**        | **在启动容器时自动运行动作可以被覆盖   eg：CMD echo $FILENAME  会调用shell解析  eg：CMD [“/bin/sh”,”-c”,“echo $FILENAME”] 不调用shell解析** |
| **ENTRYPOINT** | **和CMD功能和用法类似，但动作不可被覆盖**                    |

```bash
[root@docker-node1 ~]# ls
anaconda-ks.cfg  docker  game2048-latest.tar  vim

[root@docker-node1 ~]# cd docker/

[root@docker-node1 docker]# docker rmi timinglee:v1
Untagged: timinglee:v1
Deleted: sha256:d6a555a7e8ae1c387b3df73e9422ff8dd32b0faaabbcfdd9c918f42150d08f94

[root@docker-node1 docker]# vim Dockerfile

[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
COPY timinglee /root

[root@docker-node1 docker]# docker build -t lee:v1 .
[+] Building 0.2s (7/7) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 96B                                       0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.0s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => [internal] load build context                                         0.0s
 => => transferring context: 30B                                          0.0s
 => [1/2] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => CACHED [2/2] COPY timinglee /root                                     0.0s
 => exporting to image                                                    0.1s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:772de584a4cd99463df884c9e0ce2bc435856f9  0.0s
 => => exporting config sha256:dccdaaef0f0b4c554f6a5003b19f012a711aa911e  0.0s
 => => exporting attestation manifest sha256:44047ef589263d13ee0aa16c306  0.0s
 => => exporting manifest list sha256:ab96bcbd0b9ae61178fb9709821b1340ae  0.0s
 => => naming to docker.io/library/lee:v1                                 0.0s
 => => unpacking to docker.io/library/lee:v1                              0.0s
```


构建能看到Dockerfile的两个动作


history能看到LABEL标签

```bash
#LABEL KEY=VALUES
LABEL creater=lee
```

```bash
#ADD
[root@docker-node1 docker]# echo lee > lee
[root@docker-node1 docker]# vim Dockerfile
[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
COPY timinglee /root
ADD lee /root

[root@docker-node1 docker]# docker build -t lee:v2 .
[+] Building 0.2s (8/8) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 110B                                      0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.0s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => [internal] load build context                                         0.0s
 => => transferring context: 62B                                          0.0s
 => [1/3] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => CACHED [2/3] COPY timinglee /root                                     0.0s
 => [3/3] ADD lee /root                                                   0.0s
 => exporting to image                                                    0.1s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:23a8cf1e968bd0c6f3f247a6abe397f3731d3db  0.0s
 => => exporting config sha256:3b5582c11dbb082c3ef1e3fde01ec78b3386e61b7  0.0s
 => => exporting attestation manifest sha256:9ee958f37cb985e351b0a0e4535  0.0s
 => => exporting manifest list sha256:09907b3c449f698535e09421c2cc689a1f  0.0s
 => => naming to docker.io/library/lee:v2                                 0.0s
 => => unpacking to docker.io/library/lee:v2                              0.0s
 
[root@docker-node1 docker]# docker run -it --name test --rm lee:v2
/ # cat /root/*
lee
timinglee
#可以看到ADD的确被执行生成了lee

#ADD可以解压缩，但是COPY不能
[root@docker-node1 docker]# tar zcf bin.tar.gz /bin
tar: 从成员名中删除开头的“/”
[root@docker-node1 docker]# ls
bin.tar.gz  Dockerfile  lee  timinglee

[root@docker-node1 docker]# vim Dockerfile
[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
COPY bin.tar.gz /root
ADD bin.tar.gz /mnt

[root@docker-node1 docker]# docker build -t lee:v3 .
[+] Building 0.2s (8/8) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 117B                                      0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.0s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => CACHED [1/3] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63b  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => [internal] load build context                                         0.0s
 => => transferring context: 147B                                         0.0s
 => [2/3] COPY bin.tar.gz /root                                           0.0s
 => [3/3] ADD bin.tar.gz /mnt                                             0.0s
 => exporting to image                                                    0.1s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:56fdf85817bb9fb45b03b65f3aad7a0c50bc173  0.0s
 => => exporting config sha256:3082b1f01abf13848180b492e631414c526f1760a  0.0s
 => => exporting attestation manifest sha256:128544a1c46196e88d5d8d234f2  0.0s
 => => exporting manifest list sha256:e3901aeb53d4d62bd9becf3f965a089b08  0.0s
 => => naming to docker.io/library/lee:v3                                 0.0s
 => => unpacking to docker.io/library/lee:v3                              0.0s

[root@docker-node1 docker]# docker run -it --name test --rm lee:v3
/ # ls /root/
bin.tar.gz
/ # ls /mnt/
bin

#/mnt/目录下被解压，说明ADD能解压
```

```bash
#ENV
[root@docker-node1 docker]# vim Dockerfile
[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
ENV NAME=timinglee
RUN [ "/bin/sh","-c", "touch /root/$NAME" ]

#/bin/sh表示启动shell -c表示shell中执行后面命令

[root@docker-node1 docker]# docker build -t lee:v4 .
[+] Building 0.3s (6/6) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 138B                                      0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.0s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => CACHED [1/2] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63b  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => [2/2] RUN [ "/bin/sh","-c", "touch /root/timinglee" ]                 0.2s
 => exporting to image                                                    0.1s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:dba9bc71c675f05c169e02efdfdc415e6d76b3b  0.0s
 => => exporting config sha256:f98d25cfb5e9fa900f4b9e2707993824d35537bb8  0.0s
 => => exporting attestation manifest sha256:b0b1f07882aaa673c91d3fb4980  0.0s
 => => exporting manifest list sha256:0d8f5f108b3709b304f03c570ec64e9786  0.0s
 => => naming to docker.io/library/lee:v4                                 0.0s
 => => unpacking to docker.io/library/lee:v4                              0.0s

[root@docker-node1 docker]# docker run -it --name test --rm lee:v4
/ # ls /root/
timinglee
#看到docker中的确生成了timinglee文件
```

```bash
#EXPOSE
[root@docker-node1 docker]# vim Dockerfile
[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
ENV NAME=timinglee
EXPOSE 8080
RUN [ "/bin/sh","-c", "touch /root/$NAME" ]

[root@docker-node1 docker]# docker build -t lee:v5 .
[+] Building 0.2s (6/6) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 150B                                      0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.1s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => [1/2] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => CACHED [2/2] RUN [ "/bin/sh","-c", "touch /root/timinglee" ]          0.0s
 => exporting to image                                                    0.0s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:4cca3aecd2b3f29d07fce31912efe279ea869fa  0.0s
 => => exporting config sha256:7e0b364ff9713708ad1d6305807550514bfbe11cd  0.0s
 => => exporting attestation manifest sha256:0bc98ec4145992b9bb24e1c8097  0.0s
 => => exporting manifest list sha256:4648788e80409f8bd92107d905259ce2c4  0.0s
 => => naming to docker.io/library/lee:v5                                 0.0s
 => => unpacking to docker.io/library/lee:v5                              0.0s

[root@docker-node1 docker]# docker history lee:v5
IMAGE          CREATED         CREATED BY                                    SIZE      COMMENT
0f9ab202f6dc   6 minutes ago   RUN /bin/sh -c touch /root/$NAME # buildkit   0B        buildkit.dockerfile.v0
<missing>      6 minutes ago   EXPOSE [8080/tcp]                             0B        buildkit.dockerfile.v0
<missing>      6 minutes ago   ENV NAME=timinglee                            0B        buildkit.dockerfile.v0
<missing>      6 minutes ago   LABEL Creater=lee                             0B        buildkit.dockerfile.v0
<missing>      2 weeks ago     BusyBox 1.38.0 (glibc), Debian 13             4.51MB

```


history查看docker发现暴露端口8080

```bash
#VOLUME
[root@docker-node1 ~]# docker inspect lee:v5
[
    {
        "Id": "sha256:0f9ab202f6dc2cd6e3c243b6b6dc3e99262d75ece4098fb6964c0173f8c27504",
        "RepoTags": [
            "lee:v5"
        ],
        "RepoDigests": [
            "lee@sha256:0f9ab202f6dc2cd6e3c243b6b6dc3e99262d75ece4098fb6964c0173f8c27504"
        ],
        "Comment": "buildkit.dockerfile.v0",
        "Created": "2026-05-31T03:32:15.420148423+08:00",
        "Config": {
            "ExposedPorts": {
                "8080/tcp": {}
            },
            "Env": [
                "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "NAME=timinglee"
            ],
            "Cmd": [
                "sh"
            ],
            "Labels": {
                "Creater": "lee"
            }
        },
        "Architecture": "amd64",
        "Os": "linux",
        "Size": 2229109,
        "RootFS": {
            "Type": "layers",
            "Layers": [
                "sha256:0958e0fef2d6a31e1325b8bfecd99dead933363682d69850a7606599023751bc",
                "sha256:03580ef5fb09b36475c8795962b8bcc9af580b55e175fb9c6b9becb962e0e612"
            ]
        },
        "Metadata": {
            "LastTagTime": "2026-05-30T19:38:30.356292508Z"
        },
        "Descriptor": {
            "mediaType": "application/vnd.oci.image.index.v1+json",
            "digest": "sha256:0f9ab202f6dc2cd6e3c243b6b6dc3e99262d75ece4098fb6964c0173f8c27504",
            "size": 855
        },
        "Identity": {
            "Build": [
                {
                    "Ref": "at2o000a51m352xpuojimmh9r",
                    "CreatedAt": "2026-05-31T03:38:30.362639167+08:00"
                }
            ]
        }
    }
]
#可以看到并没有mount挂载信息

[root@docker-node1 docker]# vim Dockerfile
[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
ENV NAME=timinglee
EXPOSE 8080
VOLUME "/mnt"
RUN [ "/bin/sh","-c", "touch /root/$NAME" ]


[root@docker-node1 docker]# docker run -it --name test --rm lee:v6
/ #

[root@docker-node1 ~]# docker inspect test | grep -i mounts -A10
        "Mounts": [
            {
                "Type": "volume",
                "Name": "e0a3fc4a8e9b51c169f70c70a87e3ddd7480ff82ac4a3ee2507d1c2737de3cbf",
                "Source": "/var/lib/docker/volumes/e0a3fc4a8e9b51c169f70c70a87e3ddd7480ff82ac4a3ee2507d1c2737de3cbf/_data",
                "Destination": "/mnt",
                "Driver": "local",
                "Mode": "",
                "RW": true,
                "Propagation": ""
            }
```



可以看到的确被挂载，挂载地址/mnt

如果往宿主机的source目录地址里写东西，其实是写到了容器的/mnt目录里

```bash
[root@docker-node1 ~]# cd /var/lib/docker/volumes/e0a3fc4a8e9b51c169f70c70a87e3ddd7480ff82ac4a3ee2507d1c2737de3cbf/_data

[root@docker-node1 _data]# touch lee{1..5}
[root@docker-node1 _data]# ls
lee1  lee2  lee3  lee4  lee5

[root@docker-node1 docker]# docker run -it --name test --rm lee:v6
/ # ls /mnt/
lee1  lee2  lee3  lee4  lee5

#可以看到五个文件的确被写入容器的/mnt目录中
```

```bash
#WORKDIR
[root@docker-node1 docker]# vim Dockerfile
[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
ENV NAME=timinglee
EXPOSE 8080
VOLUME "/mnt"
RUN [ "/bin/sh","-c", "touch /root/$NAME" ]
WORKDIR "/mnt"

[root@docker-node1 docker]# docker build -t lee:v7 .
[+] Building 0.2s (7/7) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 181B                                      0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.0s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => [1/3] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => CACHED [2/3] RUN [ "/bin/sh","-c", "touch /root/timinglee" ]          0.0s
 => [3/3] WORKDIR /mnt                                                    0.0s
 => exporting to image                                                    0.1s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:fd4677ab721d528939b2043249d4422f2de8f79  0.0s
 => => exporting config sha256:1df65585916677b710bafb2b2bc536517f6fe0e6f  0.0s
 => => exporting attestation manifest sha256:1fb026f866bc4475a3b31c4182e  0.0s
 => => exporting manifest list sha256:845822a2fbf40ffe83fc1707a82de62c88  0.0s
 => => naming to docker.io/library/lee:v7                                 0.0s
 => => unpacking to docker.io/library/lee:v7                              0.0s

[root@docker-node1 docker]# docker run -it --name test --rm lee:v7
/mnt #

#可以看到路径确实变成了/mnt
```

```bash
#CMD
[root@docker-node1 docker]# vim Dockerfile

[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
ENV NAME=timinglee
EXPOSE 8080
VOLUME "/mnt"
RUN [ "/bin/sh","-c", "touch /root/$NAME" ]
WORKDIR "/mnt"
CMD ["/bin/echo", "$NAME"]

[root@docker-node1 docker]# docker build -t lee:v8  .
[+] Building 0.4s (7/7) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 208B                                      0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.1s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => [1/3] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => CACHED [2/3] RUN [ "/bin/sh","-c", "touch /root/timinglee" ]          0.0s
 => CACHED [3/3] WORKDIR /mnt                                             0.0s
 => exporting to image                                                    0.1s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:94b67315084f3cac8eb777fe57913d5344675f8  0.0s
 => => exporting config sha256:c771385c8b69b2d6e89e7990760491ed7169404ca  0.0s
 => => exporting attestation manifest sha256:6265ed6c2bc9c039ee969ec0544  0.0s
 => => exporting manifest list sha256:c94627b6be3c8ec4d36b13f51389c8d11b  0.0s
 => => naming to docker.io/library/lee:v8                                 0.0s
 => => unpacking to docker.io/library/lee:v8                              0.0s

[root@docker-node1 docker]# docker run -it --name test --rm lee:v8
$NAME

```

history可以看到的确执行了CMD命令


但是运行容器后并没有调用shell输出$NAME的值，说明CMD [“/bin/sh”,”-c”,“echo $FILENAME”] 不调用shell解析


```bash
[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
ENV NAME=timinglee
EXPOSE 8080
VOLUME "/mnt"
RUN [ "/bin/sh","-c", "touch /root/$NAME" ]
WORKDIR "/mnt"
CMD echo $NAME

[root@docker-node1 docker]# docker build -t lee:v8  .
[+] Building 0.3s (7/7) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 196B                                      0.0s
 => WARN: JSONArgsRecommended: JSON arguments recommended for CMD to pre  0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.0s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => [1/3] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => CACHED [2/3] RUN [ "/bin/sh","-c", "touch /root/timinglee" ]          0.0s
 => CACHED [3/3] WORKDIR /mnt                                             0.0s
 => exporting to image                                                    0.1s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:16ade2a32da8cc8156d3f3e07f0100af0e4dd3e  0.0s
 => => exporting config sha256:43af0fbb25f0f0d9821feceaf83f88dc2b0cf90bf  0.0s
 => => exporting attestation manifest sha256:c3b3532314820f25a8eb7106b66  0.0s
 => => exporting manifest list sha256:aea44e947ecc48503cdb61f91f583e8e2a  0.0s
 => => naming to docker.io/library/lee:v8                                 0.0s
 => => unpacking to docker.io/library/lee:v8                              0.0s

 1 warning found (use docker --debug to expand):
 - JSONArgsRecommended: JSON arguments recommended for CMD to prevent unintended behavior related to OS signals (line 8)
 
[root@docker-node1 docker]# docker run -it --name test --rm lee:v8
timinglee

```

可以看到镜像构建后有一个警告，而且运行容器后直接输出了$NAME的值，说明CMD echo $FILENAME  会调用shell解析。


而且CMD指令会被覆盖掉




```bash
#ENTRYPOINT
[root@docker-node1 docker]# vim Dockerfile

[root@docker-node1 docker]# cat Dockerfile
FROM busybox:latest
LABEL Creater=lee
ENV NAME=timinglee
EXPOSE 8080
VOLUME "/mnt"
RUN [ "/bin/sh","-c", "touch /root/$NAME" ]
WORKDIR "/mnt"
ENTRYPOINT ["/bin/sh","-c","echo $NAME"]

[root@docker-node1 docker]# docker build -t lee:v8  .
[+] Building 0.3s (7/7) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 222B                                      0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.0s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => [1/3] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => CACHED [2/3] RUN [ "/bin/sh","-c", "touch /root/timinglee" ]          0.0s
 => CACHED [3/3] WORKDIR /mnt                                             0.0s
 => exporting to image                                                    0.1s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:e52d6140de8fc8b09f69fab6b063047c7a58b36  0.0s
 => => exporting config sha256:9bc4a60e2163b3d07b557d3ccfd18df112491634b  0.0s
 => => exporting attestation manifest sha256:2c14079287689831ff57aad67e9  0.0s
 => => exporting manifest list sha256:671c8248a804fa772bb931c59e7e00ea65  0.0s
 => => naming to docker.io/library/lee:v8                                 0.0s
 => => unpacking to docker.io/library/lee:v8                              0.0s

[root@docker-node1 docker]# docker run -it --name test --rm lee:v8
timinglee

[root@docker-node1 docker]# docker run -it --name test --rm lee:v8 echo haha
timinglee

```

可以看到ENTRYPOINT作用与CMD基本相同，但是ENTRYPOINT命令不能被覆盖




```bash

#建立构建目录
[root@docker-node1 ~]# mkdir docker
[root@docker-node1 ~]# cd docker/

#编写构建规则文件
[root@docker-node1 docker]# vim Dockerfile

#FROM
FROM busybox:latest

#COPY
[root@docker-node1 docker]# echo timinglee > timinglee
[root@docker-node1 docker]# cat timinglee
timinglee


[root@docker-node1 docker]# vim Dockerfile
FROM busybox:latest
COPY timinglee /root

[root@docker-node1 docker]# docker build -t timinglee:v1 .  
#.识别当前目录当中名字为dockerfile的文件，文件名不对识别不了
[+] Building 0.2s (7/7) FINISHED                                docker:default
 => [internal] load build definition from Dockerfile                      0.0s
 => => transferring dockerfile: 78B                                       0.0s
 => [internal] load metadata for docker.io/library/busybox:latest         0.0s
 => [internal] load .dockerignore                                         0.0s
 => => transferring context: 2B                                           0.0s
 => [internal] load build context                                         0.0s
 => => transferring context: 46B                                          0.0s
 => [1/2] FROM docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => => resolve docker.io/library/busybox:latest@sha256:fd8d9aa63ba2f0982  0.0s
 => [2/2] COPY timinglee /root                                            0.0s
 => exporting to image                                                    0.1s
 => => exporting layers                                                   0.0s
 => => exporting manifest sha256:09f5672c5311b85b8e5f4bc3bf661d94b9dd65f  0.0s
 => => exporting config sha256:46ab4e759b64f3dd92e8fe12dc35b8abbc5aa4404  0.0s
 => => exporting attestation manifest sha256:39c28122ff0a4ee323c0ccbfb8e  0.0s
 => => exporting manifest list sha256:d6a555a7e8ae1c387b3df73e9422ff8dd3  0.0s
 => => naming to docker.io/library/timinglee:v1                           0.0s
 => => unpacking to docker.io/library/timinglee:v1 

#如果文件不叫dockerfile 必须-f指定文件进行构建
[root@docker-node1 docker]# docker build -t timinglee:v2 -f lee .

```


可以看到构建后执行了拷贝动作


查看操作历史也能看到历史动作


```bash
[root@docker-node1 docker]# docker run -it --name test --rm timinglee:v1
#--rm使容器停止后自动删除

[root@docker-node1 docker]# docker run -it --name test --rm timinglee:v1
/ # cat /root/timinglee
timinglee
/ # exit

[root@docker-node1 docker]# docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
#容器已经被自动删除

```

参数示例及用法

```bash
#FROM COPY 和MAINTAINER
#构建目录
[root@Docker-node1 ~]# mkdir  docker/
[root@Docker-node1 ~]# cd docker/

#编写构建规则文件
[root@Docker-node1 docker]# touch leefile
[root@Docker-node1 docker]# vim Dockerfile 
FROM busybox:latest				#指定使用的基础镜像
MAINTAINER lee@timinglee.org	#指定作者信息
COPY leefile /					#复制当前目录文件到容器指定位置，leefile必须在当前目录中

[root@Docker-node1 docker]# docker build -t example:v1 .	#构建镜像

#ADD
[root@Docker-node1 docker]# touch leefile{1..3}
[root@Docker-node1 docker]# tar zcf leefile.gz leefile*
[root@Docker-node1 docker]# vim Dockerfile
FROM busybox
MAINTAINER lee@timinglee.org
COPY leefile /
ADD leefile.gz /

[root@Docker-node1 docker]# docker build -t example:v2 .
[root@Docker-node1 docker]# docker run -it --rm --name test example:v2
/ # ls
bin       etc       leefile   leefile2  lib       proc      sys       usr
dev       home      leefile1  leefile3  lib64     root      tmp       var

#ENV CMD
FROM busybox
MAINTAINER lee@timinglee.org
ENV NAME lee
CMD echo $NAME
#CMD ["/bin/echo", "$NAME"]
#CMD ["/bin/sh", "-c", "/bin/echo $NAME"]
[root@Docker-node1 docker]# docker run -it --rm --name test example:v3
lee


FROM busybox
MAINTAINER lee@timinglee.org
ENV NAME lee
#CMD echo $NAME
CMD ["/bin/echo", "$NAME"]
#CMD ["/bin/sh", "-c", "/bin/echo $NAME"]
[root@Docker-node1 docker]# docker run -it --rm --name test example:v3
$NAME

#ENV CMD
FROM busybox
MAINTAINER lee@timinglee.org
ENV NAME lee
#CMD echo $NAME
#CMD ["/bin/echo", "$NAME"]
CMD ["/bin/sh", "-c", "/bin/echo $NAME"]
[root@Docker-node1 docker]# docker run -it --rm --name test example:v3
lee

#ENTRYPOINT
FROM busybox
MAINTAINER lee@timinglee.org
ENV NAME lee
ENTRYPOINT echo $NAME
[root@Docker-node1 docker]# docker run -it --rm --name test example:v3  sh
lee

#EXPOSE VOLUME VOLUME
FROM busybox
MAINTAINER lee@timinglee.org
ENV NAME lee
EXPOSE 80 443
VOLUME /var/www/html
WORKDIR /var/www/html
RUN touch leefile

[root@Docker-node1 docker]# docker build -t example:v4 .
[root@Docker-node1 docker]# docker run -it --rm --name test example:v4
/var/www/html #
```



### 3.4.2 Dockerfile实例

#### 3.4.2.1 建立构建目录，编写构建文件

```bash
[root@server1 ~]# mdkir docker
[root@server1 ~]# cd docker/
[root@server1 docker]#  cp ~/nginx-1.23.3.tar.gz .
[root@server1 docker]# vim Dockerfile
FROM centos:7
ADD nginx-1.23.3.tar.gz /mnt
WORKDIR /mnt/nginx-1.23.3
RUN yum install -y gcc make pcre-devel openssl-devel
RUN sed -i 's/CFLAGS="$CFLAGS -g"/#CFLAGS="$CFLAGS -g"/g' auto/cc/gcc
RUN ./configure --with-http_ssl_module --with-http_stub_status_module
RUN make
RUN make install
EXPOSE 80
VOLUME ["/usr/local/nginx/html"]
CMD ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]
```

#### 3.4.2.2 通过dockerfile生成镜像

```bash
[root@server1 docker]# docker build -t webserver:v1 .
```

#### 3.4.2.3 测试镜像可用性

```
[root@server1 docker]# docker images webserver
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
webserver    v1        bfd6774cc216   8 seconds ago   494MB

[root@server1 docker]# docker history  webserver:v1
[root@server1 docker]# docker run -d --name checkimage webserver
```

#### 3.4.2.4 查看容器详情

```
[root@server1 docker]# docker inspect  web1
```





## 3.5 镜像优化方案

### 3.5.1 镜像优化策略

- 选择最精简的基础镜像
- 减少镜像的层数
- 清理镜像构建的中间产物

### 3.5.2 镜像优化示例

**方法1.缩减镜像层**

```
[root@server1 docker]# vim Dockerfile
FROM centos:7 AS build
ADD nginx-1.23.3.tar.gz /mnt
WORKDIR /mnt/nginx-1.23.3
RUN yum install -y gcc make pcre-devel openssl-devel && sed -i 's/CFLAGS="$CFLAGS -g"/#CFLAGS="$CFLAGS -g"/g' auto/cc/gcc && ./configure --with-http_ssl_module --with-http_stub_status_module && make && make install && cd .. && rm -fr nginx-1.23.3 && yum clean all
EXPOSE 80
VOLUME ["/usr/local/nginx/html"]
CMD ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]

[root@server1 docker]# docker build -t webserver:v2 .

[root@server1 docker]# docker images  webserver
REPOSITORY   TAG       IMAGE ID       CREATED             SIZE
webserver    v2        caf0f80f2332   4 seconds ago       317MB
webserver    v1        bfd6774cc216   About an hour ago   494MB

```

**方法2.多阶段构建**

```
[root@server1 docker]# vim Dockerfile
FROM centos:7 AS build
ADD nginx-1.23.3.tar.gz /mnt
WORKDIR /mnt/nginx-1.23.3
RUN yum install -y gcc make pcre-devel openssl-devel && sed -i 's/CFLAGS="$CFLAGS -g"/#CFLAGS="$CFLAGS -g"/g' auto/cc/gcc && ./configure --with-http_ssl_module --with-http_stub_status_module && make && make install && cd .. && rm -fr nginx-1.23.3 && yum clean all

FROM centos:7
COPY --from=build /usr/local/nginx /usr/local/nginx
EXPOSE 80
VOLUME ["/usr/local/nginx/html"]
CMD ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]

[root@server1 docker]# docker build -t webserver:v3 .

[root@server1 docker]# docker images  webserver
REPOSITORY   TAG       IMAGE ID       CREATED             SIZE
webserver    v3        1ac964f2cefe   29 seconds ago      205MB
webserver    v2        caf0f80f2332   3 minutes ago       317MB
webserver    v1        bfd6774cc216   About an hour ago   494MB
```

**方法3.使用最精简镜像**

使用google提供的最精简镜像

**下载地址：**

**https://github.com/GoogleContainerTools/distroless**

**下载镜像：**

```
docker pull gcr.io/distroless/base
```

利用最精简镜像构建

```
[root@server1 ~]# mkdir new
[root@server1 ~]# cd new/
[root@server1 new]# vim Dockerfile
FROM nginx:1.23 AS base

# https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
ARG TIME_ZONE

RUN mkdir -p /opt/var/cache/nginx && \
    cp -a --parents /usr/lib/nginx /opt && \
    cp -a --parents /usr/share/nginx /opt && \
    cp -a --parents /var/log/nginx /opt && \
    cp -aL --parents /var/run /opt && \
    cp -a --parents /etc/nginx /opt && \
    cp -a --parents /etc/passwd /opt && \
    cp -a --parents /etc/group /opt && \
    cp -a --parents /usr/sbin/nginx /opt && \
    cp -a --parents /usr/sbin/nginx-debug /opt && \
    cp -a --parents /lib/x86_64-linux-gnu/ld-* /opt && \
    cp -a --parents /usr/lib/x86_64-linux-gnu/libpcre* /opt && \
    cp -a --parents /lib/x86_64-linux-gnu/libz.so.* /opt && \
    cp -a --parents /lib/x86_64-linux-gnu/libc* /opt && \
    cp -a --parents /lib/x86_64-linux-gnu/libdl* /opt && \
    cp -a --parents /lib/x86_64-linux-gnu/libpthread* /opt && \
    cp -a --parents /lib/x86_64-linux-gnu/libcrypt* /opt && \
    cp -a --parents /usr/lib/x86_64-linux-gnu/libssl.so.* /opt && \
    cp -a --parents /usr/lib/x86_64-linux-gnu/libcrypto.so.* /opt && \
    cp /usr/share/zoneinfo/${TIME_ZONE:-ROC} /opt/etc/localtime

FROM gcr.io/distroless/base-debian11

COPY --from=base /opt /

EXPOSE 80 443

ENTRYPOINT ["nginx", "-g", "daemon off;"]

[root@server1 new]# docker build -t webserver:v4 .

[root@server1 new]# docker images  webserver
REPOSITORY   TAG       IMAGE ID       CREATED             SIZE
webserver    v4        c0c4e1d49f3d   4 seconds ago       34MB
webserver    v3        1ac964f2cefe   12 minutes ago      205MB
webserver    v2        caf0f80f2332   15 minutes ago      317MB
webserver    v1        bfd6774cc216   About an hour ago   494MB
```

