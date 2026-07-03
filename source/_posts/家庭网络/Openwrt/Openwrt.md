---
参考备份: https://ruanluyou.net/ask/how-to-backup-and-restore-openwrt-configuration.html
AX3000T刷机: https://note.okhk.net/xiaomi-ax3000t-router-install-openwrt-immortalwrt
参考: https://zhuanlan.zhihu.com/p/662650136
网址对应PDF: "[[在 VMware 安装 OpenWrt 主路由.pdf]]"
---
---
## OP作主路由，VMWARES启动
1. lan口接路由器，wan口接光猫
2. 配置vmwares虚拟网络编辑器，更改设置，创建虚拟网卡VMnet，桥接模式下会与自己的实际物理网卡进行绑定
	- VMnet3：填写想要的子网IP，192.168.31.0，255.255.255.0，关闭DHCP
	- VMnet2：ASIX USB  桥接模式
	- VMnet0：USB2.0 Ethernet Adapter  桥接模式
	>注意USB2.0 Ethernet Adapter、ASIX USB为个人网口名称，请根据实际情况替换
	>eth0将作为lan口、eth1为wan口、eth2将作为虚拟机网落桥接接口
3. 转化OP固件
4. 创建虚拟机vmwares，选择固件
5. 设备添加刚刚配置好的虚拟网卡，VMwares会按顺序分配
	![[OP在VM中配置.png]]
	如图eth0就是VMnet3，以此类推，eth012对应VMnet320
6. 开启虚拟机，修改接口配置
	- 输入 `vi etc/config/network` 并回车 ，如下图lan口就是eth0和eth2桥接，其中eth2连接路由器（局域网）的接口，eth0是其他虚拟机Nas使用的网络
	- 输入`:wq`保存
	- 输入并回车 `service network restart` 或者`reboot`重启网络服务
	![[OP接口配置.png]]
7. 配置小米路由器，OP的lan口接入路由器的lan口，关闭DHCP，大功告成！ 

## 备份和恢复
- 系统 → 备份与恢复
## 相关概念

## 服务
- [[wireguard]]
- password
	- 节点
- [[HomeProxy]]
### 定时重启
[openwrt设置定时重启（天/周/月）_openwrt 定时重启-CSDN博客](https://blog.csdn.net/x_qingh/article/details/125508580)
1. 进入openwrt管理页面，找到“系统-计划任务”，编辑命令行，点击“保存”
2. “系统-启动项”中找到cron，确认状态为“开启”；点击“重启”使计划生效（或重启系统）。
3. 示例 
```sh
# 每天 3:05 重启，先 sleep 70 再重启
5 3 * * * sleep 70 && touch /etc/banner && reboot
```