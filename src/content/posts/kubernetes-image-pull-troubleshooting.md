---
title: "Kubernetes 镜像拉取故障排障实战：从 InvalidImageName 到 Running"
published: 2026-07-06
description: "一次完整的 Kubernetes 部署排障记录，涵盖镜像格式错误、Harbor 私有仓库配置、Docker insecure-registries 设置等常见问题"
image: /assets/images/k8s-image-pull-flow.png
tags: [Kubernetes, Docker, Harbor, Linux, 排障]
category: 技术
draft: false
---

## 一、故障现象

Kubernetes 集群中名为 webcluster 的 Deployment 所有 Pod 均处于非健康状态：

```bash
$ kubectl get pods -l app=webcluster
NAME                          READY   STATUS             RESTARTS   AGE
webcluster-57cf75cbc6-b2wzg   0/1     InvalidImageName   0          2m42s
webcluster-57cf75cbc6-bpb7z   0/1     InvalidImageName   0          13d
webcluster-6c9xf              0/1     ImagePullBackOff   0          13d
webcluster-bhwcw              0/1     ImagePullBackOff   0          13d
```

问题表现：

- READY 0/1：容器未能启动
- InvalidImageName：镜像名称格式错误
- ImagePullBackOff：镜像拉取失败，正在退避重试

## 二、排障过程

### 第一阶段：定位 InvalidImageName

使用 kubectl describe pod 查看详细错误：

```bash
$ kubectl describe pod webcluster-57cf75cbc6-b2wzg
```

关键 Events 信息：

```
Events:
  Warning  Failed   kubelet  spec.containers{game2048}: Error: InvalidImageName
  Warning  Failed   kubelet  Failed to apply default image tag "game2048:latest:v2": 
                             couldn't parse image name "game2048:latest:v2": invalid reference format
```

**根因分析**：镜像名 `game2048:latest:v2` 包含两个标签（tag），Docker 镜像格式要求 `[仓库/]镜像名:标签`，标签只能有一个。`latest:v2` 被解析为两个标签，导致格式错误。

**解决方案**：修正镜像名为合法格式。

```bash
# 从 game2048:latest:v2 改为 game2048:v2
$ kubectl set image deployment/webcluster game2048=game2048:v2
```

更新后，InvalidImageName 问题解决，但新 Pod 出现 ErrImagePull：

```
webcluster-7d95df794c-5tgt4   0/1     ErrImagePull       0          13s
```

### 第二阶段：镜像不存在于 Docker Hub

新的 Pod 尝试从 Docker Hub 拉取 game2048:v2，但该镜像并不存在于公共仓库。

排查方向：需要确认镜像来源。经沟通，团队内部搭建了 Harbor 私有仓库，地址为 192.168.84.200，镜像应从此处拉取。

### 第三阶段：确认 Harbor 服务状态

首先检查 Harbor 服务是否正常运行：

```bash
$ cd /opt/harbor && docker compose ps
```

发现只有 harbor-log 在运行，核心服务全部停止。

启动 Harbor：

```bash
$ docker-compose up -d
$ docker compose ps
NAME                IMAGE                    STATUS
harbor-core         goharbor/harbor-core     Up 2 minutes (healthy)
harbor-db           goharbor/harbor-db       Up 2 minutes (healthy)
harbor-portal       goharbor/harbor-portal   Up 2 minutes (healthy)
nginx               goharbor/nginx-photon    Up 2 minutes (healthy)
registry            goharbor/registry-photon Up 2 minutes (healthy)
...
```

所有服务恢复健康状态 ✅

### 第四阶段：验证 Harbor 镜像是否存在

通过 Harbor API 查询镜像：

```bash
# 注意：Harbor 要求 HTTPS 访问
$ curl -k -u admin:Harbor12345 https://192.168.84.200/api/v2.0/projects/library/repositories
[{"artifact_count":1,"name":"library/game2048",...}]
```

确认 game2048 镜像存在，标签为 latest：

```bash
$ curl -k -u admin:Harbor12345 https://192.168.84.200/api/v2.0/projects/library/repositories/game2048/artifacts
...
"tags": [{"name": "latest"}]
```

确认信息：
- 镜像地址：`192.168.84.200/library/game2048:latest`
- 认证信息：admin / Harbor12345

### 第五阶段：配置 Kubernetes 拉取私有镜像

**5.1 创建 Secret**

```bash
$ kubectl create secret docker-registry harbor-secret \
  --docker-server=192.168.84.200 \
  --docker-username=admin \
  --docker-password=Harbor12345 \
  --docker-email=admin@example.com
```

**5.2 将 Secret 关联到 Deployment**

```bash
$ kubectl patch deployment webcluster -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"harbor-secret"}]}}}}'
```

**5.3 更新镜像地址**

```bash
$ kubectl set image deployment/webcluster game2048=192.168.84.200/library/game2048:latest
```

此时 Deployment 镜像已正确配置：

```bash
$ kubectl describe deployment webcluster | grep Image
    Image:         192.168.84.200/library/game2048:latest
```

但新 Pod 仍然报 ErrImagePull ❌

### 第六阶段：配置 Docker insecure-registries

查看 Pod 详细错误：

```bash
$ kubectl describe pod webcluster-7d95df794c-5tgt4 | grep -A 10 Events
Events:
  Warning  Failed   Failed to pull image "game2048:v2": 
                     Get "https://registry-1.docker.io/v2/": dial tcp ... network is unreachable
```

问题在于：

1. Pod 仍在尝试拉取 game2048:v2（旧镜像名），说明之前的更新没有彻底生效
2. 节点没有配置 insecure-registries，无法通过 HTTP 访问 Harbor

检查节点 Docker 配置：

```bash
$ cat /etc/docker/daemon.json
{
  "dns": ["8.8.8.8", "1.1.1.1"],
  "registry-mirrors": ["https://reg.timinglee.org/"],
  "insecure-registries": ["127.0.0.0/8", "::1/128"],  # 缺少 192.168.84.200
  "live-restore": false
}
```

修复：在所有节点添加 Harbor 地址到 insecure-registries：

```json
{
  "dns": ["8.8.8.8", "1.1.1.1", "114.114.114.114"],
  "registry-mirrors": ["https://reg.timinglee.org/"],
  "insecure-registries": ["127.0.0.0/8", "::1/128", "192.168.84.200"],
  "live-restore": false
}
```

重启 Docker 并测试拉取：

```bash
$ systemctl restart docker
$ docker login 192.168.84.200 -u admin -p Harbor12345
$ docker pull 192.168.84.200/library/game2048:latest
Downloaded newer image for 192.168.84.200/library/game2048:latest ✅
```

### 第七阶段：清理旧 Pod，触发重建

```bash
# 删除有问题的 ReplicaSet
$ kubectl delete replicaset webcluster-57cf75cbc6 webcluster-7d95df794c

# 删除拉取失败的 Pod
$ kubectl delete pod -l app=webcluster --field-selector=status.phase=Pending
```

## 三、最终结果

```bash
$ kubectl get pods -l app=webcluster
NAME                          READY   STATUS    RESTARTS   AGE
webcluster-576844d96d-4h5c6   1/1     Running   0          2m
webcluster-576844d96d-58pqf   1/1     Running   0          2m
webcluster-576844d96d-plsjg   1/1     Running   0          2m
webcluster-6c9xf              1/1     Running   1          13d
webcluster-bhwcw              1/1     Running   1          13d

$ kubectl get deployment webcluster
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
webcluster   5/5     3            5           13d
```

问题全部解决 ✅

## 四、经验总结与最佳实践

### 4.1 镜像命名规范

| ❌ 错误写法 | ✅ 正确写法 | 说明 |
|---|---|---|
| `game2048:latest:v2` | `game2048:v2` | 只能有一个标签 |
| `game2048` | `192.168.84.200/library/game2048:latest` | 私有仓库需完整路径 |
| 无标签 | `game2048:latest` 或 `game2048:v1.0` | 建议使用语义化版本 |

### 4.2 私有仓库访问要点

- Secret 必须正确创建并关联到 Deployment
- 所有工作节点必须配置 insecure-registries（如果使用 HTTP）
- 镜像地址必须包含完整仓库路径

### 4.3 Harbor 故障排查 Checklist

1. 检查服务状态：`docker compose ps`
2. 检查服务日志：`docker compose logs --tail=50`
3. 测试 API 连通性：`curl -k https://harbor-url/api/v2.0/health`
4. 确认镜像存在：`curl -u user:pass https://harbor-url/api/v2.0/projects/{project}/repositories`
5. 确认标签版本：`curl ... /artifacts \| grep "name"`

### 4.4 常用排障命令速查

```bash
# 查看 Pod 详细错误
kubectl describe pod <pod-name>

# 查看 Deployment 镜像
kubectl describe deployment <name> | grep Image

# 查看 Secret 是否正确关联
kubectl get deployment <name> -o yaml | grep -A 3 imagePullSecrets

# 查看 Pod 使用的镜像
kubectl get pods -o jsonpath='{.items[*].spec.containers[0].image}'

# 手动测试镜像拉取
docker pull <full-image-path>
```

## 附：Pod 并不运行在 master 上

### 1. Pod 调度到了 worker 节点

从之前的输出可以看到：

```bash
$ kubectl describe pod webcluster-7d95df794c-5tgt4
...
Node:             node1/192.168.84.20    # 👈 Pod 被调度到了 node1
```

而您在 master 上手动 docker pull 成功了，但 Pod 却拉取失败，因为：

| 操作 | 执行位置 | 影响范围 |
|---|---|---|
| `docker pull` 在 master 执行 | master 节点 | 只把镜像下载到了 master 的本地存储 |
| Pod 拉取镜像 | node1 或 node2 | 需要在 Pod 所在节点的本地存储中有镜像 |

简单来说：您在 master 上拉取镜像，只是让 master 有了镜像，但 Pod 运行在 node1/node2 上，它们还没有这个镜像。

### 2. Kubernetes 镜像拉取的工作流程

![Kubernetes 镜像拉取流程图](/assets/images/k8s-image-pull-flow.png)

### 3. 为什么需要配置所有 worker 节点？

**原因一：每个节点独立拉取镜像**

当 Pod 被调度到某个节点时，该节点的 kubelet 会独立执行 docker pull。每个节点都有自己的 Docker 守护进程和本地镜像缓存。

```
Node1 的 Docker  ←→ Harbor ←→ Node2 的 Docker
     ↑                         ↑
     需要配置                   也需要配置
     insecure-registries       insecure-registries
```

**原因二：Harbor 使用 HTTP（非 HTTPS）**

您的 Harbor 使用 HTTP 协议（端口 80），而 Docker 默认要求 HTTPS。配置 insecure-registries 的作用是：

```json
{
  "insecure-registries": ["192.168.84.200"]  // 告诉 Docker：这个地址可以用 HTTP
}
```

这个配置是节点级别的，每个节点的 Docker 都需要知道：

- Node1 的 `/etc/docker/daemon.json` → `"insecure-registries": ["192.168.84.200"]` ← 必须配置
- Node2 的 `/etc/docker/daemon.json` → `"insecure-registries": ["192.168.84.200"]` ← 必须配置

如果某个节点没有配置，当 Pod 被调度到该节点时，Docker 会尝试用 HTTPS 连接 Harbor，但 Harbor 只支持 HTTP，导致拉取失败。

### 4. 验证：Pod 调度与节点关系

查看 Pod 分别调度到了哪些节点：

```bash
$ kubectl get pods -l app=webcluster -o wide
NAME                          READY   STATUS    NODE
webcluster-576844d96d-4h5c6   1/1     Running   node1
webcluster-576844d96d-58pqf   1/1     Running   node2
webcluster-576844d96d-plsjg   1/1     Running   node1
webcluster-6c9xf              1/1     Running   node1
webcluster-bhwcw              1/1     Running   node2
```

可以看到，Pod 分布在 node1 和 node2 上。每个 Pod 拉取镜像时，都使用它所在节点的 Docker。

**统一配置所有 worker 节点**

```bash
# 使用脚本批量配置
for node in node1 node2 node3; do
  ssh $node "echo '{\"insecure-registries\":[\"192.168.84.200\"]}' > /etc/docker/daemon.json && systemctl restart docker"
done
```
