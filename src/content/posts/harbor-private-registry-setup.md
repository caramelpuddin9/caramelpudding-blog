---
title: "搭建 Harbor 私有仓库"
published: 2026-07-12
description: "一口气带你搭建 Harbor 私有仓库"
image: ./images/bg021.png
tags: [Harbor, Docker, 私有仓库, Registry, DevOps]
category: 技术
draft: false
---

## 一、构建企业级私有仓库

![Harbor 架构概览](https://i-blog.csdnimg.cn/img_convert/a0f957cf7ca104430c307b9ef67ee485.jpeg)

**下载软件包地址**

https://github.com/goharbor/harbor/releases

Harbor 是由 VMware 公司开源的企业级 Docker Registry 项目。

它提供了以下主要功能和特点：

1. **基于角色的访问控制（RBAC）**：可以为不同的用户和用户组分配不同的权限，增强了安全性和管理的灵活性。
2. **镜像复制**：支持在不同的 Harbor 实例之间复制镜像，方便在多个数据中心或环境中分发镜像。
3. **图形化用户界面（UI）**：提供了直观的 Web 界面，便于管理镜像仓库、项目、用户等。
4. **审计日志**：记录了对镜像仓库的各种操作，有助于追踪和审查活动。
5. **垃圾回收**：可以清理不再使用的镜像，节省存储空间。

### 1.1 部署 Harbor

#### 生成证书和密钥

```bash
[root@docker ~]# openssl req -newkey rsa:4096 \
  -nodes -sha256 -keyout certs/timinglee.org.key \
  -addext "subjectAltName = DNS:reg.timinglee.org" \
  -x509 -days 365 -out certs/timinglee.org.crt
```

交互式输入证书信息：

```
Country Name (2 letter code) [XX]:CN
State or Province Name (full name) []:guangdong
Locality Name (eg, city) [Default City]:guangzhou
Organization Name (eg, company) [Default Company Ltd]:timinglee
Organizational Unit Name (eg, section) []:docker
Common Name (eg, your name or your server's hostname) []:reg.timinglee.org
Email Address []:admin@timinglee.org
```

查看证书信息：

```bash
[root@docker-node1 docker]# openssl x509 -in certs/timinglee.org.crt -noout -text
```

#### 解压并配置 Harbor

```bash
[root@docker-node1 ~]# tar zxf harbor-offline-installer-v2.14.4.tgz -C /opt/
[root@docker-node1 ~]# cd /opt/harbor/
[root@docker-node1 harbor]# cp -p harbor.yml.tmpl harbor.yml
```

准备证书目录：

```bash
[root@docker-node1 ~]# mkdir /data
[root@docker-node1 ~]# cp -rp /etc/docker/certs/ /data/
[root@docker-node1 ~]# ll /data/certs/timinglee.org.crt
-rw-r--r-- 1 root root 2212  6月 19 20:39 /data/certs/timinglee.org.crt
[root@docker-node1 ~]# ll /data/certs/timinglee.org.key
-rw------- 1 root root 3272  6月 19 20:37 /data/certs/timinglee.org.key
```

编辑 harbor.yml 配置文件：

```bash
[root@docker-node1 harbor]# vim harbor.yml
```

![harbor.yml 配置](https://i-blog.csdnimg.cn/direct/951c19407b7f4f1490fbfae0cff0dcd0.png)

![harbor.yml 配置](https://i-blog.csdnimg.cn/direct/97c8455ad46c42e3a516d6c258f59dfe.png)

> 注意：容器运行时会和其他正在运行的容器冲突，需要先关闭其他容器。

```bash
[root@docker-node1 harbor]# docker rm -f registry
```

![删除冲突容器](https://i-blog.csdnimg.cn/direct/383f47f798394986aabc812e78f6a137.png)

#### 安装 Harbor

```bash
[root@docker-node1 harbor]# ./install.sh

[Step 0]: checking if docker is installed ...
Note: docker version: 29.5.2

[Step 1]: checking docker-compose is installed ...
Note: Docker Compose version v5.1.4

[Step 2]: loading Harbor images ...
Loaded image: goharbor/trivy-adapter-photon:v2.14.4
Loaded image: goharbor/harbor-exporter:v2.14.4
Loaded image: goharbor/harbor-portal:v2.14.4
Loaded image: goharbor/harbor-db:v2.14.4
Loaded image: goharbor/redis-photon:v2.14.4
Loaded image: goharbor/prepare:v2.14.4
Loaded image: goharbor/harbor-log:v2.14.4
Loaded image: goharbor/harbor-core:v2.14.4
Loaded image: goharbor/harbor-jobservice:v2.14.4
Loaded image: goharbor/harbor-registryctl:v2.14.4
Loaded image: goharbor/nginx-photon:v2.14.4
Loaded image: goharbor/registry-photon:v2.14.4

[Step 3]: preparing environment ...
[Step 4]: preparing harbor configs ...
[Step 5]: starting Harbor ...
[+] up 10/10
 ✔ Network harbor_harbor       Created
 ✔ Container harbor-log        Started
 ✔ Container harbor-portal     Started
 ✔ Container redis             Started
 ✔ Container registry          Started
 ✔ Container harbor-db         Started
 ✔ Container registryctl       Started
 ✔ Container harbor-core       Started
 ✔ Container harbor-jobservice Started
 ✔ Container nginx             Started
✔ ----Harbor has been installed and started successfully.----
```

安装完成后的界面：

![安装完成](https://i-blog.csdnimg.cn/direct/d6f69349635d4f52be2124a1436da0df.png)

可以看到所有容器都已成功启动：

![容器运行状态](https://i-blog.csdnimg.cn/direct/c76f6e90b6f543a0b6adb4ad7a7017f5.png)

Harbor 服务管理命令：

```bash
开启：docker compose up -d
关闭：docker compose stop    # 关闭后不删除容器
删除：docker compose down    # 开启后依旧会重新建立
```

#### 其他版本配置参考

```bash
[root@docker ~]# tar zxf harbor-offline-installer-v2.5.4.tgz
[root@docker ~]# cd harbor/
[root@docker harbor]# cp harbor.yml.tmpl harbor.yml
[root@docker harbor]# vim harbor.yml

  hostname: reg.timinglee.org
  certificate: /data/certs/timinglee.org.crt
  private_key: /data/certs/timinglee.org.key
  harbor_admin_password: lee

[root@docker harbor]# ./install.sh --with-chartmuseum
```

---

## 二、管理仓库

### 2.1 访问 Harbor Web 界面

部署完成后，在浏览器访问 Harbor 的 IP 地址即可进入管理界面：

![Harbor 登录界面](https://i-blog.csdnimg.cn/direct/a846d89d8a58407d8cd89324339c577d.png)

### 2.2 Docker 登录 Harbor

```bash
[root@docker-node1 harbor]# docker login reg.timinglee.org
Username: admin
Password:
Error response from daemon: Get "https://reg.timinglee.org/v2/":
dial tcp: lookup reg.timinglee.org on 114.114.114.114:53: no such host
```

> 这里显示 DNS 服务器 114.114.114.114 无法解析 reg.timinglee.org，因为这个域名在公网 DNS 中不存在。所以需要自己配置域名解析。

```bash
[root@docker-node1 harbor]# vim /etc/hosts
127.0.0.1 localhost localhost.localdomain localhost4 localhost4.localdomain4
::1       localhost localhost.localdomain localhost6 localhost6.localdomain6
192.168.84.10  docker-node1
192.168.84.10 reg.timinglee.org
```

![配置 hosts](https://i-blog.csdnimg.cn/direct/276bb7cd681142a38a97850efe0c026f.png)

再次登录，遇到证书错误：

```bash
[root@docker-node1 harbor]# docker login reg.timinglee.org
Username: admin
Password:
Error response from daemon: Get "https://reg.timinglee.org/v2/":
tls: failed to verify certificate: x509: certificate signed by unknown authority
```

> 这里显示证书有问题，需要重新配置证书信任。

```bash
[root@docker-node1 docker]# mkdir -p certs.d/reg.timinglee.org
[root@docker-node1 harbor]# cp /data/certs/timinglee.org.crt \
  /etc/docker/certs.d/reg.timinglee.org/ca.crt
[root@docker-node1 harbor]# ls -la /etc/docker/certs.d/reg.timinglee.org/
总用量 4
drwxr-xr-x 2 root root   20  6月 19 22:40 .
drwxr-xr-x 3 root root   31  6月 19 22:38 ..
-rw-r--r-- 1 root root 2212  6月 19 22:40 ca.crt

[root@docker-node1 harbor]# systemctl restart docker
[root@docker-node1 harbor]# docker compose up -d
```

配置正确后，登录成功：

```bash
[root@docker-node1 harbor]# docker login reg.timinglee.org
Username: admin
Password:
Login Succeeded
```

### 2.3 推送镜像到 Harbor

```bash
# 查看本地镜像
[root@docker-node1 ~]# docker images | grep game2048
timinglee/game2048:latest   19299002fdbe   55.5MB

# 打标签
[root@docker-node1 ~]# docker tag timinglee/game2048:latest \
  reg.timinglee.org/library/game2048:latest

# 推送镜像
[root@docker-node1 ~]# docker push reg.timinglee.org/library/game2048:latest
The push refers to repository [reg.timinglee.org/library/game2048]
88fca8ae768a: Pushed
6d7504772167: Pushed
192e9fad2abc: Pushed
36e9226e74f8: Pushed
011b303988d2: Pushed
latest: digest: sha256:8a34fb9cb168c420604b6e5d32ca6d412cb0d533a826b313b190535c03fe9390 size: 1364
```

可以看到镜像被成功推送到仓库：

![推送成功](https://i-blog.csdnimg.cn/direct/29ac09fd476a45679d8168e05dc65399.png)

### 2.4 推送到新建项目

也可以推送到新建的项目中：

```bash
[root@docker-node1 ~]# docker tag timinglee/game2048:latest \
  reg.timinglee.org/timinglee/game2048:latest
[root@docker-node1 ~]# docker push reg.timinglee.org/timinglee/game2048:latest
The push refers to repository [reg.timinglee.org/timinglee/game2048]
88fca8ae768a: Mounted from library/game2048
6d7504772167: Mounted from library/game2048
192e9fad2abc: Mounted from library/game2048
36e9226e74f8: Mounted from library/game2048
011b303988d2: Mounted from library/game2048
latest: digest: sha256:8a34fb9cb168c420604b6e5d32ca6d412cb0d533a826b313b190535c03fe9390 size: 1364
```

![新建项目](https://i-blog.csdnimg.cn/direct/34321e6886264bcc869c17d3896a85ea.png)

### 2.5 其他节点拉取镜像

开另一台虚拟机模拟拉取镜像：

```bash
[root@docker-node2 ~]# vim /lib/systemd/system/docker.service
```

![docker.service 配置](https://i-blog.csdnimg.cn/direct/0540892e1e4441e990fc3d2e6e2d971c.png)

![docker.service 配置](https://i-blog.csdnimg.cn/direct/f4c4a36982974af289f57be78afc3bb4.png)

在其他节点上同理配置认证证书和 key：

```bash
[root@docker-node1 docker]# ls
certs  certs.d  daemon.json

# 生成认证 key 和证书
[root@docker ~]# openssl req -newkey rsa:4096 \
  -nodes -sha256 -keyout certs/timinglee.org.key \
  -addext "subjectAltName = DNS:reg.timinglee.org" \
  -x509 -days 365 -out certs/timinglee.org.crt

Country Name (2 letter code) [XX]:CN
State or Province Name (full name) []:guangdong
Locality Name (eg, city) [Default City]:guangzhou
Organization Name (eg, company) [Default Company Ltd]:timinglee
Organizational Unit Name (eg, section) []:docker
Common Name (eg, your name or your server's hostname) []:reg.timinglee.org
Email Address []:admin@timinglee.org
```

以自己搭建的仓库为加速器：

```bash
[root@docker-node2 ~]# vim /etc/docker/daemon.json
```

![daemon.json 配置](https://i-blog.csdnimg.cn/direct/9dd8003a91764564a5c0483e0d0e53be.png)

```bash
[root@docker-node2 ~]# docker info
```

![docker info](https://i-blog.csdnimg.cn/direct/fe4b2cc01787480f8081418285ceb517.png)

拉取镜像：

```bash
[root@docker-node2 ~]# docker pull timinglee/busybox
Using default tag: latest
latest: Pulling from timinglee/busybox
d0f42ecf7e6c: Pull complete
Status: Downloaded newer image for timinglee/busybox:latest
docker.io/timinglee/busybox:latest
```

> 配置仓库为加速器后，可以不用再写完整仓库地址。

---

## 三、Harbor Web 界面操作

### 3.1 登录

![Harbor 登录界面](https://i-blog.csdnimg.cn/img_convert/55c73b06a6f0c0c0445ebf782181bea7.jpeg)

### 3.2 建立仓库项目

![创建项目](https://i-blog.csdnimg.cn/img_convert/872dc4aac3144957be6ad9fc38024ced.jpeg)

![项目配置](https://i-blog.csdnimg.cn/img_convert/4fe74cad60d807e7b66bc9995a1e0f14.jpeg)

### 3.3 上传镜像

```bash
[root@docker harbor]# docker login reg.timinglee.org
Username: admin
Password:
Login Succeeded

[root@docker harbor]# docker tag busybox:latest \
  reg.timinglee.org/timinglee/busybox:latest
[root@docker harbor]# docker push reg.timinglee.org/timinglee/busybox:latest
The push refers to repository [reg.timinglee.org/timinglee/busybox]
d51af96cf93e: Pushed
latest: digest: sha256:28e01ab32c9dbcbaae96cf0d5b472f22e231d9e603811857b295e61197e40a9b size: 527
```

查看上传的镜像：

![查看上传的镜像](https://i-blog.csdnimg.cn/img_convert/0211553612d0ac38273fb568dd318de1.jpeg)

---

## 总结

本文详细介绍了 Harbor 私有仓库的完整搭建流程：

| 阶段 | 内容 |
|---|---|
| **证书生成** | 使用 OpenSSL 生成自签名 SSL 证书 |
| **Harbor 部署** | 离线安装 Harbor v2.14.4 |
| **Docker 对接** | 配置证书信任、域名解析、登录验证 |
| **镜像管理** | 推送镜像到 Library 项目和自定义项目 |
| **多节点配置** | 其他节点配置证书与加速器，实现内网快速拉取 |
