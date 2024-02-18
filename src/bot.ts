import { Whatsapp } from "@wppconnect-team/wppconnect";
import { gemini, allowChat, getAllowedChats, diceRoll } from "./feats";
import { Aproval, Dice, Response } from "./types"
import { helpText } from "./txts";

export const start = async (client: Whatsapp) => {
    client.onAnyMessage(async (message) => {
        if ((await getAllowedChats()).includes(message.chatId)){
            console.log(message.body)
            if (message.body?.startsWith('/gemini')) {
                // sem imagens por enquanto
                client.sendReactionToMessage(message.id, '🕒');
                client.sendText(message.chatId, 'Processando...', {
                    quotedMsg: message.id
                });
                let response: Response<string>;
                message.isMedia ? 
                    response = await gemini(message.body.replace('/gemini', ''), { data: await client.downloadMedia(message), mimeType: message.mimetype }) 
                        :
                    response = await gemini(message.body.replace('/gemini', ''));
                response.status === Aproval.ALLOWED ?
                    client.sendReactionToMessage(message.id, '✅') 
                        :
                    client.sendReactionToMessage(message.id, '❌');
                client.sendText(message.chatId, response.message, {
                    quotedMsg: message.id
                });
            }
            if (JSON.parse(JSON.stringify(message))?.caption === '/s') {
                client.sendReactionToMessage(message.id, '🕒');
                try {
                    client.sendImageAsSticker(message.chatId, await client.downloadMedia(message.id))
                    client.sendReactionToMessage(message.id, '✅');
                } catch (error) {
                    client.sendReactionToMessage(message.id, '❌');
                }
            }
            if (message.body?.startsWith('/help')) {
                client.sendText(message.chatId, helpText);
                client.sendReactionToMessage(message.id, '✅');
            }
            if (message.body?.startsWith('/roll')) {
                const allowedFlags = ['s', '+', '-'];
                client.sendReactionToMessage(message.id, '🕒');
                const vars = message.body.split(' ');
                const flag = vars[2];
                const dice = vars[1];
                const response = diceRoll(dice, flag);
                if (response.status === Aproval.DENIED) {
                    client.sendText(message.chatId, response.result as string);
                    client.sendReactionToMessage(message.id, '❌');
                } else {
                    const res = response.result as Dice;
                    if (!allowedFlags.includes(flag)) {
                        client.sendText(message.chatId, `Opção não permitida, favor seguir o formato correto: /roll [quantidade]d[lados][s/+/-]`);
                        client.sendReactionToMessage(message.id, '❌');
                    } else {
                        client.sendText(message.chatId, `Rolando dados...`);
                        client.sendText(message.chatId, `Valores: ${res.values}\nResultado: ${res.result}`);
                        client.sendReactionToMessage(message.id, '✅');
                    }
                }
            }
        } else if (message.body?.startsWith('/allow') && message.sender.isMe || message.from === '553195382956@c.us') {
            const response = await allowChat(message.chatId);
            client.sendReactionToMessage(message.id, response.status === Aproval.ALLOWED ? '✅' : '❌');
            client.sendText(message.chatId, response.message);
        }
    });
}