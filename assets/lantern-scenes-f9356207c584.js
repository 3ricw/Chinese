/* Each stop has a two-turn conversation, a sentence to build and three word pairs.
   Token indices stay stable when the order on screen is shuffled. */
const LANE_SCENES = [
  {
    id: 'gate', course: 'chinese-1', place: 'Market gate', title: 'Say hello', seal: '好', person: 'Lin', hue: 'jade',
    outcome: 'You greeted Lin and said goodbye.', phrase: ['你好', 'nǐ hǎo', 'Hello'],
    greet: { line: '你好！', sound: 'nǐ hǎo', gloss: 'Hello!', ask: 'Greet Lin back.', choices: ['你好！', '谢谢！', '再见！'], answer: 0, why: '你好 works both as a greeting and as a reply to one.' },
    build: { ask: 'Introduce yourself as Xiao An.', words: ['我', '叫', '小安'], extras: ['好'], sound: 'wǒ jiào Xiǎo’ān', why: 'Put 我 before 叫, then add the name.' },
    pairs: [['你', 'you'], ['我', 'I / me'], ['好', 'good']],
    end: { line: '再见！', sound: 'zàijiàn', gloss: 'Goodbye!', ask: 'Lin is leaving. What do you say?', choices: ['我叫小林。', '再见！', '谢谢！'], answer: 1, why: '再见 means goodbye. You can say it back as someone leaves.' }
  },
  {
    id: 'tea', course: 'chinese-1', place: 'Tea stall', title: 'Order a drink', seal: '茶', person: 'Mei', hue: 'gold',
    outcome: 'You ordered tea and thanked the seller.', phrase: ['我要一杯茶', 'wǒ yào yì bēi chá', 'I’d like a cup of tea'],
    greet: { line: '你喝什么？', sound: 'nǐ hē shénme', gloss: 'What are you drinking?', ask: 'Order tea.', choices: ['我喝水。', '我喝茶。', '我不喝茶。'], answer: 1, why: '喝 means “to drink.” 茶 is tea and 水 is water.' },
    build: { ask: 'Say “I’d like a cup of tea.”', words: ['我', '要', '一杯', '茶'], extras: ['水'], sound: 'wǒ yào yì bēi chá', why: 'Use 要 to order, then 一杯茶 for a cup of tea.' },
    pairs: [['茶', 'tea'], ['水', 'water'], ['杯', 'cup']],
    end: { line: '你的茶。', sound: 'nǐ de chá', gloss: 'Your tea.', ask: 'Thank Mei as she hands it to you.', choices: ['不喝。', '你好！', '谢谢！'], answer: 2, why: '谢谢 is the natural way to thank someone for handing you a drink.' }
  },
  {
    id: 'street', course: 'chinese-1', place: 'Riverside path', title: 'Find the park', seal: '路', person: 'An', hue: 'blue',
    outcome: 'You asked for the park and followed a direction.', phrase: ['公园在哪里', 'gōngyuán zài nǎlǐ', 'Where is the park?'],
    greet: { line: '你要去哪儿？', sound: 'nǐ yào qù nǎr', gloss: 'Where do you want to go?', ask: 'Tell An you want to go to the park.', choices: ['我在家。', '我喝茶。', '我要去公园。'], answer: 2, why: '要去 means “want to go to.” Put the destination, 公园, after 去.' },
    build: { ask: 'Ask “Where is the park?”', words: ['公园', '在', '哪里'], extras: ['谁'], sound: 'gōngyuán zài nǎlǐ', why: 'The place you are looking for comes first. 在哪里 asks where it is.' },
    pairs: [['公园', 'park'], ['左', 'left'], ['右', 'right']],
    end: { line: '往左走。', sound: 'wǎng zuǒ zǒu', gloss: 'Go left.', ask: 'Which way does An point?', choices: ['Left', 'Right', 'Straight ahead'], answer: 0, why: '左 is left. 往左走 tells someone to go that way.' }
  },
  {
    id: 'market', course: 'chinese-1', place: 'Fruit market', title: 'Ask the price', seal: '买', person: 'Bo', hue: 'rose',
    outcome: 'You asked a price and understood the answer.', phrase: ['多少钱', 'duōshao qián', 'How much does it cost?'],
    greet: { line: '你想买什么？', sound: 'nǐ xiǎng mǎi shénme', gloss: 'What would you like to buy?', ask: 'Ask for an apple.', choices: ['我想买苹果。', '我要去公园。', '我叫小林。'], answer: 0, why: '想买 means “would like to buy.” 苹果 is apple.' },
    build: { ask: 'Ask “How much is this apple?”', words: ['这个', '苹果', '多少钱'], extras: ['几点'], sound: 'zhège píngguǒ duōshao qián', why: 'Put the item before 多少钱 to ask its price.' },
    pairs: [['买', 'buy'], ['钱', 'money'], ['苹果', 'apple']],
    end: { line: '五块钱。', sound: 'wǔ kuài qián', gloss: 'Five yuan.', ask: 'How much does Bo ask for?', choices: ['Ten yuan', 'Two yuan', 'Five yuan'], answer: 2, why: '五 is five. 块 is a common spoken unit for yuan.' }
  },
  {
    id: 'meeting', course: 'chinese-2', place: 'Station clock', title: 'Make a plan', seal: '约', person: 'Lin', hue: 'blue',
    outcome: 'You agreed on a time and a meeting place.', phrase: ['我们几点见面', 'wǒmen jǐ diǎn jiànmiàn', 'What time shall we meet?'],
    greet: { line: '你明天有空吗？', sound: 'nǐ míngtiān yǒu kòng ma', gloss: 'Are you free tomorrow?', ask: 'Tell Lin you’re free tomorrow afternoon.', choices: ['我昨天很忙。', '我明天下午有空。', '我今年去。'], answer: 1, why: '明天下午 sets the time. 有空 means you are free.' },
    build: { ask: 'Ask “What time shall we meet?”', words: ['我们', '几点', '见面'], extras: ['多少钱'], sound: 'wǒmen jǐ diǎn jiànmiàn', why: 'Put the question about time, 几点, before the action 见面.' },
    pairs: [['明天', 'tomorrow'], ['下午', 'afternoon'], ['见面', 'meet']],
    end: { line: '三点在车站见！', sound: 'sān diǎn zài chēzhàn jiàn', gloss: 'See you at the station at three!', ask: 'Confirm the arrangement.', choices: ['下午三点，车站见！', '明天没空。', '我要一杯水。'], answer: 0, why: '三点 is three o’clock, and 车站 is the station.' }
  },
  {
    id: 'books', course: 'chinese-2', place: 'Bookshop', title: 'Borrow a book', seal: '书', person: 'Mei', hue: 'rose',
    outcome: 'You asked to borrow a book and understood when to return it.', phrase: ['我可以借这本书吗', 'wǒ kěyǐ jiè zhè běn shū ma', 'May I borrow this book?'],
    greet: { line: '你想看哪本书？', sound: 'nǐ xiǎng kàn nǎ běn shū', gloss: 'Which book would you like to read?', ask: 'Point out this book.', choices: ['我喝这杯茶。', '我去那家店。', '我想看这本书。'], answer: 2, why: 'Use 本 when counting or pointing out books. 这本书 means this book.' },
    build: { ask: 'Ask “May I borrow this book?”', words: ['我', '可以', '借', '这本书', '吗'], extras: ['还'], sound: 'wǒ kěyǐ jiè zhè běn shū ma', why: '可以 asks about permission. End a yes-or-no question with 吗.' },
    pairs: [['借', 'borrow'], ['还书', 'return a book'], ['本', 'classifier for books']],
    end: { line: '星期五还给我吧。', sound: 'xīngqīwǔ huán gěi wǒ ba', gloss: 'Please give it back to me on Friday.', ask: 'When does Mei want it back?', choices: ['Wednesday', 'Friday', 'Sunday'], answer: 1, why: '星期五 means Friday. 还给我 means give it back to me.' }
  },
  {
    id: 'noodles', course: 'chinese-2', place: 'Noodle shop', title: 'Order dinner', seal: '面', person: 'Bo', hue: 'gold',
    outcome: 'You ordered noodles and told the cook how you like them.', phrase: ['请给我一碗面', 'qǐng gěi wǒ yì wǎn miàn', 'Please give me a bowl of noodles'],
    greet: { line: '你想吃点什么？', sound: 'nǐ xiǎng chī diǎn shénme', gloss: 'What would you like to eat?', ask: 'Order a bowl of noodles.', choices: ['我要一碗面。', '我要一本书。', '我要一张票。'], answer: 0, why: 'A bowl is 碗. 一碗面 is a bowl of noodles.' },
    build: { ask: 'Say “Please give me a bowl of noodles.”', words: ['请', '给', '我', '一碗', '面'], extras: ['本'], sound: 'qǐng gěi wǒ yì wǎn miàn', why: '请 makes the request polite. 给我 means give me.' },
    pairs: [['碗', 'bowl'], ['辣', 'spicy'], ['面条', 'noodles']],
    end: { line: '要辣的吗？', sound: 'yào là de ma', gloss: 'Would you like it spicy?', ask: 'Ask for it without spice.', choices: ['多放辣椒。', '再来一碗。', '不要辣，谢谢。'], answer: 2, why: '不要辣 asks for no spice. Add 谢谢 to thank the cook.' }
  },
  {
    id: 'cinema', course: 'chinese-2', place: 'Neighborhood cinema', title: 'Invite a friend', seal: '影', person: 'An', hue: 'jade',
    outcome: 'You invited a friend out and settled on a showtime.', phrase: ['一起去看电影吧', 'yìqǐ qù kàn diànyǐng ba', 'Let’s go see a movie together'],
    greet: { line: '周末想做什么？', sound: 'zhōumò xiǎng zuò shénme', gloss: 'What would you like to do this weekend?', ask: 'Suggest a movie.', choices: ['我想回家睡觉。', '一起去看电影吧！', '星期五还书。'], answer: 1, why: '一起 means together. 吧 makes the invitation sound friendly.' },
    build: { ask: 'Say “Let’s go see a movie together.”', words: ['一起', '去', '看', '电影', '吧'], extras: ['吗'], sound: 'yìqǐ qù kàn diànyǐng ba', why: '去看电影 is “go see a movie.” Add 吧 for a suggestion.' },
    pairs: [['电影', 'movie'], ['周末', 'weekend'], ['一起', 'together']],
    end: { line: '晚上七点那场怎么样？', sound: 'wǎnshang qī diǎn nà chǎng zěnmeyàng', gloss: 'How about the seven o’clock evening showing?', ask: 'Accept the seven o’clock showing.', choices: ['好，七点见！', '我不想去。', '下午两点吧。'], answer: 0, why: '七点见 confirms the time and means “see you at seven.”' }
  }
];
const LANE_TRAD = { '门':'門','谢':'謝','见':'見','吗':'嗎','这':'這','儿':'兒','么':'麼','园':'園','里':'裡','哪':'哪','块':'塊','钱':'錢','个':'個','买':'買','苹':'蘋','点':'點','们':'們','车':'車','约':'約','书':'書','给':'給','还':'還','请':'請','条':'條','面':'面','电':'電','场':'場','样':'樣','张':'張','两':'兩','觉':'覺','睡':'睡','间':'間','时':'時','几':'幾','周':'週' };
function laneZh(value) {
  if (state.settings.script !== 'traditional') return value;
  // 麵 is food. 面 in 見面 is a different word.
  return Array.from(value.replace(/一碗面|面条|^面$/g, s => s.replace('面','麵')), ch => LANE_TRAD[ch] || text(ch)).join('');
}

const LANE_BUILD_GLOSSES = {
  gate:['I','am called','Xiao An (name)'], tea:['I','want','one cup','tea'],
  street:['park','is located','where'], market:['this','apple','how much money'],
  meeting:['we','what time','meet'], books:['I','may','borrow','this book','question'],
  noodles:['please','give','me','one bowl','noodles'], cinema:['together','go','watch','movie','suggestion']
};
