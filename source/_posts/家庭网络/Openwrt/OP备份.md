1. **`.vmx` 文件**  
    这是虚拟机的配置文件，包含了所有硬件和系统设置。
    
2. **虚拟磁盘文件（`.vmdk`）**  
    根据 `.vmx` 文件中的以下行进行配置：
    ```plaintext
    scsi0:0.fileName = "D:\VMWARES\OPENWRT\openwrt-gdq-v1[2024]-x86-64-generic-squashfs-uefi.img\openwrt-gdq-v1[2024]-x86-64-generic-squashfs-uefi.vmdk"
    ```
    
    需要更改指定路径 `D:\VMWARES\OPENWRT\openwrt-gdq-v1[2024]-x86-64-generic-squashfs-uefi.img\openwrt-gdq-v1[2024]-x86-64-generic-squashfs-uefi.vmdk` 中的 `.vmdk` 文件。
    
3. **其他相关文件（可选）**
    - **`.nvram` 文件**：存储虚拟机的 BIOS 设置。根据 `.vmx` 文件：
        ```plaintext
        nvram = "OPENWRT.nvram"
        ```     
        如果需要保留 BIOS 设置，也需要备份该文件。
            
    - **扩展配置文件（`.vmxf`）**：    如果存在该文件，建议一并备份。
        ```plaintext
        extendedConfigFile = "OPENWRT.vmxf"
        ```
    
	- **日志文件（`.log`）**：虽然日志文件不是必须备份的，但可以保留用于排查问题。
4. **其他可能的文件**  
    如果虚拟机使用了快照功能，还需要备份以下文件：
    
    - **`.vmsd` 文件**：存储快照信息。
        
    - **`.vmss` 文件**：存储虚拟机的挂起状态。