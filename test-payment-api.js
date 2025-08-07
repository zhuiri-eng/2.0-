const axios = require('axios');

// 测试配置
const API_BASE_URL = 'http://localhost:3000';
const TEST_ORDER = {
    amount: '0.01',
    orderName: 'API测试商品',
    orderId: `TEST${Date.now()}`,
    paymentMethod: 'alipay'
};

// 测试函数
async function testPaymentAPI() {
    console.log('🚀 开始测试支付API...\n');

    try {
        // 1. 测试健康检查
        console.log('1️⃣ 测试健康检查...');
        const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
        console.log('✅ 健康检查通过:', healthResponse.data.message);
        console.log('📊 系统状态:', healthResponse.data.stats);
        console.log('');

        // 2. 测试创建支付订单
        console.log('2️⃣ 测试创建支付订单...');
        const paymentResponse = await axios.post(`${API_BASE_URL}/api/create-payment`, TEST_ORDER, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (paymentResponse.data.success) {
            console.log('✅ 支付订单创建成功!');
            console.log('📋 订单信息:');
            console.log(`   订单号: ${paymentResponse.data.data.out_trade_no}`);
            console.log(`   交易号: ${paymentResponse.data.data.trade_no}`);
            console.log(`   金额: ¥${paymentResponse.data.data.money}`);
            console.log(`   支付链接: ${paymentResponse.data.data.pay_url}`);
            console.log('');

            // 3. 测试查询订单状态
            console.log('3️⃣ 测试查询订单状态...');
            const statusResponse = await axios.get(`${API_BASE_URL}/api/order-status/${TEST_ORDER.orderId}`);
            if (statusResponse.data.success) {
                console.log('✅ 订单状态查询成功!');
                console.log(`📊 订单状态: ${statusResponse.data.data.status}`);
            } else {
                console.log('❌ 订单状态查询失败:', statusResponse.data.message);
            }
            console.log('');

            // 4. 测试获取订单列表
            console.log('4️⃣ 测试获取订单列表...');
            const ordersResponse = await axios.get(`${API_BASE_URL}/api/orders`);
            if (ordersResponse.data.success) {
                console.log('✅ 订单列表获取成功!');
                console.log(`📊 总订单数: ${ordersResponse.data.total}`);
                console.log(`📋 最新订单: ${ordersResponse.data.data[0]?.orderId || '无'}`);
            } else {
                console.log('❌ 订单列表获取失败:', ordersResponse.data.message);
            }

        } else {
            console.log('❌ 支付订单创建失败:', paymentResponse.data.message);
        }

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 提示: 请确保支付API服务器已启动 (npm start)');
        }
        
        if (error.response) {
            console.log('📋 错误详情:', error.response.data);
        }
    }

    console.log('\n🏁 测试完成!');
}

// 运行测试
if (require.main === module) {
    testPaymentAPI();
}

module.exports = { testPaymentAPI }; 