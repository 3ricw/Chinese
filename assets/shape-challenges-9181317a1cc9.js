/* Original visual shape exercises. Simplified source forms; display follows the app script setting.
 * Layouts are vetted against the app component catalog. These are visual construction cues, not etymologies.
 * Component data credit remains in the existing Settings references.
 */
const SHAPE_TRANSFORMS = [
  {
    "id": "shape-transform-01",
    "from": "一",
    "to": "二",
    "prompt": "Add one horizontal stroke below 一.",
    "explanation": "Keep the two horizontal strokes separate; 二 has two levels.",
    "lesson": "I"
  },
  {
    "id": "shape-transform-02",
    "from": "二",
    "to": "三",
    "prompt": "Add a third horizontal stroke.",
    "explanation": "三 has three horizontal levels. The middle stroke is usually the shortest.",
    "lesson": "I"
  },
  {
    "id": "shape-transform-03",
    "from": "口",
    "to": "日",
    "prompt": "Put one horizontal stroke inside 口.",
    "explanation": "One inner horizontal changes the box-like 口 into 日.",
    "lesson": "I"
  },
  {
    "id": "shape-transform-04",
    "from": "日",
    "to": "目",
    "prompt": "Add a second inner horizontal line.",
    "explanation": "目 has two inner horizontal lines; 日 has one.",
    "lesson": "I"
  },
  {
    "id": "shape-transform-05",
    "from": "口",
    "to": "中",
    "prompt": "Run a vertical stroke through the box.",
    "explanation": "In 中, the vertical passes through the box and extends above and below it.",
    "lesson": "1"
  },
  {
    "id": "shape-transform-06",
    "from": "木",
    "to": "末",
    "prompt": "Add a horizontal stroke above 木.",
    "explanation": "末 has an extra horizontal at the top. Its upper horizontal is longer than the one below.",
    "lesson": "4"
  },
  {
    "id": "shape-transform-07",
    "from": "人",
    "to": "大",
    "prompt": "Add a horizontal stroke across the upper part of 人.",
    "explanation": "The added horizontal makes 大. Keep the two lower strokes spread apart.",
    "lesson": "I"
  },
  {
    "id": "shape-transform-08",
    "from": "大",
    "to": "天",
    "prompt": "Add a horizontal stroke above 大.",
    "explanation": "天 has a short top horizontal and another horizontal below it.",
    "lesson": "3"
  },
  {
    "id": "shape-transform-09",
    "from": "大",
    "to": "太",
    "prompt": "Add a dot between the lower strokes.",
    "explanation": "The small dot near the lower center distinguishes 太 from 大.",
    "lesson": "3"
  },
  {
    "id": "shape-transform-10",
    "from": "人",
    "to": "个",
    "prompt": "Add a vertical stroke below the meeting point of 人.",
    "explanation": "The vertical in 个 continues downward between the two sloping upper strokes.",
    "lesson": "2"
  },
  {
    "id": "shape-transform-11",
    "from": "月",
    "to": "朋",
    "prompt": "Put a second 月 next to the first.",
    "explanation": "朋 has two narrow 月 shapes side by side.",
    "lesson": "1"
  },
  {
    "id": "shape-transform-12",
    "from": "日",
    "to": "明",
    "prompt": "Put 月 to the right of 日.",
    "explanation": "明 keeps 日 on the left and 月 on the right.",
    "lesson": "3"
  },
  {
    "id": "shape-transform-13",
    "from": "女",
    "to": "好",
    "prompt": "Put 子 to the right of 女.",
    "explanation": "好 has 女 on the left and 子 on the right. Both fit inside one square.",
    "lesson": "1"
  },
  {
    "id": "shape-transform-14",
    "from": "女",
    "to": "妈",
    "prompt": "Put 马 to the right of 女.",
    "explanation": "妈 keeps 女 on the left. 马 is its right-hand block.",
    "lesson": "2"
  },
  {
    "id": "shape-transform-15",
    "from": "女",
    "to": "她",
    "prompt": "Put 也 to the right of 女.",
    "explanation": "她 has 女 on the left and 也 on the right. Compare the right side carefully with 妈.",
    "lesson": "2"
  },
  {
    "id": "shape-transform-16",
    "from": "口",
    "to": "吗",
    "prompt": "Put 马 to the right of 口.",
    "explanation": "吗 has a small 口 on the left. 马 takes the right side.",
    "lesson": "1"
  },
  {
    "id": "shape-transform-17",
    "from": "口",
    "to": "问",
    "prompt": "Put 门 around 口.",
    "explanation": "问 has 门 enclosing a small 口. Leave space around the inner box.",
    "lesson": "1"
  },
  {
    "id": "shape-transform-18",
    "from": "门",
    "to": "间",
    "prompt": "Put 日 inside 门.",
    "explanation": "间 contains 日 inside 门. 问 contains 口 instead.",
    "lesson": "6"
  },
  {
    "id": "shape-transform-19",
    "from": "又",
    "to": "汉",
    "prompt": "Put 氵 to the left of 又.",
    "explanation": "汉 has three water dots on the left and 又 on the right.",
    "lesson": "7"
  },
  {
    "id": "shape-transform-20",
    "from": "又",
    "to": "双",
    "prompt": "Put a second 又 to the right.",
    "explanation": "双 repeats 又 side by side. The left shape is narrowed to make room.",
    "lesson": "9"
  },
  {
    "id": "shape-transform-21",
    "from": "木",
    "to": "杯",
    "prompt": "Put 不 to the right of 木.",
    "explanation": "杯 keeps 木 on the left and 不 on the right.",
    "lesson": "5"
  },
  {
    "id": "shape-transform-22",
    "from": "大",
    "to": "因",
    "prompt": "Put 囗 around 大.",
    "explanation": "因 places 大 inside an outer frame. Keep the inner shape away from the frame.",
    "lesson": "3"
  },
  {
    "id": "shape-transform-23",
    "from": "口",
    "to": "回",
    "prompt": "Put a larger 囗 around 口.",
    "explanation": "回 has a small inner box and a separate outer frame.",
    "lesson": "5"
  },
  {
    "id": "shape-transform-24",
    "from": "口",
    "to": "加",
    "prompt": "Put 力 to the left of 口.",
    "explanation": "加 has 力 on the left and 口 on the right.",
    "lesson": "c2-11"
  },
  {
    "id": "shape-transform-25",
    "from": "火",
    "to": "秋",
    "prompt": "Put 禾 to the left of 火.",
    "explanation": "秋 has 禾 on the left and 火 on the right. The two blocks share one square.",
    "lesson": "c2-11"
  },
  {
    "id": "shape-transform-26",
    "from": "口",
    "to": "味",
    "prompt": "Put 未 to the right of 口.",
    "explanation": "味 has a narrow 口 on the left. On the right, 未 has a shorter upper horizontal.",
    "lesson": "c2-12"
  },
  {
    "id": "shape-transform-27",
    "from": "方",
    "to": "放",
    "prompt": "Put 攵 to the right of 方.",
    "explanation": "放 keeps 方 on the left and the 攵 stroke group on the right.",
    "lesson": "c2-12"
  },
  {
    "id": "shape-transform-28",
    "from": "买",
    "to": "卖",
    "prompt": "Put 十 above 买.",
    "explanation": "卖 contains 十 above 买. Notice the extra top block.",
    "lesson": "c2-12"
  },
  {
    "id": "shape-transform-29",
    "from": "青",
    "to": "清",
    "prompt": "Put 氵 to the left of 青.",
    "explanation": "清 has water dots on the left. 青 remains the right-hand block.",
    "lesson": "c2-12"
  },
  {
    "id": "shape-transform-30",
    "from": "人",
    "to": "从",
    "prompt": "Put another 人 to the right.",
    "explanation": "从 has two 人 shapes. The left one is narrower and its final stroke becomes a dot.",
    "lesson": "c2-13"
  },
  {
    "id": "shape-transform-31",
    "from": "本",
    "to": "体",
    "prompt": "Put 亻 to the left of 本.",
    "explanation": "体 has the narrow person form 亻 on the left and 本 on the right.",
    "lesson": "c2-15"
  },
  {
    "id": "shape-transform-32",
    "from": "木",
    "to": "休",
    "prompt": "Put 亻 to the left of 木.",
    "explanation": "休 has 亻 on the left and 木 on the right. Compare 休 with 体: 本 has one more short horizontal.",
    "lesson": "c2-15"
  },
  {
    "id": "shape-transform-33",
    "from": "土",
    "to": "肚",
    "prompt": "Put 月 to the left of 土.",
    "explanation": "肚 places the body-related 月 component on the left and 土 on the right.",
    "lesson": "c2-15"
  },
  {
    "id": "shape-transform-34",
    "from": "不",
    "to": "坏",
    "prompt": "Put 土 to the left of 不.",
    "explanation": "坏 has 土 on the left. Compare it with 杯, which has 木 on the left.",
    "lesson": "c2-15"
  },
  {
    "id": "shape-transform-35",
    "from": "十",
    "to": "针",
    "prompt": "Put 钅 to the left of 十.",
    "explanation": "针 places the simplified metal component 钅 on the left and 十 on the right.",
    "lesson": "c2-15"
  },
  {
    "id": "shape-transform-36",
    "from": "约",
    "to": "药",
    "prompt": "Put 艹 above 约.",
    "explanation": "药 has the grass component 艹 across the top; 约 is the lower block.",
    "lesson": "c2-15"
  },
  {
    "id": "shape-transform-37",
    "from": "冬",
    "to": "疼",
    "prompt": "Put 疒 above and to the left of 冬.",
    "explanation": "疼 has the illness component 疒 surrounding 冬 from above and the left.",
    "lesson": "c2-15"
  },
  {
    "id": "shape-transform-38",
    "from": "木",
    "to": "本",
    "prompt": "Add a short horizontal near the bottom of 木.",
    "explanation": "The added short stroke across the lower vertical distinguishes 本 from 木.",
    "lesson": "c2-14"
  }
];

const COMPONENT_CHALLENGES = [
  {
    "id": "component-puzzle-01",
    "target": "二",
    "parts": [
      "一",
      "一"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for two.",
    "explanation": "The two horizontal pieces sit one above the other. Leave a clear gap between them.",
    "lesson": "I"
  },
  {
    "id": "component-puzzle-02",
    "target": "三",
    "parts": [
      "一",
      "二"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for three.",
    "explanation": "Place 一 above 二 to make three horizontal levels. This is a visual grouping for this puzzle.",
    "lesson": "I"
  },
  {
    "id": "component-puzzle-03",
    "target": "六",
    "parts": [
      "亠",
      "八"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for six.",
    "explanation": "亠 is the top block; 八 opens outward below it.",
    "lesson": "I"
  },
  {
    "id": "component-puzzle-04",
    "target": "糸",
    "parts": [
      "幺",
      "小"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for fine silk (component).",
    "explanation": "幺 sits above 小. In some compound characters this shape is narrowed to 糹 or simplified to 纟.",
    "lesson": "I"
  },
  {
    "id": "component-puzzle-05",
    "target": "目",
    "parts": [
      "口",
      "二"
    ],
    "layout": "enclosure",
    "clue": "Build the character for eye.",
    "explanation": "The outer box surrounds two inner horizontal lines. Here 口 is a visual frame, not a separate spoken word.",
    "lesson": "I"
  },
  {
    "id": "component-puzzle-06",
    "target": "好",
    "parts": [
      "女",
      "子"
    ],
    "layout": "left-right",
    "clue": "Build the character for good.",
    "explanation": "Place 女 on the left and 子 on the right. The two components are narrowed to fit together.",
    "lesson": "1"
  },
  {
    "id": "component-puzzle-07",
    "target": "朋",
    "parts": [
      "月",
      "月"
    ],
    "layout": "left-right",
    "clue": "Build the character for friend (in 朋友).",
    "explanation": "The two 月 shapes sit side by side. Keep their widths balanced.",
    "lesson": "1"
  },
  {
    "id": "component-puzzle-08",
    "target": "请",
    "parts": [
      "讠",
      "青"
    ],
    "layout": "left-right",
    "clue": "Build the character for please; invite.",
    "explanation": "讠 is the narrow speech component on the left; 青 fills the right side.",
    "lesson": "1"
  },
  {
    "id": "component-puzzle-09",
    "target": "国",
    "parts": [
      "囗",
      "玉"
    ],
    "layout": "enclosure",
    "clue": "Build the character for country.",
    "explanation": "The outer 囗 surrounds 玉. The dot inside is part of 玉, not a mark outside the frame.",
    "lesson": "1"
  },
  {
    "id": "component-puzzle-10",
    "target": "李",
    "parts": [
      "木",
      "子"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for surname Li; plum.",
    "explanation": "木 is above 子. Keep the two blocks vertically aligned.",
    "lesson": "1"
  },
  {
    "id": "component-puzzle-11",
    "target": "字",
    "parts": [
      "宀",
      "子"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for written character.",
    "explanation": "宀 forms a roof over 子. The roof spans the lower block.",
    "lesson": "1"
  },
  {
    "id": "component-puzzle-12",
    "target": "妈",
    "parts": [
      "女",
      "马"
    ],
    "layout": "left-right",
    "clue": "Build the character for mom.",
    "explanation": "女 is the left block and 马 is the right block.",
    "lesson": "2"
  },
  {
    "id": "component-puzzle-13",
    "target": "妹",
    "parts": [
      "女",
      "未"
    ],
    "layout": "left-right",
    "clue": "Build the character for younger sister.",
    "explanation": "女 is on the left and 未 is on the right. Notice the shorter upper horizontal in 未.",
    "lesson": "2"
  },
  {
    "id": "component-puzzle-14",
    "target": "男",
    "parts": [
      "田",
      "力"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for male.",
    "explanation": "田 is above 力. The two components are stacked, rather than placed side by side.",
    "lesson": "2"
  },
  {
    "id": "component-puzzle-15",
    "target": "明",
    "parts": [
      "日",
      "月"
    ],
    "layout": "left-right",
    "clue": "Build the character for bright.",
    "explanation": "日 is on the left and 月 is on the right. Both stay upright.",
    "lesson": "3"
  },
  {
    "id": "component-puzzle-16",
    "target": "星",
    "parts": [
      "日",
      "生"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for star.",
    "explanation": "日 sits above 生. Keep 生 as one lower block.",
    "lesson": "3"
  },
  {
    "id": "component-puzzle-17",
    "target": "多",
    "parts": [
      "夕",
      "夕"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for many; much.",
    "explanation": "One 夕 sits above another. The upper one is offset slightly to the left.",
    "lesson": "3"
  },
  {
    "id": "component-puzzle-18",
    "target": "思",
    "parts": [
      "田",
      "心"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for think.",
    "explanation": "田 is above 心. The bottom dots belong to 心.",
    "lesson": "4"
  },
  {
    "id": "component-puzzle-19",
    "target": "想",
    "parts": [
      "相",
      "心"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for want; think.",
    "explanation": "相 is above 心. 相 is kept together as a block in this puzzle.",
    "lesson": "4"
  },
  {
    "id": "component-puzzle-20",
    "target": "音",
    "parts": [
      "立",
      "日"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for sound.",
    "explanation": "立 sits above 日. Separate the two horizontal blocks clearly.",
    "lesson": "4"
  },
  {
    "id": "component-puzzle-21",
    "target": "时",
    "parts": [
      "日",
      "寸"
    ],
    "layout": "left-right",
    "clue": "Build the character for time.",
    "explanation": "日 is the left block and 寸 is the right block.",
    "lesson": "4"
  },
  {
    "id": "component-puzzle-22",
    "target": "杯",
    "parts": [
      "木",
      "不"
    ],
    "layout": "left-right",
    "clue": "Build the character for cup; cup measure.",
    "explanation": "木 is on the left and 不 is on the right.",
    "lesson": "5"
  },
  {
    "id": "component-puzzle-23",
    "target": "回",
    "parts": [
      "囗",
      "口"
    ],
    "layout": "enclosure",
    "clue": "Build the character for return.",
    "explanation": "A small 口 sits inside the outer 囗 frame. Keep the two boxes separate.",
    "lesson": "5"
  },
  {
    "id": "component-puzzle-24",
    "target": "校",
    "parts": [
      "木",
      "交"
    ],
    "layout": "left-right",
    "clue": "Build the character for school.",
    "explanation": "木 is on the left and 交 is on the right.",
    "lesson": "5"
  },
  {
    "id": "component-puzzle-25",
    "target": "话",
    "parts": [
      "讠",
      "舌"
    ],
    "layout": "left-right",
    "clue": "Build the character for speech.",
    "explanation": "讠 is on the left and 舌 is on the right. The lower 口 is part of 舌.",
    "lesson": "6"
  },
  {
    "id": "component-puzzle-26",
    "target": "会",
    "parts": [
      "人",
      "云"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for meeting; can.",
    "explanation": "人 forms a roof over 云. This is a visual layout cue.",
    "lesson": "6"
  },
  {
    "id": "component-puzzle-27",
    "target": "空",
    "parts": [
      "穴",
      "工"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for free time.",
    "explanation": "穴 sits above 工. Keep 工 centered below the roof-like upper component.",
    "lesson": "6"
  },
  {
    "id": "component-puzzle-28",
    "target": "间",
    "parts": [
      "门",
      "日"
    ],
    "layout": "enclosure",
    "clue": "Build the character for between; period.",
    "explanation": "门 surrounds 日 on three sides. Compare the inner 日 with the 口 in 问.",
    "lesson": "6"
  },
  {
    "id": "component-puzzle-29",
    "target": "汉",
    "parts": [
      "氵",
      "又"
    ],
    "layout": "left-right",
    "clue": "Build the character for Chinese (ethnicity/language).",
    "explanation": "氵 sits on the left and 又 on the right. The three dots form one left-hand component.",
    "lesson": "7"
  },
  {
    "id": "component-puzzle-30",
    "target": "语",
    "parts": [
      "讠",
      "吾"
    ],
    "layout": "left-right",
    "clue": "Build the character for language.",
    "explanation": "讠 sits on the left and 吾 on the right. 吾 stays together as one block.",
    "lesson": "7"
  },
  {
    "id": "component-puzzle-31",
    "target": "枝",
    "parts": [
      "木",
      "支"
    ],
    "layout": "left-right",
    "clue": "Build the character for thin-object measure; branch.",
    "explanation": "木 sits on the left and 支 on the right.",
    "lesson": "7"
  },
  {
    "id": "component-puzzle-32",
    "target": "信",
    "parts": [
      "亻",
      "言"
    ],
    "layout": "left-right",
    "clue": "Build the character for letter; trust.",
    "explanation": "亻 is the narrow person form on the left; 言 is on the right.",
    "lesson": "8"
  },
  {
    "id": "component-puzzle-33",
    "target": "洗",
    "parts": [
      "氵",
      "先"
    ],
    "layout": "left-right",
    "clue": "Build the character for wash.",
    "explanation": "氵 is on the left and 先 on the right.",
    "lesson": "8"
  },
  {
    "id": "component-puzzle-34",
    "target": "种",
    "parts": [
      "禾",
      "中"
    ],
    "layout": "left-right",
    "clue": "Build the character for kind; type measure.",
    "explanation": "禾 is on the left and 中 on the right. Keep the vertical stroke through 中.",
    "lesson": "9"
  },
  {
    "id": "component-puzzle-35",
    "target": "红",
    "parts": [
      "纟",
      "工"
    ],
    "layout": "left-right",
    "clue": "Build the character for red.",
    "explanation": "纟 is the simplified silk component on the left; 工 is on the right.",
    "lesson": "9"
  },
  {
    "id": "component-puzzle-36",
    "target": "机",
    "parts": [
      "木",
      "几"
    ],
    "layout": "left-right",
    "clue": "Build the character for machine.",
    "explanation": "木 is on the left and 几 on the right.",
    "lesson": "10"
  },
  {
    "id": "component-puzzle-37",
    "target": "汽",
    "parts": [
      "氵",
      "气"
    ],
    "layout": "left-right",
    "clue": "Build the character for steam; gas.",
    "explanation": "氵 is on the left and 气 on the right. The water dots are separate from the right-hand block.",
    "lesson": "10"
  },
  {
    "id": "component-puzzle-38",
    "target": "租",
    "parts": [
      "禾",
      "且"
    ],
    "layout": "left-right",
    "clue": "Build the character for rent.",
    "explanation": "禾 is on the left and 且 on the right.",
    "lesson": "10"
  },
  {
    "id": "component-puzzle-39",
    "target": "雪",
    "parts": [
      "雨",
      "彐"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for snow.",
    "explanation": "雨 spans the top; 彐 is the lower block. The dots belong to the upper 雨 component.",
    "lesson": "c2-11"
  },
  {
    "id": "component-puzzle-40",
    "target": "园",
    "parts": [
      "囗",
      "元"
    ],
    "layout": "enclosure",
    "clue": "Build the character for garden; park.",
    "explanation": "囗 surrounds 元. Keep both legs of 元 inside the frame.",
    "lesson": "c2-11"
  },
  {
    "id": "component-puzzle-41",
    "target": "冰",
    "parts": [
      "冫",
      "水"
    ],
    "layout": "left-right",
    "clue": "Build the character for ice.",
    "explanation": "冫 gives two dots on the left; 水 is on the right. Compare 冫 with the three-dot 氵 component.",
    "lesson": "c2-11"
  },
  {
    "id": "component-puzzle-42",
    "target": "秋",
    "parts": [
      "禾",
      "火"
    ],
    "layout": "left-right",
    "clue": "Build the character for autumn; fall.",
    "explanation": "禾 sits on the left and 火 on the right.",
    "lesson": "c2-11"
  },
  {
    "id": "component-puzzle-43",
    "target": "饺",
    "parts": [
      "饣",
      "交"
    ],
    "layout": "left-right",
    "clue": "Build the character for dumpling.",
    "explanation": "饣 is the simplified food component on the left; 交 is on the right.",
    "lesson": "c2-12"
  },
  {
    "id": "component-puzzle-44",
    "target": "味",
    "parts": [
      "口",
      "未"
    ],
    "layout": "left-right",
    "clue": "Build the character for taste; flavor.",
    "explanation": "口 is on the left and 未 on the right.",
    "lesson": "c2-12"
  },
  {
    "id": "component-puzzle-45",
    "target": "清",
    "parts": [
      "氵",
      "青"
    ],
    "layout": "left-right",
    "clue": "Build the character for clear; pure.",
    "explanation": "氵 is on the left and 青 on the right.",
    "lesson": "c2-12"
  },
  {
    "id": "component-puzzle-46",
    "target": "忘",
    "parts": [
      "亡",
      "心"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for forget.",
    "explanation": "亡 sits above 心. Keep the bottom dots with 心.",
    "lesson": "c2-12"
  },
  {
    "id": "component-puzzle-47",
    "target": "活",
    "parts": [
      "氵",
      "舌"
    ],
    "layout": "left-right",
    "clue": "Build the character for live; lively.",
    "explanation": "氵 is on the left and 舌 on the right.",
    "lesson": "c2-13"
  },
  {
    "id": "component-puzzle-48",
    "target": "从",
    "parts": [
      "人",
      "人"
    ],
    "layout": "left-right",
    "clue": "Build the character for from; follow.",
    "explanation": "Two 人 shapes stand side by side. The left one is narrower.",
    "lesson": "c2-13"
  },
  {
    "id": "component-puzzle-49",
    "target": "灯",
    "parts": [
      "火",
      "丁"
    ],
    "layout": "left-right",
    "clue": "Build the character for light; lamp.",
    "explanation": "火 is on the left and 丁 on the right.",
    "lesson": "c2-13"
  },
  {
    "id": "component-puzzle-50",
    "target": "住",
    "parts": [
      "亻",
      "主"
    ],
    "layout": "left-right",
    "clue": "Build the character for live; reside.",
    "explanation": "亻 is on the left and 主 on the right. Notice the dot at the top of 主.",
    "lesson": "c2-14"
  },
  {
    "id": "component-puzzle-51",
    "target": "钟",
    "parts": [
      "钅",
      "中"
    ],
    "layout": "left-right",
    "clue": "Build the character for clock; bell.",
    "explanation": "钅 is the simplified metal component on the left; 中 is on the right.",
    "lesson": "c2-14"
  },
  {
    "id": "component-puzzle-52",
    "target": "睛",
    "parts": [
      "目",
      "青"
    ],
    "layout": "left-right",
    "clue": "Build the character for eyeball; eye (in 眼睛).",
    "explanation": "目 is on the left and 青 on the right. Compare it with 清, whose left component is 氵.",
    "lesson": "c2-14"
  },
  {
    "id": "component-puzzle-53",
    "target": "圆",
    "parts": [
      "囗",
      "员"
    ],
    "layout": "enclosure",
    "clue": "Build the character for round.",
    "explanation": "囗 surrounds 员. Keep 员 together inside the frame.",
    "lesson": "c2-14"
  },
  {
    "id": "component-puzzle-54",
    "target": "体",
    "parts": [
      "亻",
      "本"
    ],
    "layout": "left-right",
    "clue": "Build the character for body; form.",
    "explanation": "亻 is on the left and 本 on the right. The short lower horizontal belongs to 本.",
    "lesson": "c2-15"
  },
  {
    "id": "component-puzzle-55",
    "target": "休",
    "parts": [
      "亻",
      "木"
    ],
    "layout": "left-right",
    "clue": "Build the character for rest.",
    "explanation": "亻 is on the left and 木 on the right. Compare the lower part with 体.",
    "lesson": "c2-15"
  },
  {
    "id": "component-puzzle-56",
    "target": "肚",
    "parts": [
      "月",
      "土"
    ],
    "layout": "left-right",
    "clue": "Build the character for belly; abdomen.",
    "explanation": "月 is on the left and 土 on the right. In 肚, 月 is the body-related component.",
    "lesson": "c2-15"
  },
  {
    "id": "component-puzzle-57",
    "target": "药",
    "parts": [
      "艹",
      "约"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for medicine.",
    "explanation": "艹 spans the top; 约 forms the lower block.",
    "lesson": "c2-15"
  },
  {
    "id": "component-puzzle-58",
    "target": "息",
    "parts": [
      "自",
      "心"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for rest; breath.",
    "explanation": "自 sits above 心. Keep the top and bottom blocks separate.",
    "lesson": "c2-15"
  },
  {
    "id": "component-puzzle-59",
    "target": "查",
    "parts": [
      "木",
      "旦"
    ],
    "layout": "top-bottom",
    "clue": "Build the character for check; look up.",
    "explanation": "木 sits above 旦. The bottom horizontal belongs to 旦.",
    "lesson": "c2-15"
  }
];
