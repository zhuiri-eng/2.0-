const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Payma支付配置
const PAYMA_CONFIG = {
    apiUrl: 'https://pay.payma.cn/',
    pid: '145297917',
    key: 'AeYM3mCbR1NK420b9MZAY105yEm2ccbu'
};

// 存储订单信息（实际项目中应使用数据库）
const orders = new Map();

// 日志记录函数
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
}

// 生成MD5签名
function generateMD5Sign(data) {
    try {
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
        
        log(`签名字符串: ${signStr}`, 'DEBUG');
        
        // 返回MD5哈希
        return crypto.createHash('md5').update(signStr, 'utf8').digest('hex');
    } catch (error) {
        log(`生成签名失败: ${error.message}`, 'ERROR');
        throw error;
    }
}

// 验证签名
function verifySign(data, sign) {
    try {
        const calculatedSign = generateMD5Sign(data);
        const isValid = calculatedSign.toLowerCase() === sign.toLowerCase();
        log(`签名验证: ${isValid ? '成功' : '失败'}`, isValid ? 'INFO' : 'WARN');
        return isValid;
    } catch (error) {
        log(`签名验证失败: ${error.message}`, 'ERROR');
        return false;
    }
}

// 创建支付订单
app.post('/api/create-payment', async (req, res) => {
    try {
        const { amount, orderName, orderId, paymentMethod } = req.body;

        log(`收到创建支付请求: ${JSON.stringify(req.body)}`, 'INFO');

        // 验证参数
        if (!amount || amount <= 0) {
            log('无效的支付金额', 'WARN');
            return res.status(400).json({
                success: false,
                message: '无效的支付金额'
            });
        }

        if (!orderName || !orderId) {
            log('缺少必要参数', 'WARN');
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }

        // 检查订单是否已存在
        if (orders.has(orderId)) {
            log(`订单已存在: ${orderId}`, 'WARN');
            return res.status(400).json({
                success: false,
                message: '订单号已存在，请使用不同的订单号'
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

        log(`构建支付参数: ${JSON.stringify(paymentData)}`, 'DEBUG');

        // 生成签名
        paymentData.sign = generateMD5Sign(paymentData);

        log(`发送请求到Payma: ${PAYMA_CONFIG.apiUrl}submit.php`, 'INFO');

        // 发送请求到Payma
        const response = await axios.post(PAYMA_CONFIG.apiUrl + 'submit.php', paymentData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'PaymentSystem/1.0'
            },
            timeout: 30000 // 30秒超时
        });

        log(`Payma响应: ${JSON.stringify(response.data)}`, 'DEBUG');

        // 解析响应
        if (response.data && response.data.code === 1) {
            // 存储订单信息
            const orderInfo = {
                ...paymentData,
                status: 'pending',
                createTime: new Date(),
                tradeNo: response.data.trade_no,
                originalResponse: response.data
            };
            orders.set(orderId, orderInfo);

            log(`支付订单创建成功: ${orderId}`, 'INFO');

            res.json({
                success: true,
                code: 1,
                msg: '支付订单创建成功',
                data: {
                    trade_no: response.data.trade_no,
                    out_trade_no: orderId,
                    money: amount,
                    pay_url: response.data.payurl,
                    qr_code: response.data.qrcode,
                    payment_method: paymentMethod
                }
            });
        } else {
            log(`Payma返回错误: ${response.data.msg || '未知错误'}`, 'ERROR');
            res.json({
                success: false,
                message: response.data.msg || '支付订单创建失败',
                error_code: response.data.code
            });
        }

    } catch (error) {
        log(`创建支付订单失败: ${error.message}`, 'ERROR');
        
        if (error.response) {
            log(`Payma API错误响应: ${JSON.stringify(error.response.data)}`, 'ERROR');
        }
        
        res.status(500).json({
            success: false,
            message: '服务器内部错误',
            error: process.env.NODE_ENV === 'development' ? error.message : '请稍后重试'
        });
    }
});

// 支付回调通知
app.post('/api/payment-notify', (req, res) => {
    try {
        const notifyData = req.body;
        log(`收到支付回调: ${JSON.stringify(notifyData)}`, 'INFO');

        // 验证签名
        if (!verifySign(notifyData, notifyData.sign)) {
            log('支付回调签名验证失败', 'ERROR');
            return res.send('fail');
        }

        const orderId = notifyData.out_trade_no;
        const order = orders.get(orderId);

        if (!order) {
            log(`支付回调订单不存在: ${orderId}`, 'ERROR');
            return res.send('fail');
        }

        // 检查订单状态，避免重复处理
        if (order.status === 'paid') {
            log(`订单已支付，跳过重复处理: ${orderId}`, 'WARN');
            return res.send('success');
        }

        // 更新订单状态
        order.status = 'paid';
        order.payTime = new Date();
        order.tradeNo = notifyData.trade_no;
        order.notifyData = notifyData;
        orders.set(orderId, order);

        log(`订单支付成功: ${orderId}, 交易号: ${notifyData.trade_no}`, 'INFO');

        // 这里可以添加业务逻辑，如发货、发送通知等
        // handlePaymentSuccess(order);

        res.send('success');

    } catch (error) {
        log(`处理支付回调失败: ${error.message}`, 'ERROR');
        res.send('fail');
    }
});

// 支付返回页面
app.get('/api/payment-return', (req, res) => {
    try {
        const returnData = req.query;
        log(`支付返回: ${JSON.stringify(returnData)}`, 'INFO');

        // 验证签名
        if (!verifySign(returnData, returnData.sign)) {
            log('支付返回签名验证失败', 'ERROR');
            return res.send('签名验证失败');
        }

        const orderId = returnData.out_trade_no;
        const order = orders.get(orderId);

        if (!order) {
            log(`支付返回订单不存在: ${orderId}`, 'ERROR');
            return res.send('订单不存在');
        }

        // 返回支付结果页面
        const isSuccess = returnData.trade_status === 'TRADE_SUCCESS';
        
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>支付结果</title>
                <style>
                    body { 
                        font-family: 'Microsoft YaHei', Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: linear-gradient(135deg, #0F1A3C 0%, #1a2a5e 100%);
                        color: #FFFFF0;
                        margin: 0;
                    }
                    .container {
                        max-width: 500px;
                        margin: 0 auto;
                        background: rgba(255, 255, 255, 0.1);
                        padding: 30px;
                        border-radius: 15px;
                        backdrop-filter: blur(10px);
                    }
                    .success { color: #4CAF50; }
                    .error { color: #f44336; }
                    .info { color: #D4AF37; }
                    .btn {
                        background: linear-gradient(45deg, #D4AF37, #FFD700);
                        border: none;
                        border-radius: 25px;
                        color: #0F1A3C;
                        padding: 12px 24px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        text-decoration: none;
                        display: inline-block;
                        margin: 10px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="${isSuccess ? 'success' : 'error'}">
                        ${isSuccess ? '✅ 支付成功！' : '❌ 支付失败'}
                    </h1>
                    <div class="info">
                        <p><strong>订单号:</strong> ${orderId}</p>
                        <p><strong>支付金额:</strong> ¥${order.money}</p>
                        <p><strong>商品名称:</strong> ${order.name}</p>
                        <p><strong>支付时间:</strong> ${new Date().toLocaleString()}</p>
                        ${isSuccess ? `<p><strong>交易号:</strong> ${returnData.trade_no || 'N/A'}</p>` : ''}
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <a href="/" class="btn">返回首页</a>
                        <button class="btn" onclick="window.close()">关闭页面</button>
                    </div>
                    
                    <script>
                        // 3秒后自动关闭页面
                        setTimeout(() => {
                            window.close();
                        }, 3000);
                    </script>
                </div>
            </body>
            </html>
        `);

    } catch (error) {
        log(`处理支付返回失败: ${error.message}`, 'ERROR');
        res.send('处理失败');
    }
});

// 查询订单状态
app.get('/api/order-status/:orderId', (req, res) => {
    try {
        const orderId = req.params.orderId;
        log(`查询订单状态: ${orderId}`, 'INFO');

        const order = orders.get(orderId);

        if (!order) {
            log(`订单不存在: ${orderId}`, 'WARN');
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
                name: order.name,
                createTime: order.createTime,
                payTime: order.payTime,
                tradeNo: order.tradeNo,
                paymentMethod: order.type
            }
        });

    } catch (error) {
        log(`查询订单状态失败: ${error.message}`, 'ERROR');
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
});

// 获取所有订单
app.get('/api/orders', (req, res) => {
    try {
        log('获取订单列表', 'INFO');
        
        const orderList = Array.from(orders.entries()).map(([orderId, order]) => ({
            orderId,
            status: order.status,
            amount: order.money,
            name: order.name,
            createTime: order.createTime,
            payTime: order.payTime,
            tradeNo: order.tradeNo,
            paymentMethod: order.type
        }));

        res.json({
            success: true,
            data: orderList,
            total: orderList.length
        });

    } catch (error) {
        log(`获取订单列表失败: ${error.message}`, 'ERROR');
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
        timestamp: new Date().toISOString(),
        config: {
            apiUrl: PAYMA_CONFIG.apiUrl,
            pid: PAYMA_CONFIG.pid,
            key: PAYMA_CONFIG.key ? '***' + PAYMA_CONFIG.key.slice(-4) : '未配置'
        },
        stats: {
            totalOrders: orders.size,
            pendingOrders: Array.from(orders.values()).filter(o => o.status === 'pending').length,
            paidOrders: Array.from(orders.values()).filter(o => o.status === 'paid').length
        }
    });
});

// 首页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'payment-system.html'));
});

// 启动服务器
app.listen(PORT, () => {
    log(`🚀 支付API服务器启动成功！`, 'INFO');
    log(`📍 服务地址: http://localhost:${PORT}`, 'INFO');
    log(`📋 API文档:`, 'INFO');
    log(`   - 首页: GET /`, 'INFO');
    log(`   - 创建支付: POST /api/create-payment`, 'INFO');
    log(`   - 支付回调: POST /api/payment-notify`, 'INFO');
    log(`   - 支付返回: GET /api/payment-return`, 'INFO');
    log(`   - 查询订单: GET /api/order-status/:orderId`, 'INFO');
    log(`   - 订单列表: GET /api/orders`, 'INFO');
    log(`   - 健康检查: GET /api/health`, 'INFO');
    log(`🔧 支付配置:`, 'INFO');
    log(`   - API地址: ${PAYMA_CONFIG.apiUrl}`, 'INFO');
    log(`   - 商户ID: ${PAYMA_CONFIG.pid}`, 'INFO');
    log(`   - 商户密钥: ***${PAYMA_CONFIG.key.slice(-4)}`, 'INFO');
});

module.exports = app; 