/* Original, scene-specific answer explanations. Scene text and IDs remain unchanged. */
const ADVENTURE_FEEDBACK = {
  "adventure-I#0": {
    "evidence": "三人",
    "explanation": "三 means three; 人 means people. The sign shows three people.",
    "replyExplanation": "Choose 三 to match the number on the sign."
  },
  "adventure-I#1": {
    "evidence": "水：二\n木：四",
    "explanation": "水 means water, and its number is 二: two.",
    "replyExplanation": "The reply asks for the word paired with four. 木 is paired with 四, so choose 木."
  },
  "adventure-I#2": {
    "evidence": "日：一\n月：二",
    "explanation": "月 means moon, and it is paired with 二: two.",
    "replyExplanation": "日 means sun. Its number is 一, so choose 一."
  },
  "adventure-1#0": {
    "evidence": "你姓什么",
    "explanation": "姓 asks about a surname. 什么 means what, so Lin is asking for your surname.",
    "replyExplanation": "我姓李 says “My surname is Li.” It answers the surname question directly."
  },
  "adventure-1#1": {
    "evidence": "是学生",
    "explanation": "学生 means student. Eric says he is a student.",
    "replyExplanation": "也 means also. 我也是学生 says that you are a student too."
  },
  "adventure-1#2": {
    "evidence": "王老师",
    "explanation": "老师 means teacher. 王 before 老师 names the teacher: Wang.",
    "replyExplanation": "Address the teacher as 王老师, then greet them with 你好."
  },
  "adventure-2#0": {
    "evidence": "我家有四口人",
    "explanation": "四 is four. 四口人 counts four people in the family.",
    "replyExplanation": "她 refers to a woman or girl; 谁 means who. 她是谁 asks who she is."
  },
  "adventure-2#1": {
    "evidence": "她是医生吗",
    "explanation": "医生 means doctor. Lin is asking whether she is a doctor.",
    "replyExplanation": "我妈妈是医生 states that your mother is a doctor. It supplies the requested information."
  },
  "adventure-2#2": {
    "evidence": "我有一个妹妹",
    "explanation": "妹妹 means younger sister. Eric says he has one younger sister.",
    "replyExplanation": "你妹妹 names the younger sister. 是学生吗 asks whether she is a student."
  },
  "adventure-3#0": {
    "evidence": "今天是星期五，明天是我的生日",
    "explanation": "今天 is today, and 星期五 is Friday. The birthday is 明天, tomorrow, so it is on Saturday.",
    "replyExplanation": "明天是你的生日吗 asks whether tomorrow is the other person’s birthday."
  },
  "adventure-3#1": {
    "evidence": "晚上七点：吃饭",
    "explanation": "晚上 means evening; 七点 means seven o’clock. Dinner is at seven in the evening.",
    "replyExplanation": "好 accepts the plan, and 晚上七点见 confirms meeting at seven in the evening."
  },
  "adventure-3#2": {
    "evidence": "明天晚上七点见",
    "explanation": "明天 means tomorrow. Lin confirms meeting tomorrow evening at seven.",
    "replyExplanation": "明天见 means “See you tomorrow.” It confirms the agreed day."
  },
  "adventure-4#0": {
    "evidence": "我想看电影",
    "explanation": "想 means want to; 看电影 means watch a movie. That is what Eric wants to do.",
    "replyExplanation": "我也喜欢看电影 says that you also like watching movies. 也 adds “also.”"
  },
  "adventure-4#1": {
    "evidence": "星期日：唱歌",
    "explanation": "星期日 means Sunday. Its listed activity is 唱歌: singing.",
    "replyExplanation": "星期日我想唱歌 states both the day, Sunday, and the activity you want to do, singing."
  },
  "adventure-4#2": {
    "evidence": "在你家看电影",
    "explanation": "Eric is speaking to Lin, so 你家 means Lin’s home. That is where they plan to watch the movie.",
    "replyExplanation": "In Lin’s reply, 我家 means “my home.” 好 agrees to watch the movie there."
  },
  "adventure-5#0": {
    "evidence": "喝茶还是咖啡",
    "explanation": "茶 is tea; 咖啡 is coffee. 还是 presents the two drink choices.",
    "replyExplanation": "我要喝茶 chooses tea. 喝 means drink."
  },
  "adventure-5#1": {
    "evidence": "再去图书馆",
    "explanation": "再 means then in this plan. They will go to the 图书馆, the library, after tea and a chat.",
    "replyExplanation": "一起 means together. 我们一起去图书馆 suggests going to the library together."
  },
  "adventure-5#2": {
    "evidence": "图书馆",
    "explanation": "图书馆 means library. It is the place named on the second line.",
    "replyExplanation": "图书馆在学校 says the library is at the school. 在 introduces its location."
  },
  "adventure-6#0": {
    "evidence": "我有一个问题",
    "explanation": "问题 means question. Eric contacts the teacher because he has a question to ask.",
    "replyExplanation": "今天下午三点 proposes three this afternoon. 可以吗 asks whether that time works."
  },
  "adventure-6#1": {
    "evidence": "办公室",
    "explanation": "办公室 means office. It is the appointment location.",
    "replyExplanation": "下午三点 gives the time; 办公室 gives the place. 见 confirms meeting there."
  },
  "adventure-6#2": {
    "evidence": "考试的问题",
    "explanation": "考试 means exam. Eric wants to ask questions about the exam.",
    "replyExplanation": "请说 means “Please go ahead.” It invites Eric to explain his question."
  },
  "adventure-7#0": {
    "evidence": "先复习，再练习写汉字",
    "explanation": "先 marks what happens first: 复习, review. Writing practice comes after 再.",
    "replyExplanation": "我们先复习 agrees to review first, matching the proposed order."
  },
  "adventure-7#1": {
    "evidence": "请您说慢一点",
    "explanation": "说 means speak. 慢一点 means a little more slowly, so Eric is asking for slower speech.",
    "replyExplanation": "请您说慢一点 politely asks the teacher to speak more slowly. 您 is the respectful form of you."
  },
  "adventure-7#2": {
    "evidence": "先听\n再写",
    "explanation": "听 means listen; 写 means write. Writing is the next step after listening.",
    "replyExplanation": "练习写汉字 means practice writing Chinese characters. 我要 introduces what you intend to do."
  },
  "adventure-8#0": {
    "evidence": "作业已经写好了",
    "explanation": "作业 means homework. 已经 and 好了 show that the homework is already finished.",
    "replyExplanation": "我的作业已经写好了 tells Lin that your homework is finished. It does not claim the diary is finished."
  },
  "adventure-8#1": {
    "evidence": "再回宿舍洗澡",
    "explanation": "回宿舍 means return to the dorm, and 洗澡 means shower. This happens after the library visit.",
    "replyExplanation": "我要回宿舍 says you will return to the dorm. 回 expresses going back."
  },
  "adventure-8#2": {
    "evidence": "我希望今天早点睡觉",
    "explanation": "希望 means hope. 早点睡觉 means go to bed a little earlier.",
    "replyExplanation": "我也想早点睡觉 says you also want to sleep earlier. 也 connects your wish to Eric’s."
  },
  "adventure-9#0": {
    "evidence": "红衬衫：八十块\n白衬衫：九十块",
    "explanation": "The red shirt costs 八十, eighty, while the white shirt costs 九十, ninety. The red shirt costs less.",
    "replyExplanation": "我要这件红衬衫 requests this red shirt. 件 is the counter used here for a shirt."
  },
  "adventure-9#1": {
    "evidence": "太大了，有小一点的吗",
    "explanation": "太大了 means too big. Eric asks for something 小一点: a little smaller.",
    "replyExplanation": "有小一点的吗 asks whether a smaller one is available. The shirt is understood from the conversation."
  },
  "adventure-9#2": {
    "evidence": "可以刷信用卡",
    "explanation": "信用卡 means credit card. 可以刷 says it can be used for payment.",
    "replyExplanation": "我用信用卡 says you will use a credit card. 用 means use."
  },
  "adventure-10#0": {
    "evidence": "去机场",
    "explanation": "机场 means airport. 去机场 gives their destination.",
    "replyExplanation": "坐地铁 chooses the subway; 去机场 states the destination. The reply combines both."
  },
  "adventure-10#1": {
    "evidence": "我有两张票，你不用买票",
    "explanation": "Lin already has 两张票: two tickets. That is why Eric does not need to buy one.",
    "replyExplanation": "地铁站 means subway station. 地铁站见 confirms meeting at that location."
  },
  "adventure-10#2": {
    "evidence": "你跟我一起坐地铁",
    "explanation": "跟我一起 means together with me. Eric asks Lin to ride the subway with him.",
    "replyExplanation": "我跟你一起去 agrees to go with the other person. 我 and 你 change with the speaker."
  },
  "adventure-c2-11#0": {
    "evidence": "今天比昨天冷",
    "explanation": "比 introduces a comparison. Today is 冷, colder, compared with yesterday.",
    "replyExplanation": "今天下雪了 says it has started snowing today. 下雪 means snow as a weather event."
  },
  "adventure-c2-11#1": {
    "evidence": "公园滑冰",
    "explanation": "公园 means park, and 滑冰 means ice-skate. The plan was ice-skating at the park.",
    "replyExplanation": "今天我不想滑冰 says you do not want to ice-skate today. 不想 expresses not wanting to."
  },
  "adventure-c2-11#2": {
    "evidence": "在家喝热茶",
    "explanation": "在家 means at home; 热茶 means hot tea. This is Lin’s new plan for the cold day.",
    "replyExplanation": "我们在家喝热茶 agrees to have hot tea at home. It keeps both the drink and location."
  },
  "adventure-c2-12#0": {
    "evidence": "素饺子",
    "explanation": "素 marks the vegetarian option. The vegetarian dish on this menu is the dumplings.",
    "replyExplanation": "一盘 means one plate of. 请给我一盘素饺子 politely orders a plate of vegetarian dumplings."
  },
  "adventure-c2-12#1": {
    "evidence": "豆腐还有",
    "explanation": "豆腐 means tofu. 还有 says some is still available, unlike the sold-out dumplings.",
    "replyExplanation": "我要豆腐 accepts the available tofu. It changes the order to the dish that remains."
  },
  "adventure-c2-12#2": {
    "evidence": "这碗汤太辣了",
    "explanation": "汤 means soup; 太辣了 means too spicy. That is why Eric asks for cool water.",
    "replyExplanation": "一些 means some. 请给我一些凉水 politely asks for some cool water."
  },
  "adventure-c2-13#0": {
    "evidence": "在红灯那儿往左拐",
    "explanation": "红灯 identifies the traffic light. 往左拐 means turn left there.",
    "replyExplanation": "The reply keeps the landmark 红灯 and direction 往左拐, confirming the left turn."
  },
  "adventure-c2-13#1": {
    "evidence": "学校｜公园｜图书馆",
    "explanation": "图书馆 is shown to the right of 公园 in the sign’s layout. The library is on the park’s right.",
    "replyExplanation": "右边 means right side. 图书馆在公园的右边 states the library’s position relative to the park."
  },
  "adventure-c2-13#2": {
    "evidence": "离这儿不远",
    "explanation": "离这儿 means from here. 不远 means not far, so the library is nearby.",
    "replyExplanation": "走过去 means walk over there. The reply chooses walking to the nearby destination."
  },
  "adventure-c2-14#0": {
    "evidence": "我表姐的生日",
    "explanation": "表姐 means an older female cousin. Lin is describing that cousin’s birthday.",
    "replyExplanation": "晚上六点 supplies six in the evening; 在她家见 confirms meeting at her home."
  },
  "adventure-c2-14#1": {
    "evidence": "我带一本书",
    "explanation": "带 means bring. 一本书 is one book, which Eric will bring as the gift.",
    "replyExplanation": "我带苹果和梨子 says you will bring apples and pears. 和 joins the two items."
  },
  "adventure-c2-14#2": {
    "evidence": "她住在楼上",
    "explanation": "住在 means live at or in; 楼上 means upstairs. The cousin lives upstairs.",
    "replyExplanation": "在这儿等你 means wait for you here. It answers Lin’s offer to come meet you."
  },
  "adventure-c2-15#0": {
    "evidence": "头疼，身体也很累",
    "explanation": "头疼 means have a headache, and 很累 means very tired. Eric is changing plans because he feels unwell.",
    "replyExplanation": "我今天头疼 states the requested symptom: a headache today."
  },
  "adventure-c2-15#1": {
    "evidence": "保险卡",
    "explanation": "保险卡 means insurance card. That is the item the speaker asks to see.",
    "replyExplanation": "我的保险卡在这儿 identifies your insurance card and says it is here. It does not name a credit card or ticket."
  },
  "adventure-c2-15#2": {
    "evidence": "我想在家休息",
    "explanation": "休息 means rest. Eric wants to rest at home today.",
    "replyExplanation": "明天再说 means talk about it tomorrow. The reply accepts the changed plan without suggesting going to the park today."
  }
};
