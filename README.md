# LiteBot 简介

**LiteBot** 是一个基于Node.js平台、[OICQ](https://github.com/takayama-lily/oicq)框架进行开发的基岩版群服互通机器人。

LiteBot目前支持的WebSocket组件为：

WebSocket组件|组件类型|依赖平台|作者
--|--|--|--
[LLWebSocket](https://www.minebbs.com/resources/c-bdx-liteloader-bdswebsocketapi.2150/)|服务器|LiteLoader|WangYneos

# 运行环境要求
* 主流的操作系统平台（包括但不限于Windows、Linux、MacOS）；
* 操作系统需要安装Node.js环境（Node.js版本要求为14.x及以上）

# 使用指南
## 第一次使用LLWebSocket
1、按照LLWebSocket文档指示，下载并将LLWebSocket插件添加到您的BDS；
2、修改LLWebSocket配置文件：

```
{
	"wsaddr":"0.0.0.0:996",	//务必按照“IP地址:端口”的格式进行填写，IP地址一般写0.0.0.0（即监听本机所有IP地址）
	"endpoint":"/mc",	//可自定义，务必带前缀“/”
	"encrypt":"aes_cbc_pkcs7padding",	//务必修改为“aes_cbc_pkcs7padding”
	"wspasswd":"32v34W#e6%E*6wv$^Vw?65a+",
	"enableLog": false
}
```

3、开服，然后开始配置LiteBot

## 第一次使用LiteBot
### 对于Windows用户
1. 下载LiteBot；
2. 将压缩包内的所有文件解压，进入解压后的文件夹，复制examples文件夹并重命名为config；
3. 打开LiteBot全局配置文件``./config/global_config.yml``，按照文件内的提示进行修改；
4. 修改完成后,保存并退出。在当前目录打开终端，输入``node app.js``启动LiteBot

### 对于Linux用户
1. 在终端输入``wget -qO- https://gitee.com/litebot/litebot-scripts/raw/master/init.sh | bash``，执行快速初始化；
2. 初始化完成后，进入LiteBot根目录（位置：``/opt/LiteBot``）；
3. 打开LiteBot全局配置文件``./config/global_config.yml``，按照文件内的提示进行修改；
4. 修改完成后,保存并退出。在当前目录打开终端，输入``node app.js``启动LiteBot

* 当控制台出现以下类似的内容时，说明LiteBot已经可以正常使用：

```

  ###+++#################
  ###  +###############
  ####            ####
  ####          ####
  ####        ####
  ####      ####             LiteBot 3.0.0 Preview 1
  ####    ####               Powered by OICQ
  ####      ####             ©2022 Asurin219 All rights reserved.
  ####        ####
  ####          ####
  ####            ####
  ######################
  ########################


[2022-04-02T23:00:01.215] [MARK] [iPad:123456789] - ----------
[2022-04-02T23:00:01.216] [MARK] [iPad:123456789] - Package Version: oicq@2.2.1 (Released on 2021/3/16)
[2022-04-02T23:00:01.216] [MARK] [iPad:123456789] - View Changelogs：https://github.com/takayama-lily/oicq/releases
[2022-04-02T23:00:01.216] [MARK] [iPad:123456789] - ----------
[2022-04-02T23:00:01.330] [INFO] [WebSocket] - 服务器 “纯生存服” 连接成功
[2022-04-02T23:00:01.330] [INFO] [WebSocket] - 服务器 “建筑创造服” 连接成功
[2022-04-02T23:00:01.331] [INFO] [WebSocket] - 服务器 “空岛生存服” 连接成功
[2022-04-02T23:00:01.381] [MARK] [iPad:123456789] - 113.96.18.253:8080 connected
[2022-04-02T23:00:01.743] [MARK] [iPad:123456789] - Welcome, LiteBot Bot ! 正在加载资源...
[2022-04-02T23:00:01.997] [MARK] [iPad:123456789] - 加载了3个好友，2个群，0个陌生人
[2022-04-02T23:00:01.998] [INFO] [OICQ] - 登录成功，开始处理消息
```


## 详细配置
### 正则表达式
LiteBot可以通过正则表达式模块对群消息进行特定处理。当群员发送的消息与正则表达式匹配时，将会触发相应的动作。正则表达式配置文件为``./config/regex.json``。以下是示例配置：

```
[
	{	//正则组1
		"regex": "^(绑定 )([A-Za-z0-9 ]{4,20})$",	//正则表达式
		"permission": 1,	//执行该组动作的所需权限，0为普通玩家，1为管理员
		"actions": [		//动作组，即正则匹配成功时所执行的动作
			{	//动作1
				"type": "bind_xboxid",	//动作类型
			},
			{	//动作2
				"type":"add_allowlist_self",
			}
		]
	},
	{
		//正则组2...
	}
]
```

以下是正则表达式目前支持的配置项：

regex（正则表达式）|type（动作类型）|content（内容）|说明
--|--|--|--
"^(帮助)$"|group_msg|"帮助测试"|发送一条自定义内容的群消息"帮助测试"
"^(查服)$"|run_cmd|"/list"|向服务器执行一条预定的控制台指令"/list"
"^(/cmd )(.+$)"|run_cmd_raw|无|向服务器执行一条自定义的控制台指令
"^(绑定 )([A-Za-z0-9 ]{4,20})$"|bind_xboxid|无|自助绑定白名单
"^(申请白名单)$"|add_allowlist_self|无|自助添加白名单
"^(加白名单)(.+$)"|add_allowlist|无|为目标玩家添加白名单
"^(解绑)$"|del_allowlist_self|无|自助解绑白名单
"^(解绑 )(.+$)"|del_allowlist|无|删除目标玩家的白名单
"^(我的信息)$"|get_bind_info_self|无|查询本人的白名单绑定状态
"^(查绑定 )(.+$)"|get_bind_info|无|查询目标玩家的白名单绑定状态

### 语言文件
当相关的动作或事件触发时（例如玩家加入/离开服务器、管理员在群内执行指令等），LiteBot将会根据语言文件配置，向群内发送经格式化处理后的文本消息（一般是动作的执行结果、服务器内的聊天信息等）。
语言文件位于目录``./config/language/``下，默认为zh-cn.json，可在全局配置文件进行修改。以下是配置说明：

#### "player_join"：
* 消息触发条件：玩家进入服务器（转发到绑定的群聊）
* 支持的占位符：

占位符|说明
--|--
{player}|玩家xboxid

#### "player_left"：
* 消息触发条件：玩家离开服务器（转发到绑定的群聊）
* 支持的占位符：

占位符|说明
--|--
{player}|玩家xboxid

#### "server_player_join"：
* 消息触发条件：玩家进入服务器（转发到群组服）
* 支持的占位符：无

#### "server_player_left"：
* 消息触发条件：玩家离开服务器（转发到群组服）
* 支持的占位符：无

#### "player_chat"：
* 消息触发条件：玩家在服内聊天（转发到绑定的群聊）
* 支持的占位符：

占位符|说明
--|--
{server_name}|服务器名称
{player}|玩家xboxid
{content}|玩家聊天内容

#### chat_between_server
* 消息触发条件：玩家在服内聊天（转发到群组服）
* 支持的占位符：

占位符|说明
--|--
{server_name}|服务器名称
{player}|玩家xboxid
{content}|玩家聊天内容

#### "runcmd_feedback"
* 消息触发条件：通过群聊向服务器发送指令
* 支持的占位符：

占位符|说明
--|--
{server_name}|服务器名称
{result}|指令执行结果

#### "get_online_players"：
* 消息触发条件：指令执行返回的结果为玩家在线数量
* 支持的占位符：

占位符|说明
--|--
{server_name}|服务器名称
{online}|当前服务器在线人数
{max_online}|服务器设定的最大在线人数
{player}|在线的玩家xboxid

#### "targets_not_found"
* 消息触发条件：指令执行返回的结果为目标未找到
* 支持的占位符：

占位符|说明
--|--
{server_name}|服务器名称

#### "chat_to_server"
* 消息触发条件：玩家在群内发送消息（转发到该群绑定的所有服务器）
* 支持的占位符：

占位符|说明
--|--
{group_name}|群聊名称
{group_sender}|群消息发送者
{content}|群消息内容

#### "permission_denied"
* 消息触发条件：玩家执行指令或相关操作的权限不足
* 支持的占位符：无

#### "server_connect_error"
* 消息触发条件：执行指令或相关操作时遇到服务器连接错误
* 支持的占位符：无


#### "get_bind_info"
* 消息触发条件：玩家查询自己/目标玩家的绑定状态
* 支持的占位符：

占位符|说明
--|--
{member_qqid}|已绑定的QQ账号
{xboxid}|已绑定的XboxID
{permission}|玩家权限
{bind_status}|服务器白名单状态

#### "member_bind_succeeded"
* 消息触发条件：玩家绑定成功
* 支持的占位符：

占位符|说明
--|--
{xboxid}|玩家绑定的xboxid

#### "member_unbind_succeeded"
* 消息触发条件：玩家解绑成功
* 支持的占位符：

占位符|说明
--|--
{xboxid}|玩家绑定的xboxid

#### "member_already_binded"
* 消息触发条件：玩家已经绑定
* 支持的占位符：无

#### "xboxid_already_binded_by_others"
* 消息触发条件：玩家欲绑定的xboxid已被目标玩家占用
* 支持的占位符：

占位符|说明
--|--
{others_qqid}|该xboxid占用者的QQ号码

#### "member_not_bind"
* 消息触发条件：玩家未绑定
* 支持的占位符：无

#### "adding_to_allowlist"
* 消息触发条件：正在将玩家的xboxid添加到服务器白名单
* 支持的占位符：

占位符|说明
--|--
{xboxid}|玩家绑定的xboxid

#### "member_already_in_allowlist"
* 消息触发条件：玩家的xboxid已经在服务器白名单内
* 支持的占位符：无

#### "target_member_not_bind"
* 消息触发条件：操作的目标玩家未绑定
* 支持的占位符：

占位符|说明
--|--
{member_qqid}|操作的目标玩家的QQ号码

#### "target_member_already_in_allowlist"
* 消息触发条件：目标玩家的xboxid已经在服务器白名单内
* 支持的占位符：

占位符|说明
--|--
{xboxid}|目标玩家绑定的xboxid

#### "target_member_unbind_succeeded"
* 消息触发条件：目标玩家解绑成功
* 支持的占位符：

占位符|说明
--|--
{xboxid}|目标玩家绑定的xboxid
{member_qqid}|操作的目标玩家的QQ号码