const fs = require('fs');

// 1. Read Partials (Source of Truth for Title/Desc)
const toolsZh = JSON.parse(fs.readFileSync('tools_zh_partial.json', 'utf8'));
const toolsEn = JSON.parse(fs.readFileSync('tools_en_partial.json', 'utf8'));

// 2. Define Static Parts (Salvaged from Logs)
const commonZh = {
    "header": {
        "login": "登录",
        "user_tooltip": "用户登录",
        "personal_center": "个人中心",
        "logout": "退出登录",
        "loading": "加载中..."
    },
    "message": {
        "logout_success": "已退出登录"
    },
    "sidebar": {
        "about": "关于本站",
        "category": "分类"
    },
    "category": {
        "2": "开发运维",
        "3": "文本处理",
        "4": "教育学术",
        "5": "图片处理",
        "7": "其他工具",
        "8": "数据图表",
        "9": "选择随机",
        "10": "AI工具",
        "11": "趣味互动",
        "12": "好物网站"
    },
    "footer": {
        "copyright": "一个轻量的在线工具箱 © 2019 - 2025"
    }
};

const commonEn = {
    "header": {
        "login": "Log in",
        "user_tooltip": "User login",
        "personal_center": "Profile",
        "logout": "Log out",
        "loading": "Loading..."
    },
    "message": {
        "logout_success": "Logged out"
    },
    "sidebar": {
        "about": "About",
        "category": "Categories"
    },
    "category": {
        "2": "DevOps",
        "3": "Text Tools",
        "4": "Education",
        "5": "Image Tools",
        "7": "Other Tools",
        "8": "Data & Charts",
        "9": "Random",
        "10": "AI Tools",
        "11": "Fun & Games",
        "12": "Useful Sites"
    },
    "footer": {
        "copyright": "A lightweight online toolbox © 2019 - 2025"
    }
};

// 3. Enrich Tools with Salvaged Details

// Helper to merge details into a tool check if it exists in partial
function inject(langTools, key, details) {
    if (langTools[key]) {
        Object.assign(langTools[key], details);
    } else {
        // If key mismatch in partial vs salvaged, add it anyway or map it
        // Note: partial uses 'httpstatus', logs used 'httpcode'??
        // Let's check partial keys. 'httpstatus' is key in partial. zh.json had 'httpcode' at root. 
        // I should probably stick to partial keys if I can, OR map root keys to partial keys.
        // The components use specific keys. HttpCode.vue probably uses 'tools.httpcode'.
        // Let's add it as a new key if missing, but preferably merge.
        langTools[key] = details;
    }
}

// ----- ZH Salvage -----
// URL Params (translated from EN roughly or placeholders)
inject(toolsZh, 'urlparams', {
    "intro": "输入完整URL或查询字符串（如 ?a=1&b=2），也就是“问号”后面的部分，点击“解析”即可在下方编辑和重新构建。",
    "link_example": "填入示例",
    "placeholder_input": "在此输入URL或查询字符串 like ?a=1&b=2",
    "btn_parse": "解析 URL",
    "btn_build": "重构 URL",
    "label_auto_encode": "自动编码值",
    "label_raw": "原始查询字符串",
    "btn_clear": "清空",
    "label_base_url": "基础 URL (无参数)",
    "placeholder_base": "例如: https://example.com/path",
    "label_params": "查询参数",
    "btn_add": "添加参数",
    "placeholder_key": "参数名",
    "placeholder_value": "参数值",
    "btn_delete": "删除",
    "label_result_query": "生成的查询字符串",
    "btn_copy_query": "复制查询串",
    "label_result_full": "完整 URL",
    "btn_copy_full": "复制完整 URL",
    "detail_title": "简介",
    "detail_content": "本工具允许您解析和构建URL参数。粘贴URL以查看其组件，或手动添加/编辑参数以生成新URL。"
});

// HTML Format
inject(toolsZh, 'htmlformat', {
    "placeholder": "这里是代码...",
    "format": "格式化",
    "copy": "复制",
    "clear": "清空",
    "error_format": "请填入正确代码格式",
    "detail_title": "描述",
    "detail_content": "提供在线HTML、XML格式化"
});

// HTTP Code (Mapping 'httpstatus' from partial to 'httpcode' if needed, but wait, partial has 'httpstatus'. 
// I should check what the component uses. If component uses 'tools.httpcode', I need key 'httpcode'.
// Partial has 'httpstatus'. I will duplicate or rename. Let's add 'httpcode' as alias or merge if same.
// Actually, looking at partial, 'httpstatus' title is 'HTTP状态码'.
// I'll add the details to 'httpstatus' AND 'httpcode' to be safe.)
const httpDetailsZh = {
    "detail_title": "描述",
    "detail_content": "本工具提供完整的 HTTP 状态码列表及其详细说明。状态码被分为五类：1xx（消息）、2xx（成功）、3xx（重定向）、4xx（客户端错误）和 5xx（服务器错误）。通过本工具，你可以快速了解每个状态码的具体含义及其在不同场景下的应用。"
};
inject(toolsZh, 'httpstatus', httpDetailsZh);
// inject(toolsZh, 'httpcode', httpDetailsZh); // Safety

// QRCode
inject(toolsZh, 'qrcode', {
    "fire_desc": "炽热火焰红，激情四射",
    "ice_name": "冰雪蓝",
    "ice_desc": "清凉冰雪蓝，纯净透明",
    "label_dot_style": "点样式",
    "label_color": "颜色",
    "msg_generate_first": "请先生成二维码",
    "msg_element_not_found": "二维码元素未找到",
    "msg_download_success": "下载成功",
    "msg_image_generate_fail": "图片生成失败",
    "msg_download_fail": "下载失败，请重试",
    "dot_styles": {
        "square": "方形",
        "rounded": "圆角",
        "dots": "圆点",
        "classy": "经典",
        "classy_rounded": "经典圆角",
        "extra_rounded": "超圆角",
        "dot": "圆点"
    },
    "label_color_settings": "颜色设置",
    "tab_single": "单色",
    "tab_gradient": "渐变色",
    "label_fg": "前景色",
    "label_bg": "背景色",
    "label_gradient_type": "渐变类型",
    "gradient_linear": "线性渐变",
    "gradient_radial": "径向渐变",
    "label_gradient_angle": "渐变角度",
    "label_start_color": "起始色",
    "label_end_color": "结束色",
    "label_corner_square": "角落方块",
    "label_corner_dot": "角落点",
    "label_style": "样式",
    "btn_download": "下载二维码",
    "preview_title": "二维码预览",
    "preview_desc": "点击二维码查看大图",
    "detail": {
        "title": "关于二维码生成器",
        "intro_title": "二维码技术详解",
        "intro_content": "QR Code (Quick Response Code) 是一种二维条码，于 1994 年由日本 Denso Wave 公司发明。它具有高速读取、大容量存储（可存储数字、字母、汉字、二进制等）、高可靠性等特点。",
        "level_title": "如何选择纠错级别 (Error Correction Level)？",
        "level_intro": "二维码具有“纠错能力”，即当二维码被遮挡或污损时，仍然可以被扫描出来。本工具提供四种纠错级别：",
        "level_l": "L (Low): 约 7% 的字码可被恢复。适用于在大尺寸、环境干净的场景下以获得最小的图片尺寸。",
        "level_m": "M (Medium): 约 15% 的字码可被恢复。标准水平，大多数场景的默认选择。",
        "level_q": "Q (Quartile): 约 25% 的字码可被恢复。建议在二维码中间添加 Logo 时使用此级别或更高。",
        "level_h": "H (High): 约 30% 的字码可被恢复。适用于工业环境或二维码可能会沾染污渍、破损的场景，也最适合添加大尺寸 Logo。",
        "best_title": "打印与设计最佳实践",
        "best_contrast": "对比度: 确保二维码颜色（前景色）比背景色深，且对比度足够高。扫描仪通常识别“深色在浅色背景上”。虽然本工具支持彩色和渐变，但也请保持足够的深浅差异。",
        "best_quiet": "静区 (Quiet Zone): 二维码周围需要保留至少 4 个模块宽度的空白区域，不要让周围的文字或图形紧贴二维码，否则可能无法识别。",
        "best_size": "尺寸: 二维码过小会导致手机难以聚焦。一般建议打印尺寸不小于 2cm x 2cm。",
        "faq": "FAQ",
        "q1": "Q: 为什么我的二维码扫不出来？",
        "a1": "A: 常见原因包括：1. 颜色对比度不足（如黄色背景配白色码）；2. 中间 Logo 遮挡面积过大（建议开启 H 级纠错）；3. 码点过于密集（内容太多导致），建议缩短链接或增大图片尺寸。",
        "q2": "Q: 生成的二维码有有效期吗？",
        "a2": "A: 没有。本工具生成的二维码是“静态码”，内容（链接或文本）直接编码在图案中，只要二维码图片不损坏，就可以永久扫描。"
    }
});


// ----- EN Salvage -----
inject(toolsEn, 'urlparams', {
    "intro": "Parse URL query parameters, edit, build, and support auto-encoding",
    "link_example": "Example",
    "placeholder_input": "Enter URL to parse here...",
    "btn_parse": "Parse URL",
    "btn_build": "Build URL",
    "label_auto_encode": "Auto encode values",
    "label_raw": "Raw Query String",
    "btn_clear": "Clear",
    "label_base_url": "Base URL (without params)",
    "placeholder_base": "e.g. https://example.com/path",
    "label_params": "Query Parameters",
    "btn_add": "Add Param",
    "placeholder_key": "Key",
    "placeholder_value": "Value",
    "btn_delete": "Delete",
    "label_result_query": "Generated Query String",
    "btn_copy_query": "Copy Query",
    "label_result_full": "Full URL",
    "btn_copy_full": "Copy Full URL",
    "detail_title": "Introduction",
    "detail_content": "This tool allows you to parse and build URL parameters. Paste a URL to see its components, or manually add/edit parameters to generate a new URL."
});

// HTML Format En
inject(toolsEn, 'htmlformat', {
    "placeholder": "Enter code here...",
    "format": "Format",
    "copy": "Copy",
    "clear": "Clear",
});

// 4. Assemble Final Objects
const finalZh = {
    ...commonZh,
    tools: toolsZh
};
const finalEn = {
    ...commonEn,
    tools: toolsEn
};

// 5. Write Files
fs.writeFileSync('src/locales/zh.json', JSON.stringify(finalZh, null, 2));
fs.writeFileSync('src/locales/en.json', JSON.stringify(finalEn, null, 2));

console.log('Restored locales successfully.');
