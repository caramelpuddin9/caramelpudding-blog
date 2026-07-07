---
title: "Kubernetes 节点加入实战：一次完整的故障排查与解决之旅"
published: 2026-07-07
description: "从零到一，记录将工作节点加入 K8s 集群过程中遇到的四个典型问题及其解决方案"
image: ./images/bg018.png
tags: [Kubernetes, 节点管理, kubeadm, containerd, Linux, 排障]
category: 技术
draft: false
---

## 前言

在 Kubernetes 集群的日常运维中，添加新的工作节点是一项基础但容易出错的操作。本文记录了我在将 node3 节点加入集群时遇到的四个典型问题，包括多个 CRI 端点冲突、Swap 未关闭、配置文件残留、容器运行时未启动等。希望通过这次实战经验分享，帮助读者避免踩坑。

## 一、环境概览

| 项目 | 信息 |
|---|---|
| 集群 Master | 192.168.84.100:6443 |
| 工作节点 | node3 (192.168.84.30) |
| Kubernetes 版本 | v1.35.6 |
| 操作系统 | Rocky Linux 9 (内核 5.14.0) |
| 容器运行时 | containerd (最终采用) |

一开始，我以为只需要一条简单的 `kubeadm join` 命令就能完成，但现实给了我一个"惊喜套餐"——整整四个问题等着我逐一攻破。

## 二、问题一：多个 CRI 端点冲突

### 错误现象

执行 kubeadm join 命令后，首先遇到的错误是：

```
error: found multiple CRI endpoints on the host. 
Please define which one do you wish to use by setting the 'criSocket' field
```

### 根因分析

节点上同时安装了多个容器运行时：

- `unix:///var/run/containerd/containerd.sock` (containerd)
- `unix:///var/run/cri-dockerd.sock` (cri-dockerd)

kubeadm 发现了多个 CRI 端点，无法自动选择，必须由用户明确指定。

### 解决方案

在 kubeadm join 命令中添加 `--cri-socket` 参数：

```bash
kubeadm join 192.168.84.100:6443 \
  --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH> \
  --cri-socket unix:///var/run/containerd/containerd.sock
```

> 📌 **经验启示**：当节点上存在多个容器运行时，必须显式指定 CRI 端点。建议统一使用 containerd，它是 Kubernetes 官方推荐的运行时，性能更好、更稳定。

## 三、问题二：kubelet 因 Swap 未关闭而反复崩溃

### 错误现象

加入命令卡在 `[kubelet-check]` 阶段，等待 4 分钟后超时：

```
[kubelet-check] Waiting for a healthy kubelet at http://127.0.0.1:10248/healthz. 
This can take up to 4m0s
[kubelet-check] The kubelet is not healthy after 4m0.00096433s
```

查看 kubelet 日志，发现根本原因：

```
E0707 19:46:43.349802 5328 run.go:72] "command failed" 
err="failed to run Kubelet: running with swap on is not supported, 
please disable swap or set --fail-swap-on flag to false"
```

`systemctl status kubelet` 显示 kubelet 在不断重启：

```
Active: activating (auto-restart) (Result: exit-code)
Main PID: 2916 (code=exited, status=1/FAILURE)
```

### 根因分析

Kubernetes 默认要求禁用 Swap 分区。虽然我之前执行过 `swapoff -a`，但系统重启后 swap 会重新启用，因为 `/etc/fstab` 中仍有 swap 挂载项。

### 解决方案

**第一步：立即关闭 swap**

```bash
swapoff -a
```

**第二步：永久禁用 swap**

```bash
sed -i '/swap/d' /etc/fstab
```

**第三步：验证**

```bash
free -h
# Swap: 3.9Gi 0B 3.9Gi  ✅ 显示已关闭
```

> 📌 **经验启示**：禁用 swap 要"斩草除根"——不仅要执行 `swapoff -a`，还要从 `/etc/fstab` 中彻底删除 swap 挂载项，否则重启后问题会复现。

## 四、问题三：配置文件残留导致预检查失败

### 错误现象

在多次尝试加入后，kubeadm join 的预检查阶段报错：

```
[ERROR FileAvailable--etc-kubernetes-kubelet.conf]: 
    /etc/kubernetes/kubelet.conf already exists
[ERROR FileAvailable--etc-kubernetes-bootstrap-kubelet.conf]: 
    /etc/kubernetes/bootstrap-kubelet.conf already exists
[ERROR FileAvailable--etc-kubernetes-pki-ca.crt]: 
    /etc/kubernetes/pki/ca.crt already exists
```

### 根因分析

之前的加入尝试在 `/etc/kubernetes/` 目录下残留了配置文件。kubeadm 的预检查机制会检测这些文件，如果存在则拒绝继续执行，以防止新旧配置相互干扰。

### 解决方案

```bash
# 1. 重置 kubeadm 配置
kubeadm reset -f --cri-socket unix:///var/run/containerd/containerd.sock

# 2. 手动删除残留目录
rm -rf /etc/kubernetes/
rm -rf /var/lib/kubelet/
rm -rf /var/lib/etcd/
rm -rf /etc/cni/
rm -rf /var/lib/cni/

# 3. 确认清理完成
ls /etc/kubernetes/
# 应显示 "No such file or directory"
```

> 📌 **经验启示**：每次加入失败后，务必执行 `kubeadm reset` 并手动清理残留目录。否则配置文件冲突会导致新的加入尝试无法通过预检查。

## 五、问题四：containerd socket 不存在

### 错误现象

切换到 containerd 后，加入命令报错：

```
[ERROR CRI]: could not connect to the container runtime: 
validate CRI v1 runtime API for endpoint 
"unix:///var/run/containerd/containerd.sock": 
rpc error: code = Unimplemented desc = unknown service runtime.v1.RuntimeService
```

检查发现 socket 文件根本不存在：

```bash
ls -la /var/run/containerd/containerd.sock
# ls: 无法访问 '/var/run/containerd/containerd.sock': 没有那个文件或目录
```

### 根因分析

containerd 服务没有运行，因此无法创建 socket 文件。

### 解决方案

```bash
# 1. 启动 containerd
systemctl start containerd
systemctl enable containerd

# 2. 验证 socket 存在
ls -la /var/run/containerd/containerd.sock
# srw-rw---- 1 root root 0 7月 7 19:52 /var/run/containerd/containerd.sock
```

> 📌 **经验启示**：容器运行时必须处于运行状态。加入集群前，务必确认 containerd 已启动且 socket 文件存在。

## 六、最终成功加入

解决了上述四个问题后，执行加入命令：

```bash
kubeadm join 192.168.84.100:6443 \
  --token f8s17y.1aoqat6m2nelmmqe \
  --discovery-token-ca-cert-hash sha256:a172c619ab8eb698a2cb72dfebd0258882e88be169a688ee97d786d6ce525471 \
  --cri-socket unix:///var/run/containerd/containerd.sock
```

成功输出：

```
[preflight] Running pre-flight checks
[kubelet-start] Starting the kubelet
[kubelet-check] The kubelet is healthy after 503.493551ms
[kubelet-start] Waiting for the kubelet to perform the TLS Bootstrap

This node has joined the cluster:
* Certificate signing request was sent to apiserver and a response was received.
* The Kubelet was informed of the new secure connection details.
```

在 Master 节点验证：

```bash
kubectl get nodes
```

```
NAME     STATUS   ROLES           AGE    VERSION
master   Ready    control-plane    XXd    v1.35.6
node3    Ready    <none>          XXs    v1.35.6  ✅
```

## 七、完整故障排查流程图

![Kubernetes 节点加入故障排查流程图](/assets/images/k8s-node-join-flow.png)

## 八、最佳实践清单

在执行 `kubeadm join` 之前，建议按以下清单逐项检查：

| 序号 | 检查项 | 命令 | 预期结果 |
|---|---|---|---|
| 1 | Swap 已永久关闭 | `free -h` | Swap 显示 0 |
| 2 | containerd 运行中 | `systemctl status containerd` | Active: running |
| 3 | containerd socket 存在 | `ls -la /var/run/containerd/containerd.sock` | 文件存在 |
| 4 | 无残留配置 | `ls /etc/kubernetes/` | 目录不存在或为空 |
| 5 | Token 未过期 | 在 Master 确认 | Token 24 小时内有效 |

### 一键检查脚本

```bash
#!/bin/bash
# 节点加入前检查脚本

echo "🔍 开始加入前检查..."

# 1. 检查 Swap
echo -n "检查 Swap... "
if free -h | grep -q "Swap:.*0B"; then
    echo "✅ 已关闭"
else
    echo "❌ Swap 未关闭，执行关闭..."
    swapoff -a
    sed -i '/swap/d' /etc/fstab
fi

# 2. 检查 containerd
echo -n "检查 containerd... "
if systemctl is-active containerd > /dev/null 2>&1; then
    echo "✅ 运行中"
else
    echo "❌ 未运行，启动中..."
    systemctl start containerd
    systemctl enable containerd
fi

# 3. 检查 socket
echo -n "检查 containerd socket... "
if [ -S /var/run/containerd/containerd.sock ]; then
    echo "✅ 存在"
else
    echo "❌ 不存在，请检查 containerd 配置"
fi

# 4. 清理残留
echo -n "清理残留配置... "
kubeadm reset -f --cri-socket unix:///var/run/containerd/containerd.sock 2>/dev/null
rm -rf /etc/kubernetes/ /var/lib/kubelet/ 2>/dev/null
echo "✅ 完成"

echo "✅ 检查完成！可以执行 kubeadm join"
```

## 九、常用故障排查命令速查表

| 目的 | 命令 |
|---|---|
| 查看 kubelet 实时日志 | `journalctl -xeu kubelet -f` |
| 查看 kubelet 最近 50 行日志 | `journalctl -xeu kubelet -n 50 --no-pager` |
| 查看 kubelet 服务状态 | `systemctl status kubelet` |
| 查看 containerd 日志 | `journalctl -xeu containerd -n 50` |
| 检查 CRI socket | `ls -la /var/run/containerd/containerd.sock` |
| 检查 Swap 状态 | `free -h` |
| 重置节点 | `kubeadm reset -f --cri-socket unix:///var/run/containerd/containerd.sock` |
| 生成新的加入命令（Master 执行） | `kubeadm token create --print-join-command` |

## 十、总结

这次节点加入过程虽然曲折，但遇到的四个问题都是 Kubernetes 集群运维中的典型场景：

| 问题类型 | 关键字 | 解决方案 |
|---|---|---|
| 多 CRI 端点 | `found multiple CRI endpoints` | 使用 `--cri-socket` 指定 |
| Swap 未关闭 | `running with swap on is not supported` | `swapoff -a` + 修改 `/etc/fstab` |
| 配置文件残留 | `FileAvailable` 错误 | `kubeadm reset` + 手动删除 |
| 运行时未启动 | `no such file or directory` (socket) | `systemctl start containerd` |
