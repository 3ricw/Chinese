// Cards introduce one construction, show it in context, then invite a small change.
const curriculum = [
['Build a sentence',[
['Start with who, action, thing','我喝茶。','I drink tea.','我 is the person, 喝 the action, 茶 the thing. Read those chunks left to right. Keep the action before what receives it.','Change “I” to “she” and “tea” to “water”.','她喝水。'],
['Give the action a time and place','我明天下午在家看书。','Tomorrow afternoon I will read at home.','Start with 我看书. Insert 明天下午 after 我, then 在家 before 看. 在 + place tells where the action happens.','Say you study Chinese at school today.','我今天在学校学中文。'],
['Give time from large to small','五月三号星期五下午两点','Friday, May 3, at two in the afternoon','Read 年 year → 月 month → 号 day → 星期 weekday → time of day → clock time. 昨天, 今天, 明天 mean yesterday, today, tomorrow. 周末 is the weekend. 早上, 中午, 下午, 晚上 divide the day.','Build “tomorrow morning at nine”.','明天早上九点。'],
['Describe and negate','她很忙。我不忙。','She is busy. I am not busy.','忙 already describes the subject. Use 很 + adjective for a neutral statement. Use 不 for a negative description, preference or habit. Use 没 or 没有 before an action you did not do.','Contrast “I don’t drink tea” with “I didn’t drink tea yesterday.”','我不喝茶。我昨天没喝茶。'],
['Choose the verb first','我想去学校。我觉得中文很有意思。','I want to go to school. I think Chinese is interesting.','有 means have, 去 means go, 喜欢 means like. 想 + action expresses a wish; 觉得 introduces an opinion. 请 + action politely asks someone to act.','Say that you like Chinese and want to study it.','我喜欢中文。我想学中文。']
]],
['Ask and answer',[
['Turn a statement into a yes/no question','你喝茶吗？你喝不喝茶？','Do you drink tea?','Keep the statement intact and add 吗, or offer both possibilities with verb + 不 + verb. With 有 use 有没有. Choose one question frame.','Ask if someone has an older brother in two ways.','你有哥哥吗？你有没有哥哥？'],
['Leave the question word in the answer slot','我星期三去学校。你星期几去学校？','I go to school on Wednesday. What day do you go?','Replace just the unknown piece. 谁 asks who, 什么 what, 哪 which, 在哪儿 where, 为什么 why. 几点 asks clock time, 什么时候 asks when, 几月几号 asks a date, 多大 asks age, 几 asks a small number.','Start with 你下午三点上课. Ask what time the class starts.','你几点上课？'],
['Offer a choice or invite a reply','你喝茶还是喝水？我喝水，你呢？','Tea or water? I drink water. How about you?','Put 还是 between alternatives. Use 呢 to return the same question. 吧 suggests a plan. Add 好吗 or 可以吗 to ask for agreement or permission, 对不对 to check accuracy, 怎么样 to invite an opinion.','Invite someone to go tomorrow and ask what they think.','我们明天去吧，怎么样？']
]],
['Count and identify things',[
['Fit the counter between number and noun','这两位老师都是我的老师。','These two teachers are both my teachers.','这/那 + number + measure word + noun picks things out. 两 is the usual “two” before a classifier. 哪位老师 asks which teacher; 几位老师 asks how many. Owner + 的 + noun marks possession.','Say “those two cups of tea”.','那两杯茶。'],
...[
['口','家里有四口人。','There are four people in the family.','members of a household','a family of three','三口人'],
['位','两位客人来了。','Two guests came.','people, respectfully','one teacher','一位老师'],
['个','我吃了一个苹果。','I ate an apple.','many common items, including apples','three apples','三个苹果'],
['瓶','我买了两瓶水。','I bought two bottles of water.','bottles of something','one bottle of water','一瓶水'],
['杯','请给我一杯茶。','Please give me a cup of tea.','cups or glasses of a drink','two cups of coffee','两杯咖啡'],
['节','我今天有三节课。','I have three class periods today.','class periods','two class periods','两节课'],
['枝','她送我一枝花。','She gave me a flower.','flowers by the stem','three flowers on stems','三枝花'],
['张','桌上有一张纸。','There is a sheet of paper on the table.','flat items such as sheets of paper','two sheets of paper','两张纸'],
['篇','我们读了一篇文章。','We read an article.','articles or essays','three articles','三篇文章'],
['封','我写了两封信。','I wrote two letters.','letters','one letter','一封信']
].map(([mw,zh,en,use,prompt,ans])=>[mw+' · '+use,zh,en,'Use '+mw+' between the number and the noun when counting '+use+'.','Build the phrase for '+prompt+'.',ans])
]],
['Add detail before the verb',[
['Add another person, activity or habit','我也学中文。我还学日文。','I study Chinese too. I also study Japanese.','也 often adds a shared fact; 还 adds another point or can mean “still”. 常 marks a habit. 都 covers the whole group. Each goes before the verb.','Say “We all often speak Chinese.”','我们都常说中文。'],
['Move 不 and the meaning changes','他们不都喝茶。他们都不喝茶。','Not all of them drink tea. None of them drink tea.','Read the first pair as “not all”. Read the second as “all do not”. Scope changes which people the negative includes.','Which sentence allows some tea drinkers?','他们不都喝茶。'],
['Use a place, partner, recipient or tool','我在家跟姐姐用中文聊天。','At home I chat with my older sister in Chinese.','在 + place locates an action. 跟 + person introduces your partner. 用 + tool or language gives the means. 给 + person before a verb identifies a recipient, as in 给老师写信.','Say “I write a letter to my friend.”','我给朋友写信。'],
['Want, know how, be able, have permission','我会开车，可是今天不能开车。','I know how to drive, but I can’t drive today.','会 describes a learned skill. 能 describes ability or circumstances. 可以 permits an action. 要 can express intention or need. 别 + verb tells someone to stop or avoid it.','Ask permission to sit here. Then tell a friend not to go.','我可以坐在这儿吗？别走。'],
['Make a request smaller','请看一下这张照片。','Please take a quick look at this photo.','Put 一下 immediately after the action. It makes the action brief and often softens the request.','Ask a friend to listen for a moment.','请听一下。']
]],
['Describe actions in time',[
['Completed action or action in progress','我买了书。他正在买书。','I bought books. He is buying books.','Attach 了 to the verb to present an action as completed. Put 正在 before the verb to zoom in on an action underway. Negate a completed purchase with 没买.','Change “I ate” to “I am eating.”','我吃了饭。→ 我正在吃饭。'],
['Show an early or late time','我七点就到了。他十点才到。','I arrived as early as seven. He didn’t arrive until ten.','Place the time first. 就 presents it as early or prompt; 才 presents it as late. The speaker’s expectation determines the choice.','You expected the bus at eight; it came at nine.','公共汽车九点才来。'],
['Distinguish duration from frequency','我学中文学了两个小时。我去过北京两次。','I studied Chinese for two hours. I have been to Beijing twice.','Duration answers “how long?” With a verb and object, one option is to repeat the verb before the duration. 次 counts how many times an event happened. 两点 is a clock time.','Say “I slept for eight hours.” Then say “I called three times.”','我睡了八个小时。我打了三次电话。'],
['Overlap or sequence','我一边走一边听歌。我一到家就吃饭。','I listen to songs while walking. As soon as I get home, I eat.','一边 A 一边 B puts two actions side by side in time. 一 A 就 B makes the first event trigger the second.','Make coming out of class trigger a phone call.','我一下课就打电话。']
]],
['Describe, compare and emphasize',[
['Use 得 to describe performance','她写汉字写得很快。','She writes Chinese characters quickly.','First name the activity, 写汉字. Repeat 写 and attach 得 + description. With no object, 她写得很快 also works.','Say your friend speaks Chinese well.','我朋友说中文说得很好。'],
['Compare two things or track change','今天比昨天热。天气越来越热了。','Today is hotter than yesterday. The weather is getting hotter.','A 比 B + adjective compares two things. 越来越 + adjective tracks change over time.','Compare two people’s height. Then describe a child growing taller.','哥哥比我高。孩子越来越高了。'],
['Qualify an opinion','这件衣服有一点小。便宜是便宜，可是太小了。','This garment is a little small. It is cheap, but it is too small.','有一点 before an adjective often signals an unwelcome degree. Repeat the adjective around 是 to concede one point, then add 可是 or 但是 and your reservation.','Concede that something looks good, then mention its price.','好看是好看，可是太贵了。'],
['Advise more or less; express zero','多喝水，少喝咖啡。我今天一杯咖啡也没喝。','Drink more water and less coffee. Today I didn’t drink a single cup of coffee.','Put 多 or 少 before the verb. For zero, name a single unit and add 也 or 都 plus 不 for a habit, 没 for a past event.','Say you did not buy a single book.','我一本书也没买。'],
['Highlight the detail of a known event','我是昨天来的。','It was yesterday that I came.','The arrival is already known. Wrap 是…的 around the relevant detail and verb. Move the focus to a person, time or way of travelling.','Emphasize that you came by train.','我是坐火车来的。'],
['Say what happens to a specific object','请把书放在桌子上。','Please put the book on the table.','Introduce the known object with 把 before the action. Finish with what changes, such as the book’s new location.','Move the cup onto the table.','请把杯子放在桌子上。']
]],
['Join your ideas',[
['Give a reason and result','因为下雨，所以我们在家吃饭。','Because it is raining, we are eating at home.','因为 introduces the reason. 所以 introduces the result. 和 joins nouns such as 我和妹妹; use a connector that describes the relationship between two clauses.','Explain why you went to bed early.','因为我很累，所以我很早就睡了。'],
['Make a plan with a backup','要是下雨，那我们就在家看电影吧。','If it rains, then let’s watch a film at home.','要是 introduces the condition. 那 means “in that case”. 就 connects the condition to what you will do.','Plan to go to the park if the weather is good.','要是天气好，我们就去公园。'],
['Add a second point or warn of a consequence','除了茶以外，我还喝水。快走吧，要不然会迟到。','Besides tea, I drink water too. Hurry, or we’ll be late.','Besides X, also Y uses 除了 X 以外，还 Y. 要不然 means otherwise. 再说 adds another supporting reason, as in 再说，明天还要上课 (besides, we have class tomorrow).','Add swimming to the sports you like besides running.','除了跑步以外，我还喜欢游泳。']
]],
['Read, insert and translate',[
['Find the evidence in a passage','小李本来想走路去学校，可是下雨了。她跟姐姐坐车去了。','Xiao Li originally wanted to walk to school, but it rained. She went by car with her sister.','Underline the person first. 本来想 gives the original plan. 可是 signals a change. The last clause supplies what actually happened. Match your answer to that clause.','How did she get there? Point to the decisive words.','坐车去了 tells you she rode. 走路 describes only her original plan.'],
['Find an insertion slot','她 / 昨天 / 九点 / 到家。','She got home at nine yesterday.','To add 才, ask what it modifies: the late arrival. Keep 九点 together, place 才 immediately before 到家, then reread the whole line.','Instead insert 在学校 into 我今天学中文.','我今天在学校学中文。The location goes before the action.'],
['Translate meaning in chunks','我昨天没去学校。','I did not go to school yesterday.','Circle the time, negative and action in the English. Start with 我去学校. Put 昨天 after 我 and 没 before 去. Check every option against all three pieces.','Change the meaning to “I don’t go to school on weekends.”','我周末不去学校。A regular habit uses 不.']
]],
['Write an answer with a required structure',[
['Let the required form shape the answer','你昨天什么时候到家？我昨天晚上九点才到家。','When did you get home yesterday? I didn’t get home until nine last night.','If the required form is 才, draft the skeleton “I + time + 才 + action”. Fill in the time and repeat the action from the question. Reread to check both the meaning and the required form.','Answer 你什么时候起床？ using 就 to suggest an early start.','我早上六点就起床了。'],
['Expand one sentence at a time','我喜欢中文。除了中文以外，我还喜欢数学。','I like Chinese. Besides Chinese, I also like math.','Start with a fact you can write. Keep that fact as the 除了 phrase and choose a second subject of study for 还. Check that both items belong to the same comparison.','Use the same frame to name two drinks you enjoy.','除了茶以外，我还喜欢喝咖啡。']
]],
['Build the two compositions',[
['Narrate a day in four sentences','昨天我七点就到学校了。我在教室里学中文。我学了两个小时。下课以后，我跟朋友去吃饭了。','Yesterday I got to school as early as seven. I studied Chinese in the classroom for two hours. After class I went to eat with a friend.','Plan four beats on paper: when, where and what, how long, then what happened next. Give each beat its own sentence first. Connect them once the order is clear.','Move the scene to a library and change the duration to one hour.','我在图书馆学中文。我学了一个小时。Keep the arrival and ending consistent with your new scene.'],
['Write a proposal with a fallback','我们周末去公园吧！公园比商场安静。要是下雨，我们就去看电影。你觉得怎么样？','Let’s go to the park this weekend. The park is quieter than the mall. If it rains, we’ll see a film. What do you think?','Open with 吧, support your choice with 比, offer a backup with 要是…就…, and invite a reply. The guide gives two compositions 30% together; these are practice genres.','Change both destinations. Keep the invitation, reason, backup and closing.','我们周末去图书馆吧！那里比我家安静。要是图书馆不开门，我们就去咖啡店。你觉得怎么样？'],
['Rehearse under exam conditions','我一到家就给朋友打电话。','As soon as I get home, I call my friend.','Handwrite a fresh paragraph. Check who did what, time before action, classifiers, and the required structures. Use a character-only word list for Part II. In the two-hour closed-book final you hand in Part I first. Redo past lesson tests for the 35% multiple-choice section.','Cover the model. Write a new sentence linking arriving at school to starting class.','我一到学校就去上课。Then write the rest of your paragraph without the model.']
]]
];

const pronunciation = {
 "我喝茶。": "Wǒ hē chá.",
 "我明天下午在家看书。": "Wǒ míngtiān xiàwǔ zài jiā kàn shū.",
 "五月三号星期五下午两点": "Wǔ yuè sān hào xīngqīwǔ xiàwǔ liǎng diǎn",
 "她很忙。我不忙。": "Tā hěn máng. Wǒ bù máng.",
 "我想去学校。我觉得中文很有意思。": "Wǒ xiǎng qù xuéxiào. Wǒ juéde Zhōngwén hěn yǒu yìsi.",
 "你喝茶吗？你喝不喝茶？": "Nǐ hē chá ma? Nǐ hē bu hē chá?",
 "我星期三去学校。你星期几去学校？": "Wǒ xīngqīsān qù xuéxiào. Nǐ xīngqījǐ qù xuéxiào?",
 "你喝茶还是喝水？我喝水，你呢？": "Nǐ hē chá háishi hē shuǐ? Wǒ hē shuǐ, nǐ ne?",
 "这两位老师都是我的老师。": "Zhè liǎng wèi lǎoshī dōu shì wǒ de lǎoshī.",
 "家里有四口人。": "Jiālǐ yǒu sì kǒu rén.",
 "两位客人来了。": "Liǎng wèi kèrén lái le.",
 "我吃了一个苹果。": "Wǒ chī le yí ge píngguǒ.",
 "我买了两瓶水。": "Wǒ mǎi le liǎng píng shuǐ.",
 "请给我一杯茶。": "Qǐng gěi wǒ yì bēi chá.",
 "我今天有三节课。": "Wǒ jīntiān yǒu sān jié kè.",
 "她送我一枝花。": "Tā sòng wǒ yì zhī huā.",
 "桌上有一张纸。": "Zhuō shang yǒu yì zhāng zhǐ.",
 "我们读了一篇文章。": "Wǒmen dú le yì piān wénzhāng.",
 "我写了两封信。": "Wǒ xiě le liǎng fēng xìn.",
 "我也学中文。我还学日文。": "Wǒ yě xué Zhōngwén. Wǒ hái xué Rìwén.",
 "他们不都喝茶。他们都不喝茶。": "Tāmen bù dōu hē chá. Tāmen dōu bù hē chá.",
 "我在家跟姐姐用中文聊天。": "Wǒ zài jiā gēn jiějie yòng Zhōngwén liáotiān.",
 "我会开车，可是今天不能开车。": "Wǒ huì kāichē, kěshì jīntiān bù néng kāichē.",
 "请看一下这张照片。": "Qǐng kàn yíxià zhè zhāng zhàopiàn.",
 "我买了书。他正在买书。": "Wǒ mǎi le shū. Tā zhèngzài mǎi shū.",
 "我七点就到了。他十点才到。": "Wǒ qī diǎn jiù dào le. Tā shí diǎn cái dào.",
 "我学中文学了两个小时。我去过北京两次。": "Wǒ xué Zhōngwén xué le liǎng ge xiǎoshí. Wǒ qù guo Běijīng liǎng cì.",
 "我一边走一边听歌。我一到家就吃饭。": "Wǒ yìbiān zǒu yìbiān tīng gē. Wǒ yí dào jiā jiù chī fàn.",
 "她写汉字写得很快。": "Tā xiě Hànzì xiě de hěn kuài.",
 "今天比昨天热。天气越来越热了。": "Jīntiān bǐ zuótiān rè. Tiānqì yuèláiyuè rè le.",
 "这件衣服有一点小。便宜是便宜，可是太小了。": "Zhè jiàn yīfu yǒu yìdiǎn xiǎo. Piányi shì piányi, kěshì tài xiǎo le.",
 "多喝水，少喝咖啡。我今天一杯咖啡也没喝。": "Duō hē shuǐ, shǎo hē kāfēi. Wǒ jīntiān yì bēi kāfēi yě méi hē.",
 "我是昨天来的。": "Wǒ shì zuótiān lái de.",
 "请把书放在桌子上。": "Qǐng bǎ shū fàng zài zhuōzi shang.",
 "因为下雨，所以我们在家吃饭。": "Yīnwèi xià yǔ, suǒyǐ wǒmen zài jiā chī fàn.",
 "要是下雨，那我们就在家看电影吧。": "Yàoshi xià yǔ, nà wǒmen jiù zài jiā kàn diànyǐng ba.",
 "除了茶以外，我还喝水。快走吧，要不然会迟到。": "Chúle chá yǐwài, wǒ hái hē shuǐ. Kuài zǒu ba, yàoburán huì chídào.",
 "小李本来想走路去学校，可是下雨了。她跟姐姐坐车去了。": "Xiǎo Lǐ běnlái xiǎng zǒulù qù xuéxiào, kěshì xià yǔ le. Tā gēn jiějie zuò chē qù le.",
 "她 / 昨天 / 九点 / 到家。": "Tā / zuótiān / jiǔ diǎn / dào jiā.",
 "我昨天没去学校。": "Wǒ zuótiān méi qù xuéxiào.",
 "你昨天什么时候到家？我昨天晚上九点才到家。": "Nǐ zuótiān shénme shíhou dào jiā? Wǒ zuótiān wǎnshang jiǔ diǎn cái dào jiā.",
 "我喜欢中文。除了中文以外，我还喜欢数学。": "Wǒ xǐhuan Zhōngwén. Chúle Zhōngwén yǐwài, wǒ hái xǐhuan shùxué.",
 "昨天我七点就到学校了。我在教室里学中文。我学了两个小时。下课以后，我跟朋友去吃饭了。": "Zuótiān wǒ qī diǎn jiù dào xuéxiào le. Wǒ zài jiàoshì lǐ xué Zhōngwén. Wǒ xué le liǎng ge xiǎoshí. Xiàkè yǐhòu, wǒ gēn péngyou qù chī fàn le.",
 "我们周末去公园吧！公园比商场安静。要是下雨，我们就去看电影。你觉得怎么样？": "Wǒmen zhōumò qù gōngyuán ba! Gōngyuán bǐ shāngchǎng ānjìng. Yàoshi xià yǔ, wǒmen jiù qù kàn diànyǐng. Nǐ juéde zěnmeyàng?",
 "我一到家就给朋友打电话。": "Wǒ yí dào jiā jiù gěi péngyou dǎ diànhuà."
};
