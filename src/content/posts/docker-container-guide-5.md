---
title: Docker 容器学习（五）：Docker网络
published: 2026-02-14
description: Docker 原生网络（bridge/host/none）、自定义桥接网络与 DNS 解析、joined 容器网络、跨主机网络（macvlan）。
image: ./images/new05.png
tags: [Docker, 网络, bridge, macvlan]
category: 技术
draft: false
---
# 五 Docker 网络

docker的镜像是令人称道的地方，但网络功能还是相对薄弱的部分

docker安装后会自动创建3种网络：bridge、host、none

```
[root@docker harbor]# docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
2a93d6859680   bridge    bridge    local
4d81ddd9ed10   host      host      local
8c8c95f16b68   none      null      local
```

## 5.1  docker原生bridge网路

docker安装时会创建一个名为 docker0 的Linux bridge，新建的容器会自动桥接到这个接口

```
[root@docker mnt]# ip link show type bridge
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN mode DEFAULT group default
    link/ether 02:42:5f:e2:34:6c brd ff:ff:ff:ff:ff:ff
```

- bridge模式下容器没有一个公有ip，只有宿主机可以直接访问，外部主机是不可见的。
- 容器通过宿主机的NAT规则后可以访问外网


```bash
[root@docker mnt]# docker run -d --name web -p 80:80 nginx:1.23
defeba839af1b95bac2a200fd1e06a45e55416be19c7e9ce7e0c8daafa7dd470
[root@docker mnt]# ifconfig
docker0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        inet6 fe80::42:5fff:fee2:346c  prefixlen 64  scopeid 0x20<link>
        ether 02:42:5f:e2:34:6c  txqueuelen 0  (Ethernet)
        RX packets 21264  bytes 1497364 (1.4 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 27358  bytes 215202237 (205.2 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.25.254.100  netmask 255.255.255.0  broadcast 172.25.254.255
        inet6 fe80::30b2:327e:b13a:31cf  prefixlen 64  scopeid 0x20<link>
        ether 00:0c:29:ec:fc:d3  txqueuelen 1000  (Ethernet)
        RX packets 1867778  bytes 2163432019 (2.0 GiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 822980  bytes 848551940 (809.2 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 11819  bytes 1279944 (1.2 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 11819  bytes 1279944 (1.2 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

veth022a7c9: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet6 fe80::a013:5fff:fefc:c9e4  prefixlen 64  scopeid 0x20<link>
        ether a2:13:5f:fc:c9:e4  txqueuelen 0  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 15  bytes 2007 (1.9 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

veth022a7c9 为容器使用的网卡

```bash
[root@docker mnt]# brctl show
bridge name     bridge id               STP enabled     interfaces
docker0         8000.02425fe2346c       no              veth022a7c9
```

## 5.2 docker原生网络host

host网络模式需要在容器创建时指定 --network=host

host模式可以让容器共享宿主机网络栈，这样的好处是外部主机与容器直接通信，但是容器的网络缺少隔离性


```bash
[root@docker ~]# docker run -it --name test  --network host busybox
/ # ifconfig
docker0   Link encap:Ethernet  HWaddr 02:42:5F:E2:34:6C
          inet addr:172.17.0.1  Bcast:172.17.255.255  Mask:255.255.0.0
          inet6 addr: fe80::42:5fff:fee2:346c/64 Scope:Link
          UP BROADCAST MULTICAST  MTU:1500  Metric:1
          RX packets:21264 errors:0 dropped:0 overruns:0 frame:0
          TX packets:27359 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:1497364 (1.4 MiB)  TX bytes:215202367 (205.2 MiB)

eth0      Link encap:Ethernet  HWaddr 00:0C:29:EC:FC:D3
          inet addr:172.25.254.100  Bcast:172.25.254.255  Mask:255.255.255.0
          inet6 addr: fe80::30b2:327e:b13a:31cf/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:1902507 errors:0 dropped:0 overruns:0 frame:0
          TX packets:831640 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:2202443300 (2.0 GiB)  TX bytes:849412124 (810.0 MiB)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:11819 errors:0 dropped:0 overruns:0 frame:0
          TX packets:11819 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:1279944 (1.2 MiB)  TX bytes:1279944 (1.2 MiB)

/ #
```

如果公用一个网络，那么所有的网络资源都是公用的，比如启动了nginx容器那么真实主机的80端口被占用，在启动第二个nginx容器就会失败



## 5.3 docker 原生网络none

none模式是指禁用网络功能，只有lo接口，在容器创建时使用

--network=none指定。

```bash
[root@docker ~]# docker run -it --name test --rm --network none  busybox
/ # ifconfig
lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

```

## 5.4 docker的自定义网络

自定义网络模式，docker提供了三种自定义网络驱动：

- bridge
- overlay
- macvlan

bridge驱动类似默认的bridge网络模式，但增加了一些新的功能，

overlay和macvlan是用于创建跨主机网络

建议使用自定义的网络来控制哪些容器可以相互通信，还可以自动DNS解析容器名称到IP地址。

### 5.4.1 自定义桥接网络

在建立自定以网络时，默认使用桥接模式

```bash
[root@docker ~]# docker network create my_net1
f2aae5ce8ce43e8d1ca80c2324d38483c2512d9fb17b6ba60d05561d6093f4c4
[root@docker ~]# docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
2a93d6859680   bridge    bridge    local
4d81ddd9ed10   host      host      local
f2aae5ce8ce4   my_net1   bridge    local
8c8c95f16b68   none      null      local
```

桥接默认是单调递增

```bash
[root@docker ~]# ifconfig
br-f2aae5ce8ce4: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.18.0.1  netmask 255.255.0.0  broadcast 172.18.255.255
        ether 02:42:70:57:f2:82  txqueuelen 0  (Ethernet)
        RX packets 21264  bytes 1497364 (1.4 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 27359  bytes 215202367 (205.2 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.17.0.1  netmask 255.255.0.0  broadcast 172.17.255.255
        inet6 fe80::42:5fff:fee2:346c  prefixlen 64  scopeid 0x20<link>
        ether 02:42:5f:e2:34:6c  txqueuelen 0  (Ethernet)
        RX packets 21264  bytes 1497364 (1.4 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 27359  bytes 215202367 (205.2 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

```

桥接也支持自定义子网和网关

```bash
[root@docker ~]# docker network create my_net2 --subnet 192.168.0.0/24 --gateway 192.168.0.100
7e77cd2e44c64ff3121a1f1e0395849453f8d524d24b915672da265615e0e4f9
[root@docker ~]# docker network  inspect my_net2
[
    {
        "Name": "my_net2",
        "Id": "7e77cd2e44c64ff3121a1f1e0395849453f8d524d24b915672da265615e0e4f9",
        "Created": "2024-08-17T17:05:19.167808342+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "192.168.0.0/24",
                    "Gateway": "192.168.0.100"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {},
        "Options": {},
        "Labels": {}
    }
]
```

### 5.4.2 为什么要自定义桥接

多容器之间如何互访？通过ip可以，但是有什么问题？

```bash
[root@docker ~]# docker run  -d --name web1 nginx
d5da7eaa913fa6cdd2aa9a50561042084eca078c114424cb118c57eeac473424
[root@docker ~]# docker run  -d --name web2 nginx
0457a156b02256915d4b42f6cc52ea71b18cf9074ce550c886f206fef60dfae5
[root@docker ~]# docker inspect  web1
            "Networks": {
                "bridge": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": null,
                    "MacAddress": "02:42:ac:11:00:03",
                    "DriverOpts": null,
                    "NetworkID": "2a93d6859680b45eae97e5f6232c3b8e070b1ec3d01852b147d2e1385034bce5",
                    "EndpointID": "4d54b12aeb2d857a6e025ee220741cbb3ef1022848d58057b2aab544bd3a4685",
                    "Gateway": "172.17.0.1",
                    "IPAddress": "172.17.0.2",		#注意ip信息
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "DNSNames": null

[root@docker ~]# docker inspect  web1
            "Networks": {
                "bridge": {
                    "IPAMConfig": null,
                    "Links": null,
                    "Aliases": null,
                    "MacAddress": "02:42:ac:11:00:03",
                    "DriverOpts": null,
                    "NetworkID": "2a93d6859680b45eae97e5f6232c3b8e070b1ec3d01852b147d2e1385034bce5",
                    "EndpointID": "4d54b12aeb2d857a6e025ee220741cbb3ef1022848d58057b2aab544bd3a4685",
                    "Gateway": "172.17.0.1",
                    "IPAddress": "172.17.0.3",		#注意ip信息
                    "IPPrefixLen": 16,
                    "IPv6Gateway": "",
                    "GlobalIPv6Address": "",
                    "GlobalIPv6PrefixLen": 0,
                    "DNSNames": null
                    
#关闭容器后重启容器，启动顺序调换
[root@docker ~]# docker stop web1 web2
web1
web2
[root@docker ~]# docker start web2
web2
[root@docker ~]# docker start web1
web1

#我们会发容器ip颠倒
```

docker引擎在分配ip时时根据容器启动顺序分配到，谁先启动谁用，是动态变更的

多容器互访用ip很显然不是很靠谱，那么多容器访问一般使用容器的名字访问更加稳定

docker原生网络是不支持dns解析的，自定义网络中内嵌了dns

```bash

[root@docker ~]# docker run -d --network my_net1 --name web nginx
d9ed01850f7aae35eb1ca3e2c73ff2f83d13c255d4f68416a39949ebb8ec699f
[root@docker ~]# docker run  -it --network my_net1  --name  test busybox
/ # ping web
PING web (172.18.0.2): 56 data bytes
64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.197 ms
64 bytes from 172.18.0.2: seq=1 ttl=64 time=0.096 ms
64 bytes from 172.18.0.2: seq=2 ttl=64 time=0.087 ms
```

注意：不同的自定义网络是不能通讯的

```bash
#在rhel7中使用的是iptables进行网络隔离，在rhel9中使用nftpables
[root@docker ~]# nft list ruleset可以看到网络隔离策略
```

### 5.4.3 如何让不同的自定义网络互通？


```bash
[root@docker ~]# docker run -d  --name web1 --network my_net1 nginx
[root@docker ~]# docker run  -it --name test --network my_net2 busybox
/ # ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:C0:A8:00:01
          inet addr:192.168.0.1  Bcast:192.168.0.255  Mask:255.255.255.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:36 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:5244 (5.1 KiB)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)

/ # ping 172.18.0.2
PING 172.18.0.2 (172.18.0.2): 56 data bytes

[root@docker ~]# docker network connect my_net1 test

#在上面test容器中加入网络eth1
/ # ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:C0:A8:00:01
          inet addr:192.168.0.1  Bcast:192.168.0.255  Mask:255.255.255.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:45 errors:0 dropped:0 overruns:0 frame:0
          TX packets:8 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:5879 (5.7 KiB)  TX bytes:602 (602.0 B)

eth1      Link encap:Ethernet  HWaddr 02:42:AC:12:00:03
          inet addr:172.18.0.3  Bcast:172.18.255.255  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:15 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:2016 (1.9 KiB)  TX bytes:0 (0.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:4 errors:0 dropped:0 overruns:0 frame:0
          TX packets:4 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:212 (212.0 B)  TX bytes:212 (212.0 B)
```

### 5.4.4  joined容器网络

 Joined容器一种较为特别的网络模式，•在容器创建时使用--network=container:vm1指定。（vm1指定的是运行的容器名）

处于这个模式下的 Docker 容器会共享一个网络栈，这样两个容器之间可以使用localhost高效快速通信。


```bash
[root@docker ~]# docker run  -it --rm  --network container:web1 busybox
/ # ifconfig
eth0      Link encap:Ethernet  HWaddr 02:42:AC:12:00:02
          inet addr:172.18.0.2  Bcast:172.18.255.255  Mask:255.255.0.0
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:28 errors:0 dropped:0 overruns:0 frame:0
          TX packets:4 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:0
          RX bytes:3046 (2.9 KiB)  TX bytes:280 (280.0 B)

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)


[root@docker ~]# docker run  -it --rm  --network container:web1 centos:7
[root@efae66874371 /]# curl localhost
<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>

```

5.4.5 joined网络示例演示

利用容器部署phpmyadmin管理mysql

```bash
#运行phpmysqladmin
[root@docker ~]# docker run -d --name mysqladmin --network my_net1 \
-e PMA_ARBITRARY=1 \				#在web页面中可以手动输入数据库地址和端口
-p 80:80 phpmyadmin:latest
```

```bash
#运行数据库
[root@docker ~]# docker run  -d --name mysql \
-e MYSQL_ROOT_PASSWORD='lee' \					#设定数据库密码
--network container:mysqladmin  \				#把数据库容器添加到phpmyadmin容器中
mysql:5.7
```


> [!NOTE]
>
> 开启的phpmyadmin容器中是没有数据库的
>
> 这里填写的localhost:3306是因为mysql容器和phpmyadmin容器公用一个网络站





## 5.5. 容器内外网的访问

 

### 5.5.1 容器访问外网


- 在rhel7中，docker访问外网是通过iptables添加地址伪装策略来完成容器网文外网
- 在rhel7之后的版本中通过nftables添加地址伪装来访问外网

```bash
[root@docker ~]# iptables -t nat -nL
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination

Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
MASQUERADE  6    --  172.17.0.2           172.17.0.2           tcp dpt:80		#内网访问外网策略

Chain DOCKER (0 references)
target     prot opt source               destination
DNAT       6    --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80 to:172.17.0.2:80

```

### 5.5.2 外网访问docker容器


端口映射 -p 本机端口:容器端口来暴漏端口从而达到访问效果

```bash
#通过docker-proxy对数据包进行内转
[root@docker ~]# docker run  -d --name webserver -p 80:80 nginx
[root@docker ~]# ps ax
 133986 ?        Sl     0:00 /usr/bin/docker-proxy -proto tcp -host-ip 0.0.0.0 -host-port 80 -container-ip 172.17.0.2 -container-port 80
 133995 ?        Sl     0:00 /usr/bin/docker-proxy -proto tcp -host-ip :: -host-port 80 -container-ip 172.17.0.2 -container-port 80
 134031 ?        Sl     0:00 /usr/bin/containerd-shim-runc-v2 -namespace moby -id cae79497a01c0b8c488c7597b43de4a43f361f21a398ff423b4504c0905db143 -address /run/containerd/containerd.sock
 134059 ?        Ss     0:00 nginx: master process nginx -g daemon off;
 134099 ?        S      0:00 nginx: worker process
 134100 ?        S      0:00 nginx: worker process

#通过dnat策略来完成浏览内转
[root@docker ~]# iptables -t nat -nL
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination

Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination

Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
MASQUERADE  6    --  172.17.0.2           172.17.0.2           tcp dpt:80

Chain DOCKER (0 references)
target     prot opt source               destination
DNAT       6    --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80 to:172.17.0.2:80
```

> [!NOTE]
>
> docker-proxy和dnat在容器建立端口映射后都会开启，那个传输速录高走那个



## 5.6 docker跨主机网络

在生产环境中，我们的容器不可能都在同一个系统中，所以需要容器具备跨主机通信的能力

- 跨主机网络解决方案
  - docker原生的overlay和macvlan
  - 第三方的flannel、weave、calico
- 众多网络方案是如何与docker集成在一起的
  - libnetwork 	docker容器网络库
  - CNM （Container Network Model）这个模型对容器网络进行了抽象

### 5.6.1 CNM （Container Network Model）




CNM分三类组件

Sandbox：容器网络栈，包含容器接口、dns、路由表。（namespace）
Endpoint：作用是将sandbox接入network （veth pair）
Network：包含一组endpoint，同一network的endpoint可以通信



### 5.6.2 macvlan网络方式实现跨主机通信

**macvlan网络方式**

- Linux kernel提供的一种网卡虚拟化技术。
- 无需Linux bridge，直接使用物理接口，性能极好
- 容器的接口直接与主机网卡连接，无需NAT或端口映射。
- macvlan会独占主机网卡，但可以使用vlan子接口实现多macvlan网络
- vlan可以将物理二层网络划分为4094个逻辑网络，彼此隔离，vlan id取值为1~4094

**macvlan网络间的隔离和连通**

- macvlan网络在二层上是隔离的，所以不同macvlan网络的容器是不能通信的
- 可以在三层上通过网关将macvlan网络连通起来
- docker本身不做任何限制，像传统vlan网络那样管理即可

**实现方法如下**：

1.在两台docker主机上各添加一块网卡，打开网卡混杂模式：

```bash
[root@docker ~]# ip link set eth1 promisc on
[root@docker ~]# ip link set up eth1
[root@docker ~]# ifconfig  eth1
eth1: flags=4419<UP,BROADCAST,RUNNING,PROMISC,MULTICAST>  mtu 1500
        ether 00:0c:29:ec:fc:dd  txqueuelen 1000  (Ethernet)
        RX packets 83  bytes 8696 (8.4 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

> [!NOTE]
>
> eth1这款网卡在vmware中要设定为仅主机模式



2.添加macvlan网路

```
[root@docker ~]# docker network create  \
-d macvlan \
--subnet 1.1.1.0/24 \
--gateway 1.1.1.1 \
-o parent=eth1 macvlan1
```

3.测试

```
#在docker-node1中
[root@docker ~]# docker run  -it --name busybox --network macvlan1 --ip 1.1.1.100 --rm busybox
/ # ping 1.1.1.200


[root@docker-node2 ~]# docker run  -it --name busybox --network macvlan1 --ip 1.1.1.200 --rm busybox
/ #

```







