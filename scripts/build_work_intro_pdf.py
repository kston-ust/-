from __future__ import annotations

from datetime import date
from pathlib import Path

import fitz
from PIL import Image as PilImage
from PIL import ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


PROJECT_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = PROJECT_ROOT.parent
ASSET_DIR = PROJECT_ROOT / "deliverables" / "assets"
OUTPUT_DIR = WORKSPACE_ROOT / "output" / "pdf"
TMP_DIR = WORKSPACE_ROOT / "tmp" / "pdfs"

PDF_PATH = OUTPUT_DIR / "西域羊都网上交易程序作品介绍.pdf"
RENDER_DIR = TMP_DIR / "西域羊都网上交易程序作品介绍_pages"
COVER_IMAGE = ASSET_DIR / "work-intro-cover.png"
FLOW_IMAGE = TMP_DIR / "xiyu-work-intro-flow-2026.png"

FONT_REGULAR = "MicrosoftYaHei"
FONT_BOLD = "MicrosoftYaHeiBold"
FONT_REGULAR_PATH = Path("C:/Windows/Fonts/msyh.ttc")
FONT_BOLD_PATH = Path("C:/Windows/Fonts/msyhbd.ttc")

INK = colors.HexColor("#203227")
MUTED = colors.HexColor("#5C6C60")
GREEN = colors.HexColor("#1F4D3B")
LIGHT_GREEN = colors.HexColor("#F4F8EF")
BLUE = colors.HexColor("#1F4E79")
LIGHT_BLUE = colors.HexColor("#E8EEF5")
BORDER = colors.HexColor("#D6DFD2")
GOLD = colors.HexColor("#C7A45A")
ROSE = colors.HexColor("#B76E5C")


def register_fonts() -> None:
    pdfmetrics.registerFont(TTFont(FONT_REGULAR, str(FONT_REGULAR_PATH)))
    pdfmetrics.registerFont(TTFont(FONT_BOLD, str(FONT_BOLD_PATH)))


def make_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "TitleCN",
            parent=base["Title"],
            fontName=FONT_BOLD,
            fontSize=25,
            leading=31,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=8,
            wordWrap="CJK",
        ),
        "subtitle": ParagraphStyle(
            "SubtitleCN",
            parent=base["Normal"],
            fontName=FONT_REGULAR,
            fontSize=14,
            leading=20,
            textColor=GREEN,
            alignment=TA_LEFT,
            spaceAfter=14,
            wordWrap="CJK",
        ),
        "meta": ParagraphStyle(
            "MetaCN",
            parent=base["Normal"],
            fontName=FONT_REGULAR,
            fontSize=9.2,
            leading=13,
            textColor=MUTED,
            alignment=TA_LEFT,
            spaceAfter=8,
            wordWrap="CJK",
        ),
        "h1": ParagraphStyle(
            "Heading1CN",
            parent=base["Heading1"],
            fontName=FONT_BOLD,
            fontSize=15.5,
            leading=21,
            textColor=BLUE,
            spaceBefore=12,
            spaceAfter=7,
            keepWithNext=True,
            wordWrap="CJK",
        ),
        "h2": ParagraphStyle(
            "Heading2CN",
            parent=base["Heading2"],
            fontName=FONT_BOLD,
            fontSize=12.2,
            leading=17,
            textColor=GREEN,
            spaceBefore=8,
            spaceAfter=5,
            keepWithNext=True,
            wordWrap="CJK",
        ),
        "body": ParagraphStyle(
            "BodyCN",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=10.2,
            leading=15.2,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=6,
            firstLineIndent=18,
            wordWrap="CJK",
        ),
        "body_plain": ParagraphStyle(
            "BodyPlainCN",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=10.1,
            leading=15,
            textColor=INK,
            alignment=TA_LEFT,
            spaceAfter=5,
            wordWrap="CJK",
        ),
        "small": ParagraphStyle(
            "SmallCN",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=8.7,
            leading=12.2,
            textColor=INK,
            alignment=TA_LEFT,
            wordWrap="CJK",
        ),
        "table_header": ParagraphStyle(
            "TableHeaderCN",
            parent=base["BodyText"],
            fontName=FONT_BOLD,
            fontSize=9.1,
            leading=12.8,
            textColor=BLUE,
            alignment=TA_CENTER,
            wordWrap="CJK",
        ),
        "table_cell": ParagraphStyle(
            "TableCellCN",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=8.8,
            leading=12.6,
            textColor=INK,
            alignment=TA_LEFT,
            wordWrap="CJK",
        ),
        "callout": ParagraphStyle(
            "CalloutCN",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=9.8,
            leading=14.2,
            textColor=INK,
            spaceAfter=0,
            wordWrap="CJK",
        ),
        "toc": ParagraphStyle(
            "TocCN",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=10,
            leading=16,
            textColor=INK,
            wordWrap="CJK",
        ),
        "right": ParagraphStyle(
            "RightCN",
            parent=base["BodyText"],
            fontName=FONT_REGULAR,
            fontSize=8.8,
            leading=12,
            textColor=MUTED,
            alignment=TA_RIGHT,
            wordWrap="CJK",
        ),
    }


def p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text, style)


def table_text(value: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(value.replace("\n", "<br/>"), style)


def make_table(
    headers: list[str],
    rows: list[list[str]],
    widths: list[float],
    styles: dict[str, ParagraphStyle],
    repeat_header: bool = True,
) -> Table:
    data = [[table_text(header, styles["table_header"]) for header in headers]]
    for row in rows:
        data.append([table_text(cell, styles["table_cell"]) for cell in row])

    table = Table(data, colWidths=widths, repeatRows=1 if repeat_header else 0, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BLUE),
                ("TEXTCOLOR", (0, 0), (-1, 0), BLUE),
                ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAFCF7")]),
            ]
        )
    )
    return table


def callout(label: str, text: str, styles: dict[str, ParagraphStyle]) -> Table:
    content = Paragraph(f"<b>{label}</b>  {text}", styles["callout"])
    table = Table([[content]], colWidths=[6.45 * inch], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT_GREEN),
                ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#C9D8CE")),
                ("LEFTPADDING", (0, 0), (-1, -1), 11),
                ("RIGHTPADDING", (0, 0), (-1, -1), 11),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    return table


def draw_flow_image() -> None:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    width, height = 1900, 920
    image = PilImage.new("RGB", (width, height), "#F5F7F0")
    draw = ImageDraw.Draw(image)
    font_title = ImageFont.truetype(str(FONT_BOLD_PATH), 58)
    font_subtitle = ImageFont.truetype(str(FONT_REGULAR_PATH), 30)
    font_block = ImageFont.truetype(str(FONT_BOLD_PATH), 34)
    font_small = ImageFont.truetype(str(FONT_REGULAR_PATH), 25)

    draw.text((72, 56), "系统结构与数据闭环", fill="#203227", font=font_title)
    draw.text(
        (72, 128),
        "消费者下单、平台分配、商户供货、供应链撮合与后台运营数据形成同一条业务链路",
        fill="#5C6C60",
        font=font_subtitle,
    )

    blocks = [
        ("消费者商城", ["商品浏览", "购物车下单", "订单查询"]),
        ("FastAPI 接口", ["订单校验", "金额计算", "状态版本"]),
        ("SQLite 数据层", ["商品/订单", "商户/挂单", "履约/金融"]),
        ("运营数据中心", ["订单监控", "单单/批量分配", "趋势分析"]),
        ("商户工作区", ["任务查看", "保障上传", "新增挂单"]),
        ("供应链撮合", ["农户挂单", "动态收购价", "JIT 排产"]),
    ]
    x_positions = [72, 375, 678, 981, 1284, 1587]
    y = 260
    block_w, block_h = 230, 215
    for i, (title, lines) in enumerate(blocks):
        x = x_positions[i]
        fill = "#FFFFFF" if i % 2 == 0 else "#EAF4ED"
        draw.rounded_rectangle((x, y, x + block_w, y + block_h), radius=24, fill=fill, outline="#BFD6C7", width=4)
        draw.text((x + 24, y + 38), title, fill="#1F4D3B", font=font_block)
        for line_idx, line in enumerate(lines):
            draw.text((x + 26, y + 102 + line_idx * 36), line, fill="#5C6C60", font=font_small)
        if i < len(blocks) - 1:
            x1 = x + block_w + 16
            x2 = x_positions[i + 1] - 18
            yy = y + block_h // 2
            draw.line((x1, yy, x2, yy), fill="#2F735A", width=6)
            draw.polygon([(x2, yy), (x2 - 20, yy - 12), (x2 - 20, yy + 12)], fill="#2F735A")

    draw.rounded_rectangle((88, 570, 1812, 785), radius=26, fill="#FFFFFF", outline="#D6DFD2", width=4)
    notes = [
        ("前台交易", ["顾客提交订单后，后端写入", "订单与明细，并更新版本。"]),
        ("后台管理", ["运营人员查看分配状态、", "商户、销量和趋势分析。"]),
        ("供给响应", ["商户处理需求任务和挂单，", "供应链模块完成撮合排产。"]),
    ]
    start_x = 130
    for idx, (head, body_lines) in enumerate(notes):
        x = start_x + idx * 560
        draw.text((x, 622), head, fill="#1F4D3B", font=font_block)
        for line_idx, line in enumerate(body_lines):
            draw.text((x, 676 + line_idx * 34), line, fill="#203227", font=font_small)

    draw.text((72, 835), "刷新机制：前端与后台每 5 秒轻量检查 /api/change-state，发现订单变化后自动更新页面。", fill="#5C6C60", font=font_small)
    image.save(FLOW_IMAGE, quality=95)


def add_bullet_items(story: list, items: list[str], styles: dict[str, ParagraphStyle]) -> None:
    bullet_style = ParagraphStyle(
        "BulletCN",
        parent=styles["body_plain"],
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4,
    )
    for item in items:
        story.append(Paragraph(f"• {item}", bullet_style))


def add_numbered_steps(story: list, steps: list[str], styles: dict[str, ParagraphStyle]) -> None:
    step_style = ParagraphStyle(
        "StepCN",
        parent=styles["body_plain"],
        leftIndent=18,
        firstLineIndent=-18,
        spaceAfter=5,
    )
    for index, step in enumerate(steps, start=1):
        story.append(Paragraph(f"{index}. {step}", step_style))


def scaled_image(path: Path, width: float, max_height: float | None = None) -> Image:
    image = PilImage.open(path)
    ratio = image.height / image.width
    height = width * ratio
    if max_height and height > max_height:
        height = max_height
        width = height / ratio
    return Image(str(path), width=width, height=height)


def build_story(styles: dict[str, ParagraphStyle]) -> list:
    draw_flow_image()
    story: list = []

    story.append(p("西域羊都网上交易程序", styles["title"]))
    story.append(p("作品介绍文档", styles["subtitle"]))
    story.append(
        p(
            "内容范围：作品开发平台、主要软件、详细操作方法、作品亮点与特色。"
            f"生成日期：{date.today().strftime('%Y年%m月%d日')}",
            styles["meta"],
        )
    )
    if COVER_IMAGE.exists():
        story.append(scaled_image(COVER_IMAGE, 6.45 * inch, 3.65 * inch))
        story.append(Spacer(1, 10))
    story.append(
        callout(
            "作品定位",
            "本作品以西北羊产业数字化供应链为业务背景，构建了消费者商城、平台运营后台、商户工作区和供应链撮合模块协同运行的网上交易程序。",
            styles,
        )
    )
    story.append(Spacer(1, 10))
    story.append(
        make_table(
            ["项目项", "说明"],
            [
                ["作品名称", "西域羊都网上交易程序"],
                ["作品类型", "前后端分离的电商交易与运营数据监控系统"],
                ["核心角色", "消费者、平台运营人员、商户、供应链供给方"],
                ["访问入口", "前端商城 http://127.0.0.1:5173/；后端后台 http://127.0.0.1:8000/ 或 /admin"],
                ["交付内容", "React 前端、FastAPI 后端、SQLite 数据库、测试用例、作品介绍 PDF"],
            ],
            [1.45 * inch, 5.0 * inch],
            styles,
            repeat_header=False,
        )
    )

    story.append(PageBreak())
    story.append(p("文档目录", styles["h1"]))
    for item in [
        "一、作品概述",
        "二、作品开发平台",
        "三、主要软件",
        "四、系统结构与数据流",
        "五、详细操作方法",
        "六、作品亮点与特色",
        "七、测试与实现程度",
        "八、作品总结",
    ]:
        story.append(p(item, styles["toc"]))

    story.append(p("一、作品概述", styles["h1"]))
    story.append(
        p(
            "西域羊都网上交易程序围绕“产地直供、数字溯源、冷链履约、订单归纳、商户协同”五个环节展开。"
            "系统不是单一静态展示页，而是可以完成商品浏览、购物车下单、订单查询、后台分配、商户登录、供货挂单和供应链撮合的可运行程序。",
            styles["body"],
        )
    )
    add_bullet_items(
        story,
        [
            "消费者端负责购买体验：商品筛选、采购场景选择、购物车金额计算、订单提交和订单查询。",
            "平台后台负责运营管理：订单监控、分配状态、商户管理、单单分配、批量分配、销量与趋势分析。",
            "商户端负责供给响应：账号密码登录、查看后台分配来的需求任务、上传保障信息、新增供货挂单。",
            "供应链模块负责业务延展：农户在线挂单、订单与挂单撮合、动态收购价和 JIT 排产结果。",
        ],
        styles,
    )

    story.append(p("二、作品开发平台", styles["h1"]))
    story.append(
        make_table(
            ["平台要素", "采用方案", "作用"],
            [
                ["开发环境", "Windows 本地工作区", "完成代码开发、调试运行、测试执行和文档生成。"],
                ["前端运行平台", "Node.js + Vite 开发服务器", "启动 React 商城界面，支持热更新与生产构建。"],
                ["后端运行平台", "Python + FastAPI + Uvicorn", "提供 REST API、后台运营数据中心、业务校验和订单计算能力。"],
                ["数据平台", "SQLite 本地数据库", "保存商品、订单、商户、挂单、履约、金融与收益样例数据。"],
                ["测试平台", "Python unittest + Node test", "验证后端汇总逻辑、页面约束、前端金额计算和刷新判断。"],
                ["版本管理", "Git + GitHub", "记录功能迭代，便于打包、发布和后续维护。"],
            ],
            [1.3 * inch, 2.0 * inch, 3.15 * inch],
            styles,
        )
    )

    story.append(p("三、主要软件", styles["h1"]))
    story.append(
        make_table(
            ["软件/框架", "所在模块", "主要用途"],
            [
                ["React", "前端", "构建消费者商城、商户工作区、弹窗登录、任务卡片和订单展示。"],
                ["Vite", "前端", "提供前端开发服务器、模块热更新和生产构建能力。"],
                ["FastAPI", "后端", "定义商品、订单、商户、分配、汇总、溯源、供货挂单和撮合接口。"],
                ["Uvicorn", "后端", "运行 ASGI Web 服务，使前端可以访问后端 API。"],
                ["SQLite", "后端数据", "存储样例交易数据和平台运营数据，便于本地演示。"],
                ["Pydantic", "后端校验", "对订单、商户登录、商户管理和供货挂单请求进行字段校验。"],
                ["Python unittest / Node test", "测试", "验证订单闭环、商户逻辑、供应链算法和前端工具函数。"],
            ],
            [1.45 * inch, 1.35 * inch, 3.7 * inch],
            styles,
        )
    )

    story.append(p("四、系统结构与数据流", styles["h1"]))
    story.append(scaled_image(FLOW_IMAGE, 6.55 * inch, 3.25 * inch))
    story.append(Spacer(1, 6))
    story.append(
        p(
            "系统采用前后端分离结构。前端不直接写数据库，所有订单创建都通过 POST /api/orders 提交给后端。"
            "后端完成商品校验、金额计算、订单写入和汇总归纳，同时向运营后台提供订单监控、分配、商户管理和趋势分析。"
            "商户登录后只查看与自己相关的任务和挂单信息，消费者页面与商户工作区保持职责边界清晰。",
            styles["body"],
        )
    )

    story.append(PageBreak())
    story.append(p("五、详细操作方法", styles["h1"]))
    story.append(p("1. 一键启动方式", styles["h2"]))
    add_numbered_steps(
        story,
        [
            '进入项目目录：cd "E:\\数媒，羊\\xiyu-yangdu-trading-work-20260530-164320"。',
            "运行一键启动脚本：.\\启动前后端.ps1；也可以双击 启动前后端.bat。",
            "等待脚本显示服务就绪后，打开前端商城 http://localhost:5173 和后端后台 http://localhost:8000/admin。",
        ],
        styles,
    )
    story.append(p("2. 手动启动后端服务", styles["h2"]))
    add_numbered_steps(
        story,
        [
            "进入 backend 目录，安装依赖：python -m pip install -r requirements.txt。",
            "运行后端：uvicorn app.main:app --reload --port 8000。",
            "打开 http://127.0.0.1:8000/ 查看运营数据中心；打开 http://127.0.0.1:8000/docs 查看接口文档。",
        ],
        styles,
    )
    story.append(p("3. 手动启动前端商城", styles["h2"]))
    add_numbered_steps(
        story,
        [
            "进入 frontend 目录，安装依赖：npm install。",
            "运行前端：npm run dev。",
            "访问 http://127.0.0.1:5173，查看消费者商城、商品分类、保障信息和订单确认区。",
        ],
        styles,
    )
    story.append(p("4. 体验消费者交易流程", styles["h2"]))
    add_numbered_steps(
        story,
        [
            "在商城中选择“全部、基石产品、增长产品、溢价产品”等分类，浏览商品产地、价格和溯源标签。",
            "选择采购场景，填写采购方名称，点击加入购物车并调整数量。",
            "点击提交订单，后端会接收订单、计算总额、写入订单明细，并返回订单号。",
            "使用“我的订单确认”区域输入订单号、客户名或商品名，查询本次交易记录。",
        ],
        styles,
    )
    story.append(p("5. 体验平台后台与商户流程", styles["h2"]))
    add_numbered_steps(
        story,
        [
            "打开后端运营数据中心，查看订单监控、分配状态、商户管理、库存、销量和趋势分析。",
            "在后台对订单进行单独分配或批量分配，使订单进入商户任务链路。",
            "回到前端，点击“商户入口”，使用演示账号 hht / 123456、xijing / 123456 或 tumen / 123456 登录。",
            "商户登录后查看需求任务、按订单或商品查询任务，并在“我的产品提供信息”中新增供货挂单。",
            "访问 /api/supply-matches 查看已支付订单与农户挂单的撮合、动态收购价和 JIT 排产结果。",
        ],
        styles,
    )
    story.append(
        callout(
            "操作提示",
            "如果后端未启动，前端会使用内置演示数据，适合展示页面样式；如果要验证真实订单写入、后台刷新和商户任务，请同时启动前后端服务。",
            styles,
        )
    )

    story.append(p("六、作品亮点与特色", styles["h1"]))
    story.append(
        make_table(
            ["亮点", "体现方式", "价值"],
            [
                ["角色边界清晰", "消费者商城、平台后台、商户工作区各自承担不同职责。", "贴近真实业务分工，减少页面和权限混用。"],
                ["真实订单闭环", "前端 POST /api/orders 下单，后端写入订单并重新归纳 summary 数据。", "证明页面交互能够驱动后端数据变化。"],
                ["后台分配机制", "运营人员可单独分配订单，也可批量分配已确认未分配订单。", "把交易从消费者下单延伸到平台履约管理。"],
                ["商户协同能力", "商户登录后查看任务、查询任务、提交供货挂单和保障信息。", "表现平台与供给端协作的完整链路。"],
                ["供应链撮合扩展", "供应链接口输出农户挂单、订单撮合、动态收购价和 JIT 排产。", "体现数字化供应链不止是卖货页面。"],
                ["自动刷新机制", "前端和后台每 5 秒检查\n/api/change-state，发现订单变化后自动刷新。", "减少人工刷新，模拟实时交易场景。"],
                ["产业场景贴合", "页面围绕溯源、冷链、库存、渠道、客户结构和养殖户增收展开。", "突出西北羊产业数字化平台主题。"],
                ["测试覆盖意识", "后端、前端和供应链算法均保留测试入口。", "提升作品可信度和后续维护能力。"],
            ],
            [1.38 * inch, 2.45 * inch, 2.67 * inch],
            styles,
        )
    )

    story.append(p("七、测试与实现程度", styles["h1"]))
    story.append(
        p(
            "项目已设置前后端测试和构建命令。后端测试覆盖综合经营汇总、后台页面约束、商户数据、订单分配和供应链撮合；"
            "前端测试覆盖购物车金额、订单查询、商户登录条件、商户任务筛选和自动刷新判断。",
            styles["body"],
        )
    )
    story.append(
        make_table(
            ["验证项", "命令或证据", "说明"],
            [
                ["后端单元测试", "python -m unittest discover -s tests", "验证 API 依赖的数据逻辑、后台页面和供应链算法。"],
                ["前端单元测试", "npm test", "验证前端工具函数、提交条件、任务筛选与刷新判断。"],
                ["前端生产构建", "npm run build", "验证 Vite 项目可以生成可发布版本。"],
                ["接口联动验证", "前端提交订单后，后端订单数、金额、版本与后台指标发生变化。", "证明前后端数据流和自动刷新逻辑可用。"],
            ],
            [1.45 * inch, 2.3 * inch, 2.75 * inch],
            styles,
        )
    )

    story.append(p("八、作品总结", styles["h1"]))
    story.append(
        p(
            "本作品将西域羊都的产业背景转化为一套可运行的软件系统：前端面向消费者完成交易，后端面向平台完成数据归纳和运营管理，商户端面向供给方完成任务响应，供应链模块面向撮合与排产进行业务延展。"
            "作品的核心特色在于功能链路完整、角色职责明确、数据能够随订单变化自动更新，并且能通过测试和接口验证支撑演示可信度。",
            styles["body"],
        )
    )
    story.append(p("主要访问入口", styles["h2"]))
    story.append(
        make_table(
            ["入口", "地址或命令", "用途"],
            [
                ["消费者商城", "http://localhost:5173", "浏览商品、加入购物车、提交订单、查询订单。"],
                ["后端运营后台", "http://localhost:8000/admin", "查看订单监控、商户管理、分配状态、库存和趋势分析。"],
                ["接口文档", "http://localhost:8000/docs", "查看 FastAPI 自动生成的接口说明和调试入口。"],
                ["商户演示账号", "hht / 123456\nxijing / 123456\ntumen / 123456", "从前端“商户入口”登录，查看任务并新增供货挂单。"],
                ["供应链撮合", "/api/supply-matches", "查看订单与农户挂单撮合、动态收购价和 JIT 排产结果。"],
            ],
            [1.25 * inch, 2.3 * inch, 2.95 * inch],
            styles,
        )
    )
    story.append(
        callout(
            "最终评价",
            "该作品既有视觉展示，也有可运行逻辑；既能体现电商交易流程，也能体现后台管理、商户协同和供应链数字化特色，适合作为数字媒体与软件应用结合的综合作品展示。",
            styles,
        )
    )

    return story


def draw_page_frame(canvas, doc) -> None:
    page = canvas.getPageNumber()
    width, height = letter
    canvas.saveState()
    if page > 1:
        canvas.setStrokeColor(colors.HexColor("#D6DFD2"))
        canvas.setLineWidth(0.6)
        canvas.line(doc.leftMargin, height - 0.62 * inch, width - doc.rightMargin, height - 0.62 * inch)
        canvas.setFont(FONT_REGULAR, 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(doc.leftMargin, height - 0.48 * inch, "西域羊都网上交易程序 · 作品介绍")
        canvas.drawRightString(width - doc.rightMargin, height - 0.48 * inch, f"第 {page} 页")
    canvas.setStrokeColor(colors.HexColor("#D6DFD2"))
    canvas.setLineWidth(0.6)
    canvas.line(doc.leftMargin, 0.55 * inch, width - doc.rightMargin, 0.55 * inch)
    canvas.setFont(FONT_REGULAR, 8)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(width - doc.rightMargin, 0.36 * inch, f"Page {page}")
    canvas.restoreState()


def build_pdf() -> None:
    register_fonts()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    styles = make_styles()
    doc = SimpleDocTemplate(
        str(PDF_PATH),
        pagesize=letter,
        leftMargin=0.78 * inch,
        rightMargin=0.78 * inch,
        topMargin=0.82 * inch,
        bottomMargin=0.78 * inch,
        title="西域羊都网上交易程序作品介绍",
        author="Codex",
        subject="作品开发平台、主要软件、详细操作方法及作品亮点特色",
    )
    story = build_story(styles)
    doc.build(story, onFirstPage=draw_page_frame, onLaterPages=draw_page_frame)


def render_pdf() -> None:
    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    for old_file in RENDER_DIR.glob("page-*.png"):
        old_file.unlink()
    pdf = fitz.open(PDF_PATH)
    for index, page in enumerate(pdf, start=1):
        pix = page.get_pixmap(matrix=fitz.Matrix(1.7, 1.7), alpha=False)
        pix.save(RENDER_DIR / f"page-{index:02d}.png")
    print(PDF_PATH)
    print(RENDER_DIR)
    print(len(pdf))


def main() -> None:
    build_pdf()
    render_pdf()


if __name__ == "__main__":
    main()
