#!/usr/bin/env node

// 运行远程数据库迁移
console.log('🔧 运行远程数据库迁移');
console.log('========================\n');

const API_BASE_URL = 'https://1fbfby34gd.execute-api.us-east-2.amazonaws.com/dev';

async function runMigration() {
    console.log('🚀 发送迁移请求...');
    
    try {
        const response = await fetch(`${API_BASE_URL}/migrate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ 迁移成功！');
            console.log('📊 结果:', JSON.stringify(data, null, 2));
        } else {
            console.log('❌ 迁移失败');
            console.log('错误:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('❌ 请求失败:', error.message);
    }
}

runMigration(); 