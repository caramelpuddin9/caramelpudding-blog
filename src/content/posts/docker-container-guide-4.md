---
title: Docker 容器学习（四）：Docker镜像仓库管理
published: 2026-02-13
description: Docker Hub 使用、私有仓库 Registry 搭建（加密传输+登陆认证）、Harbor 企业级仓库部署与管理。
image: ./images/bg005.png
tags: [Docker, Harbor, Registry, 镜像仓库]
category: 技术
draft: false
---
# 四 docker 镜像仓库的管理

## 4.1 什么是docker仓库


**Docker 仓库（Docker Registry）** 是用于存储和分发 Docker 镜像的集中式存储库。

它就像是一个大型的镜像仓库，开发者可以将自己创建的 Docker 镜像推送到仓库中，也可以从仓库中拉取所需的镜像。

Docker 仓库可以分为公共仓库和私有仓库：

- 公共仓库，如 Docker Hub，任何人都可以访问和使用其中的镜像。许多常用的软件和应用都有在 Docker Hub 上提供的镜像，方便用户直接获取和使用。
  - 例如，您想要部署一个 Nginx 服务器，就可以从 Docker Hub 上拉取 Nginx 的镜像。
- 私有仓库则是由组织或个人自己搭建和管理的，用于存储内部使用的、不希望公开的镜像。
  - 比如，一家企业为其特定的业务应用创建了定制化的镜像，并将其存储在自己的私有仓库中，以保证安全性和控制访问权限。

通过 Docker 仓库，开发者能够方便地共享和复用镜像，加速应用的开发和部署过程。

## 4.2 docker hub


官网：https://hub.docker.com/


**Docker Hub** 是 Docker 官方提供的一个公共的镜像仓库服务。

它是 Docker 生态系统中最知名和广泛使用的镜像仓库之一，拥有大量的官方和社区贡献的镜像。

以下是 Docker Hub 的一些关键特点和优势：

1. 丰富的镜像资源：涵盖了各种常见的操作系统、编程语言运行时、数据库、Web 服务器等众多应用的镜像。
   - 例如，您可以轻松找到 Ubuntu、CentOS 等操作系统的镜像，以及 MySQL、Redis 等数据库的镜像。
2. 官方支持：提供了由 Docker 官方维护的一些重要镜像，确保其质量和安全性。
3. 社区贡献：开发者们可以自由上传和分享他们创建的镜像，促进了知识和资源的共享。
4. 版本管理：对于每个镜像，通常都有多个版本可供选择，方便用户根据需求获取特定版本。
5. 便于搜索：用户可以通过关键词轻松搜索到所需的镜像。

### 4.2.1 docker hub的使用方法

```bash
#登陆官方仓库
[root@docker ~]# docker login
Log in with your Docker ID or email address to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com/ to create one.
You can log in with your password or a Personal Access Token (PAT). Using a limited-scope PAT grants better security and is required for organizations using SSO. Learn more at https://docs.docker.com/go/access-tokens/

Username: timinglee
Password:
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credential-stores

Login Succeeded

#登陆信息保存位置
[root@docker ~]# cd .docker/
[root@docker .docker]# ls
config.json
[root@docker .docker]# cat config.json
{
        "auths": {
                "https://index.docker.io/v1/": {
                        "auth": "dGltaW5nbGVlOjY3NTE1MTVtaW5nemxu"
                }
        }

[root@docker ~]# docker tag gcr.io/distroless/base-debian11:latest  timinglee/base-debian11:latest
[root@docker ~]# docker push  timinglee/base-debian11:latest
The push refers to repository [docker.io/timinglee/base-debian11]
6835249f577a: Pushed
24aacbf97031: Pushed
8451c71f8c1e: Pushed
2388d21e8e2b: Pushed
c048279a7d9f: Pushed
1a73b54f556b: Pushed
2a92d6ac9e4f: Pushed
bbb6cacb8c82: Pushed
ac805962e479: Pushed
af5aa97ebe6c: Pushed
4d049f83d9cf: Pushed
9ed498e122b2: Pushed
577c8ee06f39: Pushed
5342a2647e87: Pushed
latest: digest: sha256:f8179c20f1f2b1168665003412197549bd4faab5ccc1b140c666f9b8aa958042 size: 3234

```




> [!TIP]
>
> 在国内因为网络等原因，docker hub连接困难，可以使用国内的镜像加速解决镜像无法下载的问题
>
> ```bash
> [root@harbor docker]# vim /etc/docker/daemon.json
> {
>   "registry-mirrors": ["https://docker.m.daocloud.io"],
> }
> [root@harbor docker]# systemctl restart docker
> ```



## 4.3 docker仓库的工作原理

仓库中的三个角色

**index** docker索引服务，负责并维护有关用户帐户、镜像的校验以及公共命名空间的信息。

**registry** docker仓库，是镜像和图表的仓库，它不具有本地数据库以及不提供用户认证，通过Index Auth service的Token的方式进行认证

**Registry Client** Docker充当registry客户端来维护推送和拉取，以及客户端的授权。



### 4.3.1 pull原理


镜像拉取分为以下几步：

1.docker客户端向index发送镜像拉去请求并完成与index的认证

2.index发送认证token和镜像位置给dockerclient

3.dockerclient携带token和根据index指引的镜像位置取连接registry

4.Registry会根据client持有的token跟index核实身份合法性

5.index确认此token合法性

6.Registry会根据client的请求传递镜像到客户端

### 4.3.2 push原理






镜像上传的步骤：

1.client向index发送上传请求并完成用户认证

2.index会发方token给client来证明client的合法性

3.client携带index提供的token连接Registry

4.Registry向index合适token的合法性

5.index证实token的合法性

6.Registry开始接收客户端上传过来的镜像





## 4.3 搭建docker的私有仓库

### 4.3.1 为什么搭建私有仓库

docker hub虽然方便，但是还是有限制

- 需要internet连接，速度慢
- 所有人都可以访问
- 由于安全原因企业不允许将镜像放到外网

好消息是docker公司已经将registry开源，我们可以快速构建企业私有仓库

地址： https://docs.docker.com/registry/deploying/



### 4.3.2 搭建简单的Registry仓库

1.下载Registry镜像

```bash
[root@docker ~]# docker pull registry
Using default tag: latest
latest: Pulling from library/registry
930bdd4d222e: Pull complete
a15309931e05: Pull complete
6263fb9c821f: Pull complete
86c1d3af3872: Pull complete
a37b1bf6a96f: Pull complete
Digest: sha256:12120425f07de11a1b899e418d4b0ea174c8d4d572d45bdb640f93bc7ca06a3d
Status: Downloaded newer image for registry:latest
docker.io/library/registry:latest
```

2.开启Registry

```bash
[root@docker ~]# docker run  -d -p 5000:5000 --restart=always --name registry registry
bc58d3753a701ae67351fac335b06a4d7f66afa10ae60b992f647117827734c5
[root@docker ~]# docker ps
CONTAINER ID   IMAGE      COMMAND                   CREATED         STATUS         PORTS            NAMES
bc58d3753a70   registry   "/entrypoint.sh /etc…"   7 seconds ago   Up 6 seconds   5000/tcp, 0.0.0.0:5000->5000/tcp, :::5000->5000/tcp   registry

```

3.上传镜像到仓库中

```bash
#给要上传的经镜像大标签
[root@docker ~]# docker tag busybox:latest  172.25.254.100:5000/busybox:latest

#docker在上传的过程中默认使用https，但是我们并没有建立https认证需要的认证文件所以会报错
[root@docker ~]# docker push 172.25.254.100:5000/busybox:latest
The push refers to repository [172.25.254.100:5000/busybox]
Get "https://172.25.254.100:5000/v2/": dial tcp 172.25.254.100:5000: connect: connection refused


#配置非加密端口
[root@docker ~]# vim /etc/docker/daemon.json
{
  "insecure-registries" : ["http://172.25.254.100:5000"]
}

[root@docker ~]# systemctl restart docker

#上传镜像
[root@docker ~]# docker push  172.25.254.100:5000/busybox:latest
The push refers to repository [172.25.254.100:5000/busybox]
d51af96cf93e: Pushed
latest: digest: sha256:28e01ab32c9dbcbaae96cf0d5b472f22e231d9e603811857b295e61197e40a9b size: 527

#查看镜像上传
[root@docker ~]# curl 172.25.254.100:5000/v2/_catalog
{"repositories":["busybox"]}

```

### 4.3.3 为Registry提加密传输

```bash
#生成认证key和证书
[root@docker ~]#  openssl req -newkey  rsa:4096 \
-nodes -sha256 -keyout certs/timinglee.org.key \
-addext "subjectAltName = DNS:reg.timinglee.org" \		#指定备用名称
-x509 -days 365 -out certs/timinglee.org.crt

You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:CN
State or Province Name (full name) []:Shaanxi
Locality Name (eg, city) [Default City]:Xi'an
Organization Name (eg, company) [Default Company Ltd]:timinglee
Organizational Unit Name (eg, section) []:docker
Common Name (eg, your name or your server's hostname) []:reg.timinglee.org
Email Address []:admin@timinglee.org

#查看证书信息
[root@docker-node1 ~]# openssl x509 -in certs/timinglee.org.crt -noout -text
```

```bash
#启动registry仓库
[root@docker ~]# docker run -d -p 443:443 --restart=always --name registry \
-v /opt/registry:/var/lib/registry \
-v /root/certs:/certs \
-e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
-e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/timinglee.org.crt \
-e REGISTRY_HTTP_TLS_KEY=/certs/timinglee.org.key registry
```

测试：

```bash
[root@docker docker]# docker push reg.timinglee.org/busybox:latest		#docker客户端没有key和证书
Error response from daemon: Get "https://reg.timinglee.org/v2/": tls: failed to verify certificate: x509: certificate signed by unknown authority
```

```
#为客户端建立证书
[root@docker docker]# mkdir /etc/docker/certs.d/reg.timinglee.org/ -p
[root@docker docker]# cp /root/certs/timinglee.org.crt  /etc/docker/certs.d/reg.timinglee.org/ca.crt
[root@docker docker]# systemctl restart docker
```

```
[root@docker docker]# docker push reg.timinglee.org/busybox:latest                                 The push refers to repository [reg.timinglee.org/busybox]
d51af96cf93e: Pushed
latest: digest: sha256:28e01ab32c9dbcbaae96cf0d5b472f22e231d9e603811857b295e61197e40a9b size: 527


[root@docker docker]# curl  -k https://reg.timinglee.org/v2/_catalog
{"repositories":["busybox"]}
```

### 4.3.4 为仓库建立登陆认证

```bash
#安装建立认证文件的工具包
[root@docker docker]# dnf install httpd-tools -y

#建立认证文件
[root@docker ~]# mkdir auth
[root@docker ~]# htpasswd -Bc auth/htpasswd timinglee	#-B 强制使用最安全加密方式，默认用md5加密
New password:
Re-type new password:
Adding password for user timinglee


#添加认证到registry容器中	
[root@docker ~]# docker run -d -p 443:443 --restart=always --name registry \
-v/opt/registry:/var/lib/registry \
-v /root/certs:/certs \
-e REGISTRY_HTTP_ADDR=0.0.0.0:443 \
-e REGISTRY_HTTP_TLS_CERTIFICATE=/certs/timinglee.org.crt \
-e REGISTRY_HTTP_TLS_KEY=/certs/timinglee.org.key \
-v /root/auth:/auth \
-e "REGISTRY_AUTH=htpasswd" \
-e "REGISTRY_AUTH_HTPASSWD_REALM=Registry Realm" \
-e REGISTRY_AUTH_HTPASSWD_PATH=/auth/htpasswd \
registry


[root@docker ~]# curl -k https://reg.timinglee.org/v2/_catalog -u timinglee:lee
{"repositories":["busybox","nginx"]}

#登陆测试
[root@docker ~]# docker login reg.timinglee.org
Username: timinglee
Password:
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credential-stores

Login Succeeded


```

当仓库开启认证后必须登陆仓库才能进行镜像上传

```bash
#未登陆情况下上传镜像
[root@docker ~]# docker push  reg.timinglee.org/busybox
Using default tag: latest
The push refers to repository [reg.timinglee.org/busybox]
d51af96cf93e: Preparing
no basic auth credentials

#未登陆情况下也不能下载
[root@docker-node2 ~]# docker pull reg.timinglee.org/busybox
Using default tag: latest
Error response from daemon: Head "https://reg.timinglee.org/v2/busybox/manifests/latest": no basic auth credentials
```

### 4.4 构建企业级私有仓库

 ![](https://gitee.com/timinglee/typora/raw/master/harbor.png)

**下载软件包地址**

**https://github.com/goharbor/harbor/releases**

Harbor 是由vmware公司开源的企业级 Docker Registry 项目。

它提供了以下主要功能和特点：

1. 基于角色的访问控制（RBAC）：可以为不同的用户和用户组分配不同的权限，增强了安全性和管理的灵活性。
2. 镜像复制：支持在不同的 Harbor 实例之间复制镜像，方便在多个数据中心或环境中分发镜像。
3. 图形化用户界面（UI）：提供了直观的 Web 界面，便于管理镜像仓库、项目、用户等。
4. 审计日志：记录了对镜像仓库的各种操作，有助于追踪和审查活动。
5. 垃圾回收：可以清理不再使用的镜像，节省存储空间。

### 4.4.1 部署harbor

```bash
#生成认证key和证书
[root@docker ~]#  openssl req -newkey  rsa:4096 \
-nodes -sha256 -keyout certs/timinglee.org.key \
-addext "subjectAltName = DNS:reg.timinglee.org" \		#指定备用名称
-x509 -days 365 -out certs/timinglee.org.crt

#查看证书信息
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:CN
State or Province Name (full name) []:guangdong
Locality Name (eg, city) [Default City]:guangzhou
Organization Name (eg, company) [Default Company Ltd]:timinglee
Organizational Unit Name (eg, section) []:docker
Common Name (eg, your name or your server's hostname) []:reg.timinglee.org
Email Address []:admin@timinglee.org

[root@docker-node1 docker]# openssl x509 -in certs/timinglee.org.crt -noout -text

[root@docker-node1 docker]# cd

[root@docker-node1 ~]# ls
anaconda-ks.cfg  game2048-latest.tar                   vim
docker           harbor-offline-installer-v2.14.4.tgz

[root@docker-node1 ~]# tar zxf harbor-offline-installer-v2.14.4.tgz -C /opt/

[root@docker-node1 ~]# cd /opt/

[root@docker-node1 opt]# ls
containerd  harbor

[root@docker-node1 opt]# cd harbor/

[root@docker-node1 harbor]# ls
common.sh              harbor.yml.tmpl  LICENSE
harbor.v2.14.4.tar.gz  install.sh       prepare

[root@docker-node1 harbor]# cp -p harbor.yml.tmpl harbor.yml 	#复制模版，运行时用到的数据，安装时读取这个文件

[root@docker-node1 ~]# mkdir /data
[root@docker-node1 ~]# cd /data/
[root@docker-node1 data]# ls
[root@docker-node1 data]# cd
[root@docker-node1 ~]# cp -rp /etc/docker/certs/ /data/
[root@docker-node1 ~]# ll /data/certs/timinglee.org.crt
-rw-r--r-- 1 root root 2212  6月 19 20:39 /data/certs/timinglee.org.crt
[root@docker-node1 ~]# ll /data/certs/timinglee.org.key
-rw------- 1 root root 3272  6月 19 20:37 /data/certs/timinglee.org.key


[root@docker-node1 harbor]# vim harbor.yml

```



容器运行时会和其他正在运行的容器冲突，需要关闭其他容器

```bash
[root@docker-node1 harbor]# docker rm -f registry
```


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
prepare base dir is set to /opt/harbor
Generated configuration file: /config/portal/nginx.conf
Generated configuration file: /config/log/logrotate.conf
Generated configuration file: /config/log/rsyslog_docker.conf
Generated configuration file: /config/nginx/nginx.conf
Generated configuration file: /config/core/env
Generated configuration file: /config/core/app.conf
Generated configuration file: /config/registry/config.yml
Generated configuration file: /config/registryctl/env
Generated configuration file: /config/registryctl/config.yml
Generated configuration file: /config/db/env
Generated configuration file: /config/jobservice/env
Generated configuration file: /config/jobservice/config.yml
copy /data/secret/tls/harbor_internal_ca.crt to shared trust ca dir as name harbor_internal_ca.crt ...
ca file /hostfs/data/secret/tls/harbor_internal_ca.crt is not exist
copy  to shared trust ca dir as name storage_ca_bundle.crt ...
copy None to shared trust ca dir as name redis_tls_ca.crt ...
Generated and saved secret to file: /data/secret/keys/secretkey
Successfully called func: create_root_cert
Generated configuration file: /compose_location/docker-compose.yml
Clean up the input dir


Note: stopping existing Harbor instance ...


[Step 5]: starting Harbor ...
[+] up 10/10
 ✔ Network harbor_harbor       Created                                     0.1s
 ✔ Container harbor-log        Started                                     1.1s
 ✔ Container harbor-portal     Started                                     2.0s
 ✔ Container redis             Started                                     2.0s
 ✔ Container registry          Started                                     2.7s
 ✔ Container harbor-db         Started                                     2.7s
 ✔ Container registryctl       Started                                     2.7s
 ✔ Container harbor-core       Started                                     3.1s
 ✔ Container harbor-jobservice Started                                     4.0s
 ✔ Container nginx             Started                                     4.3s
✔ ----Harbor has been installed and started successfully.----
```

显示和图片一样就说明安装完成了


可以看到容器开启的全部容器


```bash
开启：docker compose up -d
关闭：docker compose stop  #关闭后不删除容器
删除：docker compose down  #开启后依旧会重新建立
```



```bash
[root@docker ~]# tar zxf harbor-offline-installer-v2.5.4.tgz
[root@docker ~]# ls
anaconda-ks.cfg  certs   harbor-offline-installer-v2.5.4.tgz
auth             harbor
[root@docker ~]# cd harbor/


[root@docker harbor]# cp harbor.yml.tmpl harbor.yml
[root@docker harbor]# vim harbor.yml

  hostname: reg.timinglee.org
  certificate: /data/certs/timinglee.org.crt
  private_key: /data/certs/timinglee.org.key
  harbor_admin_password: lee

[root@docker harbor]# ./install.sh --help


Please set --with-notary 				#证书签名
Please set --with-trivy  				#安全扫描
Please set --with-chartmuseum if needs enable Chartmuseum in Harbor


[root@docker harbor]# ./install.sh --with-chartmuseum
```

```bash
#管理harbor的容器
[root@docker harbor]# docker compose stop
[root@docker harbor]# docker compose  up -d
```

### 4.4.2 管理仓库

访问对应ip进入


```bash
[root@docker-node1 harbor]# docker login reg.timinglee.org
Username: admin
Password:
Error response from daemon: Get "https://reg.timinglee.org/v2/": dial tcp: lookup reg.timinglee.org on 114.114.114.114:53: no such host

#这里显示DNS 服务器 114.114.114.114 无法解析 reg.timinglee.org，因为这个域名在公网 DNS 中不存在。所以需要自己配置域名解析。

[root@docker-node1 harbor]# vim /etc/hosts
[root@docker-node1 harbor]# cat /etc/hosts
127.0.0.1 localhost localhost.localdomain localhost4 localhost4.localdomain4
::1       localhost localhost.localdomain localhost6 localhost6.localdomain6
192.168.84.10  docker-node1
54.238.185.190 registry-1.docker.io
192.168.84.10 reg.timinglee.org
```


```bash
[root@docker-node1 harbor]# docker login reg.timinglee.org
Username: admin
Password:
Error response from daemon: Get "https://reg.timinglee.org/v2/": tls: failed to verify certificate: x509: certificate signed by unknown authority

#这里显示证书有问题，重新配置证书

[root@docker-node1 ~]# cd docker/
[root@docker-node1 docker]# mkdir certs.d/
[root@docker-node1 docker]# cd certs.d/
[root@docker-node1 certs.d]# mkdir reg.timinglee.org
[root@docker-node1 certs.d]# cd reg.timinglee.org/
 
 [root@docker-node1 harbor]# cp /data/certs/timinglee.org.crt /etc/docker/certs.d/reg.timinglee.org/ca.crt
[root@docker-node1 harbor]# ls -la /etc/docker/certs.d/reg.timinglee.org/
总用量 4
drwxr-xr-x 2 root root   20  6月 19 22:40 .
drwxr-xr-x 3 root root   31  6月 19 22:38 ..
-rw-r--r-- 1 root root 2212  6月 19 22:40 ca.crt

[root@docker-node1 harbor]# systemctl restart docker
[root@docker-node1 harbor]# docker compose up -d                               [+] up 9/9
 ✔ Container harbor-log        Running                                     0.0s
 ✔ Container registry          Started                                     1.1s
 ✔ Container harbor-portal     Started                                     1.0s
 ✔ Container redis             Started                                     1.2s
 ✔ Container registryctl       Started                                     1.0s
 ✔ Container harbor-db         Started                                     0.9s
 ✔ Container harbor-core       Started                                     0.5s
 ✔ Container nginx             Started                                     0.5s
 ✔ Container harbor-jobservice Started                                     0.5s
 
 [root@docker-node1 harbor]# docker login reg.timinglee.org                     Username: admin
Password:

WARNING! Your credentials are stored unencrypted in '/root/.docker/config.json'.
Configure a credential helper to remove this warning. See
https://docs.docker.com/go/credential-store/

Login Succeeded


#挂载镜像到Harbor仓库
[root@docker-node1 ~]# docker images | grep game2048
timinglee/game2048:latest               19299002fdbe       55.5MB             0B
[root@docker-node1 ~]# docker tag timinglee/game2048:latest reg.timinglee.org/library/game2048:latest
[root@docker-node1 ~]# docker images | grep game2048
reg.timinglee.org/library/game2048:latest   19299002fdbe       55.5MB             0B
timinglee/game2048:latest                   19299002fdbe       55.5MB             0B
[root@docker-node1 ~]# docker push reg.timinglee.org/library/game2048:latest
The push refers to repository [reg.timinglee.org/library/game2048]
88fca8ae768a: Pushed
6d7504772167: Pushed
192e9fad2abc: Pushed
36e9226e74f8: Pushed
011b303988d2: Pushed
latest: digest: sha256:8a34fb9cb168c420604b6e5d32ca6d412cb0d533a826b313b190535c03fe9390 size: 1364
```

可以看到镜像被成功挂载了


挂载到新建项目中同理

```bash
[root@docker-node1 ~]# docker tag timinglee/game2048:latest reg.timinglee.org/timinglee/game2048:latest
[root@docker-node1 ~]# docker push reg.timinglee.org/timinglee/game2048:latest
The push refers to repository [reg.timinglee.org/timinglee/game2048]
88fca8ae768a: Mounted from library/game2048
6d7504772167: Mounted from library/game2048
192e9fad2abc: Mounted from library/game2048
36e9226e74f8: Mounted from library/game2048
011b303988d2: Mounted from library/game2048
latest: digest: sha256:8a34fb9cb168c420604b6e5d32ca6d412cb0d533a826b313b190535c03fe9390 size: 1364
```


开另一台虚拟机模拟拉取镜像：

```bash
[root@docker-node2 ~]# vim /lib/systemd/system/docker.service
```



同理认证证书和key

```bash
[root@docker-node1 docker]# ls
certs  certs.d  daemon.json

#生成认证key和证书
[root@docker ~]#  openssl req -newkey  rsa:4096 \
-nodes -sha256 -keyout certs/timinglee.org.key \
-addext "subjectAltName = DNS:reg.timinglee.org" \		#指定备用名称
-x509 -days 365 -out certs/timinglee.org.crt

#查看证书信息
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [XX]:CN
State or Province Name (full name) []:guangdong
Locality Name (eg, city) [Default City]:guangzhou
Organization Name (eg, company) [Default Company Ltd]:timinglee
Organizational Unit Name (eg, section) []:docker
Common Name (eg, your name or your server's hostname) []:reg.timinglee.org
Email Address []:admin@timinglee.org
```

以自己挂载的仓库为加速器

```bash
[root@docker-node2 ~]# vim /etc/docker/daemon.json
```


```bash
[root@docker-node2 ~]#	docker info
```


```bash
#拉取镜像
[root@docker-node2 ~]# docker pull timinglee/busybox
Using default tag: latest
latest: Pulling from timinglee/busybox
d0f42ecf7e6c: Pull complete
Digest:sha256:28e01ab32c9dbcbaae96cf0d5b472f22e231d9e603811857b295e61197e40a9b
Status: Downloaded newer image for timinglee/busybox:latest
docker.io/timinglee/busybox:latest
#配置仓库为加速器可以不用再写网站地址
```

1.登陆

![](https://gitee.com/timinglee/typora/raw/master/登陆.png)

2.建立仓库项目

![](https://gitee.com/timinglee/typora/raw/master/建立项目1.png)

![](https://gitee.com/timinglee/typora/raw/master/建立项目2.png)

上传镜像

```
[root@docker harbor]# docker login reg.timinglee.org
Username: admin
Password:
WARNING! Your password will be stored unencrypted in /root/.docker/config.json.
Configure a credential helper to remove this warning. See
https://docs.docker.com/engine/reference/commandline/login/#credential-stores

Login Succeeded

[root@docker harbor]# docker tag busybox:latest  reg.timinglee.org/timinglee/busybox:latest
[root@docker harbor]# docker push reg.timinglee.org/timinglee/busybox:latest
The push refers to repository [reg.timinglee.org/timinglee/busybox]
d51af96cf93e: Pushed
latest: digest: sha256:28e01ab32c9dbcbaae96cf0d5b472f22e231d9e603811857b295e61197e40a9b size: 527
```

查看上传的镜像

![](https://gitee.com/timinglee/typora/raw/master/建立项目3.png)















