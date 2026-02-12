#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 项目快速推送到 GitHub${NC}"
echo -e "${BLUE}========================================${NC}\n"

# 获取用户输入
echo -e "${YELLOW}请输入以下信息：${NC}\n"

# 1. 获取仓库URL
read -p "请输入你的 GitHub 仓库 URL (例如: https://github.com/用户名/dairay.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo -e "${RED}❌ 仓库 URL 不能为空！${NC}"
    exit 1
fi

# 2. 确认分支名
echo -e "\n${YELLOW}当前分支: add_wenjuanliebiao${NC}"
read -p "是否使用当前分支? (y/n, 默认 y): " USE_CURRENT
USE_CURRENT=${USE_CURRENT:-y}

if [ "$USE_CURRENT" = "n" ] || [ "$USE_CURRENT" = "N" ]; then
    read -p "请输入目标分支名 (默认: main): " TARGET_BRANCH
    TARGET_BRANCH=${TARGET_BRANCH:-main}
else
    TARGET_BRANCH="add_wenjuanliebiao"
fi

# 3. 确认提交信息
echo -e "\n${YELLOW}提交信息：${NC}"
DEFAULT_MSG="初始提交: 清理项目文件和文档整理"
read -p "请输入提交信息 (默认: '$DEFAULT_MSG'): " COMMIT_MSG
COMMIT_MSG=${COMMIT_MSG:-"$DEFAULT_MSG"}

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}📋 推送配置确认${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "仓库地址: ${GREEN}$REPO_URL${NC}"
echo -e "源分支:   ${GREEN}add_wenjuanliebiao${NC}"
echo -e "目标分支: ${GREEN}$TARGET_BRANCH${NC}"
echo -e "提交信息: ${GREEN}$COMMIT_MSG${NC}"
echo ""

read -p "确认继续? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo -e "${YELLOW}已取消操作${NC}"
    exit 0
fi

# 开始推送
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}📤 开始推送${NC}"
echo -e "${BLUE}========================================${NC}\n"

cd /Users/lanling/Downloads/app

# 1. 更新远程地址
echo -e "${YELLOW}1️⃣  更新远程仓库地址...${NC}"
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"
echo -e "${GREEN}✓ 远程地址已更新${NC}"

# 2. 检查状态
echo -e "\n${YELLOW}2️⃣  检查本地更改...${NC}"
git status --short | head -20
echo ""

# 3. 暂存所有更改
echo -e "${YELLOW}3️⃣  暂存文件...${NC}"
git add .
echo -e "${GREEN}✓ 文件已暂存${NC}"

# 4. 创建提交
echo -e "\n${YELLOW}4️⃣  创建本地提交...${NC}"
git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}⚠️  没有新的更改需要提交${NC}"

# 5. 推送到远程
echo -e "\n${YELLOW}5️⃣  推送到 GitHub...${NC}"
echo -e "${YELLOW}(这可能需要输入 GitHub token 或 SSH 密钥)${NC}\n"

if [ "$TARGET_BRANCH" = "add_wenjuanliebiao" ]; then
    git push origin add_wenjuanliebiao
else
    git push origin add_wenjuanliebiao:$TARGET_BRANCH
fi

PUSH_STATUS=$?

# 结果显示
echo -e "\n${BLUE}========================================${NC}"

if [ $PUSH_STATUS -eq 0 ]; then
    echo -e "${BLUE}✅ 推送成功！${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    echo -e "项目已保存到: ${GREEN}$REPO_URL${NC}"
    echo -e "访问地址:    ${GREEN}${REPO_URL%.git}${NC}"
    echo ""
    echo -e "📊 推送信息："
    echo -e "  源分支: add_wenjuanliebiao"
    echo -e "  目标分支: $TARGET_BRANCH"
    echo -e "  文件数: 101+"
    echo -e "  提交信息: $COMMIT_MSG"
else
    echo -e "${RED}❌ 推送失败！${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    echo -e "${YELLOW}可能的原因:${NC}"
    echo -e "  1. 仓库 URL 不正确"
    echo -e "  2. GitHub 身份验证失败"
    echo -e "  3. 网络连接问题"
    echo -e "  4. 仓库不存在或无权限"
    echo ""
    echo -e "${YELLOW}解决建议:${NC}"
    echo -e "  1. 检查仓库 URL: git remote -v"
    echo -e "  2. 确认 GitHub token 或 SSH 密钥"
    echo -e "  3. 查看详细错误信息（上方输出）"
    exit 1
fi

echo -e "${BLUE}========================================${NC}\n"
