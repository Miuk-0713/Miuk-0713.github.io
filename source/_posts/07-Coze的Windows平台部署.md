# 第07章：Coze的Windows平台部署

## 1、整体概述

### 1.1 Coze的开源

字节跳动于2025年7月26日开源其AI智能体开发平台Coze（中文名“扣子”），短短48小时内GitHub星标数突破9000+。

最大亮点在于其极致亲民的硬件要求——普通家用电脑（`2核CPU+4GB内存`）即可流畅运行。



**为什么Coze开源是劲爆新闻？**

之前我们在Coze上搭建的智能体只能交付给C端用户，如果交付给B端用户通常都是用Dify、n8n等平台上搭建智能体交付，因为企业用户要求`数据绝对安全`，放在公网上是不能接受的，而Dify恰好是可以私有化部署的。

现在Coze也开源了，意味着以后更多了一种选择，这绝对可以说是一个里程碑式的进步。



**为什么选择开源Coze？**

- 零成本商用：采用Apache 2.0协议，意味着你可以自由地用于商业用途，并进行二次开发
- 全链路开源：覆盖Agent开发（Studio）、测试/运维（Loop）、部署（SDK）
- 硬件平民化：告别动辄16G显存的GPU，普通笔记本即可运行AI工作流

### 1.2 两大核心组件

**两大核心组件：Coze Studio和Coze Loop。**

- 可视化开发工具Coze Studio：提供各类最新大模型和工具、多种开发模式和框架，从开发到部署，为你提供最便捷的 AI Agent 开发环境。github地址：https://github.com/coze-dev/coze-studio

- 运维管理工具Coze Loop：用于AI Agent运维和生命周期管理的平台。github地址：https://github.com/coze-dev/coze-loop

### 1.3 Coze本地化部署流程

Coze的本地化部署主要依赖Docker，其核心流程可以概括为以下四个阶段。

| 阶段        | 核心任务                            | 关键操作/说明                                                |
| :---------- | :---------------------------------- | :----------------------------------------------------------- |
| 1. 环境准备 | 确保系统满足条件<br/>并安装必要软件 | 确认电脑配置（建议双核CPU+4G内存以上），<br>安装`Docker`和`Git`。 |
| 2. 获取代码 | 下载Coze Studio开源<br/>代码到本地  | 通过`git clone`命令或直接从GitHub下载ZIP<br/>压缩包的方式获取源码。 |
| 3. 配置模型 | 配置Coze将要使用的<br/>大语言模型   | 这是关键一步，主要有两种选择：**云端API模型**<br/>（如火山方舟）或**本地模型**（如通过Ollama部署）。 |
| 4. 启动服务 | 使用Docker编译并<br/>运行所有服务   | 在项目目录下执行Docker命令，完成后通过<br/>浏览器访问 `http://localhost:8888`即可。 |

## 2、Coze Studio的安装和配置

![image-20251111142845795](/img/posts/image-20251111142845795.png)

### 步骤1：安装Docker(环境准备)

**Docker是唯一前置依赖**，用于创建隔离运行环境：

1、下载安装包

- Docker官网下载地址：https://www.docker.com/products/docker-desktop/
- 国内用户若下载慢，可使用飞书镜像包：https://ay6exk7fyt.feishu.cn/drive/folder/IccNf2B4JlJOIvd2kWfcpYnRn4l

![image-20251111160545138](/img/posts/image-20251111160545138.png)

2、安装设置

<img src="/img/posts/image-20251111160752709.png" alt="image-20251111160752709" style="zoom:80%;" />

<img src="/img/posts/image-20251111160850150.png" alt="image-20251111160850150" style="zoom:80%;" />

3、安装完成后打开Docker Desktop，确认状态栏显示 **“Running”**  ✅

<img src="/img/posts/image-20251111161225525.png" alt="image-20251111161225525" style="zoom:80%;" />

![image-20251111175328144](/img/posts/image-20251111175328144.png)

> 个别首次安装的小伙伴会被windows系统提示需要安装`适用于Linux的Windows子系统`。这里选择确认安装。稍等片刻后会完成安装。

4、配置多个镜像加速器

在安装Coze之前，我们要先进行Docker中镜像网站的设置，因为默认的镜像是国外的网址，访问不到，国内或没有加速器的需要配置docker镜像源，修改方式如下：

![image-20251118113106995](/img/posts/image-20251118113106995.png)

```bash
"registry-mirrors": [  
"https://registry.docker-cn.com",
"https://s4uv0fem.mirror.aliyuncs.com",
"https://docker.1ms.run",
"https://registry.dockermirror.com",
"https://docker.m.daocloud.io",
"https://docker.kubesre.xyz",
"https://docker.mirrors.ustc.edu.cn",
"https://docker.1panel.live",
"https://docker.kejilion.pro",
"https://dockercf.jsdelivr.fyi",
"https://docker.jsdelivr.fyi",
"https://dockertest.jsdelivr.fyi",
"https://hub.littlediary.cn",
"https://proxy.1panel.live",
"https://docker.1panelproxy.com",
"https://image.cloudlayer.icu",
"https://docker.1panel.top",
"https://docker.anye.in",
"https://docker-0.unsee.tech",
"https://hub.rat.dev",
"https://hub3.nat.tf",
"https://docker.1ms.run",
"https://func.ink",
"https://a.ussh.net",
"https://docker.hlmirror.com",
"https://lispy.org",
"https://docker.yomansunter.com",
"https://docker.xuanyuan.me",
"https://docker.mybacc.com",
"https://dytt.online",
"https://docker.xiaogenban1993.com",
"https://dockerpull.cn",
"https://docker.zhai.cm",
"https://dockerhub.websoft9.com",
"https://dockerpull.pw",
"https://docker-mirror.aigc2d.com",
"https://docker.sunzishaokao.com",
"https://docker.melikeme.cn"  
]

```

到这里，Docker已经安装配置好了。

### 步骤2：下载Coze安装包

#### 安装方式1：Github/Gitee

1. 打开Docker Desktop内置终端（右下角Terminal图标）
2. 执行以下命令：

```bash
# 克隆官方仓库代码
git clone https://github.com/coze-dev/coze-studio.git
```

**注意：**由于github下载较慢，大家可以将github上coze-studio镜像下载到gitee平台，然后从gitee平台下载。

1）在gitee平台上：

![image-20251117184702974](/img/posts/image-20251117184702974.png)

2）复制Github上的coze-studio地址

![image-20251117184601700](/img/posts/image-20251117184601700.png)

粘贴到：

![image-20251117184834778](/img/posts/image-20251117184834778.png)

3）下载完成以后，复制gitee上的地址：

![image-20251117184633048](/img/posts/image-20251117184633048.png)

粘贴到docker desktop客户端：

![image-20251117184502344](/img/posts/image-20251117184502344.png)

> 说明：git是一个从代码仓库拉取代码的工具，大家通过以下网址下载，安装一下即可。安装非常简单，安装以后，就可以使用git命令了。如果你没有安装git，请先安装git：https://git-scm.com/downloads

#### 安装方式2：解压zip包

如果你不想安装git，你也可以直接下载github上coze的zip包，如下图：

https://github.com/coze-dev/coze-studio

![image-20251114174617570](/img/posts/image-20251114174617570.png)

下载后解压到指令目录即可。

### 步骤3：安装并配置模型

首次部署并启动 Coze Studio 开源版本之前，需要在 Coze Studio 项目中配置模型服务。否则，在创建Agent或工作流时将无法正确选择模型。

1、从模板目录复制doubao-seed-1.6模型的模板文件，并粘贴到配置文件目录中。

首先，进入根目录coze-studio下，在地址栏中输入“cmd”并按回车键。

![image-20251118143432201](/img/posts/image-20251118143432201.png)

执行命令：

```bash
copy backend\conf\model\template\model_template_ark_doubao-seed-1.6.yaml backend\conf\model\ark_doubao-seed-1.6.yaml
```

2、修改配置文件目录中的模板文件，填入对应的参数

`id`：Coze Studio 中的模型 ID，由开发者自主定义，必须为非零整数，全局唯一。模型上线后请勿修改模型 ID。
`meta.conn_config.api_key`：在线模型服务的 API Key，获取方式见下方获取Key和Model接入点的api_key。
`meta.conn_config.model`：在线模型服务的模型 ID。本例中为 Volcengine Ark doubao-seed-1.6 模型接入点的 Endpoint ID，获取方式见下方获取Key和Model接入点的model。

**配置方案说明：**

模型配置是部署的核心，主要有以下两种方案，根据自己的需求（如网络条件、数据敏感性、成本）进行选择。

| 配置方式                 | 优点                                           | 缺点                                                         | 适用场景                                                 |
| :----------------------- | :--------------------------------------------- | :----------------------------------------------------------- | :------------------------------------------------------- |
| 云端API模型 (如火山方舟) | 模型能力强，响应速度快，无需消耗本地计算资源。 | 需要API Key（可能产生费用），需要联网，数据需传输到厂商云端。 | 体验Coze全部功能，需要最先进的模型能力，开发测试环境。   |
| 纯本地模型 (通过Ollama)  | `数据完全私密`，离线可用，API调用`免费`。      | 本地硬件要求较高（尤其需要较好GPU），模型性能可能不及顶级云端模型。 | 对数据安全有严格要求，内网环境，希望完全掌控模型的场景。 |

#### 方案1：配置云端API模型（以火山方舟为例）

**1、创建 API Key**

进入火山引擎官网 https://www.volcengine.com ，打开【控制台】。

![img](/img/posts/339881e3f53966366727d31e8730fd3f.png)

搜索并进入【火山方舟】

![image-20251118092704469](/img/posts/image-20251118092704469.png)

点击【API Key 管理】下的【创建 API Key】，选择【创建】

![img](/img/posts/1d6b1dd74052cb2f0fa07bb3a1fa4f75.png)

点击小眼睛即可查看 API Key ，复制备用。

![img](/img/posts/e891e1b565f5f58d50e157b82188e335.png)

**2、创建Endpoint**

进入【在线推理】页面，选择【自定义推理接入点】，点击【创建推理接入点】

![img](/img/posts/8f1bb883c08c185d60fed4efa5502f49.png)

输入接入点名称，建议以模型命名，点击【添加模型】

![img](/img/posts/828b99829c14492a4820c7ddd1ec0ae7.png)

模型目前支持：豆包、DeepSeek、Kimi、Qwen，这里以豆包 1.6 为例，选择后确定。

![img](/img/posts/41785ba8ed5b7f0b1bbec5fbc004ad0b.png)

![image-20251118152946085](/img/posts/image-20251118152946085.png)

勾选协议，点击【开通模型并接入】。

![image-20251118153103848](/img/posts/image-20251118153103848.png)

补充：如果是模型首次开通需要实名认证，输入个人信息，手机刷脸验证。

复制Endpoint。注意：模型名称下方的 ID 就是Endpoint。

![image-20251118153248976](/img/posts/image-20251118153248976.png)

**3、配置 Coze 文件**

找到前面的文件：ark_doubao-seed-1.6.yaml，进行编辑

- id 修改为任意 5 位以上纯数字。

![image-20251118112100248](/img/posts/image-20251118112100248.png)

- 将前面创建的【API Key】和【Endpoint】填入下图位置内，保存并关闭文件。

![image-20251118153405463](/img/posts/image-20251118153405463.png)

#### 方案2：配置纯本地模型（通过Ollama）

这种方法可以实现完全离线的私有化部署。

**1、安装Ollama**：首先在本地安装Ollama，它是一个用于在本地运行大模型的工具。

**2、拉取模型**：通过Ollama拉取你想要的模型，例如在命令行中执行 `ollama pull qwen2.5:7b`来下载一个开源模型。

**3、配置Coze**：在Coze项目目录下，找到Ollama的配置文件模板model_template_ollama.yaml，

![image-20251118154113127](/img/posts/image-20251118154113127.png)

将其复制并重命名为model_ollama.yaml，保存到 backend/conf/model/ 目录下：

![image-20251118154236734](/img/posts/image-20251118154236734.png)

修改其中的 base_url为Ollama的服务地址（通常是 `http://host.docker.internal:11434`），并指定你拉取的 model 名称。

![image-20251118154604090](/img/posts/image-20251118154604090.png)

### 步骤4：安装并启动Coze

下图中有一个名叫docker的目录，我们要进入到这个项目文件夹中，进行安装。

<img src="/img/posts/image-20251118151026988.png" alt="image-20251118151026988" style="zoom:80%;" />

在当前目录下，测试如下：

**1、输入docker，点击回车键后，返回下图这样的结果，表明安装是成功的，没有任何问题。**

<img src="/img/posts/image-20251118151237965.png" alt="image-20251118151237965" style="zoom:80%;" />

**2、环境变量配置**

执行如下命令，重命名环境配置文件：

```bash
copy .env.example .env   #或执行：cp .env.example .env
```

![img](/img/posts/f4834173ceb430f8dd2337b1c56c2e74.jpeg)

**3、在Docker里启动Coze**

首次启动可能需要5-10分钟（依赖网络速度），运行一下这条命令：

```bash
docker compose --profile '*' up -d
```

![image-20251118153815941](/img/posts/image-20251118153815941.png)

> 这个命令的含义是：
>
> - `docker compose`：使用Docker Compose运行服务
> - `--profile '*'`：启用所有profile配置
> - `up`：启动服务（没有就创建容器，有就重启）
> - `-d`：detached模式，即在后台运行

出现下图表示成功：

![image-20251118154819866](/img/posts/image-20251118154819866.png)

**4、安装结束后，查看运行状态**

```bash
docker compose ps
```

打开安装好的docker客户端，正常就可以看到docker启动起来了。

```bash
docker compose ps
```

我们打开安装好的docker客户端，正常就可以看到docker启动起来了。

![image-20251118155151948](/img/posts/image-20251118155151948.png)

### 步骤5：初始化并访问Coze管理界面

安装好后，我们打开浏览器，访问http://localhost:8888/来打开 Coze Studio ，可以看到如下界面。

![image-20251118155219214](/img/posts/image-20251118155219214.png)

登录进去，即可正常使用了

![image-20251118155338542](/img/posts/image-20251118155338542.png)

正常就可以看到docker启动起来了。

> 小遗憾：目前功能较商业版还比较简陋，但未来可期！

## 3、CozeLoop(扣子罗盘)指南

### 3.1 介绍

![image-20251118160521163](/img/posts/image-20251118160521163.png)

Coze Loop 是一个面向开发者，专注于 AI Agent 开发与运维的平台级解决方案。 它可以解决 AI Agent 开发过程中面临的各种挑战，提供从开发、调试、评估、到监控的全生命周期管理能力。

### 3.2 部署

**1、前期准备工作**

安装 CozeLoop 开源版之前，确保您的软硬件环境满足以下要求：

- Go：已安装Go SDK，且版本为1.23.4及以上版本。配置GOPATH，同时将${GOPATH}/bin加入到环境变量PATH中，保证安装的二进制工具可找到并运行。
- Docker：提前安装Docker、Docker Compose，并启动 Docker 服务
- 模型：已开通OpenAI或火山方舟等在线模型服务。

**2、克隆仓库**

```bash
git clone https://gitee.com/shkstart/coze-loop.git
```

![image-20251118160139754](/img/posts/image-20251118160139754.png)

**3、配置模型**

编辑文件coze-loop/release/deployment/docker-compose/conf/model_config.yaml，修改 api_key 和 model 字段。以火山方舟为例：

- api_key：火山方舟 API Key。（参考Coze Studio中的同步骤情况）
- model：火山方舟模型接入点的 Endpoint ID。（参考Coze Studio中的同步骤情况）

![image-20251118164111775](/img/posts/image-20251118164111775.png)

**4、启动服务**

![image-20251122100012451](/img/posts/image-20251122100012451.png)

在上述目录下，启动服务。但在服务启动之前，需要修改.env和docker-compose.yml文件，将文件内8888端口改为8889，因为前者被coze-studio绑定，不改会启动失败。

更改完成以后，执行启动命名：

```bash
docker compose -f docker-compose.yml --env-file .env --profile "*" up
```

![image-20251122095927332](/img/posts/image-20251122095927332.png)

首次启动需要拉取镜像、构建本地镜像，可能耗时较久，请耐心等待。部署过程中，你会看到以下日志信息。如果回显信息中”提示后端构建完成“，表示 CozeLoop 已成功启动。

**5、访问 CozeLoop 开源版**

通过浏览器访问 Coze Loop 开源版 `http://localhost:8082`。

![image-20251119145214972](/img/posts/image-20251119145214972.png)

![image-20251111113044531](/img/posts/image-20251111113044531.png)

### 3.3 使用 Coze Loop

登录 Coze Loop，使用 Playground 的功能。选择模型配置，然后在预览与调试窗口进行对话。











### 3.4 使用 Coze Loop 开源版

1、Prompt 开发：Coze Loop 的 Prompt 开发模块为开发者提供了从编写、调试、优化到版本管理的全流程支持，通过可视化 Playground 实现 Prompt 的实时交互测试，让开发者能够直观比较不同大语言模型的输出效果。

![img](/img/posts/275d962fd1ad42003bd66635dea07581.jpeg)

- 评测：Coze Loop 评测模块为开发者提供系统化的评测能力，能够对 Prompt 和扣子智能体的输出效果进行多维度自动化检测，例如准确性、简洁性和合规性等。
- 观测：Coze Loop 为开发者提供了全链路执行过程的可视化观测能力，完整记录从用户输入到 AI 输出的每个处理环节，包括 Prompt 解析、模型调用和工具执行等关键节点，并自动捕获中间结果和异常状态。
  



- [Prompt 开发与调试](https://loop.coze.cn/open/docs/cozeloop/create-prompt)：Coze Loop 提供了完整的提示词开发流程。
- [评测](https://loop.coze.cn/open/docs/cozeloop/evaluation-quick-start)：Coze Loop 的评测功能提供标准评测数据管理、自动化评估引擎和综合的实验结果统计。
- [Trace 上报与查询](https://loop.coze.cn/open/docs/cozeloop/trace_integrate)：Coze Loop 支持对平台上创建的 Prompt 调试的 Trace 自动上报，实时追踪每一条 Trace 数据。

![img](/img/posts/526d87719e7ecd7c5c1c99e298c45b12.jpeg)

![img](/img/posts/c7fe8cb2ebe47e1fba472ca39f7d8273.jpeg)

- [开源版使用Coze Loop SDK](https://github.com/coze-dev/coze-loop/wiki/8.-开源版使用-CozeLoop-SDK)：Coze Loop 三个语言的 SDK均适用于商业版和开源版。对于开源版，开发者只需要初始化时修改部分参数配置。



另一个版本：

Prompt调试

- Playground 调试、对比

- Prompt版本管理

评测

- 管理评测集

- 管理评估器
- 管理实验

观测

- SDK上报Trace
- Trace 数据观测

模型

- 支持接入OpenAl、火山方舟等模型

