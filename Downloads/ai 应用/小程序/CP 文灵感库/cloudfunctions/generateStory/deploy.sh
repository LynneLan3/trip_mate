#!/bin/bash

# 打包项目文件
tar -czf deploy.tar.gz \
    server.js \
    index.js \
    package.json \
    package-lock.json \
    .env.production \
    node_modules

# 上传到服务器
scp deploy.tar.gz root@47.119.21.92:/root/cp-story-generator/

# 执行远程部署命令
ssh root@47.119.21.92 << 'EOF'
    cd /root/cp-story-generator
    tar -xzf deploy.tar.gz
    mv .env.production .env
    npm install --production
    pm2 restart server.js || pm2 start server.js
EOF

# 清理本地打包文件
rm deploy.tar.gz
