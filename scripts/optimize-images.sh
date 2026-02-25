#!/bin/bash

# 图片优化脚本
# 使用 macOS 自带的 sips 工具压缩图片

# 配置
QUALITY=75  # JPEG 质量值 (1-100)
MAX_WIDTH=1920  # 最大宽度
MAX_HEIGHT=1920  # 最大高度

# 检查是否提供了图片目录参数
if [ -z "$1" ]; then
    echo "用法: $0 <图片目录>"
    echo "示例: $0 /Users/DingkeKong/Desktop/KDK/DTHBH/backend/src/main/resources/static/images"
    exit 1
fi

IMAGE_DIR="$1"

# 检查目录是否存在
if [ ! -d "$IMAGE_DIR" ]; then
    echo "错误: 目录不存在: $IMAGE_DIR"
    exit 1
fi

# 创建备份目录
BACKUP_DIR="${IMAGE_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
echo "创建备份目录: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 统计信息
TOTAL_FILES=0
OPTIMIZED_FILES=0
TOTAL_SIZE_BEFORE=0
TOTAL_SIZE_AFTER=0

# 遍历图片文件
echo "开始优化图片..."
echo "目录: $IMAGE_DIR"
echo "质量: $QUALITY"
echo "最大尺寸: ${MAX_WIDTH}x${MAX_HEIGHT}"
echo ""

for file in "$IMAGE_DIR"/*.{jpg,jpeg,JPG,JPEG,png,PNG}; do
    # 检查文件是否存在（避免通配符无匹配时的错误）
    if [ ! -f "$file" ]; then
        continue
    fi

    # 获取文件名
    filename=$(basename "$file")
    TOTAL_FILES=$((TOTAL_FILES + 1))

    # 获取文件大小（字节）
    size_before=$(stat -f%z "$file")
    TOTAL_SIZE_BEFORE=$((TOTAL_SIZE_BEFORE + size_before))

    echo "[$TOTAL_FILES] 处理: $filename"

    # 备份原始文件
    cp "$file" "$BACKUP_DIR/"

    # 使用 sips 压缩图片
    # sips 命令选项:
    # -s formatOptions $QUALITY: 设置 JPEG 质量
    # -Z $MAX_WIDTH: 将最大边调整为指定像素（保持宽高比）
    sips -s formatOptions $QUALITY -Z $MAX_WIDTH "$file" > /dev/null 2>&1

    # 获取优化后的文件大小
    size_after=$(stat -f%z "$file")
    TOTAL_SIZE_AFTER=$((TOTAL_SIZE_AFTER + size_after))

    # 计算节省的空间
    saved=$((size_before - size_after))
    saved_percent=$((saved * 100 / size_before))

    echo "  原始大小: $((size_before / 1024)) KB"
    echo "  优化后大小: $((size_after / 1024)) KB"
    echo "  节省: $((saved / 1024)) KB ($saved_percent%)"
    echo ""

    OPTIMIZED_FILES=$((OPTIMIZED_FILES + 1))
done

# 输出统计信息
echo "======================================"
echo "优化完成！"
echo "======================================"
echo "处理文件数: $OPTIMIZED_FILES / $TOTAL_FILES"
echo "原始总大小: $((TOTAL_SIZE_BEFORE / 1024 / 1024)) MB"
echo "优化后总大小: $((TOTAL_SIZE_AFTER / 1024 / 1024)) MB"
echo "总共节省: $(((TOTAL_SIZE_BEFORE - TOTAL_SIZE_AFTER) / 1024 / 1024)) MB"
echo "备份位置: $BACKUP_DIR"
echo ""

if [ $OPTIMIZED_FILES -eq 0 ]; then
    echo "警告: 未找到任何图片文件！"
    echo "请检查目录路径是否正确。"
fi