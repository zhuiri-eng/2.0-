// 全局变量
let selectedTime = '';
let currentSpread = 'three';
let isLunar = false;

// 天干地支数据
const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const fiveElements = ['木', '火', '土', '金', '水'];
const tenGods = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '七杀', '正官', '偏印', '正印'];

// 五行相生相克关系
const elementRelations = {
    '木': { '生': '火', '克': '土', '被生': '水', '被克': '金' },
    '火': { '生': '土', '克': '金', '被生': '木', '被克': '水' },
    '土': { '生': '金', '克': '水', '被生': '火', '被克': '木' },
    '金': { '生': '水', '克': '木', '被生': '土', '被克': '火' },
    '水': { '生': '木', '克': '火', '被生': '金', '被克': '土' }
};

// 塔罗牌数据
const tarotCards = [
    { name: '愚者', element: '风', meaning: '新的开始、冒险、纯真', reversed: '鲁莽、不负责任' },
    { name: '魔术师', element: '风', meaning: '创造力、技能、意志力', reversed: '技能不足、机会错失' },
    { name: '女祭司', element: '水', meaning: '直觉、神秘、内在知识', reversed: '隐藏的动机、表面性' },
    { name: '女皇', element: '土', meaning: '丰收、母性、自然', reversed: '依赖、过度保护' },
    { name: '皇帝', element: '火', meaning: '权威、领导、稳定', reversed: '专制、僵化' },
    { name: '教皇', element: '土', meaning: '传统、教育、信仰', reversed: '教条、限制' },
    { name: '恋人', element: '风', meaning: '爱情、和谐、选择', reversed: '不和谐、分离' },
    { name: '战车', element: '水', meaning: '胜利、意志力、决心', reversed: '失控、失败' },
    { name: '力量', element: '火', meaning: '勇气、耐心、控制', reversed: '软弱、缺乏信心' },
    { name: '隐者', element: '土', meaning: '内省、寻找、指导', reversed: '孤独、拒绝帮助' },
    { name: '命运之轮', element: '火', meaning: '变化、命运、转折', reversed: '坏运气、停滞' },
    { name: '正义', element: '风', meaning: '平衡、正义、真理', reversed: '不公、偏见' },
    { name: '倒吊人', element: '水', meaning: '牺牲、暂停、新视角', reversed: '徒劳、延迟' },
    { name: '死神', element: '水', meaning: '结束、转变、重生', reversed: '停滞、无法放手' },
    { name: '节制', element: '火', meaning: '平衡、适度、耐心', reversed: '过度、不平衡' },
    { name: '恶魔', element: '土', meaning: '束缚、欲望、物质', reversed: '释放、摆脱束缚' },
    { name: '塔', element: '火', meaning: '突然变化、混乱、启示', reversed: '避免灾难、重建' },
    { name: '星星', element: '风', meaning: '希望、信心、灵感', reversed: '失望、缺乏信心' },
    { name: '月亮', element: '水', meaning: '直觉、幻想、恐惧', reversed: '释放恐惧、内在混乱' },
    { name: '太阳', element: '火', meaning: '成功、活力、快乐', reversed: '暂时的抑郁、缺乏信心' },
    { name: '审判', element: '火', meaning: '重生、内在呼唤、释放', reversed: '自我怀疑、拒绝改变' },
    { name: '世界', element: '土', meaning: '完成、整合、成就', reversed: '未完成、延迟' }
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    setupStarfield();
    setupParticles();
}

// 设置事件监听器
function setupEventListeners() {
    // 综合测算按钮
    const startCalculationBtn = document.getElementById('startCalculation');
    if (startCalculationBtn) {
        startCalculationBtn.addEventListener('click', startComprehensiveCalculation);
    }

    // 自动定位
    const autoLocationBtn = document.getElementById('autoLocation');
    if (autoLocationBtn) {
        autoLocationBtn.addEventListener('click', getCurrentLocation);
    }

    // 导出和分享
    const exportPDFBtn = document.getElementById('exportPDF');
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', exportToPDF);
    }
    
    const shareResultBtn = document.getElementById('shareResult');
    if (shareResultBtn) {
        shareResultBtn.addEventListener('click', shareResult);
    }
}

// 标签切换
function switchTab(tabName) {
    // 移除所有活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // 添加活动状态
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// 时辰选择
function selectTime(time) {
    selectedTime = time;
    document.querySelectorAll('.branch-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-time="${time}"]`).classList.add('selected');
}

// 农历切换
function toggleCalendar() {
    isLunar = !isLunar;
    const indicator = document.querySelector('.lunar-indicator');
    indicator.textContent = isLunar ? '公历' : '农历';
}

// 自动定位
function getCurrentLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                reverseGeocode(latitude, longitude);
                hideLoading();
            },
            error => {
                console.error('定位失败:', error);
                hideLoading();
                alert('无法获取当前位置，请手动输入');
            }
        );
    } else {
        alert('您的浏览器不支持地理定位');
    }
}

// 反向地理编码
function reverseGeocode(lat, lng) {
    // 这里可以调用地图API进行反向地理编码
    // 暂时使用模拟数据
    const places = ['北京市', '上海市', '广州市', '深圳市', '杭州市'];
    const randomPlace = places[Math.floor(Math.random() * places.length)];
    document.getElementById('birthPlace').value = randomPlace;
}

// 八字计算
function calculateBazi() {
    const birthDate = document.getElementById('birthDate').value;
    const birthPlace = document.getElementById('birthPlace').value;

    if (!birthDate || !selectedTime || !birthPlace) {
        alert('请填写完整的出生信息');
        return;
    }

    showLoading();
    
    // 模拟计算延迟
    setTimeout(() => {
        const bazi = calculateBaziChart(birthDate, selectedTime);
        displayBaziResult(bazi);
        hideLoading();
        createParticleEffect();
    }, 2000);
}

// 计算八字排盘
function calculateBaziChart(birthDate, birthTime) {
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 简化的八字计算算法
    const yearStem = heavenlyStems[year % 10];
    const yearBranch = earthlyBranches[year % 12];
    
    const monthStem = heavenlyStems[(year * 12 + month) % 10];
    const monthBranch = earthlyBranches[month % 12];
    
    const dayStem = heavenlyStems[Math.floor((year * 365 + month * 30 + day) % 10)];
    const dayBranch = earthlyBranches[Math.floor((year * 365 + month * 30 + day) % 12)];
    
    const timeIndex = earthlyBranches.indexOf(birthTime);
    const hourStem = heavenlyStems[(Math.floor((year * 365 + month * 30 + day) % 10) * 2 + timeIndex) % 10];
    const hourBranch = birthTime;
    
    return {
        year: { stem: yearStem, branch: yearBranch },
        month: { stem: monthStem, branch: monthBranch },
        day: { stem: dayStem, branch: dayBranch },
        hour: { stem: hourStem, branch: hourBranch }
    };
}

// 显示八字结果
function displayBaziResult(bazi) {
    // 填充八字排盘
    const elements = [
        { id: 'yearStem', value: bazi.year.stem },
        { id: 'yearBranch', value: bazi.year.branch },
        { id: 'monthStem', value: bazi.month.stem },
        { id: 'monthBranch', value: bazi.month.branch },
        { id: 'dayStem', value: bazi.day.stem },
        { id: 'dayBranch', value: bazi.day.branch },
        { id: 'hourStem', value: bazi.hour.stem },
        { id: 'hourBranch', value: bazi.hour.branch }
    ];
    
    elements.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            el.textContent = element.value;
        }
    });
}

// 获取藏干
function getHiddenGods(stem, branch) {
    const hiddenGodsMap = {
        '子': '癸', '丑': '己辛癸', '寅': '甲丙戊', '卯': '乙',
        '辰': '戊乙癸', '巳': '丙庚戊', '午': '丁己', '未': '己丁乙',
        '申': '庚壬戊', '酉': '辛', '戌': '戊辛丁', '亥': '壬甲'
    };
    return hiddenGodsMap[branch] || '';
}

// 生成解读
function generateInterpretation(bazi) {
    const mingjuContent = `
        <p><strong>日主分析：</strong>您的日主为${bazi.day.stem}，属于${getElement(bazi.day.stem)}命。</p>
        <p><strong>命局特点：</strong>${getMingjuAnalysis(bazi)}</p>
        <p><strong>五行分析：</strong>${getFiveElementsAnalysis(bazi)}</p>
    `;
    
    const dayunContent = `
        <p><strong>大运走势：</strong>${getDayunAnalysis(bazi)}</p>
        <p><strong>流年运势：</strong>${getLiunianAnalysis(bazi)}</p>
    `;
    
    const suggestionsContent = `
        <p><strong>事业建议：</strong>${getCareerAdvice(bazi)}</p>
        <p><strong>健康建议：</strong>${getHealthAdvice(bazi)}</p>
        <p><strong>人际关系：</strong>${getRelationshipAdvice(bazi)}</p>
    `;
    
    const mingjuEl = document.getElementById('mingjuContent');
    if (mingjuEl) mingjuEl.innerHTML = mingjuContent;
    
    const dayunEl = document.getElementById('dayunContent');
    if (dayunEl) dayunEl.innerHTML = dayunContent;
    
    const suggestionsEl = document.getElementById('suggestionsContent');
    if (suggestionsEl) suggestionsEl.innerHTML = suggestionsContent;
}

// 获取五行属性
function getElement(stem) {
    const elementMap = {
        '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
        '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
    };
    return elementMap[stem] || '未知';
}

// 命局分析
function getMingjuAnalysis(bazi) {
    const analyses = [
        `此命局五行较为平衡，属于"中和之命"。日主${bazi.day.stem}坐${bazi.day.branch}，形成"${getElement(bazi.day.stem)}${getElement(bazi.day.branch)}相生"之象，性格温和内敛，适应能力强，具有"随遇而安"的特质。命局中天干地支配合得当，属于"清贵之格"，一生贵人运旺。`,
        `命局中火土较旺，形成"火土相生"之势。日主${bazi.day.stem}得令而旺，性格热情奔放，具有"火性"的积极进取精神。做事有毅力，属于"实干型"人才。但需注意火旺易燥，建议修身养性，保持内心平和。`,
        `金水相生，思维敏捷，善于沟通表达。日主${bazi.day.stem}与月令${bazi.month.stem}形成"金水相涵"之象，具有"水主智"的聪明才智。适合从事文教、传媒、咨询等行业，属于"智慧型"人才。但需防范"水多金沉"，注意情绪管理。`,
        `木火通明，富有创造力，适合艺术类工作。日主${bazi.day.stem}与年干${bazi.year.stem}形成"木火相生"之局，具有"木主仁"的善良本性和"火主礼"的文明素养。适合从事创意设计、文化艺术、教育培训等行业，属于"灵感型"人才。`,
        `土金相生，稳重踏实，适合管理类工作。日主${bazi.day.stem}与时辰${bazi.hour.stem}形成"土金相生"之象，具有"土主信"的诚信品质和"金主义"的正义感。适合从事行政管理、金融投资、法律咨询等行业，属于"稳健型"人才。`
    ];
    return analyses[Math.floor(Math.random() * analyses.length)];
}

// 五行分析
function getFiveElementsAnalysis(bazi) {
    const elementCounts = {
        '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
    };
    
    // 统计天干五行
    [bazi.year.stem, bazi.month.stem, bazi.day.stem, bazi.hour.stem].forEach(stem => {
        elementCounts[getElement(stem)]++;
    });
    
    // 统计地支五行
    [bazi.year.branch, bazi.month.branch, bazi.day.branch, bazi.hour.branch].forEach(branch => {
        const hidden = getHiddenGods('', branch);
        if (hidden) {
            hidden.split('').forEach(char => {
                if (getElement(char)) elementCounts[getElement(char)]++;
            });
        }
    });
    
    const dominantElement = Object.keys(elementCounts).reduce((a, b) => elementCounts[a] > elementCounts[b] ? a : b);
    const weakElement = Object.keys(elementCounts).reduce((a, b) => elementCounts[a] < elementCounts[b] ? a : b);
    
    const elementDescriptions = {
        '木': '木主仁，代表生长、发展、创新。木旺之人性格直爽，富有同情心，但易冲动。',
        '火': '火主礼，代表热情、活力、光明。火旺之人性格开朗，领导能力强，但易急躁。',
        '土': '土主信，代表稳重、包容、诚信。土旺之人性格踏实，责任心强，但易固执。',
        '金': '金主义，代表果断、正义、坚韧。金旺之人性格刚毅，执行力强，但易刚愎。',
        '水': '水主智，代表智慧、灵活、适应。水旺之人思维敏捷，适应力强，但易善变。'
    };
    
    const balanceAdvice = {
        '木': '建议多接触金属制品，佩戴白色饰品，选择白色、金色系服装，有助于平衡木气。',
        '火': '建议多接触水元素，佩戴黑色饰品，选择蓝色、黑色系服装，有助于平衡火气。',
        '土': '建议多接触木元素，佩戴绿色饰品，选择绿色系服装，有助于平衡土气。',
        '金': '建议多接触火元素，佩戴红色饰品，选择红色系服装，有助于平衡金气。',
        '水': '建议多接触土元素，佩戴黄色饰品，选择黄色、棕色系服装，有助于平衡水气。'
    };
    
    return `通过深入分析您的八字，发现五行分布呈现"${dominantElement}旺${weakElement}弱"的特点。${elementDescriptions[dominantElement]}当前命局中${dominantElement}气过旺，建议在生活中注意五行平衡，${balanceAdvice[dominantElement]}同时可以多食用对应五行的食物来调节身体平衡。`;
}

// 大运分析
function getDayunAnalysis(bazi) {
    const dayunPhases = [
        {
            age: '0-10岁',
            description: '童年时期，家庭环境对您影响深远。此阶段属于"根基期"，建议培养良好的学习习惯和品德修养。',
            advice: '家长应注重孩子的品德教育，培养其独立性和责任感。'
        },
        {
            age: '10-20岁',
            description: '青少年时期，学业运势较旺。此阶段属于"成长期"，是知识积累和能力培养的关键期。',
            advice: '专注学业发展，同时培养兴趣爱好，为未来发展奠定基础。'
        },
        {
            age: '20-30岁',
            description: '青年时期，事业起步阶段。此阶段属于"探索期"，适合尝试不同领域，寻找人生方向。',
            advice: '勇于尝试，不怕失败，积累经验，建立人脉关系。'
        },
        {
            age: '30-40岁',
            description: '壮年时期，事业发展的黄金期。此阶段属于"发展期"，运势渐入佳境，适合大展宏图。',
            advice: '把握机遇，专注核心业务，建立事业基础，注意身体健康。'
        },
        {
            age: '40-50岁',
            description: '中年时期，事业稳定发展。此阶段属于"成熟期"，经验丰富，适合扩大事业规模。',
            advice: '稳健发展，注重团队建设，培养接班人，平衡工作与生活。'
        },
        {
            age: '50-60岁',
            description: '中老年时期，事业达到顶峰。此阶段属于"收获期"，享受前期努力的成果。',
            advice: '适度放权，享受生活，注重养生，为退休生活做准备。'
        },
        {
            age: '60岁以后',
            description: '老年时期，安享晚年。此阶段属于"颐养期"，享受天伦之乐，传承智慧。',
            advice: '保持积极心态，适度运动，与家人朋友保持联系，传承人生经验。'
        }
    ];
    
    const currentAge = 25; // 假设当前年龄
    const currentPhase = dayunPhases.find(phase => {
        const [start, end] = phase.age.split('-').map(age => parseInt(age.replace('岁', '')));
        return currentAge >= start && currentAge <= end;
    }) || dayunPhases[3];
    
    return `根据您的八字推算，大运走势呈现"${currentPhase.description}"。当前正处于"${currentPhase.age}"阶段，${currentPhase.advice}未来10年运势总体向好，建议把握机遇，在事业上有所突破。特别提醒：${currentPhase.age}是人生的重要转折点，需要认真规划，为下一个大运期做好准备。`;
}

// 流年分析
function getLiunianAnalysis(bazi) {
    const currentYear = new Date().getFullYear();
    const yearElements = {
        2024: { element: '木', description: '甲辰年，木龙年', fortune: '木旺之年，适合发展创新项目，但需注意情绪管理' },
        2025: { element: '火', description: '乙巳年，火蛇年', fortune: '火旺之年，事业运势强劲，但需防范冲动决策' },
        2026: { element: '土', description: '丙午年，土马年', fortune: '土旺之年，稳定发展期，适合巩固基础' },
        2027: { element: '金', description: '丁未年，金羊年', fortune: '金旺之年，收获期到来，但需注意人际关系' },
        2028: { element: '水', description: '戊申年，水猴年', fortune: '水旺之年，思维活跃，适合学习进修' }
    };
    
    const yearInfo = yearElements[currentYear] || yearElements[2024];
    const dayElement = getElement(bazi.day.stem);
    
    // 分析流年与日主的五行关系
    let relationship = '';
    if (yearInfo.element === dayElement) {
        relationship = '比劫之年，竞争激烈，需要加倍努力才能脱颖而出。';
    } else if ((yearInfo.element === '木' && dayElement === '火') || 
               (yearInfo.element === '火' && dayElement === '土') ||
               (yearInfo.element === '土' && dayElement === '金') ||
               (yearInfo.element === '金' && dayElement === '水') ||
               (yearInfo.element === '水' && dayElement === '木')) {
        relationship = '印绶之年，贵人运旺，适合学习进修，提升自我。';
    } else if ((yearInfo.element === '火' && dayElement === '木') ||
               (yearInfo.element === '土' && dayElement === '火') ||
               (yearInfo.element === '金' && dayElement === '土') ||
               (yearInfo.element === '水' && dayElement === '金') ||
               (yearInfo.element === '木' && dayElement === '水')) {
        relationship = '食伤之年，创造力强，适合发挥才能，但需注意情绪波动。';
    } else if ((yearInfo.element === '土' && dayElement === '木') ||
               (yearInfo.element === '金' && dayElement === '火') ||
               (yearInfo.element === '水' && dayElement === '土') ||
               (yearInfo.element === '木' && dayElement === '金') ||
               (yearInfo.element === '火' && dayElement === '水')) {
        relationship = '财星之年，财运较旺，适合投资理财，但需谨慎决策。';
    } else {
        relationship = '官杀之年，压力较大，需要调整心态，保持积极向上。';
    }
    
    const monthlyAdvice = {
        '春季': '春季木旺，适合开始新项目，但需注意细节把控。',
        '夏季': '夏季火旺，事业运势强劲，适合扩大规模，但需防范冲动。',
        '秋季': '秋季金旺，收获期到来，适合总结反思，为来年做准备。',
        '冬季': '冬季水旺，思维活跃，适合学习进修，提升自我。'
    };
    
    const currentMonth = new Date().getMonth();
    let season = '';
    if (currentMonth >= 2 && currentMonth <= 4) season = '春季';
    else if (currentMonth >= 5 && currentMonth <= 7) season = '夏季';
    else if (currentMonth >= 8 && currentMonth <= 10) season = '秋季';
    else season = '冬季';
    
    return `${currentYear}年${yearInfo.description}，${yearInfo.fortune}。从八字流年分析来看，${relationship}${monthlyAdvice[season]}建议您在今年重点关注个人成长和事业发展，同时注意身体健康和情绪管理。`;
}

// 事业建议
function getCareerAdvice(bazi) {
    const dayElement = getElement(bazi.day.stem);
    const careerAdvice = {
        '木': {
            suitable: ['教育行业', '文化传媒', '出版印刷', '环保绿化', '林业农业', '服装纺织', '家具制造', '医药健康'],
            strengths: '具有创新思维和领导能力，善于沟通协调，富有同情心和正义感',
            advice: '建议选择能够发挥创造力和领导才能的行业，注重团队合作，培养管理能力。适合担任教师、编辑、设计师、环保工作者等职业。',
            development: '在事业发展中，应注重知识更新和技能提升，建立良好的人际关系网络，培养战略思维。'
        },
        '火': {
            suitable: ['科技互联网', '电力能源', '餐饮娱乐', '广告营销', '影视传媒', '照明电器', '化工制造', '美容美发'],
            strengths: '具有热情活力和领导魅力，善于表达和沟通，富有创造力和执行力',
            advice: '建议选择能够发挥热情和创造力的行业，注重品牌建设和市场推广。适合担任销售经理、市场总监、创意总监、企业家等职业。',
            development: '在事业发展中，应控制冲动情绪，培养耐心和细致，注重长期规划和可持续发展。'
        },
        '土': {
            suitable: ['房地产建筑', '金融投资', '保险理财', '物流运输', '仓储管理', '陶瓷建材', '农业种植', '政府机关'],
            strengths: '具有稳重踏实的性格，责任心强，善于管理和协调，注重细节和品质',
            advice: '建议选择能够发挥稳重和诚信特质的行业，注重风险控制和品质管理。适合担任项目经理、财务总监、行政主管、公务员等职业。',
            development: '在事业发展中，应保持开放心态，接受新事物，培养创新思维，避免过于保守。'
        },
        '金': {
            suitable: ['金融证券', '珠宝首饰', '机械制造', '汽车工业', 'IT技术', '法律咨询', '审计会计', '军警安保'],
            strengths: '具有果断坚韧的性格，执行力强，善于分析和决策，注重效率和品质',
            advice: '建议选择能够发挥专业能力和执行力的行业，注重技术提升和职业认证。适合担任工程师、律师、会计师、技术总监等职业。',
            development: '在事业发展中，应培养团队合作精神，改善人际关系，注重沟通技巧，避免过于刚硬。'
        },
        '水': {
            suitable: ['航运物流', '旅游酒店', '贸易进出口', '咨询顾问', '教育培训', '媒体传播', '科研机构', '外交事务'],
            strengths: '具有灵活适应能力，思维敏捷，善于沟通和协调，富有智慧和洞察力',
            advice: '建议选择能够发挥智慧和沟通能力的行业，注重知识积累和专业技能。适合担任咨询师、培训师、记者、外交官等职业。',
            development: '在事业发展中，应培养专注力和执行力，避免过于善变，注重长期规划和目标坚持。'
        }
    };
    
    const advice = careerAdvice[dayElement];
    return `根据您的${dayElement}命特点，${advice.strengths}。${advice.advice}${advice.development}推荐行业：${advice.suitable.join('、')}。在职业发展中，建议您充分发挥自身优势，同时注意弥补不足，实现事业与个人价值的双赢。`;
}

// 健康建议
function getHealthAdvice(bazi) {
    const dayElement = getElement(bazi.day.stem);
    const healthAdvice = {
        '木': {
            focus: '肝胆系统',
            symptoms: '易出现肝胆问题、情绪波动、头痛失眠、眼睛疲劳',
            diet: '多食用绿色蔬菜、酸味食物，如菠菜、芹菜、柠檬、醋等',
            exercise: '适合户外运动、瑜伽、太极、慢跑等温和运动',
            lifestyle: '保持规律作息，避免熬夜，多接触大自然，保持心情舒畅',
            warning: '注意情绪管理，避免过度劳累，定期检查肝功能'
        },
        '火': {
            focus: '心血管系统',
            symptoms: '易出现心火旺盛、血压问题、失眠多梦、口舌生疮',
            diet: '多食用苦味食物、红色食物，如苦瓜、莲子、红豆、西红柿等',
            exercise: '适合游泳、慢跑、太极拳等有氧运动',
            lifestyle: '保持心情平和，避免过度兴奋，注意休息，培养耐心',
            warning: '控制情绪波动，避免过度劳累，定期检查心血管健康'
        },
        '土': {
            focus: '脾胃系统',
            symptoms: '易出现脾胃虚弱、消化不良、肥胖、水肿',
            diet: '多食用黄色食物、甘味食物，如南瓜、玉米、蜂蜜、红枣等',
            exercise: '适合散步、健走、气功等温和运动',
            lifestyle: '规律饮食，细嚼慢咽，保持心情稳定，避免过度思虑',
            warning: '注意饮食卫生，避免暴饮暴食，定期检查消化系统'
        },
        '金': {
            focus: '呼吸系统',
            symptoms: '易出现呼吸道问题、皮肤干燥、便秘、免疫力下降',
            diet: '多食用白色食物、辛味食物，如白萝卜、梨、大蒜、生姜等',
            exercise: '适合跑步、游泳、深呼吸练习等有氧运动',
            lifestyle: '保持室内空气清新，多喝水，注意保暖，增强免疫力',
            warning: '避免吸烟，注意空气质量，定期检查呼吸系统'
        },
        '水': {
            focus: '泌尿系统',
            symptoms: '易出现肾虚、腰酸背痛、水肿、记忆力下降',
            diet: '多食用黑色食物、咸味食物，如黑豆、海带、紫菜、核桃等',
            exercise: '适合游泳、瑜伽、太极等柔和水性运动',
            lifestyle: '保持充足睡眠，避免过度劳累，多喝水，保持心情平静',
            warning: '注意保暖，避免受寒，定期检查肾功能'
        }
    };
    
    const advice = healthAdvice[dayElement];
    return `根据您的${dayElement}命特点，需要重点关注${advice.focus}。${advice.symptoms}。饮食建议：${advice.diet}。运动建议：${advice.exercise}。生活方式：${advice.lifestyle}。健康提醒：${advice.warning}。建议您建立健康的生活方式，定期体检，保持身心平衡。`;
}

// 人际关系建议
function getRelationshipAdvice(bazi) {
    const dayElement = getElement(bazi.day.stem);
    const relationshipAdvice = {
        '木': {
            personality: '性格直爽，富有同情心，善于沟通协调，具有领导才能',
            strengths: '待人真诚，乐于助人，具有正义感，容易获得他人信任',
            challenges: '有时过于直率，容易得罪人，情绪波动较大，需要学会控制',
            compatibility: '与火命人相处融洽，与金命人互补性强，与土命人需要包容',
            advice: '在人际交往中，应学会委婉表达，控制情绪，培养耐心，建立长期友谊',
            social: '适合参加团队活动，担任组织者角色，在群体中发挥领导作用'
        },
        '火': {
            personality: '性格热情开朗，善于表达，具有感染力，容易成为焦点',
            strengths: '热情大方，乐于分享，具有魅力，能够带动他人积极性',
            challenges: '有时过于冲动，情绪化严重，容易与人产生冲突，需要学会冷静',
            compatibility: '与土命人相处稳定，与木命人相互促进，与水命人需要理解',
            advice: '在人际交往中，应学会倾听他人，控制冲动，培养耐心，建立深度关系',
            social: '适合参加社交活动，担任活跃分子，在群体中发挥带动作用'
        },
        '土': {
            personality: '性格稳重踏实，责任心强，善于包容，具有亲和力',
            strengths: '诚实可靠，值得信赖，善于调解矛盾，能够维护和谐关系',
            challenges: '有时过于保守，缺乏灵活性，容易固执己见，需要学会变通',
            compatibility: '与水命人相处和谐，与火命人相互支持，与金命人需要沟通',
            advice: '在人际交往中，应保持开放心态，接受不同观点，培养灵活性，建立信任关系',
            social: '适合担任调解者角色，在群体中发挥稳定作用，建立长期友谊'
        },
        '金': {
            personality: '性格果断坚韧，执行力强，注重效率，具有专业精神',
            strengths: '言而有信，做事认真，具有专业能力，容易获得他人尊重',
            challenges: '有时过于刚硬，缺乏灵活性，容易给人压力，需要学会柔和',
            compatibility: '与木命人互补性强，与土命人需要理解，与水命人相互促进',
            advice: '在人际交往中，应学会表达关心，培养亲和力，注重沟通技巧，建立互信关系',
            social: '适合担任专业顾问角色，在群体中发挥指导作用，建立专业关系'
        },
        '水': {
            personality: '性格灵活适应，思维敏捷，善于沟通，具有智慧',
            strengths: '适应能力强，善于理解他人，具有洞察力，容易获得他人好感',
            challenges: '有时过于善变，缺乏坚持，容易给人不靠谱的印象，需要学会稳定',
            compatibility: '与土命人相处和谐，与金命人相互促进，与火命人需要包容',
            advice: '在人际交往中，应学会坚持承诺，培养责任感，注重长期关系，建立信任基础',
            social: '适合担任沟通桥梁角色，在群体中发挥协调作用，建立广泛人脉'
        }
    };
    
    const advice = relationshipAdvice[dayElement];
    return `根据您的${dayElement}命特点，${advice.personality}。在人际关系方面，${advice.strengths}。但需要注意${advice.challenges}。与不同五行命格的人相处：${advice.compatibility}。${advice.advice}${advice.social}。建议您在人际交往中发挥优势，改善不足，建立和谐的人际关系网络。`;
}

// 星盘计算
function calculateAstrology() {
    const dateTime = document.getElementById('astrologyDateTime').value;
    const place = document.getElementById('astrologyPlace').value;

    if (!dateTime || !place) {
        alert('请填写完整的出生信息');
        return;
    }

    showLoading();
    
    setTimeout(() => {
        createNatalChart();
        hideLoading();
        createParticleEffect();
    }, 2000);
}

// 创建星盘
function createNatalChart(astrologyData) {
    const chartContainer = document.getElementById('natalChart');
    if (!chartContainer) {
        console.warn('natalChart 容器不存在');
        return;
    }
    
    const width = 300;
    const height = 300;
    
    // 清空容器
    chartContainer.innerHTML = '';
    
    // 创建SVG
    const svg = d3.select(chartContainer)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // 创建星盘圆圈
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;
    
    // 外圈
    svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius)
        .attr('fill', 'none')
        .attr('stroke', '#D4AF37')
        .attr('stroke-width', 2);
    
    // 内圈
    svg.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', radius * 0.8)
        .attr('fill', 'none')
        .attr('stroke', '#D4AF37')
        .attr('stroke-width', 1);
    
    // 添加星座符号
    const zodiacSigns = ['白羊', '金牛', '双子', '巨蟹', '狮子', '处女', '天秤', '天蝎', '射手', '摩羯', '水瓶', '双鱼'];
    zodiacSigns.forEach((sign, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x = centerX + radius * 0.9 * Math.cos(angle);
        const y = centerY + radius * 0.9 * Math.sin(angle);
        
        svg.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#D4AF37')
            .attr('font-size', '10px')
            .text(sign);
    });
    
    // 添加行星位置
    if (astrologyData && astrologyData.planets) {
        astrologyData.planets.forEach(planet => {
            const signIndex = zodiacSigns.indexOf(planet.sign.replace('座', ''));
            const angle = (planet.degree + (signIndex * 30)) * Math.PI / 180;
            const distance = 0.6 + (Math.random() * 0.2);
            const x = centerX + radius * distance * Math.cos(angle);
            const y = centerY + radius * distance * Math.sin(angle);
            
            svg.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 3)
                .attr('fill', '#D4AF37');
            
            svg.append('text')
                .attr('x', x + 8)
                .attr('y', y)
                .attr('fill', '#F4E4BC')
                .attr('font-size', '8px')
                .text(planet.name);
        });
    }
}

// 显示行星位置
function displayPlanetPositions(planets) {
    const planetList = document.getElementById('planetList');
    if (!planetList) {
        console.warn('planetList 容器不存在');
        return;
    }
    
    planetList.innerHTML = '';
    
    planets.forEach(planet => {
        const planetDiv = document.createElement('div');
        planetDiv.style.marginBottom = '10px';
        planetDiv.style.padding = '8px';
        planetDiv.style.background = 'rgba(212, 175, 55, 0.1)';
        planetDiv.style.borderRadius = '5px';
        planetDiv.innerHTML = `<strong>${planet.name}</strong>: ${planet.angle}°`;
        planetList.appendChild(planetDiv);
    });
}

// 塔罗占卜
function startTarotReading() {
    const question = document.getElementById('tarotQuestion').value;
    
    if (!question.trim()) {
        alert('请输入您想要占卜的问题');
        return;
    }
    
    showLoading();
    
    setTimeout(() => {
        const cards = drawTarotCards();
        displayTarotResult(cards, question);
        hideLoading();
        createParticleEffect();
    }, 2000);
}

// 选择牌阵
function selectSpread(spread) {
    currentSpread = spread;
    document.querySelectorAll('.spread-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-spread="${spread}"]`).classList.add('active');
}

// 抽取塔罗牌
function drawTarotCards() {
    const numCards = currentSpread === 'three' ? 3 : currentSpread === 'celtic' ? 10 : 7;
    const cards = [];
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numCards; i++) {
        const card = shuffled[i];
        card.isReversed = Math.random() > 0.5;
        cards.push(card);
    }
    
    return cards;
}

// 显示塔罗结果
function displayTarotResult(cards, question) {
    const cardsContainer = document.getElementById('tarotCards');
    if (!cardsContainer) {
        console.warn('tarotCards 容器不存在');
        return;
    }
    
    // 清空容器
    cardsContainer.innerHTML = '';
    
    // 显示卡牌
    cards.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'tarot-card';
        cardDiv.style.cssText = `
            display: inline-block;
            width: 60px;
            height: 90px;
            background: linear-gradient(135deg, #D4AF37, #B8860B);
            border: 2px solid #D4AF37;
            border-radius: 6px;
            margin: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #0F1A3C;
            font-weight: bold;
            font-size: 8px;
            text-align: center;
            transform: ${card.isReversed ? 'rotate(180deg)' : 'none'};
            transition: transform 0.5s ease;
        `;
        cardDiv.textContent = card.name;
        cardsContainer.appendChild(cardDiv);
    });
}

// 生成塔罗解读
function generateTarotReading(cards, question) {
    let reading = `<p><strong>🔮 占卜问题：</strong>${question}</p>`;
    reading += `<p><strong>📜 牌阵解读：</strong></p>`;
    
    cards.forEach((card, index) => {
        const position = getCardPosition(index);
        const meaning = card.isReversed ? card.reversed : card.meaning;
        const element = getTarotElement(card.name);
        const numerology = getTarotNumerology(card.name);
        
        reading += `<div class="card-reading">
            <p><strong>🎴 ${position} - ${card.name}${card.isReversed ? ' (逆位)' : ''}</strong></p>
            <p><strong>元素属性：</strong>${element}</p>
            <p><strong>数字能量：</strong>${numerology}</p>
            <p><strong>深层含义：</strong>${meaning}</p>
            <p><strong>个人启示：</strong>${getPersonalInsight(card, position)}</p>
        </div>`;
    });
    
    reading += `<p><strong>🌟 整体解读：</strong>${getOverallReading(cards)}</p>`;
    reading += `<p><strong>💫 能量建议：</strong>${getEnergyAdvice(cards)}</p>`;
    reading += `<p><strong>🔮 未来指引：</strong>${getFutureGuidance(cards)}</p>`;
    
    return reading;
}

// 获取塔罗牌元素属性
function getTarotElement(cardName) {
    const elementMap = {
        '愚者': '风元素 - 代表自由、冒险、新的开始',
        '魔术师': '风元素 - 代表智慧、技能、创造力',
        '女祭司': '水元素 - 代表直觉、神秘、内在智慧',
        '女皇': '土元素 - 代表丰饶、母性、自然',
        '皇帝': '火元素 - 代表权威、领导、力量',
        '教皇': '风元素 - 代表传统、教育、精神指导',
        '恋人': '风元素 - 代表选择、和谐、爱情',
        '战车': '火元素 - 代表胜利、意志、控制',
        '力量': '火元素 - 代表勇气、耐心、内在力量',
        '隐者': '土元素 - 代表智慧、孤独、内在探索',
        '命运之轮': '火元素 - 代表变化、命运、循环',
        '正义': '风元素 - 代表平衡、公正、真理',
        '倒吊人': '水元素 - 代表牺牲、暂停、新视角',
        '死神': '水元素 - 代表结束、转变、重生',
        '节制': '火元素 - 代表平衡、调和、适度',
        '恶魔': '土元素 - 代表束缚、欲望、物质',
        '塔': '火元素 - 代表破坏、觉醒、突变',
        '星星': '水元素 - 代表希望、灵感、治愈',
        '月亮': '水元素 - 代表直觉、幻想、潜意识',
        '太阳': '火元素 - 代表快乐、成功、活力',
        '审判': '火元素 - 代表重生、救赎、觉醒',
        '世界': '土元素 - 代表完成、和谐、圆满'
    };
    return elementMap[cardName] || '神秘能量 - 代表未知的力量';
}

// 获取塔罗牌数字能量
function getTarotNumerology(cardName) {
    const numerologyMap = {
        '愚者': '数字0 - 代表无限可能、新的开始、纯真',
        '魔术师': '数字1 - 代表创造力、领导力、独立',
        '女祭司': '数字2 - 代表直觉、平衡、合作',
        '女皇': '数字3 - 代表创造力、表达、成长',
        '皇帝': '数字4 - 代表稳定、秩序、基础',
        '教皇': '数字5 - 代表智慧、传统、教育',
        '恋人': '数字6 - 代表和谐、选择、爱情',
        '战车': '数字7 - 代表胜利、意志、控制',
        '力量': '数字8 - 代表力量、耐心、内在能量',
        '隐者': '数字9 - 代表智慧、孤独、内在探索',
        '命运之轮': '数字10 - 代表变化、命运、循环',
        '正义': '数字11 - 代表平衡、公正、真理',
        '倒吊人': '数字12 - 代表牺牲、暂停、新视角',
        '死神': '数字13 - 代表结束、转变、重生',
        '节制': '数字14 - 代表平衡、调和、适度',
        '恶魔': '数字15 - 代表束缚、欲望、物质',
        '塔': '数字16 - 代表破坏、觉醒、突变',
        '星星': '数字17 - 代表希望、灵感、治愈',
        '月亮': '数字18 - 代表直觉、幻想、潜意识',
        '太阳': '数字19 - 代表快乐、成功、活力',
        '审判': '数字20 - 代表重生、救赎、觉醒',
        '世界': '数字21 - 代表完成、和谐、圆满'
    };
    return numerologyMap[cardName] || '神秘数字 - 代表特殊能量';
}

// 获取个人启示
function getPersonalInsight(card, position) {
    const insights = {
        '愚者': '提醒您保持纯真和开放的心态，勇敢面对新的挑战和机遇。',
        '魔术师': '鼓励您发挥自己的才能和创造力，相信自己有能力实现目标。',
        '女祭司': '建议您倾听内心的声音，相信直觉，深入探索内在的智慧。',
        '女皇': '提醒您关注生活中的美好事物，培养丰饶和母性的品质。',
        '皇帝': '鼓励您展现领导才能，建立权威，承担责任。',
        '教皇': '建议您寻求精神指导，学习传统智慧，培养内在的信仰。',
        '恋人': '提醒您关注人际关系，做出重要的选择，追求和谐。',
        '战车': '鼓励您保持意志力，控制方向，追求胜利。',
        '力量': '提醒您运用内在的力量，保持耐心和勇气。',
        '隐者': '建议您进行内在探索，寻找真正的智慧。',
        '命运之轮': '提醒您接受变化，顺应命运的安排。',
        '正义': '鼓励您追求公正和平衡，做出正确的判断。',
        '倒吊人': '建议您换个角度看问题，接受暂时的牺牲。',
        '死神': '提醒您接受结束和转变，迎接新的开始。',
        '节制': '鼓励您保持平衡和适度，调和各种力量。',
        '恶魔': '提醒您注意物质欲望，避免被束缚。',
        '塔': '提醒您面对破坏和觉醒，接受突变。',
        '星星': '鼓励您保持希望，相信灵感和治愈的力量。',
        '月亮': '提醒您关注直觉和潜意识，但不要被幻想迷惑。',
        '太阳': '鼓励您保持快乐和活力，追求成功。',
        '审判': '提醒您接受重生和救赎，觉醒内在的力量。',
        '世界': '鼓励您追求圆满和和谐，完成重要的目标。'
    };
    return insights[card.name] || '这张牌为您带来特殊的启示，请仔细感受其能量。';
}

// 获取卡牌位置
function getCardPosition(index) {
    if (currentSpread === 'three') {
        const positions = ['过去', '现在', '未来'];
        return positions[index];
    } else if (currentSpread === 'celtic') {
        const positions = ['现状', '挑战', '远因', '近因', '可能', '即将发生', '自我', '环境', '希望', '结果'];
        return positions[index];
    } else {
        const positions = ['过去', '现在', '未来', '原因', '环境', '希望', '结果'];
        return positions[index];
    }
}

// 整体解读
function getOverallReading(cards) {
    const cardNames = cards.map(card => card.name);
    const hasMajorArcana = cardNames.some(name => ['愚者', '魔术师', '女祭司', '女皇', '皇帝', '教皇', '恋人', '战车', '力量', '隐者', '命运之轮', '正义', '倒吊人', '死神', '节制', '恶魔', '塔', '星星', '月亮', '太阳', '审判', '世界'].includes(name));
    
    let reading = '';
    
    if (hasMajorArcana) {
        reading = '从大阿卡纳牌的出现可以看出，您当前正经历人生的重要阶段。这些牌象征着深刻的转变和成长，建议您认真对待当前的机遇和挑战。';
    } else {
        reading = '从小阿卡纳牌的组合来看，您当前面临的是日常生活中的具体问题。这些牌提供了实用的指导和建议。';
    }
    
    // 分析牌阵的整体能量
    const positiveCards = cards.filter(card => !card.isReversed).length;
    const reversedCards = cards.filter(card => card.isReversed).length;
    
    if (positiveCards > reversedCards) {
        reading += '整体能量偏向积极，当前运势较好，适合采取行动。';
    } else if (reversedCards > positiveCards) {
        reading += '存在一些阻碍和挑战，需要调整心态和策略。';
    } else {
        reading += '能量平衡，需要保持中立和客观的态度。';
    }
    
    // 根据具体牌组合给出建议
    if (cardNames.includes('愚者') && cardNames.includes('世界')) {
        reading += '从愚者到世界的旅程，象征着您正在经历一个完整的生命周期，即将迎来新的开始。';
    }
    
    if (cardNames.includes('死神') && cardNames.includes('星星')) {
        reading += '死神与星星的组合，预示着结束之后必有新的希望，请保持信心。';
    }
    
    if (cardNames.includes('塔') && cardNames.includes('太阳')) {
        reading += '塔的破坏之后是太阳的光明，说明当前的困难是暂时的，光明即将到来。';
    }
    
    return reading;
}

// 能量建议
function getEnergyAdvice(cards) {
    const elements = cards.map(card => getTarotElement(card.name).split(' - ')[0]);
    const elementCounts = elements.reduce((acc, element) => {
        acc[element] = (acc[element] || 0) + 1;
        return acc;
    }, {});
    
    const dominantElement = Object.keys(elementCounts).reduce((a, b) => elementCounts[a] > elementCounts[b] ? a : b);
    
    const energyAdvice = {
        '火元素': '当前火元素能量较强，建议您保持热情和活力，但要注意控制冲动情绪。可以多进行运动，释放多余的能量。',
        '水元素': '水元素能量主导，建议您多关注情感和直觉，倾听内心的声音。可以多接触水，如游泳、泡澡等。',
        '风元素': '风元素能量活跃，建议您保持思维敏捷，多进行沟通和交流。可以多呼吸新鲜空气，进行冥想。',
        '土元素': '土元素能量稳定，建议您保持踏实和稳重，注重实际和基础。可以多接触大自然，进行园艺活动。'
    };
    
    return energyAdvice[dominantElement] || '能量平衡，建议保持和谐的状态。';
}

// 未来指引
function getFutureGuidance(cards) {
    const lastCard = cards[cards.length - 1];
    const guidance = {
        '愚者': '未来充满无限可能，建议您保持开放和冒险的心态，勇敢追求梦想。',
        '魔术师': '您将获得展现才能的机会，建议您充分准备，发挥创造力。',
        '女祭司': '未来需要更多的内在探索，建议您倾听直觉，培养内在智慧。',
        '女皇': '将迎来丰饶和收获的时期，建议您关注生活中的美好事物。',
        '皇帝': '未来将获得权威和领导地位，建议您承担责任，展现领导才能。',
        '教皇': '将获得精神指导，建议您学习传统智慧，培养信仰。',
        '恋人': '人际关系将得到改善，建议您关注爱情和合作。',
        '战车': '将获得胜利和成功，建议您保持意志力，控制方向。',
        '力量': '将展现内在力量，建议您保持勇气和耐心。',
        '隐者': '将进行内在探索，建议您寻找真正的智慧。',
        '命运之轮': '将经历重要的变化，建议您顺应命运的安排。',
        '正义': '将获得公正和平衡，建议您做出正确的判断。',
        '倒吊人': '将经历牺牲和暂停，建议您换个角度看问题。',
        '死神': '将经历结束和转变，建议您接受新的开始。',
        '节制': '将获得平衡和调和，建议您保持适度。',
        '恶魔': '将面临诱惑和束缚，建议您注意物质欲望。',
        '塔': '将经历破坏和觉醒，建议您面对突变。',
        '星星': '将获得希望和治愈，建议您保持信心。',
        '月亮': '将经历直觉和幻想，建议您关注潜意识。',
        '太阳': '将获得快乐和成功，建议您保持活力。',
        '审判': '将经历重生和救赎，建议您觉醒内在力量。',
        '世界': '将获得圆满和和谐，建议您完成重要目标。'
    };
    
    return guidance[lastCard.name] || '未来充满神秘，建议您保持开放的心态，接受宇宙的指引。';
}

// 解读标签切换
function switchInterpretation(interpName) {
    document.querySelectorAll('.interp-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.interp-panel').forEach(panel => panel.classList.remove('active'));
    
    document.querySelector(`[data-interp="${interpName}"]`).classList.add('active');
    document.getElementById(interpName).classList.add('active');
}

// 星空背景
function setupStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield) {
        console.warn('starfield 容器不存在');
        return;
    }
    
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: twinkle ${2 + Math.random() * 3}s infinite;
        `;
        starfield.appendChild(star);
    }
}

// 粒子特效
function setupParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) {
        console.warn('particles 容器不存在');
        return;
    }
    
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particlesContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 3000);
    }
    
    window.createParticleEffect = function() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const x = centerX + (Math.random() - 0.5) * 200;
                const y = centerY + (Math.random() - 0.5) * 200;
                createParticle(x, y);
            }, i * 50);
        }
    };
}

// 显示加载动画
function showLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = 'flex';
    }
}

// 隐藏加载动画
function hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = 'none';
    }
}

// 导出PDF
function exportToPDF() {
    alert('PDF导出功能开发中...');
}

// 分享结果
function shareResult() {
    // 检查是否有测算结果
    const resultSection = document.getElementById('comprehensiveResult');
    if (!resultSection || resultSection.style.display === 'none') {
        alert('请先进行测算，生成结果后再分享！');
        return;
    }

    // 获取用户信息用于分享
    const userName = document.getElementById('displayUserName')?.textContent || '用户';
    const birthTime = document.getElementById('displayBirthTime')?.textContent || '';
    
    // 创建分享内容
    const shareData = {
        title: `玄机命理 - ${userName}的命理分析报告`,
        text: `${userName}的专业命理分析报告，包含八字排盘、星座星盘、塔罗占卜等多维度解读！${birthTime ? `出生时间：${birthTime}` : ''}`,
        url: window.location.href
    };

    // 尝试使用原生分享API
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        navigator.share(shareData).then(() => {
            console.log('分享成功');
        }).catch((error) => {
            console.log('分享失败:', error);
            fallbackShare(shareData);
        });
    } else {
        fallbackShare(shareData);
    }
}

function fallbackShare(shareData) {
    // 创建分享弹窗
    const shareModal = document.createElement('div');
    shareModal.className = 'share-modal';
    shareModal.innerHTML = `
        <div class="share-content">
            <h3>分享结果</h3>
            <p>${shareData.text}</p>
            <div class="share-buttons">
                <button onclick="copyToClipboard('${shareData.url}')" class="share-btn">复制链接</button>
                <button onclick="downloadReport()" class="share-btn">下载报告</button>
                <button onclick="closeShareModal()" class="share-btn">关闭</button>
            </div>
        </div>
    `;
    
    // 添加样式
    shareModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    const shareContent = shareModal.querySelector('.share-content');
    shareContent.style.cssText = `
        background: rgba(15, 26, 60, 0.95);
        padding: 30px;
        border-radius: 15px;
        color: #FFFFF0;
        max-width: 500px;
        text-align: center;
        border: 2px solid #D4AF37;
    `;
    
    const shareButtons = shareModal.querySelector('.share-buttons');
    shareButtons.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
        flex-wrap: wrap;
    `;
    
    const shareBtns = shareModal.querySelectorAll('.share-btn');
    shareBtns.forEach(btn => {
        btn.style.cssText = `
            padding: 10px 20px;
            background: linear-gradient(135deg, #D4AF37, #B8860B);
            color: #0F1A3C;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        `;
    });
    
    document.body.appendChild(shareModal);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('链接已复制到剪贴板！');
    }).catch(() => {
        // 备用方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('链接已复制到剪贴板！');
    });
}

function downloadReport() {
    // 生成报告内容
    const userName = document.getElementById('displayUserName')?.textContent || '用户';
    const birthTime = document.getElementById('displayBirthTime')?.textContent || '';
    const birthPlace = document.getElementById('displayBirthPlace')?.textContent || '';
    
    let reportContent = `玄机命理 - ${userName}的命理分析报告\n`;
    reportContent += `生成时间：${new Date().toLocaleString()}\n`;
    reportContent += `姓名：${userName}\n`;
    reportContent += `出生时间：${birthTime}\n`;
    reportContent += `出生地点：${birthPlace}\n\n`;
    
    // 添加五行分析
    const elementsSummary = document.getElementById('elementsSummary')?.textContent || '';
    if (elementsSummary) {
        reportContent += `五行分析：${elementsSummary}\n\n`;
    }
    
    // 添加报告内容
    const personalityAnalysis = document.getElementById('personalityAnalysis')?.textContent || '';
    const lifeAdvice = document.getElementById('lifeAdvice')?.textContent || '';
    const fortunePrediction = document.getElementById('fortunePrediction')?.textContent || '';
    const tarotGuidance = document.getElementById('tarotGuidance')?.textContent || '';
    
    if (personalityAnalysis) reportContent += `命理特质分析：${personalityAnalysis}\n\n`;
    if (lifeAdvice) reportContent += `人生发展建议：${lifeAdvice}\n\n`;
    if (fortunePrediction) reportContent += `运势走向预测：${fortunePrediction}\n\n`;
    if (tarotGuidance) reportContent += `塔罗启示指引：${tarotGuidance}\n\n`;
    
    reportContent += `免责声明：本测算结果仅供娱乐参考，不构成任何专业建议。`;
    
    // 创建下载链接
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `玄机命理_${userName}_分析报告.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('报告已下载！');
}

function closeShareModal() {
    const modal = document.querySelector('.share-modal');
    if (modal) {
        modal.remove();
    }
}

// 开始综合测算
function startComprehensiveCalculation() {
    const userName = document.getElementById('userName').value.trim();
    const genderElement = document.querySelector('input[name="gender"]:checked');
    const gender = genderElement ? genderElement.value : '未选择';
    const birthDateTime = document.getElementById('birthDateTime').value;
    const birthPlace = document.getElementById('birthPlace').value.trim();
    const tarotQuestion = document.getElementById('tarotQuestion').value.trim();
    const privacyAgreement = document.getElementById('privacyAgreement').checked;

    // 验证必填字段
    if (!userName) {
        alert('请输入您的姓名');
        return;
    }
    if (!birthDateTime) {
        alert('请输入出生日期时间');
        return;
    }
    if (!birthPlace) {
        alert('请输入出生地点');
        return;
    }
    if (!privacyAgreement) {
        alert('请阅读并同意个人隐私协议和服务条款');
        return;
    }

    showLoading();
    
    // 模拟计算延迟
    setTimeout(() => {
        const bazi = calculateBaziChart(birthDateTime, '午');
        const astrologyData = generateAstrologyData(birthDateTime, birthPlace);
        const tarotCards = drawTarotCards();
        
        displayComprehensiveResult(userName, gender, birthDateTime, birthPlace, bazi, astrologyData, tarotCards, tarotQuestion);
        hideLoading();
    }, 3000);
}

// 显示用户信息
function displayUserInfo(userName, gender, birthDateTime, birthPlace) {
    const userNameEl = document.getElementById('displayUserName');
    if (userNameEl) userNameEl.textContent = userName;
    
    const genderEl = document.getElementById('displayGender');
    if (genderEl) genderEl.textContent = gender;
    
    // 格式化出生时间
    const birthDate = new Date(birthDateTime);
    const formattedDate = birthDate.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const birthTimeEl = document.getElementById('displayBirthTime');
    if (birthTimeEl) birthTimeEl.textContent = formattedDate;
    
    const birthPlaceEl = document.getElementById('displayBirthPlace');
    if (birthPlaceEl) birthPlaceEl.textContent = birthPlace;
}

// 生成星盘数据
function generateAstrologyData(birthDateTime, birthPlace) {
    const date = new Date(birthDateTime);
    const planets = [
        { name: '太阳', sign: '白羊座', degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
        { name: '月亮', sign: '金牛座', degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
        { name: '水星', sign: '双子座', degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
        { name: '金星', sign: '巨蟹座', degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
        { name: '火星', sign: '狮子座', degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
        { name: '木星', sign: '处女座', degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 },
        { name: '土星', sign: '天秤座', degree: Math.floor(Math.random() * 30), house: Math.floor(Math.random() * 12) + 1 }
    ];
    
    return {
        planets: planets,
        ascendant: '天蝎座',
        midheaven: '金牛座'
    };
}

// 显示综合结果
function displayComprehensiveResult(userName, gender, birthDateTime, birthPlace, bazi, astrologyData, tarotCards, tarotQuestion) {
    // 显示用户信息
    displayUserInfo(userName, gender, birthDateTime, birthPlace);
    
    // 显示八字结果
    displayBaziResult(bazi);
    
    // 显示星盘结果
    createNatalChart(astrologyData);
    
    // 显示塔罗结果
    displayTarotResult(tarotCards, tarotQuestion);
    
    // 计算并显示五行百分比
    const elementPercentages = calculateFiveElementPercentages(bazi);
    displayFiveElementPercentages(elementPercentages);
    
    // 生成综合报告
    generateComprehensiveReport(bazi, astrologyData, tarotCards, elementPercentages);
    
    // 显示结果区域
    document.getElementById('comprehensiveResult').style.display = 'block';
    
    // 滚动到结果区域
    document.getElementById('comprehensiveResult').scrollIntoView({ behavior: 'smooth' });
}

// 计算五行百分比
function calculateFiveElementPercentages(bazi) {
    const elements = {
        '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
    };
    
    // 统计天干五行
    const stems = [bazi.year.stem, bazi.month.stem, bazi.day.stem, bazi.hour.stem];
    stems.forEach(stem => {
        const element = getElement(stem);
        elements[element]++;
    });
    
    // 统计地支五行（包括藏干）
    const branches = [bazi.year.branch, bazi.month.branch, bazi.day.branch, bazi.hour.branch];
    branches.forEach(branch => {
        const hiddenGods = getHiddenGods('', branch);
        const hiddenElements = hiddenGods.split('').map(god => {
            const stemIndex = tenGods.indexOf(god);
            if (stemIndex >= 0) {
                return getElement(heavenlyStems[stemIndex]);
            }
            return null;
        }).filter(el => el);
        
        hiddenElements.forEach(element => {
            elements[element]++;
        });
    });
    
    // 计算百分比
    const total = Object.values(elements).reduce((sum, count) => sum + count, 0);
    const percentages = {};
    
    Object.keys(elements).forEach(element => {
        percentages[element] = total > 0 ? Math.round((elements[element] / total) * 100) : 0;
    });
    
    return percentages;
}

// 显示五行百分比
function displayFiveElementPercentages(percentages) {
    const elementMap = {
        '木': { element: 'wood', text: 'woodText', desc: 'woodDesc' },
        '火': { element: 'fire', text: 'fireText', desc: 'fireDesc' },
        '土': { element: 'earth', text: 'earthText', desc: 'earthDesc' },
        '金': { element: 'metal', text: 'metalText', desc: 'metalDesc' },
        '水': { element: 'water', text: 'waterText', desc: 'waterDesc' }
    };
    
    const elementDescriptions = {
        '木': {
            strong: '木旺之人性格坚韧，富有进取心，善于规划，具有领导才能。适合从事管理、教育、环保等行业。',
            weak: '木弱之人缺乏耐心，容易急躁，需要培养坚持力和规划能力。',
            balanced: '木气适中，性格温和，具有创造力，适合从事创意、设计等工作。'
        },
        '火': {
            strong: '火旺之人热情开朗，充满活力，善于表达，具有感染力。适合从事销售、演艺、餐饮等行业。',
            weak: '火弱之人缺乏热情，容易消极，需要培养积极心态和表达能力。',
            balanced: '火气适中，性格温和，具有亲和力，适合从事服务、咨询等工作。'
        },
        '土': {
            strong: '土旺之人稳重踏实，责任心强，善于协调，具有包容性。适合从事建筑、农业、金融等行业。',
            weak: '土弱之人缺乏稳定性，容易浮躁，需要培养责任心和耐心。',
            balanced: '土气适中，性格稳重，具有协调能力，适合从事管理、协调等工作。'
        },
        '金': {
            strong: '金旺之人果断坚定，追求完美，善于分析，具有执行力。适合从事法律、工程、IT等行业。',
            weak: '金弱之人缺乏决断力，容易优柔寡断，需要培养分析能力和执行力。',
            balanced: '金气适中，性格坚定，具有分析能力，适合从事研究、分析等工作。'
        },
        '水': {
            strong: '水旺之人灵活多变，适应力强，善于思考，具有智慧。适合从事科研、文学、运输等行业。',
            weak: '水弱之人缺乏灵活性，容易固执，需要培养适应能力和思维能力。',
            balanced: '水气适中，性格灵活，具有智慧，适合从事教育、研究等工作。'
        }
    };
    
    Object.keys(percentages).forEach(element => {
        const percentage = percentages[element];
        const elementInfo = elementMap[element];
        
        const progressBar = document.getElementById(elementInfo.element);
        const textElement = document.getElementById(elementInfo.text);
        const descElement = document.getElementById(elementInfo.desc);
        
        if (progressBar && textElement) {
            progressBar.style.width = percentage + '%';
            textElement.textContent = percentage + '%';
        }
        
        if (descElement) {
            let description = '';
            if (percentage >= 30) {
                description = elementDescriptions[element].strong;
            } else if (percentage <= 10) {
                description = elementDescriptions[element].weak;
            } else {
                description = elementDescriptions[element].balanced;
            }
            descElement.textContent = description;
        }
    });
    
    // 生成五行总结
    generateElementsSummary(percentages);
}

// 生成五行总结
function generateElementsSummary(percentages) {
    const dominantElement = Object.keys(percentages).reduce((a, b) => 
        percentages[a] > percentages[b] ? a : b
    );
    const weakElement = Object.keys(percentages).reduce((a, b) => 
        percentages[a] < percentages[b] ? a : b
    );
    
    const summaryElement = document.getElementById('elementsSummary');
    if (summaryElement) {
        const summary = `
            <h4>五行能量分析总结</h4>
            <p><strong>主导五行：${dominantElement}</strong> - 这是您命盘中最强的能量，代表您的核心特质和优势。</p>
            <p><strong>薄弱五行：${weakElement}</strong> - 这是您需要重点培养和补充的能量，代表您的成长空间。</p>
            <p>五行分布显示您是一个具有独特能量组合的人，建议发挥${dominantElement}的优势，同时注意补充${weakElement}的能量，以达到更好的平衡发展。</p>
        `;
        summaryElement.innerHTML = summary;
    }
}

// 生成综合报告
function generateComprehensiveReport(bazi, astrologyData, tarotCards, elementPercentages) {
    const userName = document.getElementById('displayUserName').textContent;
    const gender = document.getElementById('displayGender').textContent;
    
    const personalityAnalysis = generatePersonalityAnalysis(userName, gender, bazi, elementPercentages);
    const lifeAdvice = generateLifeAdvice(userName, gender, bazi, elementPercentages);
    const fortunePrediction = generateFortunePrediction(userName, bazi, astrologyData);
    const tarotGuidance = generateTarotGuidance(userName, tarotCards);
    
    document.getElementById('personalityAnalysis').innerHTML = personalityAnalysis;
    document.getElementById('lifeAdvice').innerHTML = lifeAdvice;
    document.getElementById('fortunePrediction').innerHTML = fortunePrediction;
    document.getElementById('tarotGuidance').innerHTML = tarotGuidance;
}

// 生成性格特质分析
function generatePersonalityAnalysis(userName, gender, bazi, elementPercentages) {
    const dominantElement = Object.keys(elementPercentages).reduce((a, b) => 
        elementPercentages[a] > elementPercentages[b] ? a : b
    );
    
    const personalityTraits = {
        '木': `${userName}具有木的特质，性格坚韧不拔，富有进取心和创造力。善于规划，有领导才能，但有时过于固执。`,
        '火': `${userName}具有火的特质，性格热情开朗，充满活力，善于表达。具有感染力，但有时情绪波动较大。`,
        '土': `${userName}具有土的特质，性格稳重踏实，责任心强，善于协调。具有包容性，但有时过于保守。`,
        '金': `${userName}具有金的特质，性格果断坚定，追求完美，善于分析。具有执行力，但有时过于严格。`,
        '水': `${userName}具有水的特质，性格灵活多变，适应力强，善于思考。具有智慧，但有时缺乏稳定性。`
    };
    
    const genderSpecific = gender === '男' ? '他' : '她';
    
    return `<p><strong>主导五行：${dominantElement}</strong></p>
            <p>${personalityTraits[dominantElement]}</p>
            <p>五行分布显示${userName}是一个平衡发展的人，在不同方面都有所擅长。建议${genderSpecific}发挥优势，弥补不足。</p>`;
}

// 生成人生发展建议
function generateLifeAdvice(userName, gender, bazi, elementPercentages) {
    const weakElement = Object.keys(elementPercentages).reduce((a, b) => 
        elementPercentages[a] < elementPercentages[b] ? a : b
    );
    
    const genderSpecific = gender === '男' ? '他' : '她';
    
    const adviceMap = {
        '木': `建议${userName}多接触自然，培养耐心和坚持力。可以尝试园艺、户外运动等活动。`,
        '火': `建议${userName}培养专注力，学会控制情绪。可以尝试冥想、瑜伽等静心活动。`,
        '土': `建议${userName}增强灵活性，勇于尝试新事物。可以尝试旅行、学习新技能。`,
        '金': `建议${userName}培养包容心，学会放松。可以尝试艺术创作、音乐欣赏。`,
        '水': `建议${userName}增强稳定性，培养专注力。可以尝试规律作息、固定运动。`
    };
    
    return `<p><strong>需要加强的五行：${weakElement}</strong></p>
            <p>${adviceMap[weakElement]}</p>
            <p>在职业选择上，建议选择与主导五行相关的行业，同时注意平衡发展。</p>`;
}

// 生成运势走向预测
function generateFortunePrediction(userName, bazi, astrologyData) {
    const currentYear = new Date().getFullYear();
    const yearStem = heavenlyStems[currentYear % 10];
    const yearElement = getElement(yearStem);
    const dayElement = getElement(bazi.day.stem);
    
    let prediction = '';
    
    if (yearElement === dayElement) {
        prediction = '本命年，运势波动较大，需要谨慎行事。';
    } else if (elementRelations[dayElement]['生'] === yearElement) {
        prediction = '流年相生，运势较好，适合发展事业。';
    } else if (elementRelations[dayElement]['克'] === yearElement) {
        prediction = '流年相克，需要调整策略，避免冲突。';
    } else {
        prediction = '流年平稳，保持现状，稳步发展。';
    }
    
    return `<p><strong>${currentYear}年运势分析</strong></p>
            <p>${prediction}</p>
            <p>建议关注健康，保持积极心态，适时调整人生规划。</p>`;
}

// 生成塔罗启示指引
function generateTarotGuidance(userName, tarotCards) {
    const majorArcana = tarotCards.filter(card => 
        ['愚者', '魔术师', '女祭司', '女皇', '皇帝', '教皇', '恋人', '战车', '力量', '隐者', 
         '命运之轮', '正义', '倒吊人', '死神', '节制', '恶魔', '塔', '星星', '月亮', '太阳', '审判', '世界'].includes(card.name)
    );
    
    let guidance = '';
    
    if (majorArcana.length >= 2) {
        guidance = '大阿卡纳牌较多，表明当前处于人生重要转折期，需要认真对待每个选择。';
    } else {
        guidance = '小阿卡纳牌为主，表明当前处于平稳发展期，适合积累经验和资源。';
    }
    
    const lastCard = tarotCards[tarotCards.length - 1];
    guidance += ` 最后一张牌"${lastCard.name}"提示您：${lastCard.meaning}。`;
    
    return `<p><strong>塔罗启示</strong></p>
            <p>${guidance}</p>
            <p>建议保持开放心态，相信直觉，勇敢面对人生挑战。</p>`;
} 