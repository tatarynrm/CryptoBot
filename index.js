const { Telegraf, Markup } = require('telegraf')
const axios = require('axios');
require('dotenv').config();
const text = require('./commands');
const date = require('date-and-time');
const data = require('./cryptos.json')
const data2 = require('./cryptos2.json')
const owner = '@web_developer_Ukraine';

const v8 = require('v8')
const totalHeapSize = v8.getHeapStatistics().total_available_size
let totalHeapSizeInGB = (totalHeapSize / 1024 / 1024 / 1024).toFixed(2)

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) =>
    ctx.reply(`
    Привіт ${ctx.message.from.username ? ctx.message.from.username : ctx.message.from.first_name} 👋

Я створений для того , щоб допомогти тобі з пошуком найнижчої ціни на ринку 

               ₿ - Криптовалюти - ₿ 💪

*Функціонал поки-що обмежений,але ми 
працюємо над створенням 
розширених запитів*
Розробник бота : ${owner}

${text.commands}

`));

bot.command('all', async (ctx) => {
    await ctx.reply(
        `Даний розділ меню знходиться розробці
скористайтесь командами:
/start - Перезапустити бота
/crypto - Обрати торгові пари
/all_crypto_shops - Популярні критовалютні біржі
        `
    )
})
const cryptoCallBackData = [
    { name: 'USDT / UAH', data: 'USDTUAH' },
    { name: 'USDT / BTC', data: 'USDTBTC' },
];

bot.command('crypto', async (ctx) => {
    try {
        for (let i = 0; i < cryptoCallBackData.length; i++) {
            const data = cryptoCallBackData[i];
            console.log(data);
            await ctx.replyWithHTML('<b>Торгові пари</b>', Markup.inlineKeyboard(
                [
                    [Markup.button.callback(`${data.name}`, `${data.data}`)]
                    // Markup.button.callback('USDT / EUR', 'EURUSDT')
                ]
            ))

        }
        // await ctx.replyWithHTML('<b>Торгові пари</b>', Markup.inlineKeyboard(
        //     [
        //         [Markup.button.callback('USDT / UAH', 'USDTUAH')]
        //         // Markup.button.callback('USDT / EUR', 'EURUSDT')
        //     ]
        // ))
    } catch (e) {
        console.error(e);
    }
})

let binance = [];
let whiteBit = [];
let time = [];
async function addActionBot(name, text) {


    // Були проблеми з оновленням часу тому зробив функцією

    // let date = new Date();
    // let dt = {
    //     date: date.toLocaleDateString(),
    //     hours: date.getHours(),
    //     minutes: date.getMinutes(),
    //     seconds: date.getSeconds()
    // }
    // let sec = dt.seconds < 10 ? '0' + dt.seconds : dt.seconds;
    // let minutes = dt.minutes < 10 ? '0' + dt.minutes : dt.minutes;
    // let hours = dt.hours < 10 ? '0' + dt.hours : dt.hours;
    // let dat = dt.date;

    // --------------------------------------------------------------------


    function reloadTime() {
        let date = new Date();
        let dt = {
            date: date.toLocaleDateString(),
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds()
        }
        time.length = 0;
        return time.push(dt)
    }
    reloadTime()

    let one = `https://api.binance.com/api/v3/ticker/price?symbol=${name}`;
    let two = `https://whitebit.com/api/v2/public/ticker`;
    const reqOne = axios.get(one)
    const reqTwo = axios.get(two)
    const allData = async () => {
        await axios.all([reqOne, reqTwo]).then(axios.spread((...responses) => {
            binance.push(responses[0].data)
            whiteBit.push(responses[1].data.result)
            const ar = whiteBit.flat()

            // Формула , яка робить чудо
            const my = [];
            function getArr(arr) {
                const pair = [];
                const price = arr.map(item => item.lastPrice)
                const pairs = arr.map(item => item.tradingPairs)
                for (let i = 0; i < pairs.length; i++) {
                    const element = pairs[i];
                    const repEl = element.replace('_', '');

                    // БІМБАААААААААААААААААА
                    // console.log(element.replace('_', ''));
                    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

                    pair.push(repEl)
                }
                const newArr = price.map((i, ind) => {
                    return {
                        price: i,
                        pair: pair[ind]
                    }
                })
                return my.push(...newArr)
            }
            getArr(ar)
            const filterWhite = my.find(item => item.pair == binance[0].symbol)

            // Запуск команди
            const b = binance[0].price ? binance[0].price : null;
            let binancePrice = (+b).toFixed(4)
            bot.action(name, async (ctx) => {
                try {
                    await ctx.answerCbQuery()
                    await ctx.replyWithHTML(text)
                    await ctx.replyWithMarkdown(`
_Дата та точний час запиту_
*${time[0].date}* - ${time[0].hours}:${time[0].minutes < 10 ? '0' + time[0].minutes : time[0].minutes}:${time[0].seconds < 10 ? '0' + time[0].seconds : time[0].seconds}
        
        [Binance](https://www.binance.com/uk-UA/activity/referral-entry?fromActivityPage=true&ref=LIMIT_FYA2313M) *${binance[0].symbol}* - **${binancePrice}**
        [WhiteBit](https://whitebit.com/referral/69f53aee-28aa-4e88-8395-950d49ebd938)  *${filterWhite.pair}* - **${filterWhite.price}**
        
/crypto - Зробити запит ще раз


/start - Перезапустити бота

            `, { disable_web_page_preview: true })

                } catch (e) {

                }
            })
        })).catch(err => {
            console.log(err);
        })


    }
    allData();
}
addActionBot('USDTUAH', text.uah)
addActionBot('BTCUSDT', text.btc)



// addActionBot('EURUSDT', text.eur);
// addActionBot('USDT', text.btc);

bot.command('all_crypto_shops', async (ctx) => {
    function showData() {
        data.forEach(item => {

            ctx.replyWithMarkdown(`
                    [${item.name}](${item.url})
                    `)
        });
    }
    ctx.reply('Зачекайте')

    function loading() {
        ctx.reply('Дані завантажуються...')
    }

    setTimeout(loading, 500)
    setTimeout(showData, 3000);
    function loadMore() {
        ctx.replyWithHTML('Завантажити ще ?', Markup.inlineKeyboard(
            [
                [Markup.button.callback('Так', 'YesMore')], [Markup.button.callback('Ні', 'NoMore')]

            ]))
    }

    setTimeout(loadMore, 7000)

}
)

bot.action('YesMore', (ctx) => {
    function showData() {
        data2.forEach(item => {

            ctx.replyWithMarkdown(`
                    [${item.name}](${item.url})
                    `)
        });
    }
    ctx.reply('Зачекайте')

    function loading() {
        ctx.reply('Дані завантажуються...')
    }

    setTimeout(loading, 500)
    setTimeout(showData, 3000);

    function backTo() {
        ctx.reply(`

Я створений для того , щоб допомогти тобі з пошуком найнижчої ціни на ринку 

               ₿ - Криптовалюти - ₿ 💪

*Функціонал поки-що обмежений,але ми 
працюємо над створенням 
розширених запитів*
Розробник бота : ${owner}

${text.commands}

`)

    }
    setTimeout(backTo, 9000)
})
bot.action('NoMore', (ctx) => {
    ctx.reply(`

Я створений для того , щоб допомогти тобі з пошуком найнижчої ціни на ринку 

               ₿ - Криптовалюти - ₿ 💪

*Функціонал поки-що обмежений,але ми 
працюємо над створенням 
розширених запитів*
Розробник бота : ${owner}

${text.commands}

`)
})

// Запускаєм фор овер енд овер егейн !)
bot.launch()

// Enable graceful stop -- system configuration
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
