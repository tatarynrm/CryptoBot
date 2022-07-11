const { Telegraf, Markup } = require('telegraf')
const axios = require('axios');
require('dotenv').config();
const text = require('./commands');



const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) =>
    ctx.reply(`
    Привіт ${ctx.message.from.username ? ctx.message.from.username : ctx.message.from.first_name} 👋

Я створений для того , щоб допомогти тобі з пошуком найнижчої ціни на ринку 

               ₿ - Криптовалюти - ₿ 💪

*Функціонал поки-що обмежений,але ми 
працюємо над створенням 
розширених запитів*

${text.commands}

`));



bot.command('crypto', async (ctx) => {
    try {
        await ctx.replyWithHTML('<b>Торгові пари</b>', Markup.inlineKeyboard(
            [
                [Markup.button.callback('USDT / UAH', 'USDTUAH')]
                // Markup.button.callback('USDT / EUR', 'EURUSDT')
            ]
        ))
    } catch (e) {
        console.error(e);
    }
})

let binance = [];
let whiteBit = [];
async function addActionBot(name, text) {
    let date = new Date();
    let dt = {
        date: date.toLocaleDateString(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds()
    }
    let sec = dt.seconds < 10 ? '0' + dt.seconds : dt.seconds;
    let minutes = dt.minutes < 10 ? '0' + dt.minutes : dt.minutes;
    let hours = dt.hours < 10 ? '0' + dt.hours : dt.hours;


    let one = `https://api.binance.com/api/v3/ticker/price?symbol=${name}`;
    let two = `https://whitebit.com/api/v2/public/ticker`;
    const reqOne = axios.get(one)
    const reqTwo = axios.get(two)
    const allData = () => {
        axios.all([reqOne, reqTwo]).then(axios.spread((...responses) => {
            binance.push(responses[0].data)
            // console.log(binance);
            whiteBit.push(responses[1].data.result)
            const ar = whiteBit.flat()
            // console.log(ar);

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
            // console.log('MYYYYYY', my);
            const filterWhite = my.find(item => item.pair == binance[0].symbol)
            // console.log(filterWhite);
            // Запуск команди
            const b = binance[0].price ? binance[0].price : null;
            let binancePrice = (+b).toFixed(4)
            bot.action(name, async (ctx) => {
                try {

                    // console.log('BINANCE', binance);
                    // console.log('WHITEBIT', filterWhite);
                    await ctx.answerCbQuery()
                    await ctx.replyWithHTML(text)
                    await ctx.replyWithMarkdown(`
_Дата та точний час запиту_
*${dt.date}* - ${hours}:${minutes}:${sec}
        
        [Binance](https://www.binance.com/uk-UA/activity/referral-entry?fromActivityPage=true&ref=LIMIT_FYA2313M) *${binance[0].symbol}* - **${binancePrice}**
       [WhiteBit](https://whitebit.com/referral/69f53aee-28aa-4e88-8395-950d49ebd938)  *${filterWhite.pair}* - **${filterWhite.price}**
        
/crypto - Зробити запит ще раз

            `, { disable_web_page_preview: true })

                } catch (e) {

                }
            })
        })).catch(err => {
            console.log(err);
        })
    }
    allData()

}

addActionBot('USDTUAH', text.uah)
addActionBot('EURUSDT', text.eur);
addActionBot('USDT', text.btc);


// Запускаєм фор овер енд овер егейн !)
bot.launch()

// Enable graceful stop -- system configuration
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
