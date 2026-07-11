---
title: "用 kubeadm 部署 3 节点 K8s 集群：Flannel 网络 + Harbor 私仓内网部署"
published: 2026-07-12
description: "一口气带你用 kubeadm 部署 3 节点 K8s 集群，配置 Flannel 网络插件并对接 Harbor 私仓完成内网部署"
image: ./images/bg020.png
tags: [Kubernetes, kubeadm, Harbor, Flannel, Docker, 集群部署]
category: 技术
draft: false
---

## 一、构建 Harbor 镜像仓库

### 1.1 安装 Docker

在所有目标主机上配置 Docker CE 的 yum 源并安装 Docker：

```bash
[root@harbor ~]# cat > /etc/yum.repos.d/docker.repo <<EOF
[docker]
name = docker
baseurl = https://mirrors.aliyun.com/docker-ce/linux/rhel/9.6/x86_64/stable/
gpgcheck = 0
EOF

[root@harbor ~]# dnf install docker-ce-3:28.5.2-1.el9 -y
```

激活内核网络选项并配置 iptables：

```bash
# 激活内核网络选项
[root@harbor ~]# echo br_netfilter > /etc/modules-load.d/docker_mod.conf
[root@harbor ~]# modprobe -a br_netfilter

[root@harbor ~]# vim /etc/sysctl.d/docker.conf
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1

[root@harbor ~]# sysctl --system
```

修改 Docker 服务文件，添加 iptables 支持：

```bash
[root@harbor ~]# vim /lib/systemd/system/docker.service
# 修改 ExecStart 行：
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock --iptables=true

[root@harbor ~]# systemctl daemon-reload
[root@harbor ~]# systemctl enable --now docker
```

### 1.2 生成 SSL 证书密钥

为 Harbor 仓库生成自签名 SSL 证书，确保证书包含正确的 SAN：

```bash
[root@harbor ~]# mkdir /data/certs -p
[root@harbor ~]# openssl req -newkey rsa:4096 \
  -nodes -sha256 -keyout /data/certs/timinglee.org.key \
  -addext "subjectAltName = DNS:reg.timinglee.org" \
  -x509 -days 365 -out /data/certs/timinglee.org.crt
```

交互式输入证书信息：

```
Country Name (2 letter code) [XX]:CN
State or Province Name (full name) []:guangdong
Locality Name (eg, city) [Default City]:guangzhou
Organization Name (eg, company) [Default Company Ltd]:kubernetes
Organizational Unit Name (eg, section) []:harbor
Common Name (eg, your name or your server's hostname) []:reg.timinglee.org
Email Address []:admin@timinglee.org
```

### 1.3 编辑 Harbor 配置文件

解压 Harbor 离线安装包并配置 harbor.yml：

```bash
[root@harbor ~]# tar zxf harbor-offline-installer-v2.14.4.tgz -C /opt/
[root@harbor ~]# cd /opt/harbor/
[root@harbor harbor]# cp harbor.yml.tmpl harbor.yml
```

修改 harbor.yml 关键配置：

```yaml
hostname: reg.timinglee.org
certificate: /data/certs/timinglee.org.crt
private_key: /data/certs/timinglee.org.key
harbor_admin_password: 111
```

安装 Harbor：

```bash
[root@harbor harbor]# ./install.sh --with-trivy
```

### 1.4 启动并验证 Harbor

配置 Docker 信任证书并启动 Harbor 服务：

```bash
[root@harbor harbor]# mkdir /etc/docker/certs.d/reg.timinglee.org/ -p
[root@harbor harbor]# cp /data/certs/timinglee.org.crt \
  /etc/docker/certs.d/reg.timinglee.org/ca.crt

[root@harbor harbor]# vim /etc/hosts
# 添加一行：
192.168.84.200 harbor reg.timinglee.org

[root@harbor harbor]# systemctl restart docker
[root@harbor harbor]# docker compose up -d
```

验证 Harbor 登录：

```bash
[root@harbor harbor]# docker login reg.timinglee.org -u admin
Password:
Login Succeeded
```

---

## 二、构建部署 Kubernetes 所需主机

### 2.1 所有主机配置注意事项

所有主机需完成以下配置：

1. 关闭 swap
2. 安装 Docker
3. 配置可使用 Harbor 仓库
4. 配置 Kubernetes 安装源

**禁用 swap（所有主机执行）：**

```bash
# 所有主机都要执行，禁用 swap
[root@master ~]# systemctl disable --now swap.target
[root@master ~]# systemctl mask swap.target

# 注释掉 /etc/fstab 中的 swap 行
[root@master ~]# sed '/swap/s/^/#/g' -i /etc/fstab
```

**安装 Docker 并配置内核参数（所有主机执行）：**

```bash
[root@master ~]# cat > /etc/yum.repos.d/docker.repo <<EOF
[docker]
name = docker
baseurl = https://mirrors.aliyun.com/docker-ce/linux/rhel/9.6/x86_64/stable/
gpgcheck = 0
EOF

[root@master ~]# dnf install docker-ce-3:28.5.2-1.el9 -y
[root@master ~]# echo br_netfilter > /etc/modules-load.d/docker_mod.conf
[root@master ~]# modprobe -a br_netfilter
```

> 提示：可使用多执行模式（如 pssh）给三台主机批量执行命令。

配置内核网络参数：

```bash
[root@master ~]# vim /etc/sysctl.d/docker.conf
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward = 1

[root@master ~]# sysctl --system
```

修改 Docker 服务文件：

```bash
[root@master ~]# vim /lib/systemd/system/docker.service
# 修改 ExecStart 行：
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock --iptables=true

[root@master ~]# mkdir -p /etc/docker/certs.d/reg.timinglee.org
```

**分发 SSL 证书到所有节点：**

```bash
# 在 harbor 主机中分发证书到所有主机
[root@harbor ~]# for i in 100 10 20; do
  scp /data/certs/timinglee.org.crt \
    root@192.168.84.$i:/etc/docker/certs.d/reg.timinglee.org/ca.crt
done

[root@master ~]# ls /etc/docker/certs.d/reg.timinglee.org/
ca.crt

[root@master ~]# systemctl enable --now docker
[root@master ~]# systemctl restart docker
```

**所有主机配置 Docker 加速器（指向私有 Harbor 仓库）：**

```bash
[root@master ~]# cat >/etc/docker/daemon.json <<EOF
{
  "registry-mirrors":["https://reg.timinglee.org"]
}
EOF

[root@master ~]# systemctl restart docker
[root@master ~]# docker info
```

**所有主机彼此建立解析：**

```bash
[root@master ~]# vim /etc/hosts
# 添加主机名解析
```

**在 Harbor 主机上打 tag 并推送测试镜像：**

```bash
[root@harbor ~]# docker load -i game2048-latest.tar
[root@harbor ~]# docker tag timinglee/game2048:latest \
  reg.timinglee.org/library/game2048:latest
[root@harbor ~]# docker push reg.timinglee.org/library/game2048:latest

The push refers to repository [reg.timinglee.org/library/game2048]
latest: digest: sha256:8a34fb9cb... size: 1364
```

使用另一台主机测试拉取镜像：

```bash
[root@node1 ~]# docker pull game2048:latest
latest: Pulling from library/game2048
Digest: sha256:8a34fb9cb...
Status: Downloaded newer image for game2048:latest
```

验证成功，所有节点均可快速拉取镜像。

**配置 Kubernetes 安装源（阿里云镜像）：**

```bash
# 所有主机都配置 k8s 源
[root@master ~]# vim /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name = kubernetes
baseurl = https://mirrors.aliyun.com/kubernetes-new/core/stable/v1.35/rpm/
gpgcheck = 0

[root@master ~]# dnf list kubelet   # 检测可安装版本
```

以上完成后重启所有主机，并验证 swap 服务是否关闭：

```bash
[root@master ~]# reboot

# 验证所有主机的 swap 服务是否关闭（无输出即为成功）
[root@master ~]# swapon -s
[root@master ~]#
```

---

## 三、Kubernetes 的部署

### 3.1 安装 cri-dockerd（所有主机）

cri-dockerd 是 Docker 与 Kubernetes CRI 接口的适配器。

下载地址：

- libcgroup: https://repo.almalinux.org/almalinux/8/BaseOS/x86_64/os/Packages/libcgroup-0.41-19.el8.x86_64.rpm
- cri-dockerd: https://github.com/Mirantis/cri-dockerd/releases

```bash
# 在 node1 上安装
[root@node1 ~]# rpm -ivh *.rpm

# 把文件传给其他主机
[root@node1 ~]# scp cri-dockerd-0.3.14-3.el8.x86_64.rpm \
  libcgroup-0.41-19.el8.x86_64.rpm root@192.168.84.20:/root
[root@node1 ~]# scp cri-dockerd-0.3.14-3.el8.x86_64.rpm \
  libcgroup-0.41-19.el8.x86_64.rpm root@192.168.84.100:/root

# 同样在其他主机执行安装
[root@master ~]# rpm -ivh *.rpm
[root@node2 ~]# rpm -ivh *.rpm
```

修改 cri-docker 服务文件，指定网络插件和 pause 镜像：

```bash
[root@master ~]# vim /lib/systemd/system/cri-docker.service
```

关键参数说明：

```
--network-plugin=cni
--pod-infra-container-image=reg.timinglee.org/k8s/pause:3.10.1
```

启动 cri-docker 并验证 socket 文件：

```bash
[root@master ~]# systemctl enable --now cri-docker
[root@master ~]# ll /var/run/cri-dockerd.sock
srw-rw---- 1 root docker 0  6月 21 13:51 /var/run/cri-dockerd.sock
```

### 3.2 安装 Kubernetes 集群所需软件

**Master 节点安装全部组件：**

```bash
[root@master ~]# dnf install kubelet kubeadm kubectl -y
[root@master ~]# systemctl enable --now kubelet.service
```

**Node 节点安装（无需 kubectl）：**

```bash
[root@node1 ~]# dnf install kubelet kubeadm -y
[root@node1 ~]# systemctl enable --now kubelet.service
```

给 Master 主机添加命令补齐：

```bash
[root@master ~]# echo "source <(kubectl completion bash)" >> ~/.bashrc
[root@master ~]# echo "source <(kubeadm completion bash)" >> ~/.bashrc
[root@master ~]# source ~/.bashrc

[root@master ~]# kubeadm
certs    config    init     kubeconfig  token    version
completion  help     join     reset    upgrade
```

### 3.3 下载 Kubernetes 集群所需镜像

从阿里云镜像仓库拉取 K8s 组件镜像：

```bash
[root@master ~]# kubeadm config images pull \
  --image-repository registry.aliyuncs.com/google_containers \
  --kubernetes-version v1.35.3 \
  --cri-socket=unix:///var/run/cri-dockerd.sock

[config/images] Pulled registry.aliyuncs.com/google_containers/kube-apiserver:v1.35.3
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-controller-manager:v1.35.3
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-scheduler:v1.35.3
[config/images] Pulled registry.aliyuncs.com/google_containers/kube-proxy:v1.35.3
[config/images] Pulled registry.aliyuncs.com/google_containers/coredns:v1.13.1
[config/images] Pulled registry.aliyuncs.com/google_containers/pause:3.10.1
[config/images] Pulled registry.aliyuncs.com/google_containers/etcd:3.6.6-0
```

登录私有仓库并上传镜像：

```bash
[root@master ~]# docker login reg.timinglee.org -u admin -p 111

# 查看拉取的镜像
[root@master ~]# docker images --format "{{.Repository}}:{{.Tag}}"
registry.aliyuncs.com/google_containers/kube-apiserver:v1.35.3
registry.aliyuncs.com/google_containers/kube-proxy:v1.35.3
registry.aliyuncs.com/google_containers/kube-controller-manager:v1.35.3
registry.aliyuncs.com/google_containers/kube-scheduler:v1.35.3
registry.aliyuncs.com/google_containers/etcd:3.6.6-0
registry.aliyuncs.com/google_containers/coredns:v1.13.1
registry.aliyuncs.com/google_containers/pause:3.10.1

# 把所有包打标签并推送到私有仓库
[root@master ~]# docker images --format "{{.Repository}}:{{.Tag}}" \
  | awk -F "/" ' /google/{system("docker tag "$0" reg.timinglee.org/k8s/"$3)}'

[root@master ~]# docker images --format "{{.Repository}}:{{.Tag}}" \
  | grep "timinglee" | awk -F "/" '{system("docker push "$0)}'
```

#### K8s 核心组件说明

| 组件 | 作用 |
|---|---|
| **k8s/pause** | Pod 的"根容器"（infrastructure container），为 Pod 内所有容器提供共享的网络和 PID 命名空间。本身不做任何业务逻辑，每个 Pod 都会自动创建 |
| **k8s/coredns** | 集群内部 DNS 服务，负责服务发现与域名解析。将 Service 名称解析为 ClusterIP |
| **k8s/etcd** | 分布式键值存储，K8s 集群的唯一数据源。存储所有集群状态、配置和对象数据 |
| **k8s/kube-proxy** | 节点上的网络代理，维护节点的网络规则。实现 Service 的负载均衡和端口转发 |
| **k8s/kube-scheduler** | 调度器，负责将新建的 Pod 分配到合适的 Node 上 |
| **k8s/kube-controller-manager** | 控制器管理器，运行各种控制器以维护集群状态 |
| **k8s/kube-apiserver** | K8s API 网关，集群的唯一入口。处理所有 REST API 请求 |

### 3.4 在 Master 中初始化 Kubernetes 集群

执行 kubeadm init 初始化集群：

```bash
[root@master ~]# kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --image-repository reg.timinglee.org/k8s \
  --kubernetes-version v1.35.3 \
  --cri-socket=unix:///var/run/cri-dockerd.sock
```

> 如果初始化出问题，可使用以下命令重置：`kubeadm reset --cri-socket=unix:///var/run/cri-dockerd.sock`

保存加入集群的凭证（用于将工作节点加入集群）：

```bash
kubeadm join 192.168.84.100:6443 --token 9df1yn.wvu1206bg711jjr0 \
  --discovery-token-ca-cert-hash \
  sha256:a172c619ab8eb698a2cb72dfebd0258882e88be169a688ee97d786d6ce525471

# 如果找不到 token 可以用命令重新生成
kubeadm token create --print-join-command
```

添加 Kubernetes 环境变量到本机：

```bash
[root@master ~]# echo "export KUBECONFIG=/etc/kubernetes/admin.conf" \
  >> ~/.bash_profile
[root@master ~]# source ~/.bash_profile

[root@master ~]# kubectl get nodes
NAME    STATUS     ROLES           AGE   VERSION
master  NotReady   control-plane   10m   v1.35.6
```

添加 Node 节点到集群：

```bash
[root@node1 ~]# kubeadm join 192.168.84.100:6443 \
  --token 9df1yn.wvu1206bg711jjr0 \
  --discovery-token-ca-cert-hash \
  sha256:a172c619ab8eb698a2cb72dfebd0258882e88be169a688ee97d786d6ce525471 \
  --cri-socket=unix:///var/run/cri-dockerd.sock

[root@node2 ~]# kubeadm join 192.168.84.100:6443 \
  --token 9df1yn.wvu1206bg711jjr0 \
  --discovery-token-ca-cert-hash \
  sha256:a172c619ab8eb698a2cb72dfebd0258882e88be169a688ee97d786d6ce525471 \
  --cri-socket=unix:///var/run/cri-dockerd.sock
```

查看集群节点状态（此时因网络插件未安装，状态为 NotReady）：

```bash
[root@master ~]# kubectl get nodes
NAME    STATUS     ROLES           AGE   VERSION
master  NotReady   control-plane   17m   v1.35.6
node1   NotReady   <none>          2m    v1.35.6
node2   NotReady   <none>          1m    v1.35.6
```

### 3.5 安装 Flannel 网络插件

Flannel 项目地址：https://github.com/flannel-io/flannel

下载并导入 Flannel 镜像到私有仓库：

```bash
# 查看当前目录文件
[root@master ~]# ls
anaconda-ks.cfg   flannel-0.28.1.tar   libcgroup-0.41-19.el8.x86_64.rpm
cri-dockerd-0.3.14-3.el8.x86_64.rpm  kube-flannel.yml

# 导入本地 tar 包
[root@master ~]# docker load -i flannel-0.28.1.tar

# 给 flannel-cni-plugin 镜像打标签并推送
[root@master ~]# docker tag ghcr.io/flannel-io/flannel-cni-plugin:v1.9.0-flannel1 \
  reg.timinglee.org/flannel-io/flannel-cni-plugin:v1.9.0-flannel1
[root@master ~]# docker push reg.timinglee.org/flannel-io/flannel-cni-plugin:v1.9.0-flannel1

# 给 flannel:v0.28.1 镜像打标签并推送
[root@master ~]# docker tag ghcr.io/flannel-io/flannel:v0.28.1 \
  reg.timinglee.org/flannel-io/flannel:v0.28.1
[root@master ~]# docker push reg.timinglee.org/flannel-io/flannel:v0.28.1
```

修改 kube-flannel.yml 中所有 image 地址为私有仓库地址：

```bash
[root@master ~]# vim kube-flannel.yml
[root@master ~]# grep "image:" kube-flannel.yml
    image: flannel-io/flannel:v0.28.1
    image: flannel-io/flannel-cni-plugin:v1.9.0-flannel1
    image: flannel-io/flannel:v0.28.1
```

应用 Flannel 网络插件：

```bash
[root@master ~]# kubectl apply -f kube-flannel.yml
namespace/kube-flannel created
serviceaccount/flannel created
clusterrole.rbac.authorization.k8s.io/flannel created
clusterrolebinding.rbac.authorization.k8s.io/flannel created
configmap/kube-flannel-cfg created
daemonset.apps/kube-flannel-ds created
```

验证节点状态：

```bash
[root@master ~]# kubectl get nodes
NAME    STATUS   ROLES           AGE   VERSION
master  Ready    control-plane   83m   v1.35.6
node1   Ready    <none>          68m   v1.35.6
node2   Ready    <none>          67m   v1.35.6
```

> 注意：节点状态变为 Ready 需要一定时间（通常 1-3 分钟）。若长时间 NotReady，请检查 Pod 网络或镜像拉取情况。

---

## 总结

至此，我们完成了：

| 步骤 | 内容 |
|---|---|
| **Harbor 私有仓库** | 安装 Docker、生成 SSL 证书、部署 Harbor v2.14.4 |
| **节点环境准备** | 关闭 swap、安装 Docker、配置内核参数、分发证书 |
| **K8s 集群部署** | 安装 kubeadm/kubelet/kubectl、拉取镜像、初始化集群 |
| **节点加入** | node1/node2 通过 kubeadm join 加入集群 |
| **Flannel 网络** | 导入镜像、推送到私仓、应用 kube-flannel.yml |

部署完成后，集群已具备运行工作负载的基础条件，所有节点均通过私有 Harbor 仓库拉取镜像，实现纯内网部署。
