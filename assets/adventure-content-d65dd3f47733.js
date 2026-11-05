/* Original short practice scenes for Eric's Chinese.
 * 16 episodes, three scenes each; all Chinese forms appear by their episode lesson.
 * Comprehension and reply choices train usage without granting character mastery.
 */
const ADVENTURE_EPISODES = [
  {
    "id": "adventure-I",
    "lesson": "I",
    "title": "The number trail",
    "goal": "Follow three signs using numbers and familiar shapes.",
    "scenes": [
      {
        "place": "sign",
        "speaker": "Lin",
        "zh": "三人",
        "py": "Sān rén",
        "en": "Three people",
        "question": "How many people does the sign show?",
        "choices": [
          "One",
          "Three",
          "Five"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: choose the same number.",
        "replies": [
          {
            "zh": "三",
            "py": "sān",
            "en": "three",
            "traditional": "三"
          },
          {
            "zh": "五",
            "py": "wǔ",
            "en": "five",
            "traditional": "五"
          },
          {
            "zh": "二",
            "py": "èr",
            "en": "two",
            "traditional": "二"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "三人"
      },
      {
        "place": "sign",
        "speaker": "Eric",
        "zh": "水：二\n木：四",
        "py": "Shuǐ: èr. Mù: sì.",
        "en": "Water: two. Wood: four.",
        "question": "Which number goes with water?",
        "choices": [
          "Four",
          "Six",
          "Two"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: choose the word paired with four.",
        "replies": [
          {
            "zh": "木",
            "py": "mù",
            "en": "wood",
            "traditional": "木"
          },
          {
            "zh": "火",
            "py": "huǒ",
            "en": "fire",
            "traditional": "火"
          },
          {
            "zh": "水",
            "py": "shuǐ",
            "en": "water",
            "traditional": "水"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "水：二\n木：四"
      },
      {
        "place": "schedule",
        "speaker": "Lin",
        "zh": "日：一\n月：二",
        "py": "Rì: yī. Yuè: èr.",
        "en": "Sun: one. Moon: two.",
        "question": "What is paired with two?",
        "choices": [
          "The moon",
          "The sun",
          "A person"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: choose the number paired with the sun.",
        "replies": [
          {
            "zh": "一",
            "py": "yī",
            "en": "one",
            "traditional": "一"
          },
          {
            "zh": "九",
            "py": "jiǔ",
            "en": "nine",
            "traditional": "九"
          },
          {
            "zh": "十",
            "py": "shí",
            "en": "ten",
            "traditional": "十"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "日：一\n月：二"
      }
    ]
  },
  {
    "id": "adventure-1",
    "lesson": "1",
    "title": "A new study partner",
    "goal": "Introduce yourself and find the student.",
    "scenes": [
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "你好！请问，你姓什么？",
        "py": "Nǐ hǎo! Qǐngwèn, nǐ xìng shénme?",
        "en": "Hello! May I ask your surname?",
        "question": "What does Lin ask for?",
        "choices": [
          "Your age",
          "Your surname",
          "Your school address"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: tell Lin your surname is Li.",
        "replies": [
          {
            "zh": "我姓李。",
            "py": "Wǒ xìng Lǐ.",
            "en": "My surname is Li.",
            "traditional": "我姓李。"
          },
          {
            "zh": "我是老师。",
            "py": "Wǒ shì lǎoshī.",
            "en": "I am a teacher.",
            "traditional": "我是老師。"
          },
          {
            "zh": "你好。",
            "py": "Nǐ hǎo.",
            "en": "Hello.",
            "traditional": "你好。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "你好！請問，你姓什麼？"
      },
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "我姓李，是学生。你呢？",
        "py": "Wǒ xìng Lǐ, shì xuésheng. Nǐ ne?",
        "en": "My surname is Li, and I am a student. How about you?",
        "question": "What does Eric say about himself?",
        "choices": [
          "He is a teacher",
          "His surname is Wang",
          "He is a student"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: say that you are also a student.",
        "replies": [
          {
            "zh": "我也姓王。",
            "py": "Wǒ yě xìng Wáng.",
            "en": "My surname is also Wang.",
            "traditional": "我也姓王。"
          },
          {
            "zh": "我也是学生。",
            "py": "Wǒ yě shì xuésheng.",
            "en": "I am also a student.",
            "traditional": "我也是學生。"
          },
          {
            "zh": "你是老师吗？",
            "py": "Nǐ shì lǎoshī ma?",
            "en": "Are you a teacher?",
            "traditional": "你是老師嗎？"
          }
        ],
        "replyAnswer": 1,
        "vocab": [],
        "zhTraditional": "我姓李，是學生。你呢？"
      },
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "我是学生。王老师是中国人。",
        "py": "Wǒ shì xuésheng. Wáng lǎoshī shì Zhōngguó rén.",
        "en": "I am a student. Teacher Wang is Chinese.",
        "question": "Who is the teacher?",
        "choices": [
          "Wang",
          "Li",
          "Both students"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: greet Teacher Wang.",
        "replies": [
          {
            "zh": "李先生，你好。",
            "py": "Lǐ xiānsheng, nǐ hǎo.",
            "en": "Hello, Mr. Li.",
            "traditional": "李先生，你好。"
          },
          {
            "zh": "王老师，你好。",
            "py": "Wáng lǎoshī, nǐ hǎo.",
            "en": "Hello, Teacher Wang.",
            "traditional": "王老師，你好。"
          },
          {
            "zh": "我姓李。",
            "py": "Wǒ xìng Lǐ.",
            "en": "My surname is Li.",
            "traditional": "我姓李。"
          }
        ],
        "replyAnswer": 1,
        "vocab": [],
        "zhTraditional": "我是學生。王老師是中國人。"
      }
    ]
  },
  {
    "id": "adventure-2",
    "lesson": "2",
    "title": "The family photo",
    "goal": "Identify the people in a friend’s family.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "这是我家的照片。我家有四口人。",
        "py": "Zhè shì wǒ jiā de zhàopiàn. Wǒ jiā yǒu sì kǒu rén.",
        "en": "This is a photo of my family. There are four people in my family.",
        "question": "How many people are in Eric’s family?",
        "choices": [
          "Two",
          "Four",
          "Six"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: ask who the woman is.",
        "replies": [
          {
            "zh": "她是谁？",
            "py": "Tā shì shéi?",
            "en": "Who is she?",
            "traditional": "她是誰？"
          },
          {
            "zh": "你姓什么？",
            "py": "Nǐ xìng shénme?",
            "en": "What is your surname?",
            "traditional": "你姓什麼？"
          },
          {
            "zh": "你家有几口人？",
            "py": "Nǐ jiā yǒu jǐ kǒu rén?",
            "en": "How many people are in your family?",
            "traditional": "你家有幾口人？"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "這是我家的照片。我家有四口人。"
      },
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "她是你妈妈吗？她是医生吗？",
        "py": "Tā shì nǐ māma ma? Tā shì yīshēng ma?",
        "en": "Is she your mother? Is she a doctor?",
        "question": "What job does Lin ask about?",
        "choices": [
          "Teacher",
          "Lawyer",
          "Doctor"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: say your mother is a doctor.",
        "replies": [
          {
            "zh": "我妈妈是老师。",
            "py": "Wǒ māma shì lǎoshī.",
            "en": "My mother is a teacher.",
            "traditional": "我媽媽是老師。"
          },
          {
            "zh": "我妈妈是医生。",
            "py": "Wǒ māma shì yīshēng.",
            "en": "My mother is a doctor.",
            "traditional": "我媽媽是醫生。"
          },
          {
            "zh": "她是我妹妹。",
            "py": "Tā shì wǒ mèimei.",
            "en": "She is my younger sister.",
            "traditional": "她是我妹妹。"
          }
        ],
        "replyAnswer": 1,
        "vocab": [],
        "zhTraditional": "她是你媽媽嗎？她是醫生嗎？"
      },
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "我妈妈是医生，爸爸是老师。我有一个妹妹。",
        "py": "Wǒ māma shì yīshēng, bàba shì lǎoshī. Wǒ yǒu yí ge mèimei.",
        "en": "My mother is a doctor, and my father is a teacher. I have one younger sister.",
        "question": "Which sibling does Eric have?",
        "choices": [
          "A younger sister",
          "An older brother",
          "A younger brother"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: ask whether the younger sister is a student.",
        "replies": [
          {
            "zh": "你爸爸是学生吗？",
            "py": "Nǐ bàba shì xuésheng ma?",
            "en": "Is your father a student?",
            "traditional": "你爸爸是學生嗎？"
          },
          {
            "zh": "你妈妈是谁？",
            "py": "Nǐ māma shì shéi?",
            "en": "Who is your mother?",
            "traditional": "你媽媽是誰？"
          },
          {
            "zh": "你妹妹是学生吗？",
            "py": "Nǐ mèimei shì xuésheng ma?",
            "en": "Is your younger sister a student?",
            "traditional": "你妹妹是學生嗎？"
          }
        ],
        "replyAnswer": 2,
        "vocab": [],
        "zhTraditional": "我媽媽是醫生，爸爸是老師。我有一個妹妹。"
      }
    ]
  },
  {
    "id": "adventure-3",
    "lesson": "3",
    "title": "The birthday plan",
    "goal": "Read a date, choose a time, and confirm the plan.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Lin",
        "zh": "今天是星期五，明天是我的生日。",
        "py": "Jīntiān shì xīngqīwǔ, míngtiān shì wǒ de shēngrì.",
        "en": "Today is Friday. Tomorrow is my birthday.",
        "question": "On which day is Lin’s birthday?",
        "choices": [
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: ask whether tomorrow is Lin’s birthday.",
        "replies": [
          {
            "zh": "明天是你的生日吗？",
            "py": "Míngtiān shì nǐ de shēngrì ma?",
            "en": "Is tomorrow your birthday?",
            "traditional": "明天是你的生日嗎？"
          },
          {
            "zh": "今天是星期六吗？",
            "py": "Jīntiān shì xīngqīliù ma?",
            "en": "Is today Saturday?",
            "traditional": "今天是星期六嗎？"
          },
          {
            "zh": "你有几个妹妹？",
            "py": "Nǐ yǒu jǐ ge mèimei?",
            "en": "How many younger sisters do you have?",
            "traditional": "你有幾個妹妹？"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "今天是星期五，明天是我的生日。"
      },
      {
        "place": "schedule",
        "speaker": "Eric",
        "zh": "星期六\n晚上七点：吃饭",
        "py": "Xīngqīliù. Wǎnshang qī diǎn: chī fàn.",
        "en": "Saturday. Seven in the evening: have dinner.",
        "question": "When is dinner?",
        "choices": [
          "At seven in the morning",
          "At six in the evening",
          "At seven in the evening"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: say you can have dinner at seven in the evening.",
        "replies": [
          {
            "zh": "好，晚上七点见。",
            "py": "Hǎo, wǎnshang qī diǎn jiàn.",
            "en": "Good, see you at seven in the evening.",
            "traditional": "好，晚上七點見。"
          },
          {
            "zh": "现在是六点。",
            "py": "Xiànzài shì liù diǎn.",
            "en": "It is six now.",
            "traditional": "現在是六點。"
          },
          {
            "zh": "我今天很忙。",
            "py": "Wǒ jīntiān hěn máng.",
            "en": "I am busy today.",
            "traditional": "我今天很忙。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "星期六\n晚上七點：吃飯"
      },
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "好，明天晚上七点见！谢谢你。",
        "py": "Hǎo, míngtiān wǎnshang qī diǎn jiàn! Xièxie nǐ.",
        "en": "Good, see you tomorrow at seven in the evening! Thank you.",
        "question": "What has been agreed?",
        "choices": [
          "Dinner tonight at six",
          "Meeting tomorrow evening at seven",
          "Meeting tomorrow morning"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: confirm that you will meet tomorrow.",
        "replies": [
          {
            "zh": "明天见！",
            "py": "Míngtiān jiàn!",
            "en": "See you tomorrow!",
            "traditional": "明天見！"
          },
          {
            "zh": "我不认识你。",
            "py": "Wǒ bú rènshi nǐ.",
            "en": "I do not know you.",
            "traditional": "我不認識你。"
          },
          {
            "zh": "今天是我的生日。",
            "py": "Jīntiān shì wǒ de shēngrì.",
            "en": "Today is my birthday.",
            "traditional": "今天是我的生日。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "好，明天晚上七點見！謝謝你。"
      }
    ]
  },
  {
    "id": "adventure-4",
    "lesson": "4",
    "title": "Movie night or a song?",
    "goal": "Find a shared hobby and make a weekend plan.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "周末你想做什么？我想看电影。",
        "py": "Zhōumò nǐ xiǎng zuò shénme? Wǒ xiǎng kàn diànyǐng.",
        "en": "What do you want to do this weekend? I want to watch a movie.",
        "question": "What does Eric want to do?",
        "choices": [
          "Play ball",
          "Read a book",
          "Watch a movie"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: say that you also like watching movies.",
        "replies": [
          {
            "zh": "我也喜欢看电影。",
            "py": "Wǒ yě xǐhuan kàn diànyǐng.",
            "en": "I also like watching movies.",
            "traditional": "我也喜歡看電影。"
          },
          {
            "zh": "我不喜欢电影。",
            "py": "Wǒ bù xǐhuan diànyǐng.",
            "en": "I do not like movies.",
            "traditional": "我不喜歡電影。"
          },
          {
            "zh": "我想睡觉。",
            "py": "Wǒ xiǎng shuì jiào.",
            "en": "I want to sleep.",
            "traditional": "我想睡覺。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "週末你想做什麼？我想看電影。"
      },
      {
        "place": "schedule",
        "speaker": "Lin",
        "zh": "星期六：看电影\n星期日：唱歌",
        "py": "Xīngqīliù: kàn diànyǐng. Xīngqīrì: chàng gē.",
        "en": "Saturday: watch a movie. Sunday: sing.",
        "question": "Which activity is planned for Sunday?",
        "choices": [
          "Singing",
          "Watching a movie",
          "Playing ball"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: say you want to sing on Sunday.",
        "replies": [
          {
            "zh": "星期六我想打球。",
            "py": "Xīngqīliù wǒ xiǎng dǎ qiú.",
            "en": "I want to play ball on Saturday.",
            "traditional": "星期六我想打球。"
          },
          {
            "zh": "星期日我想唱歌。",
            "py": "Xīngqīrì wǒ xiǎng chàng gē.",
            "en": "I want to sing on Sunday.",
            "traditional": "星期日我想唱歌。"
          },
          {
            "zh": "星期日我想看书。",
            "py": "Xīngqīrì wǒ xiǎng kàn shū.",
            "en": "I want to read on Sunday.",
            "traditional": "星期日我想看書。"
          }
        ],
        "replyAnswer": 1,
        "vocab": [],
        "zhTraditional": "星期六：看電影\n星期日：唱歌"
      },
      {
        "place": "conversation",
        "speaker": "Eric",
        "zh": "那星期六晚上七点，我们在你家看电影，好吗？",
        "py": "Nà xīngqīliù wǎnshang qī diǎn, wǒmen zài nǐ jiā kàn diànyǐng, hǎo ma?",
        "en": "Then shall we watch a movie at your place at seven on Saturday evening?",
        "question": "Where will they watch the movie?",
        "choices": [
          "At Eric’s school",
          "At Lin’s home",
          "At a ball game"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: agree to watch the movie at your home.",
        "replies": [
          {
            "zh": "好，在我家看电影。",
            "py": "Hǎo, zài wǒ jiā kàn diànyǐng.",
            "en": "Yes, let’s watch the movie at my home.",
            "traditional": "好，在我家看電影。"
          },
          {
            "zh": "我家没有人。",
            "py": "Wǒ jiā méiyǒu rén.",
            "en": "No one is at my home.",
            "traditional": "我家沒有人。"
          },
          {
            "zh": "我喜欢打球。",
            "py": "Wǒ xǐhuan dǎ qiú.",
            "en": "I like playing ball.",
            "traditional": "我喜歡打球。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "那星期六晚上七點，我們在你家看電影，好嗎？"
      }
    ]
  },
  {
    "id": "adventure-5",
    "lesson": "5",
    "title": "Tea before the library",
    "goal": "Choose a drink and decide where to go next.",
    "scenes": [
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "请进！你要喝茶还是咖啡？",
        "py": "Qǐng jìn! Nǐ yào hē chá háishi kāfēi?",
        "en": "Come in! Would you like tea or coffee?",
        "question": "What choice is Lin offering?",
        "choices": [
          "Tea or coffee",
          "A movie or a book",
          "School or home"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: ask for tea.",
        "replies": [
          {
            "zh": "我要咖啡。",
            "py": "Wǒ yào kāfēi.",
            "en": "I would like coffee.",
            "traditional": "我要咖啡。"
          },
          {
            "zh": "我要喝茶。",
            "py": "Wǒ yào hē chá.",
            "en": "I would like tea.",
            "traditional": "我要喝茶。"
          },
          {
            "zh": "我想看电影。",
            "py": "Wǒ xiǎng kàn diànyǐng.",
            "en": "I want to watch a movie.",
            "traditional": "我想看電影。"
          }
        ],
        "replyAnswer": 1,
        "vocab": [],
        "zhTraditional": "請進！你要喝茶還是咖啡？"
      },
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "茶很好喝。我们喝茶，聊聊天，再去图书馆。",
        "py": "Chá hěn hǎohē. Wǒmen hē chá, liáo liáo tiān, zài qù túshūguǎn.",
        "en": "The tea tastes good. We will have tea, chat, and then go to the library.",
        "question": "What will they do after tea and a chat?",
        "choices": [
          "Go to the library",
          "Go home to sleep",
          "Watch television"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: suggest going to the library together.",
        "replies": [
          {
            "zh": "我们一起去图书馆。",
            "py": "Wǒmen yìqǐ qù túshūguǎn.",
            "en": "Let’s go to the library together.",
            "traditional": "我們一起去圖書館。"
          },
          {
            "zh": "我们不去图书馆。",
            "py": "Wǒmen bú qù túshūguǎn.",
            "en": "We are not going to the library.",
            "traditional": "我們不去圖書館。"
          },
          {
            "zh": "你想喝咖啡吗？",
            "py": "Nǐ xiǎng hē kāfēi ma?",
            "en": "Would you like coffee?",
            "traditional": "你想喝咖啡嗎？"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "茶很好喝。我們喝茶，聊聊天，再去圖書館。"
      },
      {
        "place": "sign",
        "speaker": "Lin",
        "zh": "学校\n图书馆",
        "py": "Xuéxiào. Túshūguǎn.",
        "en": "School. Library.",
        "question": "Which place does the second line name?",
        "choices": [
          "A home",
          "A library",
          "A movie theater"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: say that the library is at the school.",
        "replies": [
          {
            "zh": "图书馆在学校。",
            "py": "Túshūguǎn zài xuéxiào.",
            "en": "The library is at the school.",
            "traditional": "圖書館在學校。"
          },
          {
            "zh": "咖啡在我家。",
            "py": "Kāfēi zài wǒ jiā.",
            "en": "The coffee is at my home.",
            "traditional": "咖啡在我家。"
          },
          {
            "zh": "我不喜欢看书。",
            "py": "Wǒ bù xǐhuan kàn shū.",
            "en": "I do not like reading.",
            "traditional": "我不喜歡看書。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "學校\n圖書館"
      }
    ]
  },
  {
    "id": "adventure-6",
    "lesson": "6",
    "title": "An office visit",
    "goal": "Arrange a time to ask the teacher a question.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "老师，您好！我有一个问题。您今天下午有空吗？",
        "py": "Lǎoshī, nín hǎo! Wǒ yǒu yí ge wèntí. Nín jīntiān xiàwǔ yǒu kòng ma?",
        "en": "Hello, teacher! I have a question. Are you free this afternoon?",
        "question": "Why is Eric contacting the teacher?",
        "choices": [
          "To ask a question",
          "To buy a ticket",
          "To introduce a sibling"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: ask whether three this afternoon works.",
        "replies": [
          {
            "zh": "今天上午三点见。",
            "py": "Jīntiān shàngwǔ sān diǎn jiàn.",
            "en": "See you at three this morning.",
            "traditional": "今天上午三點見。"
          },
          {
            "zh": "今天下午三点可以吗？",
            "py": "Jīntiān xiàwǔ sān diǎn kěyǐ ma?",
            "en": "Would three this afternoon work?",
            "traditional": "今天下午三點可以嗎？"
          },
          {
            "zh": "我明天没有课。",
            "py": "Wǒ míngtiān méiyǒu kè.",
            "en": "I do not have class tomorrow.",
            "traditional": "我明天沒有課。"
          }
        ],
        "replyAnswer": 1,
        "vocab": [],
        "zhTraditional": "老師，您好！我有一個問題。您今天下午有空嗎？"
      },
      {
        "place": "schedule",
        "speaker": "Lin",
        "zh": "下午三点\n办公室",
        "py": "Xiàwǔ sān diǎn. Bàngōngshì.",
        "en": "Three in the afternoon. Office.",
        "question": "Where is the appointment?",
        "choices": [
          "At the library",
          "At home",
          "In the office"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: confirm a three o’clock office visit.",
        "replies": [
          {
            "zh": "好，下午三点办公室见。",
            "py": "Hǎo, xiàwǔ sān diǎn bàngōngshì jiàn.",
            "en": "Good, see you in the office at three this afternoon.",
            "traditional": "好，下午三點辦公室見。"
          },
          {
            "zh": "我想喝一杯茶。",
            "py": "Wǒ xiǎng hē yì bēi chá.",
            "en": "I would like a cup of tea.",
            "traditional": "我想喝一杯茶。"
          },
          {
            "zh": "我们星期日打球。",
            "py": "Wǒmen xīngqīrì dǎ qiú.",
            "en": "We will play ball on Sunday.",
            "traditional": "我們星期日打球。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "下午三點\n辦公室"
      },
      {
        "place": "conversation",
        "speaker": "Eric",
        "zh": "老师，我想问问考试的问题。请您帮我，好吗？",
        "py": "Lǎoshī, wǒ xiǎng wènwen kǎoshì de wèntí. Qǐng nín bāng wǒ, hǎo ma?",
        "en": "Teacher, I would like to ask about the exam. Could you help me?",
        "question": "What topic does Eric want help with?",
        "choices": [
          "The exam",
          "The weather",
          "A family photo"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: as the teacher, invite Eric to speak.",
        "replies": [
          {
            "zh": "请说。",
            "py": "Qǐng shuō.",
            "en": "Please go ahead.",
            "traditional": "請說。"
          },
          {
            "zh": "我也姓李。",
            "py": "Wǒ yě xìng Lǐ.",
            "en": "My surname is also Li.",
            "traditional": "我也姓李。"
          },
          {
            "zh": "你想喝咖啡吗？",
            "py": "Nǐ xiǎng hē kāfēi ma?",
            "en": "Would you like coffee?",
            "traditional": "你想喝咖啡嗎？"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "老師，我想問問考試的問題。請您幫我，好嗎？"
      }
    ]
  },
  {
    "id": "adventure-7",
    "lesson": "7",
    "title": "A character finally clicks",
    "goal": "Choose a study step and ask for a clearer explanation.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Lin",
        "zh": "今天的生词有点难。我们先复习，再练习写汉字。",
        "py": "Jīntiān de shēngcí yǒudiǎn nán. Wǒmen xiān fùxí, zài liànxí xiě Hànzì.",
        "en": "Today’s new words are a little difficult. Let’s review first, then practice writing characters.",
        "question": "What should happen first?",
        "choices": [
          "Writing practice",
          "Review",
          "An exam"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: agree to review first.",
        "replies": [
          {
            "zh": "好，我们先复习。",
            "py": "Hǎo, wǒmen xiān fùxí.",
            "en": "Good, let’s review first.",
            "traditional": "好，我們先復習。"
          },
          {
            "zh": "我们先看电影。",
            "py": "Wǒmen xiān kàn diànyǐng.",
            "en": "Let’s watch a movie first.",
            "traditional": "我們先看電影。"
          },
          {
            "zh": "我不想学汉字。",
            "py": "Wǒ bù xiǎng xué Hànzì.",
            "en": "I do not want to learn characters.",
            "traditional": "我不想學漢字。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "今天的生詞有點難。我們先復習，再練習寫漢字。"
      },
      {
        "place": "conversation",
        "speaker": "Eric",
        "zh": "这个字我不懂。请您说慢一点，好吗？",
        "py": "Zhè ge zì wǒ bù dǒng. Qǐng nín shuō màn yìdiǎn, hǎo ma?",
        "en": "I do not understand this character. Could you speak a little more slowly?",
        "question": "What help does Eric request?",
        "choices": [
          "More paper",
          "A louder movie",
          "Slower speech"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: ask the teacher to say it more slowly.",
        "replies": [
          {
            "zh": "请您说慢一点。",
            "py": "Qǐng nín shuō màn yìdiǎn.",
            "en": "Please speak a little more slowly.",
            "traditional": "請您說慢一點。"
          },
          {
            "zh": "请您写快一点。",
            "py": "Qǐng nín xiě kuài yìdiǎn.",
            "en": "Please write a little faster.",
            "traditional": "請您寫快一點。"
          },
          {
            "zh": "请您给我咖啡。",
            "py": "Qǐng nín gěi wǒ kāfēi.",
            "en": "Please give me coffee.",
            "traditional": "請您給我咖啡。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "這個字我不懂。請您說慢一點，好嗎？"
      },
      {
        "place": "schedule",
        "speaker": "Lin",
        "zh": "先听\n再写\n再复习",
        "py": "Xiān tīng. Zài xiě. Zài fùxí.",
        "en": "Listen first. Then write. Then review again.",
        "question": "What comes directly after listening?",
        "choices": [
          "Writing",
          "Going home",
          "Previewing grammar"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: say that you will practice writing characters.",
        "replies": [
          {
            "zh": "我要去图书馆看电影。",
            "py": "Wǒ yào qù túshūguǎn kàn diànyǐng.",
            "en": "I am going to the library to watch a movie.",
            "traditional": "我要去圖書館看電影。"
          },
          {
            "zh": "我要练习写汉字。",
            "py": "Wǒ yào liànxí xiě Hànzì.",
            "en": "I am going to practice writing characters.",
            "traditional": "我要練習寫漢字。"
          },
          {
            "zh": "我不要复习。",
            "py": "Wǒ bú yào fùxí.",
            "en": "I do not want to review.",
            "traditional": "我不要復習。"
          }
        ],
        "replyAnswer": 1,
        "vocab": [],
        "zhTraditional": "先聽\n再寫\n再復習"
      }
    ]
  },
  {
    "id": "adventure-8",
    "lesson": "8",
    "title": "The last task before bed",
    "goal": "Follow a student’s evening on campus.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "我在宿舍用电脑写日记。作业已经写好了。",
        "py": "Wǒ zài sùshè yòng diànnǎo xiě rìjì. Zuòyè yǐjīng xiě hǎo le.",
        "en": "I am writing my diary on the computer in the dorm. My homework is already finished.",
        "question": "Which task is already finished?",
        "choices": [
          "The diary",
          "The homework",
          "A shopping trip"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: tell Lin your homework is finished.",
        "replies": [
          {
            "zh": "我的作业已经写好了。",
            "py": "Wǒ de zuòyè yǐjīng xiě hǎo le.",
            "en": "I have already finished my homework.",
            "traditional": "我的作業已經寫好了。"
          },
          {
            "zh": "我没有电脑。",
            "py": "Wǒ méiyǒu diànnǎo.",
            "en": "I do not have a computer.",
            "traditional": "我沒有電腦。"
          },
          {
            "zh": "我今天没去宿舍。",
            "py": "Wǒ jīntiān méi qù sùshè.",
            "en": "I did not go to the dorm today.",
            "traditional": "我今天沒去宿舍。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "我在宿舍用電腦寫日記。作業已經寫好了。"
      },
      {
        "place": "schedule",
        "speaker": "Lin",
        "zh": "先去图书馆\n再回宿舍洗澡",
        "py": "Xiān qù túshūguǎn. Zài huí sùshè xǐ zǎo.",
        "en": "Go to the library first. Then return to the dorm to shower.",
        "question": "What happens after the library visit?",
        "choices": [
          "A shower at the dorm",
          "A ball game",
          "A visit to the teacher"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: say that you will return to the dorm.",
        "replies": [
          {
            "zh": "我要去学校。",
            "py": "Wǒ yào qù xuéxiào.",
            "en": "I am going to school.",
            "traditional": "我要去學校。"
          },
          {
            "zh": "我要去图书馆。",
            "py": "Wǒ yào qù túshūguǎn.",
            "en": "I am going to the library.",
            "traditional": "我要去圖書館。"
          },
          {
            "zh": "我要回宿舍。",
            "py": "Wǒ yào huí sùshè.",
            "en": "I am going back to the dorm.",
            "traditional": "我要回宿舍。"
          }
        ],
        "replyAnswer": 2,
        "vocab": [],
        "zhTraditional": "先去圖書館\n再回宿舍洗澡"
      },
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "今天很累，可是很高兴。我希望今天早点睡觉。",
        "py": "Jīntiān hěn lèi, kěshì hěn gāoxìng. Wǒ xīwàng jīntiān zǎo diǎn shuì jiào.",
        "en": "I am tired today, but happy. I hope to go to bed a little earlier today.",
        "question": "What does Eric hope to do?",
        "choices": [
          "Study all night",
          "Go to bed earlier",
          "Buy a new computer"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: say you also want to sleep earlier.",
        "replies": [
          {
            "zh": "我也想早点睡觉。",
            "py": "Wǒ yě xiǎng zǎo diǎn shuì jiào.",
            "en": "I also want to go to bed earlier.",
            "traditional": "我也想早點睡覺。"
          },
          {
            "zh": "我不喜欢写日记。",
            "py": "Wǒ bù xǐhuan xiě rìjì.",
            "en": "I do not like writing a diary.",
            "traditional": "我不喜歡寫日記。"
          },
          {
            "zh": "我昨天没有课。",
            "py": "Wǒ zuótiān méiyǒu kè.",
            "en": "I did not have class yesterday.",
            "traditional": "我昨天沒有課。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "今天很累，可是很高興。我希望今天早點睡覺。"
      }
    ]
  },
  {
    "id": "adventure-9",
    "lesson": "9",
    "title": "Find the right shirt",
    "goal": "Compare prices, find a fit, and pay.",
    "scenes": [
      {
        "place": "sign",
        "speaker": "Lin",
        "zh": "红衬衫：八十块\n白衬衫：九十块",
        "py": "Hóng chènshān: bāshí kuài. Bái chènshān: jiǔshí kuài.",
        "en": "Red shirt: eighty kuai. White shirt: ninety kuai.",
        "question": "Which shirt costs less?",
        "choices": [
          "The white shirt",
          "Both cost the same",
          "The red shirt"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: ask for the red shirt.",
        "replies": [
          {
            "zh": "我要这件红衬衫。",
            "py": "Wǒ yào zhè jiàn hóng chènshān.",
            "en": "I would like this red shirt.",
            "traditional": "我要這件紅襯衫。"
          },
          {
            "zh": "我要这双黑鞋。",
            "py": "Wǒ yào zhè shuāng hēi xié.",
            "en": "I would like these black shoes.",
            "traditional": "我要這雙黑鞋。"
          },
          {
            "zh": "我要那条裤子。",
            "py": "Wǒ yào nà tiáo kùzi.",
            "en": "I would like those pants.",
            "traditional": "我要那條褲子。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "紅襯衫：八十塊\n白襯衫：九十塊"
      },
      {
        "place": "conversation",
        "speaker": "Eric",
        "zh": "这件衬衫太大了，有小一点的吗？",
        "py": "Zhè jiàn chènshān tài dà le, yǒu xiǎo yìdiǎn de ma?",
        "en": "This shirt is too big. Do you have a smaller one?",
        "question": "What does Eric need?",
        "choices": [
          "A bigger shirt",
          "A smaller shirt",
          "A different color only"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: ask for a smaller shirt.",
        "replies": [
          {
            "zh": "有小一点的吗？",
            "py": "Yǒu xiǎo yìdiǎn de ma?",
            "en": "Do you have a smaller one?",
            "traditional": "有小一點的嗎？"
          },
          {
            "zh": "有大一点的吗？",
            "py": "Yǒu dà yìdiǎn de ma?",
            "en": "Do you have a bigger one?",
            "traditional": "有大一點的嗎？"
          },
          {
            "zh": "有便宜的鞋吗？",
            "py": "Yǒu piányi de xié ma?",
            "en": "Do you have inexpensive shoes?",
            "traditional": "有便宜的鞋嗎？"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "這件襯衫太大了，有小一點的嗎？"
      },
      {
        "place": "sign",
        "speaker": "Lin",
        "zh": "一共八十块。\n可以刷信用卡。",
        "py": "Yígòng bāshí kuài. Kěyǐ shuā xìnyòngkǎ.",
        "en": "Eighty kuai in total. Credit cards are accepted.",
        "question": "Which payment method is explicitly accepted?",
        "choices": [
          "Credit card",
          "Only cash",
          "Only a phone app"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: say you will use a credit card.",
        "replies": [
          {
            "zh": "我用信用卡。",
            "py": "Wǒ yòng xìnyòngkǎ.",
            "en": "I will use a credit card.",
            "traditional": "我用信用卡。"
          },
          {
            "zh": "我不要这件衬衫。",
            "py": "Wǒ bú yào zhè jiàn chènshān.",
            "en": "I do not want this shirt.",
            "traditional": "我不要這件襯衫。"
          },
          {
            "zh": "我想换颜色。",
            "py": "Wǒ xiǎng huàn yánsè.",
            "en": "I want to change the color.",
            "traditional": "我想换顏色。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "一共八十塊。\n可以刷信用卡。"
      }
    ]
  },
  {
    "id": "adventure-10",
    "lesson": "10",
    "title": "Two tickets to the airport",
    "goal": "Choose transportation and meet your travel partner.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "我们七点去机场。坐地铁还是出租车？",
        "py": "Wǒmen qī diǎn qù jīchǎng. Zuò dìtiě háishi chūzūchē?",
        "en": "We are going to the airport at seven. Shall we take the subway or a taxi?",
        "question": "Where are they going?",
        "choices": [
          "The airport",
          "The library",
          "A clothing store"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: choose the subway to the airport.",
        "replies": [
          {
            "zh": "我想坐出租车。",
            "py": "Wǒ xiǎng zuò chūzūchē.",
            "en": "I would like to take a taxi.",
            "traditional": "我想坐出租車。"
          },
          {
            "zh": "我们坐地铁去机场。",
            "py": "Wǒmen zuò dìtiě qù jīchǎng.",
            "en": "Let’s take the subway to the airport.",
            "traditional": "我們坐地鐵去機場。"
          },
          {
            "zh": "我们自己开车。",
            "py": "Wǒmen zìjǐ kāi chē.",
            "en": "Let’s drive ourselves.",
            "traditional": "我們自己開車。"
          }
        ],
        "replyAnswer": 1,
        "vocab": [],
        "zhTraditional": "我們七點去機場。坐地鐵還是出租車？"
      },
      {
        "place": "message",
        "speaker": "Lin",
        "zh": "我有两张票，你不用买票。我们在地铁站见。",
        "py": "Wǒ yǒu liǎng zhāng piào, nǐ bú yòng mǎi piào. Wǒmen zài dìtiězhàn jiàn.",
        "en": "I have two tickets, so you do not need to buy one. Let’s meet at the subway station.",
        "question": "Why does Eric not need to buy a ticket?",
        "choices": [
          "The subway is free",
          "They are driving",
          "Lin already has two tickets"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: confirm meeting at the subway station.",
        "replies": [
          {
            "zh": "好，地铁站见。",
            "py": "Hǎo, dìtiězhàn jiàn.",
            "en": "Good, see you at the subway station.",
            "traditional": "好，地鐵站見。"
          },
          {
            "zh": "好，办公室见。",
            "py": "Hǎo, bàngōngshì jiàn.",
            "en": "Good, see you at the office.",
            "traditional": "好，辦公室見。"
          },
          {
            "zh": "我有三件衬衫。",
            "py": "Wǒ yǒu sān jiàn chènshān.",
            "en": "I have three shirts.",
            "traditional": "我有三件襯衫。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "我有兩張票，你不用買票。我們在地鐵站見。"
      },
      {
        "place": "conversation",
        "speaker": "Eric",
        "zh": "我有一点紧张。你跟我一起坐地铁，好吗？",
        "py": "Wǒ yǒu yìdiǎn jǐnzhāng. Nǐ gēn wǒ yìqǐ zuò dìtiě, hǎo ma?",
        "en": "I am a little nervous. Will you ride the subway with me?",
        "question": "What does Eric ask Lin to do?",
        "choices": [
          "Buy a shirt",
          "Ride with him",
          "Stay at home"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: agree to ride together.",
        "replies": [
          {
            "zh": "好，我跟你一起去。",
            "py": "Hǎo, wǒ gēn nǐ yìqǐ qù.",
            "en": "Yes, I will go with you.",
            "traditional": "好，我跟你一起去。"
          },
          {
            "zh": "不，我不想去。",
            "py": "Bù, wǒ bù xiǎng qù.",
            "en": "No, I do not want to go.",
            "traditional": "不，我不想去。"
          },
          {
            "zh": "我明天去买票。",
            "py": "Wǒ míngtiān qù mǎi piào.",
            "en": "I will buy a ticket tomorrow.",
            "traditional": "我明天去買票。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "我有一點緊張。你跟我一起坐地鐵，好嗎？"
      }
    ]
  },
  {
    "id": "adventure-c2-11",
    "lesson": "c2-11",
    "title": "Snow changes the plan",
    "goal": "Read a weather update and choose a warmer plan.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Lin",
        "zh": "今天比昨天冷，而且下雪了。",
        "py": "Jīntiān bǐ zuótiān lěng, érqiě xià xuě le.",
        "en": "Today is colder than yesterday, and it has started snowing.",
        "question": "How is today different from yesterday?",
        "choices": [
          "Warmer",
          "Colder",
          "Exactly the same temperature"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: say that it is snowing today.",
        "replies": [
          {
            "zh": "今天下雪了。",
            "py": "Jīntiān xià xuě le.",
            "en": "It has started snowing today.",
            "traditional": "今天下雪了。"
          },
          {
            "zh": "今天非常热。",
            "py": "Jīntiān fēicháng rè.",
            "en": "It is very hot today.",
            "traditional": "今天非常熱。"
          },
          {
            "zh": "今天比昨天暖和。",
            "py": "Jīntiān bǐ zuótiān nuǎnhuo.",
            "en": "Today is warmer than yesterday.",
            "traditional": "今天比昨天暖和。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "今天比昨天冷，而且下雪了。"
      },
      {
        "place": "schedule",
        "speaker": "Eric",
        "zh": "公园滑冰\n下午三点",
        "py": "Gōngyuán huábīng. Xiàwǔ sān diǎn.",
        "en": "Ice-skating at the park. Three in the afternoon.",
        "question": "What activity was planned?",
        "choices": [
          "A movie at home",
          "Shopping for a shirt",
          "Ice-skating at the park"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: say that you do not want to ice-skate today.",
        "replies": [
          {
            "zh": "今天我不想滑冰。",
            "py": "Jīntiān wǒ bù xiǎng huábīng.",
            "en": "I do not want to ice-skate today.",
            "traditional": "今天我不想滑冰。"
          },
          {
            "zh": "今天我不想喝水。",
            "py": "Jīntiān wǒ bù xiǎng hē shuǐ.",
            "en": "I do not want to drink water today.",
            "traditional": "今天我不想喝水。"
          },
          {
            "zh": "今天我不想看书。",
            "py": "Jīntiān wǒ bù xiǎng kàn shū.",
            "en": "I do not want to read today.",
            "traditional": "今天我不想看書。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "公園滑冰\n下午三點"
      },
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "外面很冷。在家喝热茶更舒服。",
        "py": "Wàimian hěn lěng. Zài jiā hē rè chá gèng shūfu.",
        "en": "It is cold outside. Drinking hot tea at home is more comfortable.",
        "question": "Which new plan does Lin suggest?",
        "choices": [
          "Hot tea at home",
          "Ice water outside",
          "An earlier skating time"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: agree to drink hot tea at home.",
        "replies": [
          {
            "zh": "好，我们在家喝热茶。",
            "py": "Hǎo, wǒmen zài jiā hē rè chá.",
            "en": "Good, let’s have hot tea at home.",
            "traditional": "好，我們在家喝熱茶。"
          },
          {
            "zh": "好，我们去公园滑冰。",
            "py": "Hǎo, wǒmen qù gōngyuán huábīng.",
            "en": "Good, let’s go ice-skating at the park.",
            "traditional": "好，我們去公園滑冰。"
          },
          {
            "zh": "我只想喝冰水。",
            "py": "Wǒ zhǐ xiǎng hē bīngshuǐ.",
            "en": "I only want ice water.",
            "traditional": "我只想喝冰水。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "外面很冷。在家喝熱茶更舒服。"
      }
    ]
  },
  {
    "id": "adventure-c2-12",
    "lesson": "c2-12",
    "title": "A menu with one surprise",
    "goal": "Read a menu and adapt when a dish sells out.",
    "scenes": [
      {
        "place": "menu",
        "speaker": "Eric",
        "zh": "素饺子：二十块\n牛肉面：三十块",
        "py": "Sù jiǎozi: èrshí kuài. Niúròu miàn: sānshí kuài.",
        "en": "Vegetarian dumplings: twenty kuai. Beef noodles: thirty kuai.",
        "question": "Which dish is vegetarian?",
        "choices": [
          "Beef noodles",
          "Vegetarian dumplings",
          "Both dishes contain beef"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: order one plate of vegetarian dumplings.",
        "replies": [
          {
            "zh": "请给我一盘素饺子。",
            "py": "Qǐng gěi wǒ yì pán sù jiǎozi.",
            "en": "Please give me a plate of vegetarian dumplings.",
            "traditional": "請給我一盤素餃子。"
          },
          {
            "zh": "请给我一碗牛肉面。",
            "py": "Qǐng gěi wǒ yì wǎn niúròu miàn.",
            "en": "Please give me a bowl of beef noodles.",
            "traditional": "請給我一碗牛肉面。"
          },
          {
            "zh": "请给我一杯咖啡。",
            "py": "Qǐng gěi wǒ yì bēi kāfēi.",
            "en": "Please give me a cup of coffee.",
            "traditional": "請給我一杯咖啡。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "素餃子：二十塊\n牛肉面：三十塊"
      },
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "素饺子卖完了，豆腐还有。你要豆腐吗？",
        "py": "Sù jiǎozi mài wán le, dòufu hái yǒu. Nǐ yào dòufu ma?",
        "en": "The vegetarian dumplings have sold out, but tofu is still available. Would you like tofu?",
        "question": "What is still available?",
        "choices": [
          "Vegetarian dumplings",
          "Neither dish",
          "Tofu"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: accept the tofu.",
        "replies": [
          {
            "zh": "好，我要豆腐。",
            "py": "Hǎo, wǒ yào dòufu.",
            "en": "Yes, I would like tofu.",
            "traditional": "好，我要豆腐。"
          },
          {
            "zh": "我只要素饺子。",
            "py": "Wǒ zhǐ yào sù jiǎozi.",
            "en": "I only want vegetarian dumplings.",
            "traditional": "我只要素餃子。"
          },
          {
            "zh": "我要两张票。",
            "py": "Wǒ yào liǎng zhāng piào.",
            "en": "I would like two tickets.",
            "traditional": "我要兩張票。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "素餃子賣完了，豆腐還有。你要豆腐嗎？"
      },
      {
        "place": "conversation",
        "speaker": "Eric",
        "zh": "这碗汤太辣了。我想喝凉水。",
        "py": "Zhè wǎn tāng tài là le. Wǒ xiǎng hē liángshuǐ.",
        "en": "This bowl of soup is too spicy. I would like some cool water.",
        "question": "Why does Eric want cool water?",
        "choices": [
          "The soup is too spicy",
          "The water is too sour",
          "The tofu has sold out"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: ask for cool water.",
        "replies": [
          {
            "zh": "请给我一些凉水。",
            "py": "Qǐng gěi wǒ yìxiē liángshuǐ.",
            "en": "Please give me some cool water.",
            "traditional": "請給我一些涼水。"
          },
          {
            "zh": "请多放一点醋。",
            "py": "Qǐng duō fàng yìdiǎn cù.",
            "en": "Please add a little more vinegar.",
            "traditional": "請多放一點醋。"
          },
          {
            "zh": "请给我热咖啡。",
            "py": "Qǐng gěi wǒ rè kāfēi.",
            "en": "Please give me hot coffee.",
            "traditional": "請給我熱咖啡。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "這碗湯太辣了。我想喝涼水。"
      }
    ]
  },
  {
    "id": "adventure-c2-13",
    "lesson": "c2-13",
    "title": "The library turn",
    "goal": "Follow a short route and check the destination.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Lin",
        "zh": "从这儿一直走，在红灯那儿往左拐。",
        "py": "Cóng zhèr yìzhí zǒu, zài hóngdēng nàr wǎng zuǒ guǎi.",
        "en": "Go straight from here, then turn left at the traffic light.",
        "question": "Which turn should Eric take at the light?",
        "choices": [
          "Left",
          "Right",
          "Turn back"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: confirm turning left at the light.",
        "replies": [
          {
            "zh": "在红灯那儿往右拐。",
            "py": "Zài hóngdēng nàr wǎng yòu guǎi.",
            "en": "Turn right at the traffic light.",
            "traditional": "在紅燈那兒往右拐。"
          },
          {
            "zh": "在红灯那儿往左拐。",
            "py": "Zài hóngdēng nàr wǎng zuǒ guǎi.",
            "en": "Turn left at the traffic light.",
            "traditional": "在紅燈那兒往左拐。"
          },
          {
            "zh": "从这儿往回走。",
            "py": "Cóng zhèr wǎng huí zǒu.",
            "en": "Walk back from here.",
            "traditional": "從這兒往回走。"
          }
        ],
        "replyAnswer": 1,
        "vocab": [],
        "zhTraditional": "從這兒一直走，在紅燈那兒往左拐。"
      },
      {
        "place": "sign",
        "speaker": "Eric",
        "zh": "学校｜公园｜图书馆\n左边｜公园｜右边",
        "py": "Xuéxiào | gōngyuán | túshūguǎn. Zuǒbiān | gōngyuán | yòubiān.",
        "en": "School | park | library. Left side | park | right side.",
        "question": "Where is the library relative to the park?",
        "choices": [
          "On its left",
          "Behind the school",
          "On its right"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: say that the library is on the park’s right.",
        "replies": [
          {
            "zh": "图书馆在公园的右边。",
            "py": "Túshūguǎn zài gōngyuán de yòubiān.",
            "en": "The library is on the park’s right.",
            "traditional": "圖書館在公園的右邊。"
          },
          {
            "zh": "图书馆在公园的左边。",
            "py": "Túshūguǎn zài gōngyuán de zuǒbiān.",
            "en": "The library is on the park’s left.",
            "traditional": "圖書館在公園的左邊。"
          },
          {
            "zh": "学校在公园的右边。",
            "py": "Xuéxiào zài gōngyuán de yòubiān.",
            "en": "The school is on the park’s right.",
            "traditional": "學校在公園的右邊。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "學校｜公園｜圖書館\n左邊｜公園｜右邊"
      },
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "图书馆离这儿不远，走一会儿就到了。",
        "py": "Túshūguǎn lí zhèr bù yuǎn, zǒu yíhuìr jiù dào le.",
        "en": "The library is not far from here; you will get there after a short walk.",
        "question": "What does Lin say about the distance?",
        "choices": [
          "It is not far",
          "It takes a whole day",
          "It is too far to walk"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: say you will walk there.",
        "replies": [
          {
            "zh": "那我走过去。",
            "py": "Nà wǒ zǒu guòqu.",
            "en": "Then I will walk over there.",
            "traditional": "那我走過去。"
          },
          {
            "zh": "那我不去了。",
            "py": "Nà wǒ bú qù le.",
            "en": "Then I will not go.",
            "traditional": "那我不去了。"
          },
          {
            "zh": "那我去买飞机票。",
            "py": "Nà wǒ qù mǎi fēijī piào.",
            "en": "Then I will buy a plane ticket.",
            "traditional": "那我去買飛機票。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "圖書館離這兒不遠，走一會兒就到了。"
      }
    ]
  },
  {
    "id": "adventure-c2-14",
    "lesson": "c2-14",
    "title": "A gift upstairs",
    "goal": "Prepare for a birthday visit and find the right home.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Lin",
        "zh": "星期六是我表姐的生日。晚上六点，我们在她家见。",
        "py": "Xīngqīliù shì wǒ biǎojiě de shēngrì. Wǎnshang liù diǎn, wǒmen zài tā jiā jiàn.",
        "en": "Saturday is my older female cousin’s birthday. Let’s meet at her home at six in the evening.",
        "question": "Whose birthday is on Saturday?",
        "choices": [
          "Lin’s younger sister’s",
          "Lin’s cousin’s",
          "Eric’s teacher’s"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: confirm meeting at the cousin’s home at six.",
        "replies": [
          {
            "zh": "好，晚上六点在她家见。",
            "py": "Hǎo, wǎnshang liù diǎn zài tā jiā jiàn.",
            "en": "Good, see you at her home at six in the evening.",
            "traditional": "好，晚上六點在她家見。"
          },
          {
            "zh": "好，早上七点在学校见。",
            "py": "Hǎo, zǎoshang qī diǎn zài xuéxiào jiàn.",
            "en": "Good, see you at school at seven in the morning.",
            "traditional": "好，早上七點在學校見。"
          },
          {
            "zh": "今天是我的生日。",
            "py": "Jīntiān shì wǒ de shēngrì.",
            "en": "Today is my birthday.",
            "traditional": "今天是我的生日。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "星期六是我表姐的生日。晚上六點，我們在她家見。"
      },
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "我带一本书，是给你表姐的礼物。你带什么？",
        "py": "Wǒ dài yì běn shū, shì gěi nǐ biǎojiě de lǐwù. Nǐ dài shénme?",
        "en": "I am bringing a book as a gift for your cousin. What are you bringing?",
        "question": "What gift will Eric bring?",
        "choices": [
          "A clock",
          "A puppy",
          "A book"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: say you will bring apples and pears.",
        "replies": [
          {
            "zh": "我带苹果和梨子。",
            "py": "Wǒ dài píngguǒ hé lízi.",
            "en": "I will bring apples and pears.",
            "traditional": "我帶蘋果和梨子。"
          },
          {
            "zh": "我带一件衬衫。",
            "py": "Wǒ dài yí jiàn chènshān.",
            "en": "I will bring a shirt.",
            "traditional": "我帶一件襯衫。"
          },
          {
            "zh": "我带两张飞机票。",
            "py": "Wǒ dài liǎng zhāng fēijī piào.",
            "en": "I will bring two plane tickets.",
            "traditional": "我帶兩張飛機票。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "我帶一本書，是給你表姐的禮物。你帶什麼？"
      },
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "她住在楼上。东西有点重，我来接你。",
        "py": "Tā zhù zài lóushàng. Dōngxi yǒudiǎn zhòng, wǒ lái jiē nǐ.",
        "en": "She lives upstairs. The things are a little heavy, so I will come meet you.",
        "question": "Where does the cousin live?",
        "choices": [
          "Upstairs",
          "At the library",
          "Beside the airport"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: say you will wait here.",
        "replies": [
          {
            "zh": "好，我在这儿等你。",
            "py": "Hǎo, wǒ zài zhèr děng nǐ.",
            "en": "Good, I will wait for you here.",
            "traditional": "好，我在這兒等你。"
          },
          {
            "zh": "好，我自己回学校。",
            "py": "Hǎo, wǒ zìjǐ huí xuéxiào.",
            "en": "Good, I will go back to school by myself.",
            "traditional": "好，我自己回學校。"
          },
          {
            "zh": "好，我明天再来。",
            "py": "Hǎo, wǒ míngtiān zài lái.",
            "en": "Good, I will come again tomorrow.",
            "traditional": "好，我明天再來。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "她住在樓上。東西有點重，我來接你。"
      }
    ]
  },
  {
    "id": "adventure-c2-15",
    "lesson": "c2-15",
    "title": "A change of plans",
    "goal": "Explain feeling unwell and update a friend.",
    "scenes": [
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "我今天头疼，身体也很累。我想去医院。",
        "py": "Wǒ jīntiān tóu téng, shēntǐ yě hěn lèi. Wǒ xiǎng qù yīyuàn.",
        "en": "I have a headache today, and I feel tired. I want to go to the hospital.",
        "question": "Why is Eric changing his plans?",
        "choices": [
          "He feels unwell",
          "He wants to buy a gift",
          "He missed the subway"
        ],
        "answer": 0,
        "replyPrompt": "Choose what to say next: say that you have a headache.",
        "replies": [
          {
            "zh": "我今天头疼。",
            "py": "Wǒ jīntiān tóu téng.",
            "en": "I have a headache today.",
            "traditional": "我今天頭疼。"
          },
          {
            "zh": "我今天很饿。",
            "py": "Wǒ jīntiān hěn è.",
            "en": "I am hungry today.",
            "traditional": "我今天很餓。"
          },
          {
            "zh": "我今天很高兴。",
            "py": "Wǒ jīntiān hěn gāoxìng.",
            "en": "I am happy today.",
            "traditional": "我今天很高興。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "我今天頭疼，身體也很累。我想去醫院。"
      },
      {
        "place": "conversation",
        "speaker": "Lin",
        "zh": "请给我看看你的保险卡。",
        "py": "Qǐng gěi wǒ kànkan nǐ de bǎoxiǎn kǎ.",
        "en": "Please show me your insurance card.",
        "question": "Which item is requested?",
        "choices": [
          "A train ticket",
          "An insurance card",
          "A birthday gift"
        ],
        "answer": 1,
        "replyPrompt": "Choose what to say next: say your insurance card is here.",
        "replies": [
          {
            "zh": "我的飞机票在这儿。",
            "py": "Wǒ de fēijī piào zài zhèr.",
            "en": "My plane ticket is here.",
            "traditional": "我的飛機票在這兒。"
          },
          {
            "zh": "我的信用卡在这儿。",
            "py": "Wǒ de xìnyòngkǎ zài zhèr.",
            "en": "My credit card is here.",
            "traditional": "我的信用卡在這兒。"
          },
          {
            "zh": "我的保险卡在这儿。",
            "py": "Wǒ de bǎoxiǎn kǎ zài zhèr.",
            "en": "My insurance card is here.",
            "traditional": "我的保險卡在這兒。"
          }
        ],
        "replyAnswer": 2,
        "vocab": [],
        "zhTraditional": "請給我看看你的保險卡。"
      },
      {
        "place": "message",
        "speaker": "Eric",
        "zh": "我今天不能去公园了。我想在家休息，明天再跟你说。",
        "py": "Wǒ jīntiān bù néng qù gōngyuán le. Wǒ xiǎng zài jiā xiūxi, míngtiān zài gēn nǐ shuō.",
        "en": "I cannot go to the park today. I want to rest at home and talk to you tomorrow.",
        "question": "What does Eric want to do today?",
        "choices": [
          "Go skating",
          "Go shopping",
          "Rest at home"
        ],
        "answer": 2,
        "replyPrompt": "Choose what to say next: acknowledge the change and say you will talk tomorrow.",
        "replies": [
          {
            "zh": "好，我们明天再说。",
            "py": "Hǎo, wǒmen míngtiān zài shuō.",
            "en": "Okay, let’s talk tomorrow.",
            "traditional": "好，我們明天再說。"
          },
          {
            "zh": "好，我们今天去公园。",
            "py": "Hǎo, wǒmen jīntiān qù gōngyuán.",
            "en": "Okay, let’s go to the park today.",
            "traditional": "好，我們今天去公園。"
          },
          {
            "zh": "好，我现在去买礼物。",
            "py": "Hǎo, wǒ xiànzài qù mǎi lǐwù.",
            "en": "Okay, I will buy a gift now.",
            "traditional": "好，我現在去買禮物。"
          }
        ],
        "replyAnswer": 0,
        "vocab": [],
        "zhTraditional": "我今天不能去公園了。我想在家休息，明天再跟你說。"
      }
    ]
  }
];
