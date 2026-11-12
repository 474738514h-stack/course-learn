import type { KnowledgePoint } from '../types'

/** 九年级上册 · 教材目录知识点（来源：TapXWorld/ChinaTextbook） */
export const TEXTBOOK_KNOWLEDGE_SOURCE = {
  "repo": "https://github.com/TapXWorld/ChinaTextbook",
  "chinese": "初中/语文/统编版-人民教育出版社/九年级/义务教育教科书·语文九年级上册.pdf",
  "math": "初中/数学/浙教版-浙江教育出版社/九年级/义务教育教科书·数学九年级上册.pdf",
  "history": "初中/历史/统编版-人民教育出版社/九年级/义务教育教科书·世界历史九年级上册.pdf"
} as const

export const GRADE9_CHINESE_KNOWLEDGE: KnowledgePoint[] = [
  {
    "id": "g9-c-01",
    "term": "第一单元 活动·探究",
    "aliases": [
      "活动探究"
    ],
    "category": "preset",
    "description": "通过诗歌阅读、朗诵与创作，训练审美与表达。",
    "detail": "统编《语文》九年级上册第一单元。任务一鉴赏、任务二朗诵、任务三创作；重在意象、节奏与情感。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-02",
    "term": "沁园春·雪",
    "aliases": [
      "沁园春"
    ],
    "category": "preset",
    "description": "毛泽东词作，写北国冬景与革命豪情。",
    "detail": "上阕写景、下阕评史；掌握“惜”字领起与宏大意象。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-03",
    "term": "周总理，你在哪里",
    "aliases": [],
    "category": "preset",
    "description": "柯岩抒情诗，用反复与呼告表达对周总理的怀念。",
    "detail": "注意排比、反复修辞；朗读时把握情感递进。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-04",
    "term": "我爱这土地",
    "aliases": [],
    "category": "preset",
    "description": "艾青代表作，以“土地”“河流”等意象抒发爱国之情。",
    "detail": "象征手法；结尾“因为我对这土地爱得深沉”点题。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-05",
    "term": "乡愁",
    "aliases": [],
    "category": "preset",
    "description": "余光中诗歌，用邮票、船票等意象写思乡。",
    "detail": "意象串联结构；适合分析比喻与情感层次。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-06",
    "term": "你是人间的四月天",
    "aliases": [],
    "category": "preset",
    "description": "林徽因诗歌，以“四月天”比喻温暖与美好。",
    "detail": "比喻、拟人；语言清新，适合朗读体会音韵。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-07",
    "term": "我看",
    "aliases": [],
    "category": "preset",
    "description": "穆旦诗歌，写青春感受与自然生命力。",
    "detail": "关注动词的动态描写与情感基调。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-08",
    "term": "第二单元 议论性文本",
    "aliases": [],
    "category": "preset",
    "description": "学习议论文阅读：找论点、论据与论证方法。",
    "detail": "统编《语文》九年级上册第二单元；配合写作“观点要明确”。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-09",
    "term": "敬业与乐业",
    "aliases": [
      "敬业乐业"
    ],
    "category": "preset",
    "description": "梁启超演讲，提出“敬业乐业”的人生态度。",
    "detail": "中心论点与分论点；举例论证、道理论证。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-10",
    "term": "就英法联军远征中国致巴特勒上尉的信",
    "aliases": [
      "巴特勒上尉的信"
    ],
    "category": "preset",
    "description": "雨果书信体杂文，谴责侵略、捍卫文明与正义。",
    "detail": "驳论；区分作者态度与叙述对象。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-11",
    "term": "论教养",
    "aliases": [],
    "category": "preset",
    "description": "利哈乔夫论说“教养”体现在细节与尊重他人。",
    "detail": "举例论证；联系生活理解“外在礼仪与内在修养”。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-12",
    "term": "精神的三间小屋",
    "aliases": [],
    "category": "preset",
    "description": "毕淑敏散文，用比喻写精神世界的规划与平衡。",
    "detail": "比喻论证；三间小屋分别对应不同精神需求。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-13",
    "term": "观点要明确",
    "aliases": [],
    "category": "preset",
    "description": "议论文写作要求：立意清楚，论点可判断。",
    "detail": "避免论题过大；论点宜放在段首或段尾。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-14",
    "term": "君子自强不息",
    "aliases": [],
    "category": "preset",
    "description": "综合性学习：积累典故，理解“自强”精神。",
    "detail": "可结合名言、故事做展示与讨论。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-15",
    "term": "第三单元 古诗文",
    "aliases": [],
    "category": "preset",
    "description": "文言文与诗词阅读，积累实词、虚词与名句。",
    "detail": "统编《语文》九年级上册第三单元；写作“议论要言之有据”。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-16",
    "term": "岳阳楼记",
    "aliases": [],
    "category": "preset",
    "description": "范仲淹散文，借重修岳阳楼抒发“先天下之忧而忧”。",
    "detail": "写景与抒情结合；掌握“迁客骚人”对比与主旨句。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-17",
    "term": "醉翁亭记",
    "aliases": [],
    "category": "preset",
    "description": "欧阳修散文，写滁州山水与“与民同乐”。",
    "detail": "游踪式结构；“也”字句与乐的含义层次。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-18",
    "term": "湖心亭看雪",
    "aliases": [],
    "category": "preset",
    "description": "张岱小品，雪夜独赏西湖，写孤高与故国之思。",
    "detail": "白描手法；结尾“莫说相公痴”的含义。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-19",
    "term": "行路难（其一）",
    "aliases": [],
    "category": "preset",
    "description": "李白乐府，写仕途受阻仍存“长风破浪”之志。",
    "detail": "比喻与象征；“闲来垂钓”等典故需结合注释。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-20",
    "term": "酬乐天扬州初逢席上见赠",
    "aliases": [],
    "category": "preset",
    "description": "刘禹锡酬答诗，含贬谪感怀与哲理名句。",
    "detail": "“沉舟侧畔千帆过”等名句的思想感情。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-21",
    "term": "水调歌头",
    "aliases": [],
    "category": "preset",
    "description": "苏轼中秋词，由思亲上升到人生达观。",
    "detail": "上阕问月、下阕祝愿；“人有悲欢离合”哲理。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-22",
    "term": "第四单元 小说",
    "aliases": [],
    "category": "preset",
    "description": "阅读小说：人物、情节、环境与主题。",
    "detail": "统编《语文》九年级上册第四单元；写作“学习缩写”。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-23",
    "term": "故乡",
    "aliases": [],
    "category": "preset",
    "description": "鲁迅小说，通过闰土变化写乡土衰败与知识分子的迷茫。",
    "detail": "对比手法；关注“故乡”意象与结尾“路”的思考。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-24",
    "term": "我的叔叔于勒",
    "aliases": [],
    "category": "preset",
    "description": "莫泊桑小说，借家庭态度变化讽刺金钱至上。",
    "detail": "情节反转；分析人物语言与心理。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-25",
    "term": "孤独之旅",
    "aliases": [],
    "category": "preset",
    "description": "曹文轩小说，写少年在孤独中成长。",
    "detail": "环境描写烘托心理；关注“鸭群”与“成长”主题。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-26",
    "term": "走进小说天地",
    "aliases": [],
    "category": "preset",
    "description": "综合性学习：梳理人物关系与情节卡片。",
    "detail": "可做“小说要素”小项目。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-27",
    "term": "第五单元 论证方法",
    "aliases": [],
    "category": "preset",
    "description": "深化议论文：道理论证、举例论证、对比论证等。",
    "detail": "统编《语文》九年级上册第五单元；写作“论证要合理”。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-28",
    "term": "中国人失掉自信力了吗",
    "aliases": [],
    "category": "preset",
    "description": "鲁迅杂文，驳斥“国民劣根论”，指出“中国的脊梁”。",
    "detail": "驳论与立论结合；抓住“倘若”等反问句。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-29",
    "term": "怀疑与学问",
    "aliases": [],
    "category": "preset",
    "description": "顾颉刚议论文，提出“学则须疑”的治学方法。",
    "detail": "层进结构；分论点之间逻辑要理清。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-30",
    "term": "谈创造性思维",
    "aliases": [],
    "category": "preset",
    "description": "说明创造性思维需要问题意识与多元答案。",
    "detail": "举例论证；联系创新、批判性思维理解。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-31",
    "term": "创造宣言",
    "aliases": [],
    "category": "preset",
    "description": "陶行知演讲，号召人人皆可创造。",
    "detail": "排比、呼告；区分“创造”与“模仿”。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-32",
    "term": "讨论",
    "aliases": [],
    "category": "preset",
    "description": "口语交际：倾听、表达、应对与文明用语。",
    "detail": "课堂讨论要扣题、讲依据、尊重他人。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-33",
    "term": "第六单元 古典名著",
    "aliases": [],
    "category": "preset",
    "description": "长篇节选：把握人物、情节与章回体特点。",
    "detail": "统编《语文》九年级上册第六单元；写作“学习改写”。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-34",
    "term": "智取生辰纲",
    "aliases": [],
    "category": "preset",
    "description": "《水浒传》节选，写吴用等人劫取生辰纲。",
    "detail": "情节与人物智谋；注意杨志性格与团队配合。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-35",
    "term": "范进中举",
    "aliases": [],
    "category": "preset",
    "description": "《儒林外史》节选，讽刺科举对精神的扭曲。",
    "detail": "夸张与细节；范进“喜极而疯”的社会原因。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-36",
    "term": "三顾茅庐",
    "aliases": [],
    "category": "preset",
    "description": "《三国演义》节选，刘备礼贤与诸葛亮隆中对。",
    "detail": "对话推动情节；隆中对中的天下大势分析。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-37",
    "term": "刘姥姥进大观园",
    "aliases": [],
    "category": "preset",
    "description": "《红楼梦》节选，通过刘姥姥视角写贾府奢华。",
    "detail": "对比与讽刺；关注语言幽默与人物身份。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-38",
    "term": "水浒传",
    "aliases": [],
    "category": "preset",
    "description": "名著导读：英雄传奇、章回体与“官逼民反”。",
    "detail": "可梳理主要人物与“逼上梁山”的主题。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-39",
    "term": "艾青诗选",
    "aliases": [],
    "category": "preset",
    "description": "名著导读：土地与太阳意象，关注现实关怀。",
    "detail": "读诗抓意象群与情感基调。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-40",
    "term": "议论要言之有据",
    "aliases": [],
    "category": "preset",
    "description": "写作要求：论据真实、典型，能支撑论点。",
    "detail": "道理论据与事实论据要匹配论点。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-41",
    "term": "学习缩写",
    "aliases": [],
    "category": "preset",
    "description": "写作要求：删枝保干，保留要素，语言简洁。",
    "detail": "可先列提纲再压缩字数。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-42",
    "term": "学习改写",
    "aliases": [],
    "category": "preset",
    "description": "写作要求：改文体、人称或视角，内容忠于原意。",
    "detail": "改写时注明改写角度与目的。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-43",
    "term": "课外古诗词诵读",
    "aliases": [],
    "category": "preset",
    "description": "附录诗词，扩大积累，配合默写与鉴赏。",
    "detail": "九上附录篇目，注意意象与作者背景。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-44",
    "term": "诗歌朗诵",
    "aliases": [],
    "category": "preset",
    "description": "活动·探究：节奏、重音、停连与情感表达。",
    "detail": "朗诵前理解诗意，避免“念字”不“传情”。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-45",
    "term": "尝试创作",
    "aliases": [],
    "category": "preset",
    "description": "活动·探究：仿写短诗，注意分行与意象选择。",
    "detail": "可从身边事物选意象，不必刻意押韵。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-46",
    "term": "论证要合理",
    "aliases": [],
    "category": "preset",
    "description": "写作要求：论据与结论之间逻辑严密，避免以偏概全。",
    "detail": "检查因果是否成立、有无偷换概念。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-47",
    "term": "文言文实词",
    "aliases": [],
    "category": "preset",
    "description": "九上文言篇目中的重点实词（一词多义、古今异义）。",
    "detail": "结合语境记义项，如“顾”“遗”“属”等。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-48",
    "term": "文言文虚词",
    "aliases": [],
    "category": "preset",
    "description": "常见虚词之、其、而、以、于等的用法。",
    "detail": "做翻译题时先判虚词功能再选义项。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-49",
    "term": "小说三要素",
    "aliases": [],
    "category": "preset",
    "description": "人物、情节、环境相互作用，推动主题表达。",
    "detail": "分析小说从三要素入手，再归纳主题。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-c-50",
    "term": "议论文三要素",
    "aliases": [],
    "category": "preset",
    "description": "论点、论据、论证；论点要明确，论证要扣论。",
    "detail": "阅读时先找中心论点，再找支撑材料。",
    "relatedTerms": [],
    "tags": [
      "语文",
      "九上教材",
      "ChinaTextbook"
    ]
  }
]

export const GRADE9_MATH_KNOWLEDGE: KnowledgePoint[] = [
  {
    "id": "g9-m-01",
    "term": "第1章 二次函数",
    "aliases": [
      "二次函数章"
    ],
    "category": "preset",
    "description": "本章研究抛物线的表达式、图象、性质及实际应用。",
    "detail": "浙教版《数学》九年级上册第1章，含 1.1～1.5 与综合实践。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-02",
    "term": "二次函数的意义",
    "aliases": [],
    "category": "preset",
    "description": "形如 y=ax²+bx+c（a≠0）的函数，描述许多曲线运动与面积问题。",
    "detail": "浙教版《数学》九年级上册 §1.1。理解自变量、因变量及 a 对开口的影响。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-03",
    "term": "二次函数的图象",
    "aliases": [
      "抛物线"
    ],
    "category": "preset",
    "description": "图象是抛物线，可求顶点、对称轴与开口方向。",
    "detail": "浙教版《数学》九年级上册 §1.2。会用描点法或公式画草图。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-04",
    "term": "二次函数的性质",
    "aliases": [],
    "category": "preset",
    "description": "在对称轴两侧增减性相反，可求最大（小）值。",
    "detail": "浙教版《数学》九年级上册 §1.3。注意定义域（实际问题中的 x 范围）。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-05",
    "term": "二次函数与一元二次方程",
    "aliases": [
      "数形结合"
    ],
    "category": "preset",
    "description": "抛物线与 x 轴交点的横坐标就是对应方程 ax²+bx+c=0 的实根。",
    "detail": "浙教版《数学》九年级上册 §1.4。用判别式 Δ 判断交点个数。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-06",
    "term": "二次函数的应用",
    "aliases": [],
    "category": "preset",
    "description": "把利润、面积、运动路径等问题化为求二次函数最值。",
    "detail": "浙教版《数学》九年级上册 §1.5。先设变量、列函数，再求顶点或配方。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-07",
    "term": "体育运动与心率",
    "aliases": [],
    "category": "preset",
    "description": "综合实践：用数据与函数关系分析运动强度。",
    "detail": "浙教版《数学》九年级上册 第1章实践。重在建模与解释结果。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-08",
    "term": "第2章 随机事件的概率",
    "aliases": [
      "概率章"
    ],
    "category": "preset",
    "description": "从生活随机现象入手，学习概率计算与估计。",
    "detail": "浙教版《数学》九年级上册第2章。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-09",
    "term": "随机事件",
    "aliases": [],
    "category": "preset",
    "description": "必然事件、不可能事件与随机事件；结果不确定但可列举。",
    "detail": "浙教版《数学》九年级上册 §2.1。为求概率先明确“所有等可能结果”。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-10",
    "term": "简单随机事件的概率",
    "aliases": [],
    "category": "preset",
    "description": "P(A)=有利结果数÷所有等可能结果数（古典概型）。",
    "detail": "浙教版《数学》九年级上册 §2.2。例：掷骰子、摸球（需等可能）。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-11",
    "term": "用频率估计概率",
    "aliases": [],
    "category": "preset",
    "description": "试验次数很大时，频率接近概率，用于无法直接列举的情况。",
    "detail": "浙教版《数学》九年级上册 §2.3。理解“大量重复”的前提。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-12",
    "term": "概率的简单应用",
    "aliases": [],
    "category": "preset",
    "description": "用概率判断游戏是否公平、方案是否合理。",
    "detail": "浙教版《数学》九年级上册 §2.4。比较各方获胜概率。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-13",
    "term": "第3章 圆的基本性质",
    "aliases": [],
    "category": "preset",
    "description": "圆、弦、弧、角的关系，是几何证明的重点章节。",
    "detail": "浙教版《数学》九年级上册第3章。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-14",
    "term": "圆的有关概念",
    "aliases": [],
    "category": "preset",
    "description": "圆心、半径、弦、弧、直径等；同圆中半径相等。",
    "detail": "浙教版《数学》九年级上册 §3.1。准确使用几何语言。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-15",
    "term": "图形的旋转",
    "aliases": [],
    "category": "preset",
    "description": "绕定点按角度转动，对应点与旋转中心连线成等角。",
    "detail": "浙教版《数学》九年级上册 §3.2。与圆心角、对称性联系。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-16",
    "term": "垂径定理",
    "aliases": [
      "垂径"
    ],
    "category": "preset",
    "description": "垂直于弦的直径平分这条弦，并平分弦所对的两条弧。",
    "detail": "浙教版《数学》九年级上册 §3.3。证明题常作弦心距。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-17",
    "term": "圆心角",
    "aliases": [],
    "category": "preset",
    "description": "顶点在圆心的角；同圆中相等圆心角所对弧相等。",
    "detail": "浙教版《数学》九年级上册 §3.4。圆心角与弧、弦的对应关系。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-18",
    "term": "圆周角",
    "aliases": [
      "圆周角定理"
    ],
    "category": "preset",
    "description": "顶点在圆上；同弧所对圆周角等于圆心角的一半。",
    "detail": "浙教版《数学》九年级上册 §3.5。直径所对圆周角为直角。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-19",
    "term": "圆内接四边形",
    "aliases": [],
    "category": "preset",
    "description": "四个顶点都在圆上的四边形，对角互补。",
    "detail": "浙教版《数学》九年级上册 §3.6。逆命题用于判四点共圆。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-20",
    "term": "正多边形",
    "aliases": [],
    "category": "preset",
    "description": "各边相等、各角相等；与圆的内接、外切关系。",
    "detail": "浙教版《数学》九年级上册 §3.7。正 n 边形的中心角。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-21",
    "term": "弧长及扇形的面积",
    "aliases": [],
    "category": "preset",
    "description": "l= nπr/180，S扇形= nπr²/360；会求组合图形面积。",
    "detail": "浙教版《数学》九年级上册 §3.8。注意角度 n 与半径单位。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-22",
    "term": "第4章 相似三角形",
    "aliases": [],
    "category": "preset",
    "description": "通过比例线段与角相等，研究三角形相似与测量应用。",
    "detail": "浙教版《数学》九年级上册第4章。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-23",
    "term": "比例线段",
    "aliases": [
      "成比例线段"
    ],
    "category": "preset",
    "description": "四条线段 a,b,c,d 若 a:b=c:d（或写成 AB/CD=EF/GH），则称它们成比例。",
    "detail": "浙教版《数学》九年级上册 §4.1。掌握比例的基本性质、合比与分比；注意线段顺序对应。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-24",
    "term": "平行线截得的比例线段",
    "aliases": [
      "平行线分线段成比例"
    ],
    "category": "preset",
    "description": "平行于三角形一边的直线截其他两边，所得对应线段成比例。",
    "detail": "浙教版《数学》九年级上册 §4.2。是证明相似的重要桥梁。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-25",
    "term": "相似三角形",
    "aliases": [],
    "category": "preset",
    "description": "对应角相等、对应边成比例的两个三角形。",
    "detail": "浙教版《数学》九年级上册 §4.3。相似比记为 k，周长比 k、面积比 k²。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-26",
    "term": "相似三角形的判定",
    "aliases": [
      "AA",
      "SAS",
      "SSS"
    ],
    "category": "preset",
    "description": "AA、两边成比例且夹角相等、三边成比例可判定相似。",
    "detail": "浙教版《数学》九年级上册 §4.4。证明时先找对应角或对应边。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-27",
    "term": "相似三角形的性质",
    "aliases": [],
    "category": "preset",
    "description": "对应高、中线、角平分线之比等于相似比。",
    "detail": "浙教版《数学》九年级上册 §4.5。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-28",
    "term": "相似三角形的应用",
    "aliases": [],
    "category": "preset",
    "description": "测河宽、树高等：构造相似三角形列比例式。",
    "detail": "浙教版《数学》九年级上册 §4.5～4.6。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-29",
    "term": "相似多边形",
    "aliases": [],
    "category": "preset",
    "description": "对应角相等、对应边成比例的多边形。",
    "detail": "浙教版《数学》九年级上册 §4.6。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-30",
    "term": "图形的位似",
    "aliases": [
      "位似"
    ],
    "category": "preset",
    "description": "对应点连线过同一点（位似中心），对应边平行，比为位似比。",
    "detail": "浙教版《数学》九年级上册 §4.7。与相似、坐标放大缩小联系。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-31",
    "term": "探秘无人驾驶汽车的眼睛",
    "aliases": [],
    "category": "preset",
    "description": "综合实践：用相似与视角理解传感与测距。",
    "detail": "浙教版《数学》九年级上册 第4章实践。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-32",
    "term": "抛物线",
    "aliases": [],
    "category": "preset",
    "description": "二次函数 y=ax²+bx+c 的图象，开口由 a 的符号决定。",
    "detail": "与 §1.2～1.3 结合；顶点式 y=a(x-h)²+k 便于读顶点。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-33",
    "term": "顶点式",
    "aliases": [],
    "category": "preset",
    "description": "y=a(x-h)²+k 直接给出顶点 (h,k) 与最值。",
    "detail": "由一般式配方得到；读图时优先找顶点。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-34",
    "term": "配方法",
    "aliases": [],
    "category": "preset",
    "description": "把二次式化为 a(x+m)²+n，便于解方程与求最值。",
    "detail": "九上在函数与方程中都会用到。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-35",
    "term": "一元二次方程",
    "aliases": [],
    "category": "preset",
    "description": "ax²+bx+c=0 的根对应抛物线与 x 轴交点的横坐标。",
    "detail": "与 §1.4 数形结合；Δ 决定根的情况。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-36",
    "term": "样本空间",
    "aliases": [],
    "category": "preset",
    "description": "随机试验所有可能结果的集合，求概率要先数清样本点。",
    "detail": "与 §2.2 古典概型配合。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-37",
    "term": "概率加法",
    "aliases": [],
    "category": "preset",
    "description": "互斥事件 A、B：P(A或B)=P(A)+P(B)。",
    "detail": "先判断能否同时发生。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-38",
    "term": "切线",
    "aliases": [],
    "category": "preset",
    "description": "与圆只有一个公共点的直线；切线垂直于过切点的半径。",
    "detail": "切线长、切点判定是常考点。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-39",
    "term": "弦心距",
    "aliases": [],
    "category": "preset",
    "description": "圆心到弦的距离；弦心距越小弦越长，垂径定理常与之相关。",
    "detail": "浙教版《数学》九年级上册 第3章。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-40",
    "term": "黄金分割",
    "aliases": [],
    "category": "preset",
    "description": "将线段分成两段，较长段与全段之比约为 0.618。",
    "detail": "与比例、美学及相似联系，拓展了解即可。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-41",
    "term": "相似比",
    "aliases": [],
    "category": "preset",
    "description": "相似三角形对应边的比值 k；周长比 k，面积比 k²。",
    "detail": "列比例式时对应边必须配对。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-42",
    "term": "位似图形",
    "aliases": [],
    "category": "preset",
    "description": "不仅是相似，且对应顶点连线共点于位似中心。",
    "detail": "浙教版《数学》九年级上册 §4.7。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-43",
    "term": "二次函数最值",
    "aliases": [],
    "category": "preset",
    "description": "在自变量允许范围内，通过顶点或配方求最大或最小值。",
    "detail": "应用题要注意 x 的实际取值范围。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-44",
    "term": "列表法求概率",
    "aliases": [],
    "category": "preset",
    "description": "两步试验可列表格，数有利结果个数。",
    "detail": "与 §2.2、2.4 结合。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-45",
    "term": "树状图",
    "aliases": [],
    "category": "preset",
    "description": "多步试验画树状图，保证不重不漏。",
    "detail": "与列表法二选一或互相验证。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-46",
    "term": "圆的对称性",
    "aliases": [],
    "category": "preset",
    "description": "圆既是轴对称又是中心对称图形。",
    "detail": "解释直径、垂径等性质的对称背景。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-47",
    "term": "三角形的外接圆",
    "aliases": [],
    "category": "preset",
    "description": "三顶点共圆的圆；外心在垂直平分线交点。",
    "detail": "与圆周角、圆内接四边形综合。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-48",
    "term": "三角形的内切圆",
    "aliases": [],
    "category": "preset",
    "description": "与三边都相切的圆；内心在角平分线交点。",
    "detail": "常与切线长、面积联系。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-49",
    "term": "平行四边形与相似",
    "aliases": [],
    "category": "preset",
    "description": "利用平行线分线段成比例或相似证线段相等、成比例。",
    "detail": "九上综合题常见思路。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-m-50",
    "term": "九上数学综合复习",
    "aliases": [],
    "category": "preset",
    "description": "串联二次函数、概率、圆、相似，做章末整合。",
    "detail": "按教材四张主线梳理公式与定理。",
    "relatedTerms": [],
    "tags": [
      "数学",
      "九上教材",
      "ChinaTextbook"
    ]
  }
]

export const GRADE9_HISTORY_KNOWLEDGE: KnowledgePoint[] = [
  {
    "id": "g9-h-01",
    "term": "文明的产生和古代亚非文明",
    "aliases": [],
    "category": "preset",
    "description": "第一单元总览：人类从原始社会到早期国家、亚非四大文明古国。",
    "detail": "统编《世界历史》九年级上册 第一单元。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-02",
    "term": "从原始社会到奴隶社会",
    "aliases": [
      "原始社会",
      "奴隶社会"
    ],
    "category": "preset",
    "description": "人类从采集渔猎到农业定居，出现私有制、阶级与国家。",
    "detail": "统编《世界历史》九年级上册 第1课。记时间线：原始社会→奴隶社会；生产力推动社会形态变化。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-03",
    "term": "古代两河流域",
    "aliases": [],
    "category": "preset",
    "description": "古巴比伦等地发展出早期国家与成文法。",
    "detail": "统编《世界历史》九年级上册 第2课。重点：《汉谟拉比法典》内容与历史地位。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-04",
    "term": "古代埃及",
    "aliases": [],
    "category": "preset",
    "description": "尼罗河定期泛滥孕育农业，法老专制与金字塔文明。",
    "detail": "统编《世界历史》九年级上册 第3课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-05",
    "term": "古代印度",
    "aliases": [],
    "category": "preset",
    "description": "种姓制度与佛教的兴起，影响南亚社会。",
    "detail": "统编《世界历史》九年级上册 第4课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-06",
    "term": "古代欧洲文明",
    "aliases": [],
    "category": "preset",
    "description": "第二单元：希腊城邦民主与罗马法制、帝国扩张。",
    "detail": "统编《世界历史》九年级上册 第二单元。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-07",
    "term": "古代希腊",
    "aliases": [],
    "category": "preset",
    "description": "雅典民主政治与希腊文化（哲学、戏剧等）。",
    "detail": "统编《世界历史》九年级上册 第5课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-08",
    "term": "古代罗马",
    "aliases": [],
    "category": "preset",
    "description": "从共和国到帝国，罗马法影响深远。",
    "detail": "统编《世界历史》九年级上册 第6课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-09",
    "term": "封建时代的欧洲",
    "aliases": [],
    "category": "preset",
    "description": "第三单元：西欧封建制度、庄园与城市。",
    "detail": "统编《世界历史》九年级上册 第三单元。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-10",
    "term": "法兰克王国和西欧封建制度",
    "aliases": [],
    "category": "preset",
    "description": "封君封臣、庄园经济构成中世纪西欧社会基础。",
    "detail": "统编《世界历史》九年级上册 第7课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-11",
    "term": "西欧的城市和大学",
    "aliases": [],
    "category": "preset",
    "description": "城市自治与大学兴起，推动近代因素萌芽。",
    "detail": "统编《世界历史》九年级上册 第8课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-12",
    "term": "拜占庭帝国",
    "aliases": [],
    "category": "preset",
    "description": "延续罗马遗产，查士丁尼法典与东西方交汇。",
    "detail": "统编《世界历史》九年级上册 第9课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-13",
    "term": "中古时期的亚洲、非洲和美洲",
    "aliases": [],
    "category": "preset",
    "description": "第四单元：日本、阿拉伯、非洲与美洲多元文明。",
    "detail": "统编《世界历史》九年级上册 第四单元。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-14",
    "term": "封建时代的日本",
    "aliases": [],
    "category": "preset",
    "description": "大化改新学习隋唐，幕府政治形成。",
    "detail": "统编《世界历史》九年级上册 第10课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-15",
    "term": "阿拉伯帝国",
    "aliases": [],
    "category": "preset",
    "description": "伊斯兰文明连接欧亚非，促进文化交融。",
    "detail": "统编《世界历史》九年级上册 第11课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-16",
    "term": "中古时期的非洲和美洲",
    "aliases": [],
    "category": "preset",
    "description": "非洲王国与美洲文明（如玛雅等）概况。",
    "detail": "统编《世界历史》九年级上册 第12课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-17",
    "term": "走向近代",
    "aliases": [],
    "category": "preset",
    "description": "第五单元：文艺复兴、新航路、早期殖民。",
    "detail": "统编《世界历史》九年级上册 第五单元。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-18",
    "term": "西欧经济社会发展与文艺复兴运动",
    "aliases": [],
    "category": "preset",
    "description": "资本主义萌芽与人文主义思想解放。",
    "detail": "统编《世界历史》九年级上册 第13课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-19",
    "term": "探寻新航路",
    "aliases": [],
    "category": "preset",
    "description": "哥伦布等开辟新航路，世界联系加强。",
    "detail": "统编《世界历史》九年级上册 第14课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-20",
    "term": "早期殖民掠夺",
    "aliases": [],
    "category": "preset",
    "description": "三角贸易与殖民扩张对亚非拉的影响。",
    "detail": "统编《世界历史》九年级上册 第15课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-21",
    "term": "资本主义制度的初步确立",
    "aliases": [],
    "category": "preset",
    "description": "第六单元：英法美资产阶级革命。",
    "detail": "统编《世界历史》九年级上册 第六单元。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-22",
    "term": "英国资产阶级革命",
    "aliases": [],
    "category": "preset",
    "description": "光荣革命与《权利法案》，确立议会主权。",
    "detail": "统编《世界历史》九年级上册 第16课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-23",
    "term": "美国的独立",
    "aliases": [],
    "category": "preset",
    "description": "独立战争与 1787 年宪法，联邦制与分权。",
    "detail": "统编《世界历史》九年级上册 第17课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-24",
    "term": "法国大革命和拿破仑帝国",
    "aliases": [],
    "category": "preset",
    "description": "《人权宣言》、拿破仑战争与法典。",
    "detail": "统编《世界历史》九年级上册 第18课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-25",
    "term": "第一次工业革命和马克思主义的诞生",
    "aliases": [],
    "category": "preset",
    "description": "第七单元：工业化与工人运动、科学社会主义。",
    "detail": "统编《世界历史》九年级上册 第七单元。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-26",
    "term": "第一次工业革命",
    "aliases": [],
    "category": "preset",
    "description": "蒸汽机与工厂制度，城市化与社会变化。",
    "detail": "统编《世界历史》九年级上册 第19课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-27",
    "term": "马克思主义的诞生",
    "aliases": [],
    "category": "preset",
    "description": "《共产党宣言》标志科学社会主义诞生。",
    "detail": "统编《世界历史》九年级上册 第20课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-28",
    "term": "第一国际和巴黎公社",
    "aliases": [],
    "category": "preset",
    "description": "国际工人联合与巴黎公社无产阶级政权尝试。",
    "detail": "统编《世界历史》九年级上册 第21课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-29",
    "term": "唱响《国际歌》",
    "aliases": [],
    "category": "preset",
    "description": "活动课：通过歌曲理解工人运动与国际主义。",
    "detail": "统编《世界历史》九年级上册 第22课。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-30",
    "term": "《汉谟拉比法典》",
    "aliases": [],
    "category": "preset",
    "description": "迄今已知较完整的成文法典，体现王权与等级。",
    "detail": "两河流域核心史料，可对比其他文明法制。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-31",
    "term": "种姓制度",
    "aliases": [],
    "category": "preset",
    "description": "古代印度严格的职业与等级划分，影响社会流动。",
    "detail": "与佛教传播背景联系理解。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-32",
    "term": "雅典民主政治",
    "aliases": [],
    "category": "preset",
    "description": "公民大会、抽签选举；局限在成年男性公民。",
    "detail": "对比现代民主，评价其进步与局限。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-33",
    "term": "罗马法",
    "aliases": [],
    "category": "preset",
    "description": "《十二铜表法》到查士丁尼法典，影响大陆法系。",
    "detail": "强调法律对国家治理的作用。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-34",
    "term": "文艺复兴",
    "aliases": [],
    "category": "preset",
    "description": "14～16 世纪欧洲思想文化运动，人文主义复兴古典。",
    "detail": "代表人物但丁、达·芬奇等（据课堂所讲）。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-35",
    "term": "新航路开辟",
    "aliases": [],
    "category": "preset",
    "description": "欧洲到达印度、美洲，全球贸易网络开始形成。",
    "detail": "原因：寻金、传播基督教、商业需求等。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-36",
    "term": "三角贸易",
    "aliases": [],
    "category": "preset",
    "description": "欧—非—美之间强迫劳动与商品交换，含奴隶贸易。",
    "detail": "与殖民掠夺、美洲种植园经济联系。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-37",
    "term": "君主立宪制",
    "aliases": [],
    "category": "preset",
    "description": "君主权力受宪法与议会限制，如英国模式。",
    "detail": "对比专制君主制与共和制。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-38",
    "term": "1787年宪法",
    "aliases": [],
    "category": "preset",
    "description": "美国联邦制、三权分立、制衡原则。",
    "detail": "理解参议院与众议院、总统权力设计。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-39",
    "term": "拿破仑法典",
    "aliases": [],
    "category": "preset",
    "description": "巩固资产阶级革命成果，影响欧洲立法。",
    "detail": "评价拿破仑战争的双重性。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-40",
    "term": "蒸汽时代",
    "aliases": [],
    "category": "preset",
    "description": "瓦特改良蒸汽机，机器生产取代手工工场。",
    "detail": "工业革命使生产力飞跃，也带来社会问题。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-41",
    "term": "科学社会主义",
    "aliases": [],
    "category": "preset",
    "description": "马克思主义揭示资本主义矛盾，主张无产阶级解放。",
    "detail": "与空想社会主义区别：科学性与实践性。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-42",
    "term": "封建庄园",
    "aliases": [],
    "category": "preset",
    "description": "自给自足农业经济，农奴受领主束缚。",
    "detail": "中世纪西欧经济组织形式。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-43",
    "term": "伊斯兰教",
    "aliases": [],
    "category": "preset",
    "description": "7 世纪兴起，阿拉伯帝国统一与文化传播。",
    "detail": "与阿拉伯帝国疆域、文化成就联系。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-44",
    "term": "大化改新",
    "aliases": [],
    "category": "preset",
    "description": "646 年前后日本仿唐制改革，走向中央集权。",
    "detail": "日本从奴隶社会向封建社会过渡的重要事件。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-45",
    "term": "人文主义",
    "aliases": [],
    "category": "preset",
    "description": "以人为中心，肯定现世的幸福与理性，反对神权束缚。",
    "detail": "文艺复兴的核心思想。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-46",
    "term": "殖民扩张",
    "aliases": [],
    "category": "preset",
    "description": "列强建立殖民地，掠夺资源并改变当地社会。",
    "detail": "评价其推动交流与带来灾难的两面。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-47",
    "term": "工人运动",
    "aliases": [],
    "category": "preset",
    "description": "19 世纪工人组织工会、罢工，要求改善待遇。",
    "detail": "为马克思主义诞生与第一国际提供基础。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-48",
    "term": "横向联系",
    "aliases": [],
    "category": "preset",
    "description": "学史方法：同一时期不同地区事件的比较与联系。",
    "detail": "如文艺复兴与新航路、工业革命与殖民。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-49",
    "term": "研读《共产党宣言》",
    "aliases": [],
    "category": "preset",
    "description": "学史方法：抓核心观点、历史背景与当代意义。",
    "detail": "关注阶级、生产力与革命主张等表述。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  },
  {
    "id": "g9-h-50",
    "term": "世界历史大事年表",
    "aliases": [],
    "category": "preset",
    "description": "附录：按时间梳理九上重大事件，便于复习。",
    "detail": "建议对照课文自己补全因果。",
    "relatedTerms": [],
    "tags": [
      "历史",
      "九上教材",
      "ChinaTextbook"
    ]
  }
]

export const GRADE9_KNOWLEDGE_POINTS: KnowledgePoint[] = [
  ...GRADE9_CHINESE_KNOWLEDGE,
  ...GRADE9_MATH_KNOWLEDGE,
  ...GRADE9_HISTORY_KNOWLEDGE,
]
