---
title: Docker 容器学习（一）：Docker简介及部署方法
published: 2026-02-10
description: Docker 简介、容器与虚拟化对比、Docker 的优势，以及如何部署第一个 Docker 容器环境。
image: ./images/new01.png
tags: [Docker, Linux, 容器, 虚拟化]
category: 技术
draft: false
---
# 一 Docker简介及部署方法

## 1.1 Docker简介


Docker之父Solomon Hykes：Docker就好比传统的货运集装箱

> [!NOTE]
>
> 2008 年LXC(LinuX Contiainer)发布，但是没有行业标准，兼容性非常差
>
> docker2013年首次发布，由Docker, Inc开发



### 1.1.1 什么是docker？


- Docker是管理容器的引擎，为应用打包、部署平台，而非单纯的虚拟化技术

  它具有以下几个重要特点和优势：

  1. **轻量级虚拟化**

     ：Docker 容器相较于传统的虚拟机更加轻量和高效，能够快速启动和停止，节省系统资源。

     - 例如，启动一个 Docker 容器可能只需要几秒钟，而启动一个虚拟机则可能需要几分钟。

  2. **一致性**

     ：确保应用程序在不同的环境中（如开发、测试、生产）具有一致的运行表现。

     - 无论在本地还是云端，应用的运行环境都能保持相同，减少了因环境差异导致的问题。

  3. **可移植性**

     ：可以轻松地将 Docker 容器从一个平台迁移到另一个平台，无需担心依赖和环境配置的差异。

     - 比如，在本地开发的容器可以无缝部署到云服务器上。

  4. **高效的资源利用**：多个 Docker 容器可以共享主机的操作系统内核，从而更有效地利用系统资源。

  5. **易于部署和扩展**：能够快速部署新的应用实例，并且可以根据需求轻松地进行水平扩展。

  总之，Docker 极大地简化了应用程序的开发、部署和管理流程，提高了开发效率和运维的便利性。它在现代软件开发和云计算领域得到了广泛的应用。

### 1.1.2 docker在企业中的应用场景


- 在企业中docker作为业务的最小载体而被广泛应用
- 通过docker企业可以更效率的部署应用并更节省资源

> [!NOTE]
>
> IaaS（Infrastructure as a Service），即基础设施即服务
>
> PaaS是（Platform as a Service）即指平台即服务
>
> SaaS（Software as a Service）软件运营服务是

### 1.1.3 docker与虚拟化的对比


|          | 虚拟机                      | docker容器       |
| -------- | --------------------------- | ---------------- |
| 操作系统 | 宿主机上运行虚拟机OS        | 共享宿主机OS     |
| 存储     | 镜像较大（GB                | 镜像小（MB）     |
| 性能     | 操作系统额外的cpu、内存消耗 | 几乎无性能损耗   |
| 移植性   | 笨重、与虚拟化技术耦合度高  | 轻量、灵活迁移   |
| 隔离性   | 完全隔离                    | 安全隔离         |
| 部署     | 慢、分钟级                  | 快速、秒级       |
| 运行密度 | 一般几十个                  | 单机支持上千容器 |

### 1.1.4 docker的优势

- 对于开发人员：Build once、Run anywhere。
- 对于运维人员：Configure once、Run anything
- 容器技术大大提升了IT人员的幸福指数！



## 2 部署docker

### 2.1 容器工作方法


### 2.2 部署第一个容器

官方站点：https://docs.docker.com/

#### 2.2.1 配置软件仓库

```
]# cd /etc/yum.repos.d
]# vim docker.repo
[docker]
name=docker-ce
baseurl=https://mirrors.aliyun.com/docker-ce/linux/rhel/9/x86_64/stable
gpgcheck=0
```

#### 2.2.2 安装docker-ce并启动服务

```bash
#安装docker
]# yum install -y docker-ce 

#编辑docker启动文件，设定其使用iptables的网络设定方式，默认使用nftables
[root@docker ~]# vim /usr/lib/systemd/system/docker.service
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock --iptables=true

]# systemctl  enable --now docker
]# docker info
```

#### 2.2.3 激活内核网络选项

```
]# echo br_netfilter > /etc/modules-load.d/docker_mod.conf
]# modprobe br_netfilter
]# vim /etc/sysctl.d/docker.conf
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1

]# sysctl --system
]# systemctl  restart docker
```

2.2.4 设定docker加速器


```
[root@docker-node1 ~]# vim /etc/docker/daemon.json
{
    "registry-mirrors": ["https://docker.m.daocloud.io"]
}

[root@docker-node1 ~]# systemctl restart docker
[root@docker-node1 ~]# docker info
... ...
 Registry Mirrors:
  https://docker.m.daocloud.io/
 Live Restore Enabled: false

```


