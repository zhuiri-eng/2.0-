const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Payma支付配置
const PAYMA_CONFIG = {
    apiUrl: 'https://pay.payma.cn/',
    pid: '145297917',
    key: '677g7etdq4GTqFB11e6bah1aEh1AbBmb'
};

// 存储订单信息（实际项目中应使用数据库）
const orders = new Map();

// 生成MD5签名
function generateMD5Sign(data) {
    // 按参数名排序
    const sortedKeys = Object.keys(data).filter(key => key !== 'sign' && key !== 'sign_type').sort();
    
    // 构建签名字符串
    let signStr = '';
    sortedKeys.forEach(key => {
        if (data[key] !== '' && data[key] != null) {
            signStr += key + '=' + data[key] + '&';
        }
    });
    
    // 添加密钥
    signStr += 'key=' + PAYMA_CONFIG.key;
    
    // 返回MD5哈希
    return crypto.createHash('md5').update(signStr).digest('hex');
}

// 验证签名
function verifySign(data, sign) {
    const calculatedSign = generateMD5Sign(data);
    return calculatedSign.toLowerCase() === sign.toLowerCase();
}

// 创建支付订单
app.post('/api/create-payment', async (req, res) => {
    try {
        const { amount, orderName, orderId, paymentMethod } = req.body;

        // 验证参数
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: '无效的支付金额'
            });
        }

        if (!orderName || !orderId) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }

        // 构建支付参数
        const paymentData = {
            pid: PAYMA_CONFIG.pid,
            type: paymentMethod || 'alipay',
            out_trade_no: orderId,
            notify_url: `${req.protocol}://${req.get('host')}/api/payment-notify`,
            return_url: `${req.protocol}://${req.get('host')}/api/payment-return`,
            name: orderName,
            money: amount,
            sign_type: 'MD5'
        };

        // 生成签名
        paymentData.sign = generateMD5Sign(paymentData);

        // 发送请求到Payma
        const response = await axios.post(PAYMA_CONFIG.apiUrl + 'submit.php', paymentData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // 解析响应
        if (response.data && response.data.code === 1) {
            // 存储订单信息
            orders.set(orderId, {
                ...paymentData,
                status: 'pending',
                createTime: new Date(),
                tradeNo: response.data.trade_no
            });

            res.json({
                success: true,
                code: 1,
                msg: '支付订单创建成功',
                data: {
                    trade_no: response.data.trade_no,
                    out_trade_no: orderId,
                    money: amount,
                    pay_url: response.data.payurl,
                    qr_code: response.data.qrcode
                }
            });
        } else {
            res.json({
                success: false,
                message: response.data.msg || '支付订单创建失败'
            });
        }

    } catch (error) {
        console.error('创建支付订单失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 支付回调通知
app.post('/api/payment-notify', (req, res) => {
    try {
        const notifyData = req.body;
        console.log('收到支付回调:', notifyData);

        // 验证签名
        if (!verifySign(notifyData, notifyData.sign)) {
            console.error('签名验证失败');
            return res.send('fail');
        }

        const orderId = notifyData.out_trade_no;
        const order = orders.get(orderId);

        if (!order) {
            console.error('订单不存在:', orderId);
            return res.send('fail');
        }

        // 更新订单状态
        order.status = 'paid';
        order.payTime = new Date();
        order.tradeNo = notifyData.trade_no;
        orders.set(orderId, order);

        console.log('订单支付成功:', orderId);

        // 这里可以添加业务逻辑，如发货、发送通知等
        // handlePaymentSuccess(order);

        res.send('success');

    } catch (error) {
        console.error('处理支付回调失败:', error);
        res.send('fail');
    }
});

// 支付返回页面
app.get('/api/payment-return', (req, res) => {
    try {
        const returnData = req.query;
        console.log('支付返回:', returnData);

        // 验证签名
        if (!verifySign(returnData, returnData.sign)) {
            return res.send('签名验证失败');
        }

        const orderId = returnData.out_trade_no;
        const order = orders.get(orderId);

        if (!order) {
            return res.send('订单不存在');
        }

        // 返回支付结果页面
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>支付结果</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .success { color: green; }
                    .error { color: red; }
                </style>
            </head>
            <body>
                <h1 class="success">✅ 支付成功！</h1>
                <p>订单号: ${orderId}</p>
                <p>支付金额: ¥${order.money}</p>
                <p>支付时间: ${new Date().toLocaleString()}</p>
                <script>
                    // 3秒后自动关闭页面
                    setTimeout(() => {
                        window.close();
                    }, 3000);
                </script>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('处理支付返回失败:', error);
        res.send('处理失败');
    }
});

// 查询订单状态
app.get('/api/order-status/:orderId', (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = orders.get(orderId);

        if (!order) {
            return res.json({
                success: false,
                message: '订单不存在'
            });
        }

        res.json({
            success: true,
            data: {
                orderId: orderId,
                status: order.status,
                amount: order.money,
                createTime: order.createTime,
                payTime: order.payTime,
                tradeNo: order.tradeNo
            }
        });

    } catch (error) {
        console.error('查询订单状态失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取所有订单
app.get('/api/orders', (req, res) => {
    try {
        const orderList = Array.from(orders.entries()).map(([orderId, order]) => ({
            orderId,
            status: order.status,
            amount: order.money,
            name: order.name,
            createTime: order.createTime,
            payTime: order.payTime,
            tradeNo: order.tradeNo
        }));

        res.json({
            success: true,
            data: orderList
        });

    } catch (error) {
        console.error('获取订单列表失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: '支付API服务正常运行',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 支付API服务器启动成功！`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`📋 API文档:`);
    console.log(`   - 创建支付: POST /api/create-payment`);
    console.log(`   - 支付回调: POST /api/payment-notify`);
    console.log(`   - 支付返回: GET /api/payment-return`);
    console.log(`   - 查询订单: GET /api/order-status/:orderId`);
    console.log(`   - 订单列表: GET /api/orders`);
    console.log(`   - 健康检查: GET /api/health`);
});

module.exports = app; 