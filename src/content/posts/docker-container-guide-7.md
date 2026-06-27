---
title: Docker 容器学习（七）：Docker安全优化
published: 2026-02-16
description: Docker 安全加固、资源限制（CPU/内存）、Capabilities 权限控制、AppArmor/SELinux 安全策略。
image: ./images/new07.png
tags: [Docker, 安全, Linux, 资源限制]
category: 技术
draft: false
---
# 七 Docker 的安全优化

Docker容器的安全性，很大程度上依赖于Linux系统自身

评估Docker的安全性时，主要考虑以下几个方面：

- Linux内核的命名空间机制提供的容器隔离安全 
- Linux控制组机制对容器资源的控制能力安全。 
- Linux内核的能力机制所带来的操作权限安全 
- Docker程序（特别是服务端）本身的抗攻击性。 
- 其他安全增强机制对容器安全性的影响

```bash
#在rhel9中默认使用cgroup-v2 但是cgroup-v2中不利于观察docker的资源限制情况，所以推荐使用cgroup-v1
[root@docker ~]#  grubby --update-kernel=/boot/vmlinuz-$(uname -r) \
--args="systemd.unified_cgroup_hierarchy=0 systemd.legacy_systemd_cgroup_controller"
```

1 命名空间隔离的安全

- 当docker run启动一个容器时，Docker将在后台为容器创建一个独立的命名空间。命名空间提供了最基础也最直接的隔离。
- 与虚拟机方式相比，通过Linux namespace来实现的隔离不是那么彻底。
- 容器只是运行在宿主机上的一种特殊的进程，那么多个容器之间使用的就还是同一个宿主机的操作系统内核。
- 在 Linux 内核中，有很多资源和对象是不能被 Namespace 化的，比如：磁盘等等

```bash
[root@docker ~]# docker run -d --name web nginx
3c6b649a200fc56afafe9f47494903fe56e71cabcd534d6c9e6f8b5854f29cac

[root@docker ~]# docker inspect web  | grep Pid
            "Pid": 4328,
            "PidMode": "",
            "PidsLimit": null,



[root@docker ~]# cd /proc/4328/ns/			#进程的namespace
[root@docker ns]# ls
cgroup  ipc  mnt  net  pid  pid_for_children  time  time_for_children  user  uts


[root@docker ns]# ls -d /sys/fs/cgroup/memory/docker/3c6b649a200fs省略部分854f29cac/ 		#资源隔离信息
/sys/fs/cgroup/system.slice/docker-ecb8abbbfc85bf3d62fc82afb3950ab6b6a2e80092738274a233bbb8db0c5ce2.scope
/sys/fs/cgroup/system.slice/docker.service
/sys/fs/cgroup/system.slice/docker.socket

```



2 控制组资源控制的安全

- 当docker run启动一个容器时，Docker将在后台为容器创建一个独立的控制组策略集合。 
- Linux Cgroups提供了很多有用的特性，确保各容器可以公平地分享主机的内存、CPU、磁盘IO等资源。
- 确保当发生在容器内的资源压力不会影响到本地主机系统和其他容器，它在防止拒绝服务攻击（DDoS）方面必不可少

```
[root@docker ~]# docker run  -it --name test busybox			#内存资源默认没有被隔离
/ # free -m
              total        used        free      shared  buff/cache   available
Mem:           3627         648         516          16        2463        2678
Swap:          2063           1        2062
/ # exit
[root@docker ~]# free  -m
               total        used        free      shared  buff/cache   available
Mem:            3627         907         557          15        2463        2719
Swap:           2062           1        2061
```



3 内核能力机制

- 能力机制（Capability）是Linux内核一个强大的特性，可以提供细粒度的权限访问控制。
- 大部分情况下，容器并不需要“真正的”root权限，容器只需要少数的能力即可。
- 默认情况下，Docker采用“白名单”机制，禁用“必需功能”之外的其他权限。



4  Docker服务端防护

- 使用Docker容器的核心是Docker服务端，确保只有可信的用户才能访问到Docker服务。 
- 将容器的root用户映射到本地主机上的非root用户，减轻容器和主机之间因权限提升而引起的安全问题。 
- 允许Docker 服务端在非root权限下运行，利用安全可靠的子进程来代理执行需要特权权限的操作。这些子进程只允许在特定范围内进行操作。

```
[root@docker ~]# ls -ld /var/lib/docker/   #默认docker是用root用户控制资源的
drwx--x--- 12 root root 171  8月 20 13:21 /var/lib/docker/
```

## 7.1 Docker的资源限制

Linux Cgroups 的全称是 Linux Control Group。

- 是限制一个进程组能够使用的资源上限，包括 CPU、内存、磁盘、网络带宽等等。
- 对进程进行优先级设置、审计，以及将进程挂起和恢复等操作。

Linux Cgroups 给用户暴露出来的操作接口是文件系统

- 它以文件和目录的方式组织在操作系统的 /sys/fs/cgroup 路径下。
- 执行此命令查看：mount -t cgroup	

```
[root@docker ~]# mount -t cgroup					#在rhel9中默认使用cgroup2
cgroup on /sys/fs/cgroup/systemd type cgroup (rw,nosuid,nodev,noexec,relatime,xattr,release_agent=/usr/lib/systemd/systemd-cgroups-agent,name=systemd)
cgroup on /sys/fs/cgroup/cpuset type cgroup (rw,nosuid,nodev,noexec,relatime,cpuset)
cgroup on /sys/fs/cgroup/net_cls,net_prio type cgroup (rw,nosuid,nodev,noexec,relatime,net_cls,net_prio)
cgroup on /sys/fs/cgroup/misc type cgroup (rw,nosuid,nodev,noexec,relatime,misc)
cgroup on /sys/fs/cgroup/freezer type cgroup (rw,nosuid,nodev,noexec,relatime,freezer)
cgroup on /sys/fs/cgroup/perf_event type cgroup (rw,nosuid,nodev,noexec,relatime,perf_event)
cgroup on /sys/fs/cgroup/cpu,cpuacct type cgroup (rw,nosuid,nodev,noexec,relatime,cpu,cpuacct)
cgroup on /sys/fs/cgroup/blkio type cgroup (rw,nosuid,nodev,noexec,relatime,blkio)
cgroup on /sys/fs/cgroup/pids type cgroup (rw,nosuid,nodev,noexec,relatime,pids)
cgroup on /sys/fs/cgroup/rdma type cgroup (rw,nosuid,nodev,noexec,relatime,rdma)
cgroup on /sys/fs/cgroup/hugetlb type cgroup (rw,nosuid,nodev,noexec,relatime,hugetlb)
cgroup on /sys/fs/cgroup/devices type cgroup (rw,nosuid,nodev,noexec,relatime,devices)
cgroup on /sys/fs/cgroup/memory type cgroup (rw,nosuid,nodev,noexec,relatime,memory)

```

- 在 /sys/fs/cgroup 下面有很多诸如 cpuset、cpu、 memory 这样的子目录，也叫子系统。
- 在每个子系统下面，为每个容器创建一个控制组（即创建一个新目录）。
- 控制组下面的资源文件里填上什么值，就靠用户执行 docker run 时的参数指定。

### 7.1.1.限制cpu使用

1.限制cpu的使用量

```bash
[root@docker ~]# docker run  -it --rm --name test \
--cpu-period 100000 \					#设置 CPU 周期的长度，单位为微秒（通常为 100000，即 100 毫秒）
--cpu-quota 20000 ubuntu				#设置容器在一个周期内可以使用的 CPU 时间，单位也是微秒。
root@5797d76b20f5:/# dd if=/dev/zero of=/dev/null &
[1] 8
root@5797d76b20f5:/# top
top - 11:53:22 up 1 day,  1:58,  0 user,  load average: 0.00, 0.00, 0.00
Tasks:   3 total,   2 running,   1 sleeping,   0 stopped,   0 zombie
%Cpu(s):  4.4 us,  6.0 sy,  0.0 ni, 89.5 id,  0.0 wa,  0.2 hi,  0.0 si,  0.0 st
MiB Mem :   3627.1 total,    558.1 free,    899.4 used,   2471.0 buff/cache
MiB Swap:   2063.0 total,   2062.0 free,      1.0 used.   2727.7 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      8 root      20   0    2736   1536   1536 R  20.0   0.0   0:00.92 dd			#使用cpu的百分比
      1 root      20   0    4588   3968   3456 S   0.0   0.1   0:00.03 bash
      9 root      20   0    8856   5248   3200 R   0.0   0.1   0:00.00 top
 
#在cgroup中查看docker的资源限制
[root@docker ~]# cat /sys/fs/cgroup/cpu/docker/“docker id（所要查看容器的id）”/cpu.cfs_period_us       #cpu总量划分

[root@docker ~]# cat /sys/fs/cgroup/cpu/docker/“docker id（所要查看容器的id）”/cpu.cfs_quota_us       #cpu限制
```

2.限制cpu的优先级

```bash
#关闭cpu的核心，当cpu都不空闲下才会出现争抢的情况，为了实验效果我们可以关闭一个cpu核心
root@docker ~]# echo 0 > /sys/devices/system/cpu/cpu1/online
[root@docker ~]# cat /proc/cpuinfo
processor       : 0
vendor_id       : GenuineIntel
cpu family      : 6
model           : 58
model name      : Intel(R) Core(TM) i7-3770K CPU @ 3.50GHz
stepping        : 9
microcode       : 0x21
cpu MHz         : 3901.000
cache size      : 8192 KB
physical id     : 0
siblings        : 1
core id         : 0
cpu cores       : 1		##cpu核心数为1
apicid          : 0
initial apicid  : 0
fpu             : yes
fpu_exception   : yes
cpuid level     : 13
wp              : yes
flags           : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ss ht syscall nx rdtscp lm constant_tsc arch_perfmon nopl xtopology tsc_reliable nonstop_tsc cpuid tsc_known_freq pni pclmulqdq ssse3 cx16 pcid sse4_1 sse4_2 x2apic popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm pti ssbd ibrs ibpb stibp fsgsbase tsc_adjust smep arat md_clear flush_l1d arch_capabilities
bugs            : cpu_meltdown spectre_v1 spectre_v2 spec_store_bypass l1tf mds swapgs itlb_multihit srbds mmio_unknown
bogomips        : 7802.00
clflush size    : 64
cache_alignment : 64
address sizes   : 45 bits physical, 48 bits virtual
power management:

#开启容器时如果指定了cpu使用优先级，那么设定文件为
[root@docker ~]# cat /sys/fs/cgroup/cpu/docker/“docker id（所要查看容器的id）”/cpu.shares


#开启容器并限制资源
[root@docker ~]# docker run -it  --rm --cpu-shares 100 ubuntu		#设定cpu优先级，最大为1024，值越大优先级越高
root@dc066aa1a1f0:/# dd if=/dev/zero of=/dev/null &
[1] 8
root@dc066aa1a1f0:/# top
top - 12:16:56 up 1 day,  2:22,  0 user,  load average: 1.20, 0.37, 0.20
Tasks:   3 total,   2 running,   1 sleeping,   0 stopped,   0 zombie
%Cpu(s): 37.3 us, 61.4 sy,  0.0 ni,  0.0 id,  0.0 wa,  1.0 hi,  0.3 si,  0.0 st
MiB Mem :   3627.1 total,    502.5 free,    954.5 used,   2471.7 buff/cache
MiB Swap:   2063.0 total,   2062.3 free,      0.7 used.   2672.6 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      8 root      20   0    2736   1536   1536 R   3.6   0.0   0:16.74 dd			#cpu有限制被限制
      1 root      20   0    4588   3968   3456 S   0.0   0.1   0:00.03 bash
      9 root      20   0    8856   5248   3200 R   0.0   0.1   0:00.00 top


#开启另外一个容器不限制cpu的优先级
root@17f8c9d66fde:/# dd if=/dev/zero of=/dev/null &
[1] 8
root@17f8c9d66fde:/# top
top - 12:17:55 up 1 day,  2:23,  0 user,  load average: 1.84, 0.70, 0.32
Tasks:   3 total,   2 running,   1 sleeping,   0 stopped,   0 zombie
%Cpu(s): 36.2 us, 62.1 sy,  0.0 ni,  0.0 id,  0.0 wa,  1.3 hi,  0.3 si,  0.0 st
MiB Mem :   3627.1 total,    502.3 free,    954.6 used,   2471.7 buff/cache
MiB Swap:   2063.0 total,   2062.3 free,      0.7 used.   2672.5 avail Mem

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
      8 root      20   0    2736   1408   1408 R  94.0   0.0   1:09.34 dd			#cpu为被限制
      1 root      20   0    4588   3968   3456 S   0.0   0.1   0:00.02 bash
      9 root      20   0    8848   5248   3200 R   0.0   0.1   0:00.01 top
```

### 7.1.2 限制内存使用

```bash
#开启容器并限制容器使用内存大小
[root@docker system.slice]# docker run -d --name test --memory 200M --memory-swap 200M nginx

#查看容器内存使用限制
[root@docker ~]# cd /sys/fs/cgroup/memory/docker/d09100472de41824bf0省略部分id96b977369dad843740a1e8e599f430/

[root@docker d091004723d4de41824f6b38a7be9b77369dad843740a1e8e599f430]# cat memory.limit_in_bytes
209715200
[root@docker d091004723d4de41824f6b38a7be9977369dad843740a1e8e599f430]# cat memory.memsw.limit_in_bytes
209715200


#测试容器内存限制，在容器中我们测试内存限制效果不是很明显，可以利用工具模拟容器在内存中写入数据
#在系统中/dev/shm这个目录被挂在到内存中

[root@docker cgroup]# docker run  -d --name test --rm --memory 200M --memory-swap 200M  nginx                     f5017485d69b50cf2e294bf6c65fcd5e679002e25bd9b0eaf9149eee2e379eec
[root@docker cgroup]# cgexec -g memory:docker/f5017485d69b50cf2e294bf6c65fcd5e679002e25bd9b0eaf9149eee2e379eec  dd if=/dev/zero of=/dev/shm/bigfile  bs=1M count=150
记录了150+0 的读入
记录了150+0 的写出
157286400字节（157 MB，150 MiB）已复制，0.0543126 s，2.9 GB/s
[root@docker cgroup]# cgexec -g memory:docker/f5017485d69b50cf2e294bf6c65fcd5e679002e25bd9b0eaf9149eee2e379eec  dd if=/dev/zero of=/dev/shm/bigfile  bs=1M count=180
记录了180+0 的读入
记录了180+0 的写出
188743680字节（189 MB，180 MiB）已复制，0.0650658 s，2.9 GB/s
[root@docker cgroup]# cgexec -g memory:docker/f5017485d69b50cf2e294bf6c65fcd5e679002e25bd9b0eaf9149eee2e379eec  dd if=/dev/zero of=/dev/shm/bigfile  bs=1M count=120
记录了120+0 的读入
记录了120+0 的写出
125829120字节（126 MB，120 MiB）已复制，0.044017 s，2.9 GB/s
[root@docker cgroup]# cgexec -g memory:docker/f5017485d69b50cf2e294bf6c65fcd5e679002e25bd9b0eaf9149eee2e379eec  dd if=/dev/zero of=/dev/shm/bigfile  bs=1M count=200
已杀死

#也可以自建控制器
[root@docker ~]# mkdir -p /sys/fs/cgroup/memory/x1/
[root@docker ~]# ls /sys/fs/cgroup/memory/x1/
cgroup.clone_children           memory.kmem.tcp.max_usage_in_bytes  memory.oom_control
cgroup.event_control            memory.kmem.tcp.usage_in_bytes      memory.pressure_level
cgroup.procs                    memory.kmem.usage_in_bytes          memory.soft_limit_in_bytes
memory.failcnt                  memory.limit_in_bytes               memory.stat
memory.force_empty              memory.max_usage_in_bytes           memory.swappiness
memory.kmem.failcnt             memory.memsw.failcnt                memory.usage_in_bytes
memory.kmem.limit_in_bytes      memory.memsw.limit_in_bytes         memory.use_hierarchy
memory.kmem.max_usage_in_bytes  memory.memsw.max_usage_in_bytes     notify_on_release
memory.kmem.slabinfo            memory.memsw.usage_in_bytes         tasks
memory.kmem.tcp.failcnt         memory.move_charge_at_immigrate
memory.kmem.tcp.limit_in_bytes  memory.numa_stat

[root@docker ~]# echo 209715200 > /sys/fs/cgroup/memory/x1/memory.limit_in_bytes    #内存可用大小限制
[root@docker ~]# cat /sys/fs/cgroup/memory/x1/tasks			#此控制器被那个进程调用
[root@docker ~]# cgexec -g memory:x1 dd if=/dev/zero of=/dev/shm/bigfile bs=1M count=100
记录了100+0 的读入
记录了100+0 的写出
104857600字节（105 MB，100 MiB）已复制，0.0388935 s，2.7 GB/s
[root@docker ~]# free  -m
               total        used        free      shared  buff/cache   available
Mem:            3627        1038        1813         109        1131        2589
Swap:           2062           0        2062
[root@docker ~]# cgexec -g memory:x1 dd if=/dev/zero of=/dev/shm/bigfile bs=1M count=300
记录了300+0 的读入
记录了300+0 的写出
314572800字节（315 MB，300 MiB）已复制，0.241256 s，1.3 GB/s
[root@docker ~]# free  -m
               total        used        free      shared  buff/cache   available
Mem:            3627        1125        1725         181        1203        2501
Swap:           2062         129        1933			#内存溢出部分被写入swap交换分区

[root@docker ~]# rm -fr /dev/shm/bigfile
[root@docker ~]# echo 209715200 > /sys/fs/cgroup/memory/x1/memory.memsw.limit_in_bytes		#内存+swap控制
[root@docker ~]# cgexec -g memory:x1 dd if=/dev/zero of=/dev/shm/bigfile bs=1M count=200
已杀死
[root@docker ~]# cgexec -g memory:x1 dd if=/dev/zero of=/dev/shm/bigfile bs=1M count=199
已杀死
[root@docker ~]# rm -fr /dev/shm/bigfile
[root@docker ~]#
[root@docker ~]# rm -fr /dev/shm/bigfile
[root@docker ~]# cgexec -g memory:x1 dd if=/dev/zero of=/dev/shm/bigfile bs=1M count=180
记录了180+0 的读入
记录了180+0 的写出
188743680字节（189 MB，180 MiB）已复制，0.0660052 s，2.9 GB/s
[root@docker ~]# cgexec -g memory:x1 dd if=/dev/zero of=/dev/shm/bigfile bs=1M count=190
记录了190+0 的读入
记录了190+0 的写出
199229440字节（199 MB，190 MiB）已复制，0.0682285 s，2.9 GB/s
[root@docker ~]# cgexec -g memory:x1 dd if=/dev/zero of=/dev/shm/bigfile bs=1M count=200
已杀死

```

> [!NOTE]
>
> cgexec -g memory:doceker/容器id	-g表示使用指定控制器类型

### 7.1.3  限制docker的磁盘io

```bash
[root@docker ~]# docker run -it --rm  \
--device-write-bps \			#指定容器使用磁盘io的速率
/dev/nvme0n1:30M \				#/dev/nvme0n1是指定系统的磁盘，30M即每秒30M数据
ubuntu
root@a4e9567a666d:/# dd if=/dev/zero of=bigfile		#开启容器后会发现速度和设定不匹配，是因为系统的缓存机制
^C592896+0 records in
592895+0 records out
303562240 bytes (304 MB, 289 MiB) copied, 2.91061 s, 104 MB/s

root@a4e9567a666d:/# ^C
root@a4e9567a666d:/# dd if=/dev/zero of=bigfile bs=1M count=100
100+0 records in
100+0 records out
104857600 bytes (105 MB, 100 MiB) copied, 0.0515779 s, 2.0 GB/s
root@a4e9567a666d:/# dd if=/dev/zero of=bigfile bs=1M count=100 oflag=direct		#设定dd命令直接写入磁盘
100+0 records in
100+0 records out
104857600 bytes (105 MB, 100 MiB) copied, 3.33545 s, 31.4 MB/s
```



## 7.2 Docker的安全加固



### 7.2.1 Docker默认隔离性

在系统中运行容器，我们会发现资源并没有完全隔离开

```bash
[root@docker ~]# free -m			#系统内存使用情况
               total        used        free      shared  buff/cache   available
Mem:            3627        1128        1714         207        1238        2498
Swap:           2062           0        2062
[root@docker ~]# docker run --rm  --memory 200M -it ubuntu
root@e06bdc13b764:/# free -m		#容器中内存使用情况
               total        used        free      shared  buff/cache   available
Mem:            3627        1211        1630         207        1239        2415
Swap:           2062  

#虽然我们限制了容器的内容使用情况，但是查看到的信息依然是系统中内存的使用信息，并没有隔离开
```



### 7.2.2 解决Docker的默认隔离性

LXCFS 是一个为 LXC（Linux Containers）容器提供增强文件系统功能的工具。

**主要功能**

1. **资源可见性**：

   - LXCFS 可以使容器内的进程看到准确的 CPU、内存和磁盘 I/O 等资源使用信息。在没有 LXCFS 时，容器内看到的资源信息可能不准确，这会影响到在容器内运行的应用程序对资源的评估和管理。

2. **性能监控**：

   - 方便对容器内的资源使用情况进行监控和性能分析。通过提供准确的资源信息，管理员和开发人员可以更好地了解容器化应用的性能瓶颈，并进行相应的优化。

     

安装lxcfs

```bash
#在rhel9中lxcfs是被包含在epel源中，我们可以直接下载安装包进行安装
[root@docker ~]# ls lxcfs
lxcfs-5.0.4-1.el9.x86_64.rpm  lxc-libs-4.0.12-1.el9.x86_64.rpm  lxc-templates-4.0.12-1.el9.x86_64.rpm

[root@docker ~]# dnf install lxcfs/*.rpm
```

运行lxcfs并解决容器隔离性

```
[root@docker ~]# lxcfs /var/lib/lxcfs &
[root@docker ~]# docker run  -it -m 256m \
-v /var/lib/lxcfs/proc/cpuinfo:/proc/cpuinfo:rw \
-v /var/lib/lxcfs/proc/diskstats:/proc/diskstats:rw \
-v /var/lib/lxcfs/proc/meminfo:/proc/meminfo:rw \
-v /var/lib/lxcfs/proc/stat:/proc/stat:rw \
-v /var/lib/lxcfs/proc/swaps:/proc/swaps:rw \
-v /var/lib/lxcfs/proc/uptime:/proc/uptime:rw \
ubuntu
root@69ec0c67ff04:/# free  -m
               total        used        free      shared  buff/cache   available
Mem:             256           1         254           0           0         254
Swap:            512           0         512
```



### 7.2.3 容器特权

在容器中默认情况下即使我是容器的超级用户也无法修改某些系统设定，比如网络

```bash
[root@docker ~]# docker run --rm -it  busybox
/ # whoami
root
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
27: eth0@if28: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
/ # ip a a 192.168.0.100/24 dev eth0
ip: RTNETLINK answers: Operation not permitted
```

这是因为容器使用的很多资源都是和系统真实主机公用的，如果允许容器修改这些重要资源，系统的稳定性会变的非常差

但是由于某些需要求，容器需要控制一些默认控制不了的资源，如何解决此问题，这时我们就要设置容器特权

```bash
[root@docker ~]# docker run --rm -it --privileged busybox
/ # id root
uid=0(root) gid=0(root) groups=0(root),10(wheel)
/ # ip a a 192.168.0.100/24 dev eth0
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
29: eth0@if30: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet 192.168.0.100/24 scope global eth0
       valid_lft forever preferred_lft forever
/ # fdisk  -l
Disk /dev/nvme0n1: 100 GB, 107374182400 bytes, 209715200 sectors
13003 cylinders, 256 heads, 63 sectors/track
Units: sectors of 1 * 512 = 512 bytes

Device       Boot StartCHS    EndCHS        StartLBA     EndLBA    Sectors  Size Id Type
/dev/nvme0n1p1    0,0,2       1023,255,63          1  209715199  209715199 99.9G ee EFI GPT

#如果添加了--privileged 参数开启容器，容器获得权限近乎于宿主机的root用户
```

### 7.2.4 容器特权的白名单

--privileged=true 的权限非常大，接近于宿主机的权限，为了防止用户的滥用，需要增加限制，只提供给容器必须的权限。此时Docker 提供了权限白名单的机制，使用--cap-add添加必要的权限

capabilities手册地址：http://man7.org/linux/man-pages/man7/capabilities.7.html

```bash
#限制容器对网络有root权限
[root@docker ~]# docker run --rm -it --cap-add NET_ADMIN  busybox
/ # ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
31: eth0@if32: <BROADCAST,MULTICAST,UP,LOWER_UP,M-DOWN> mtu 1500 qdisc noqueue
    link/ether 02:42:ac:11:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.2/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
/ # ip a a 192.168.0.100/24 dev eth0					#网络可以设定
/ # fdisk  -l											#无法管理磁盘
/ #
```

