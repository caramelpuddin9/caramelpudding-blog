---
title: "一口气带你认识 Kubernetes 五大控制器"
published: 2026-07-11
description: "一口气带你认识管理 ReplicaSet、Deployment、DaemonSet、Job、CronJob 五大控制器，配置滚动更新策略及版本回滚"
image: ./images/bg019.png
tags: [Kubernetes, ReplicaSet, Deployment, DaemonSet, Job, CronJob]
category: 技术
draft: false
---

## 一、ReplicaSet 控制器

![ReplicaSet 概览](/assets/images/controller-94330da1-af06-4df4-b5ad-37fd0b0b0957.png)

### 1.1 ReplicaSet 功能

- ReplicaSet 是下一代的 Replication Controller，官方推荐使用 ReplicaSet
- ReplicaSet 和 Replication Controller 的唯一区别是选择器的支持，ReplicaSet 支持新的基于集合的选择器需求
- ReplicaSet 确保任何时间都有指定数量的 Pod 副本在运行
- 虽然 ReplicaSet 可以独立使用，但今天它主要被 Deployments 用作协调 Pod 创建、删除和更新的机制

### 1.2 ReplicaSet 参数说明

![ReplicaSet 参数](/assets/images/controller-510eedce-c989-4dda-a5fd-4c2bc9b6d6de.png)

### 1.3 ReplicaSet 示例

```bash
[root@master ~]# kubectl api-resources | less
replicasets                         rs           apps/v1                           true         ReplicaSet
```

![ReplicaSet 示例](/assets/images/controller-0d5a2261-6cf7-4670-a4fa-c037e1b3c37a.png)

创建 Deployment 并导出为 YAML：

```bash
[root@master ~]# kubectl create deployment webcluster --image game2048:latest --dry-run=client -o yaml > repset.yml
```

修改为 ReplicaSet 配置：

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  labels:
    app: webcluster
  name: webcluster
spec:
  replicas: 2
  selector:
    matchLabels:
      app: webcluster
  template:
    metadata:
      labels:
        app: webcluster
    spec:
      containers:
      - image: game2048:latest
        name: game2048
```

应用配置：

```bash
[root@master ~]# kubectl apply -f repset.yml
replicaset.apps/webcluster configured
```

验证 Pod 状态：

```bash
[root@master ~]# watch -n 1 kubectl get pods --show-labels
Every 1.0s: kubectl get pods --show-labels                     master: Tue Jun 23 02:01:51 2026

NAME               READY   STATUS    RESTARTS      AGE   LABELS
webcluster-wq6mv   1/1     Running   1 (20m ago)   10h   app=webcluster
webcluster-x9knb   1/1     Running   1 (20m ago)   10h   app=webcluster
```

可以看到有两个 Pod 在运行。

**标签实验**：当我们移除一个 Pod 的标签时，ReplicaSet 会立即创建新的 Pod 来维持副本数：

```bash
# 移除 Pod 标签
[root@master ~]# kubectl label pods webcluster-wq6mv app-
pod/webcluster-wq6mv unlabeled

# 观察变化，可以看到新 Pod 被创建
[root@master ~]# watch -n 1 kubectl get pods --show-labels
Every 1.0s: kubectl get pods --show-labels                     master: Tue Jun 23 02:04:11 2026

NAME               READY   STATUS    RESTARTS      AGE   LABELS
webcluster-k6vgn   1/1     Running   0             69s   app=webcluster
webcluster-wq6mv   1/1     Running   1 (22m ago)   10h   <none>
webcluster-x9knb   1/1     Running   1 (22m ago)   10h   app=webcluster
```

将标签恢复后，Pod 数量又变回两个：

```bash
[root@master ~]# kubectl label pods webcluster-wq6mv app=webcluster
pod/webcluster-wq6mv labeled
```

**扩容实验**：修改 `replicas: 4` 后重新 apply，Pod 自动扩展为四个：

```bash
[root@master ~]# kubectl apply -f repset.yml
replicaset.apps/webcluster configured

[root@master ~]# watch -n 1 kubectl get pods --show-labels
NAME               READY   STATUS    RESTARTS      AGE   LABELS
webcluster-klnl5   1/1     Running   0             19s   app=webcluster
webcluster-msk8m   1/1     Running   0             19s   app=webcluster
webcluster-wq6mv   1/1     Running   1 (30m ago)   11h   app=webcluster
webcluster-x9knb   1/1     Running   1 (30m ago)   11h   app=webcluster
```

> 说明 ReplicaSet 控制器不需要手动开启或关闭 Pod，只需要修改配置中的参数就能自动完成控制。

---

## 二、Deployment 控制器

### 2.1 Deployment 控制器的功能

![Deployment 概览](/assets/images/controller-c4c36483-56ee-44d1-8195-fd3dad3f2ed9.png)

为了更好的解决服务编排的问题，Kubernetes 在 V1.2 版本开始引入了 Deployment 控制器。

- Deployment 控制器并不直接管理 Pod，而是通过管理 ReplicaSet 来间接管理 Pod
- **Deployment → ReplicaSet → Pod** 三层管理架构
- Deployment 为 Pod 和 ReplicaSet 提供了一个声明式的定义方法
- 在 Deployment 中，每个 ReplicaSet 相当于一个版本

**典型应用场景：**

- 用来创建 Pod 和 ReplicaSet
- 滚动更新和回滚
- 扩容和缩容
- 暂停与恢复

### 2.2 创建 Deployment

```bash
[root@master ~]# kubectl create deployment webcluster --image game2048:latest --dry-run=client -o yaml > dep.yml
```

Deployment 配置示例：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: webcluster
  name: webcluster
spec:
  minReadySeconds: 5      # Pod 最小就绪时间 5 秒
  replicas: 2
  selector:
    matchLabels:
      app: webcluster
  template:
    metadata:
      labels:
        app: webcluster
    spec:
      containers:
      - image: game2048:latest
        name: game2048
        resources: {}
```

应用并验证：

```bash
[root@master ~]# kubectl apply -f dep.yml
deployment.apps/webcluster created

[root@master ~]# watch -n 1 "kubectl get pods --show-labels;echo ====;kubectl get replicasets.apps"
Every 1.0s:  kubectl get pods --show-labels;echo ====;kube...  master: Tue Jun 23 02:32:10 2026

NAME               READY   STATUS    RESTARTS   AGE   LABELS
webcluster-6c9xf   1/1     Running   0          11s   app=webcluster
webcluster-bhwcw   1/1     Running   0          11s   app=webcluster
====
NAME         DESIRED   CURRENT   READY   AGE
webcluster   2         2         2       11s
```

监控显示建立了 ReplicaSet 控制器，并且 ReplicaSet 控制器控制了两个 Pod。

### 2.3 发布服务

```bash
[root@master ~]# kubectl expose deployment webcluster --port 80 --target-port 80
service/webcluster exposed

[root@master ~]# kubectl describe services webcluster
Name:                     webcluster
Namespace:                default
Labels:                   app=webcluster
Selector:                 app=webcluster
Type:                     ClusterIP
IP:                       10.108.247.162
Port:                     <unset>  80/TCP
TargetPort:               80/TCP
Endpoints:                10.244.2.5:80,10.244.1.6:80

# 访问服务
[root@master ~]# curl 10.108.247.162
Hello MyApp | Version: v1 | <a href="hostname.html">Pod Name</a>
```

### 2.4 升级和回滚

**升级版本：**

```yaml
# 修改 dep.yml 中的镜像版本
spec:
  template:
    spec:
      containers:
      - image: myapp:v2    # 升级为 v2 版本
        name: myapp
```

```bash
[root@master ~]# kubectl apply -f dep.yml
deployment.apps/webcluster configured

[root@master ~]# curl 10.108.247.162
Hello MyApp | Version: v2 | <a href="hostname.html">Pod Name</a>
```

![版本升级](/assets/images/controller-59d0333d-0183-42f7-8592-37a799bf9357.png)

**版本回滚：**

```bash
# 将镜像版本改回 v1 后重新 apply
[root@master ~]# kubectl apply -f dep.yml

[root@master ~]# curl 10.107.142.60
Hello MyApp | Version: v1 | <a href="hostname.html">Pod Name</a>
```

![版本回滚](/assets/images/controller-3c5bad52-8999-47fb-8f7a-f4c3024113fd.png)

### 2.5 版本更新管理及优化

**查看更新策略：**

```bash
[root@master controler]# kubectl describe deployments.apps webcluster
RollingUpdateStrategy:  25% max unavailable 25% max surge
```

**自定义滚动更新策略：**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: webcluster
  name: webcluster
spec:
  minReadySeconds: 5
  replicas: 6
  selector:
    matchLabels:
      app: webcluster
  strategy:                  # 指定更新策略
    rollingUpdate:
      maxSurge: 1            # 更新时 Pod 数量最多比期望值多一个
      maxUnavailable: 0      # 不可用的 Pod 数量最多为 0
  template:
    metadata:
      labels:
        app: webcluster
    spec:
      containers:
      - image: game2048:v2
        name: game2048
```

应用后查看策略：

```bash
[root@master ~]# kubectl apply -f dep.yml
[root@master ~]# kubectl describe deployments.apps webcluster
RollingUpdateStrategy:  0 max unavailable, 1 max surge
```

这样配置可以实现最平滑的更新——一个更新一个关闭。

**更新暂停和恢复：**

```bash
# 暂停更新
[root@master ~]# kubectl rollout pause deployment webcluster
deployment.apps/webcluster paused

# 查看更新历史
[root@master ~]# kubectl rollout history deployment webcluster
deployment.apps/webcluster
REVISION  CHANGE-CAUSE
8         <none>
9         <none>

# 恢复更新
[root@master ~]# kubectl rollout resume deployment webcluster
deployment.apps/webcluster resumed

# 再次查看历史，版本号已推进
[root@master ~]# kubectl rollout history deployment webcluster
deployment.apps/webcluster
REVISION  CHANGE-CAUSE
9         <none>
10        <none>
```

---

## 三、DaemonSet 控制器

![DaemonSet 概览](/assets/images/controller-bf0ddbaf-ead8-472a-9ae3-b49bce567aac.png)

DaemonSet 确保全部（或者某些）节点上运行一个 Pod 的副本。当有节点加入集群时，也会为他们新增一个 Pod；当有节点从集群移除时，这些 Pod 也会被回收。删除 DaemonSet 将会删除它创建的所有 Pod。

**DaemonSet 的典型应用：**

- **存储**：在每个节点上运行集群存储 DaemonSet，例如 glusterd、ceph
- **日志收集**：在每个节点上运行日志收集 DaemonSet，例如 fluentd、logstash
- **监控**：在每个节点上运行监控 DaemonSet，例如 Prometheus Node Exporter、zabbix agent

### 3.1 环境准备：将 node3 加入集群

```bash
# 在 master 上分发配置
[root@master ~]# scp /etc/yum.repos.d/*.repo root@192.168.84.30:/etc/yum.repos.d/
[root@master ~]# scp /etc/modules-load.d/docker_mod.conf root@192.168.84.30:/etc/modules-load.d/docker_mod.conf
[root@master ~]# scp /etc/sysctl.d/docker.conf root@192.168.84.30:/etc/sysctl.d/docker.conf

# 在 node3 上安装依赖
[root@node3 ~]# dnf install docker-ce kubectl kubelet kubeadm -y
[root@node3 ~]# systemctl enable --now docker.service
[root@node3 ~]# systemctl enable --now cri-docker.service
[root@node3 ~]# systemctl enable --now kubelet.service

# 在 master 生成加入命令
[root@master ~]# kubeadm token create --print-join-command
kubeadm join 192.168.84.100:6443 --token <TOKEN> --discovery-token-ca-cert-hash sha256:<HASH>

# 在 node3 执行加入
[root@node3 ~]# kubeadm join 192.168.84.100:6443 --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH> \
  --cri-socket unix:///var/run/cri-dockerd.sock

# 验证节点
[root@master ~]# kubectl get nodes
NAME     STATUS   ROLES           AGE    VERSION
master   Ready    control-plane   16d    v1.35.6
node1    Ready    <none>          16d    v1.35.6
node2    Ready    <none>          16d    v1.35.6
node3    Ready    <none>          163m   v1.35.6
```

### 3.2 创建 DaemonSet

```bash
[root@master ~]# kubectl create deployment daemonset --image game2048:v1 --dry-run=client -o yaml > daemonset.yml
```

DaemonSet 配置：

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  labels:
    app: daemonset
  name: daemonset
spec:
  selector:
    matchLabels:
      app: daemonset
  template:
    metadata:
      labels:
        app: daemonset
    spec:
      containers:
      - image: game2048:v1
        name: game2048
```

应用并观察：

```bash
[root@master ~]# kubectl apply -f daemonset.yml
[root@master ~]# watch -n 1 kubectl get pods -o wide

NAME               READY   STATUS    RESTARTS   AGE   IP            NODE
daemonset-4s665    1/1     Running   0          12s   10.244.3.5    node3
daemonset-8zcxc    1/1     Running   0          12s   10.244.2.10   node2
daemonset-bg5r7    1/1     Running   0          12s   10.244.1.10   node1
```

可以看到每个 Node 节点都有一个 DaemonSet 运行，而 Master 节点没有（因为它带有污点）：

```bash
[root@master ~]# kubectl describe nodes master
...
Taints:             node-role.kubernetes.io/control-plane:NoSchedule
```

> 通过设置污点容忍，可以让 Master 节点也运行 DaemonSet Pod。

---

## 四、Job 控制器

Job 控制器用于执行一次性任务，确保指定数量的 Pod 成功运行完成。

### Job 示例：计算圆周率

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: pi
spec:
  completions: 6         # 一共完成任务数为 6
  parallelism: 2         # 每次并行完成 2 个
  template:
    spec:
      containers:
      - name: pi
        image: perl:5.34.0
        command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"]
        # 计算 π 的后 2000 位
      restartPolicy: Never
      backoffLimit: 4     # 运行失败后尝试 4 次重新运行
```

```bash
# 应用 Job
[root@master ~]# kubectl apply -f job.yml
job.batch/job created

# 监控 Job 执行
[root@master ~]# watch -n 1 kubectl get pods -o wide
```

![Job 执行](/assets/images/controller-1d980e65-4b9a-49bc-b765-c60d876cdad9.png)

查看计算结果：

```bash
[root@master ~]# kubectl logs job-4b45g
3.141592653589793238462643383279502884197169399375105820974944592307816406286208998634825342117067......
```

> Job 类似于在 K8s 中运行的脚本任务，完成后即停止。如果想再次运行，只能删除重建。

**重启策略说明：**

| 策略 | 行为 |
|---|---|
| `OnFailure` | Job 会在 Pod 出现故障时重启容器，而不是创建 Pod，failed 次数不变 |
| `Never` | Job 会在 Pod 出现故障时创建新的 Pod，故障 Pod 不会消失也不会重启，failed 次数加 1 |

---

## 五、CronJob 控制器

### 5.1 CronJob 控制器功能

![CronJob 概览](/assets/images/controller-2fffdde8-a1b8-45a1-8d00-a00616f78d62.png)

CronJob 创建基于时间调度的 Jobs，以 Job 控制器资源为其管控对象，并借助它管理 Pod 资源对象。CronJob 可以像 Linux 操作系统的周期性任务作业计划一样，控制其运行时间点及重复运行的方式。

### 5.2 CronJob 示例

```bash
[root@master ~]# kubectl create cronjob cronjob --image busybox --schedule "* * * * *" --dry-run=client -o yaml > cronjob.yml
```

CronJob 配置：

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cronjob
spec:
  jobTemplate:
    metadata:
      name: cronjob
    spec:
      template:
        spec:
          containers:
          - image: busybox
            name: cronjob
            command:
              - /bin/sh
              - -c
              - echo "hello timinglee"
          restartPolicy: onFailure
  schedule: "* * * * *"
```

应用并观察：

```bash
# 整分运行
[root@master ~]# kubectl apply -f cronjob.yml
cronjob.batch/cronjob created

[root@master ~]# kubectl get cronjobs.batch
NAME     SCHEDULE    TIMEZONE    SUSPEND    ACTIVE    LAST SCHEDULE    AGE
cronjob  * * * * *   <none>      False      0         17s              70s

# 查看每分钟执行的 Pod
[root@master ~]# watch -n 1 kubectl get pods -o wide

NAME                    READY   STATUS      RESTARTS   AGE   IP            NODE
cronjob-29598241-pxggh  0/1     Completed   0          21s   10.244.1.43   node1

# 查看执行日志
[root@master ~]# kubectl logs cronjob-29598241-pxggh
hello timinglee
```

> CronJob 适合周期性的自动化任务，如数据采集、日志采集或定时存储整合。

---

## 总结

| 控制器 | 功能 | 典型场景 |
|---|---|---|
| **ReplicaSet** | 确保指定数量的 Pod 副本运行 | 维持 Pod 数量，作为 Deployment 的底层支撑 |
| **Deployment** | 声明式更新应用，管理 ReplicaSet | 应用发布、滚动更新、版本回滚 |
| **DaemonSet** | 每个节点运行一个 Pod | 日志收集、监控、存储代理 |
| **Job** | 执行一次性任务 | 批处理、数据计算 |
| **CronJob** | 按时间调度 Job | 定时任务、周期性采集 |
