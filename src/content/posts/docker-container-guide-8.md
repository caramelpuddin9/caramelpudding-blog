---
title: Docker 容器学习（八）：容器编排工具Docker Compose
published: 2026-02-17
description: Docker Compose 安装与使用、docker-compose.yml 编写、多容器应用编排、网络与数据卷配置。
image: ./images/bg009.png
tags: [Docker, Docker Compose, 容器编排, DevOps]
category: 技术
draft: false
---
# 八  容器编排工具Docker Compose

## 8.1 Docker Compose 概述


Docker Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。

其是官方的一个开源项目，托管到github上

https://github.com/docker/compose

网址：

**主要功能**

1. **定义服务**：
   - 使用 YAML 格式的配置文件来定义一组相关的容器服务。每个服务可以指定镜像、端口映射、环境变量、存储卷等参数。
   - 例如，可以在配置文件中定义一个 Web 服务和一个数据库服务，以及它们之间的连接关系。
2. **一键启动和停止**：
   - 通过一个简单的命令，可以启动或停止整个应用程序所包含的所有容器。这大大简化了多容器应用的部署和管理过程。
   - 例如，使用 `docker-compose up` 命令可以启动配置文件中定义的所有服务，使用 `docker-compose down` 命令可以停止并删除这些服务。
3. **服务编排**：
   - 可以定义容器之间的依赖关系，确保服务按照正确的顺序启动和停止。例如，可以指定数据库服务必须在 Web 服务之前启动。
   - 支持网络配置，使不同服务的容器可以相互通信。可以定义一个自定义的网络，将所有相关的容器连接到这个网络上。
4. **环境变量管理**：
   - 可以在配置文件中定义环境变量，并在容器启动时传递给容器。这使得在不同环境（如开发、测试和生产环境）中使用不同的配置变得更加容易。
   - 例如，可以定义一个数据库连接字符串的环境变量，在不同环境中可以设置不同的值。

**工作原理**

1. **读取配置文件**：
   - Docker Compose 读取 YAML 配置文件，解析其中定义的服务和参数。
2. **创建容器**：
   - 根据配置文件中的定义，Docker Compose 调用 Docker 引擎创建相应的容器。它会下载所需的镜像（如果本地没有），并设置容器的各种参数。
3. **管理容器生命周期**：
   - Docker Compose 监控容器的状态，并在需要时启动、停止、重启容器。
   - 它还可以处理容器的故障恢复，例如自动重启失败的容器。

**Docker Compose 中的管理层**

1. 服务 (service) 一个应用的容器，实际上可以包括若干运行相同镜像的容器实例
2. 项目 (project) 由一组关联的应用容器组成的一个完整业务单元，在 docker-compose.yml 文件中定义
3. 容器（container）容器是服务的具体实例，每个服务可以有一个或多个容器。容器是基于服务定义的镜像创建的运行实例

## 8.2 Docker Compose 的常用命令参数

```
version: "1.0"
services:
  web:
    image: nginx
    ports:
      - "80:80"

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: lee

```

以下是一些 Docker Compose 常用命令：

**一、服务管理**

1. `docker-compose up`：

   - 启动配置文件中定义的所有服务。

   - 可以使用 `-d` 参数在后台启动服务。

   - 可以使用-f 来指定yml文件

   - 例如：`docker-compose up -d`。

     ```bash
     [root@docker test]# docker compose up -d
     [+] Running 2/2
      ✔ Container test-db-1   Started            0.9s
      ✔ Container test-web-1  Started            0.9s
      
     [root@docker ~]# docker compose -f  test/docker-compose.yml  up -d
     [+] Running 3/3
      ✔ Network test_default  Created             0.1s
      ✔ Container test-web-1  Started             0.9s
      ✔ Container test-db-1   Started   
     ```

     

2. `docker-compose down`：

   - 停止并删除配置文件中定义的所有服务以及相关的网络和存储卷。

     ```bash
     [root@docker test]# docker compose down
     [+] Running 3/3
      ✔ Container test-db-1   Removed                                                          1.7s
      ✔ Container test-web-1  Removed                                                          0.3s
      ✔ Network test_default  Removed                                                          0.1s
     ```

     

3. `docker-compose start`：

   - 启动已经存在的服务，但不会创建新的服务。

     ```bash
     [root@docker test]# docker compose start
     [+] Running 2/2
      ✔ Container test-db-1   Started                                                                 
      ✔ Container test-web-1  Started   
     ```

4. `docker-compose stop`：

   - 停止正在运行的服务

     ```bash
     [root@docker test]# docker compose stop
     [+] Stopping 2/2
      ✔ Container test-web-1  Stopped                                                          0.4s
      ✔ Container test-db-1   Stopped                                                         10.3s
     ```

5. `docker-compose restart`：

   - 重启服务。

     ```bash
     [root@docker test]# docker compose restart
     [+] Restarting 2/2
      ✔ Container test-web-1  Started                                                                     
      ✔ Container test-db-1   Started  
     ```

     

**二、服务状态查看**

1. `docker-compose ps`：

   - 列出正在运行的服务以及它们的状态，包括容器 ID、名称、端口映射等信息。

     ```
     [root@docker test]# docker compose ps
     NAME         IMAGE       COMMAND                   SERVICE   CREATED         STATUS          PORTS
     test-db-1    mysql:5.7   "docker-entrypoint.s…"   db        2 minutes ago   Up 48 seconds   3306/tcp, 33060/tcp
     test-web-1   nginx       "/docker-entrypoint.…"   web       2 minutes ago   Up 50 seconds   0.0.0.0:80->80/tcp, :::80->80/tcp
     ```

     

2. `docker-compose logs`：

   - 查看服务的日志输出。可以指定服务名称来查看特定服务的日志。

     ```
     [root@docker test]# docker compose  logs db
     ```

     

**三、构建和重新构建服务（了解）**

1. `docker-compose build`：
   - 构建配置文件中定义的服务的镜像。可以指定服务名称来只构建特定的服务。
   
     ```
     [root@docker test]# cat Dockerfile
     FROM  busybox:latest
     RUN   touch /leefile1
     
     [root@docker test]# cat lee.Dockerfile
     services:
       test1:
         image: test1					#生成镜像名称
         build:
           context: /root/test			#指定Dockerfile位置
           dockerfile: lee.Dockerfile	#指定Dockerfile名字
         command: ["/bin/sh","-c","sleep 3000"]
         restart: always
         container_name: busybox1
     
       test2:
         image: test2
         build:
           context: /root/test				
           dockerfile: Dockerfile
         command: ["/bin/sh","-c","sleep 3000"]
         restart: always
         container_name: busybox2
     
     
     [root@docker test]# docker compose -f test.yml build			#构建services中的所有
     [root@docker test]# docker compose  -f test.yml build test1		#构建services中的test1
     
     
     ```
   
     
   
2. `docker-compose up --build`：
   
   - 启动服务并在启动前重新构建镜像。
   
   ```bash
   [root@docker test]# docker compose  -f test.yml  up -d			#会去仓库拉去镜像
   [+] Running 1/1
    ! test1 Warning pull access denied for test1, repository does not exist or may require 'docker login': denied: requested acces...  
    
    	
    [root@docker test]# docker compose  -f test.yml  up --build	#会先构建镜像后启动容器
   
   ```
   
   

**四、其他操作**

1. `docker-compose exec`：
   - 在正在运行的服务容器中执行命令。
   
     ```
     services:
       test:
         image: busybox
         command: ["/bin/sh","-c","sleep 3000"]
         restart: always
         container_name: busybox1
     
     [root@docker test]# docker compose -f test.yml  up -d
     [root@docker test]# docker compose  -f test.yml  exec  test sh
     / #
     ```
   
     
   
2. `docker-compose pull`：
   
   - 拉取配置文件中定义的服务所使用的镜像。
   
   ```
   [root@docker test]# docker compose -f test.yml pull
   [+] Pulling 2/2
     ✔ test Pulled
     ✔ ec562eabd705 Pull complete  
   ```
   
   
   
3. `docker-compose config`：
   
   - 验证并查看解析后的 Compose 文件内容
   
     ```
     [root@docker test]# docker compose -f test.yml  config
     name: test
     services:
       test:
         command:
           - /bin/sh
           - -c
           - sleep 3000
         container_name: busybox1
         image: busybox
         networks:
           default: null
         restart: always
     networks:
       default:
         name: test_default
     [root@docker test]# docker compose -f test.yml  config -q
     ```
   
     



## 8.3 Docker Compose 的yml文件

Docker Compose 的 YAML 文件用于定义和配置多容器应用程序的各个服务。以下是一个基本的 Docker Compose YAML 文件结构及内容解释：

**一、服务（services）**

1. **服务名称（service1_name/service2_name 等）**：

   - 每个服务在配置文件中都有一个唯一的名称，用于在命令行和其他部分引用该服务。

     ```
     services:
       web:
         # 服务1的配置
       mysql:
         # 服务2的配置
     ```

2. **镜像（image）**：

   - 指定服务所使用的 Docker 镜像名称和标签。例如，`image: nginx:latest` 表示使用 `nginx` 镜像的最新版本

     ```
     services:
       web:
         images：nginx
       mysql:
         images：mysql:5.7
     ```

     

3. **端口映射（ports）**：

   - 将容器内部的端口映射到主机的端口，以便外部可以访问容器内的服务。例如，`- "8080:80"` 表示将主机的 8080 端口映射到容器内部的 80 端口。

     ```bash
     services:
       web:
         image: timinglee/mario
         container_name: game			#指定容器名称
         restart： always				   #docekr容器自动启动
         expose：
         	- 1234						#指定容器暴露那些端口，些端口仅对链接的服务可见，不会映射到主机的端口
         ports:
           - "80:8080"
     ```

4. **环境变量（environment）**：

   - 为容器设置环境变量，可以在容器内部的应用程序中使用。例如，`VAR1: value1` 设置环境变量 `VAR1` 的值为 `value1`

     ```
     services:
       web:
         images：mysql:5.7
         environment:
           MYSQL_ROOT_PASSWORD: lee
     ```

     

5. **存储卷（volumes）**：

   - 将主机上的目录或文件挂载到容器中，以实现数据持久化或共享。例如，`- /host/data:/container/data` 将主机上的 `/host/data` 目录挂载到容器内的 `/container/data` 路径。

     ```
     services:
       test:
         image: busybox
         command: ["/bin/sh","-c","sleep 3000"]
         restart: always
         container_name: busybox1
         volumes:
           - /etc/passwd:/tmp/passwd:ro			#只读挂在本地文件到指定位置
     ```

     

6. **网络（networks）**：

   - 将服务连接到特定的网络，以便不同服务的容器可以相互通信

     ```
     services:
       web:
         image: nginx
         container_name: webserver
         network_mode: bridge				#使用本机自带bridge网络
     ```

     ```
     services:
       test:
         image: busybox 
         container_name: webserver
         command: ["/bin/sh","-c","sleep10000000"]
         #network_mode: mynet2
         networks:
           - mynet1
           - mynet2
     
     
     networks:
       mynet1:
         driver: bridge
     
       mynet2:
         driver: bridge
     ```
     
     

7. **命令（command）**：

   - 覆盖容器启动时默认执行的命令。例如，`command: python app.py` 指定容器启动时运行 `python app.py` 命令

     ```
     [root@docker test]# vim busybox.yml
     services:
       web:
         image: busybox
         container_name: busybox
         #network_mode: mynet2
         command: ["/bin/sh","-c","sleep10000000"]
     
     ```
     
     

**二、网络（networks）**

- 定义 Docker Compose 应用程序中使用的网络。可以自定义网络名称和驱动程序等属性。

- 默认情况下docker compose 在执行时会自动建立网路

  ```bash
  services:
    test:
      image: busybox1
      command: ["/bin/sh","-c","sleep 3000"]
      restart: always
      network_mode:  default
      container_name: busybox
  
    test1:
      image: busybox2
      command: ["/bin/sh","-c","sleep 3000"]
      restart: always
      container_name: busybox1
      networks:
        - mynet1
   
   test3:
      image: busybox3
      command: ["/bin/sh","-c","sleep 3000"]
      restart: always
      container_name: busybox1
      networks:
        - mynet1
  
  networks:
    mynet1:
      driver: bridge			#使用桥接驱动，也可以使用macvlan用于跨主机连接
  
    default:
      external: true			#不建立新的网络而使用外部资源
      name: bridge			#指定外部资源网络名字
      
    mynet2:
      ipam:
        driver: default
        config:
          - subnet: 172.28.0.0/16
            gateway: 172.28.0.254
  ```

  

**三、存储卷（volumes）**

- 定义 Docker Compose 应用程序中使用的存储卷。可以自定义卷名称和存储位置等属性。

  ```
  services:
    test:
      image: busybox
      command: ["/bin/sh","-c","sleep 3000"]
      restart: always
      container_name: busybox1
      volumes:
        - data:/test							#挂在data卷
        - /etc/passwd:/tmp/passwd:ro			#只读挂在本地文件到指定位置
  
  
  volumes:
    data:
      name: timinglee							#指定建立卷的名字
  
  ```

  

## 8.4 企业示例

利用容器编排完成haproxy和nginx负载均衡架构实施

```
services:
  web1:
    image: nginx:latest
    container_name: web1
    restart: always
    networks:
      - mynet1
    expose:
      - 80
    volumes:
      - /docker/web/html1:/usr/share/nginx/html
  web2:
    image: nginx:latest
    container_name: web2
    restart: always
    networks:
      - mynet1
    expose:
      - 80
    volumes:
      - /docker/web/html2:/usr/share/nginx/html

  haproxy:
    image: haproxy:2.3
    container_name: haproxy
    restart: always
    networks:
       - mynet1
       - mynet2
    volumes:
      - /docker/conf/haproxy/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg
    ports:
      - 80:80

networks:
  mynet1:
    driver: bridge
  
  mynet2:
    driver: bridge

```

