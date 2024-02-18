import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFile, readFile } from 'fs/promises';
import { Aproval, Media } from './types';

dotenv.config();

const gemini = async (prompt: string, media?: Media) => {

    const MODEL_NAME = "gemini-1.0-pro";
    const MODEL_VISION_NAME = "gemini-pro-vision";
    const API_KEY = process.env.GEMINI_KEY as string;
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    if (media) {
        try{
            const model = genAI.getGenerativeModel({ model: MODEL_VISION_NAME });
            const result = await model.generateContent([ prompt, {inlineData: media} ]);
            return {
                status: Aproval.ALLOWED,
                message: result.response.text()
            } 
        } catch (error: any) {
            if (error.message.includes('SAFETY')) return {
                status: Aproval.DENIED,
                message: "Desculpe, você inseriu conteúdo improprio."
            }
            return {
                status: Aproval.DENIED,
                message: "Desculpe, ocorreu um erro ao processar a imagem."
            }
        }
    } else {
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });
        const generationConfig = {
            temperature: 1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          };
    
          const chat = model.startChat({
            generationConfig,
            history: [
            ],
          });
          try {
            const result = await chat.sendMessage(prompt);
            const response = result.response;
      
            return {
                status: Aproval.ALLOWED,
                message: response.text()
            }
          } catch (error) {
            return {
                status: Aproval.DENIED,
                message: "Desculpe, você inseriu conteúdo improprio."
            }
        }
    }
}

const diceRoll = (value: string, type: string) => {
    const values = value.split('d');
    let result = 0;
    let str = '[';
    if (parseInt(values[0]) > 1000 || parseInt(values[1]) > 1000) return {
        status: Aproval.DENIED,
        result: "Valor de dados e/ou faces muito alto. Favor inserir valores menores."
    }
    for (let i = 0; i < parseInt(values[0]); i++) {
        const val = Math.floor(Math.random() * parseInt(values[1]) + 1);
        if (type === 's') {
            result += val;
        } else if (type === '+') {
            val > result ? result = val : result;
        } else if (type === '-') {
            val < result ? result = val : result;
        }
        if (i === parseInt(values[0]) - 1) {
            str += `${val}]`;
        } else {
            str += `${val}, `;
        }
    }
    return {
        status: Aproval.ALLOWED,
        result:{
            values: str,
            result: result.toString()
        }
    };
}


const allowChat = async (chatId: string) => {
    try {
        const previousIDs = await readFile('chats.txt', 'utf-8');
        await writeFile('chats.txt', `${previousIDs}\n${chatId}`);
        return {
            status: Aproval.ALLOWED,
            message: 'Chat permitido'
        }
    } catch (error) {
        return {
            status: Aproval.DENIED,
            message: 'Erro ao permitir chat'
        }
    }
}

const getAllowedChats = async () => {
    const chats = await readFile('chats.txt', 'utf-8');
    return chats.split('\n');

}

export { gemini, diceRoll, allowChat, getAllowedChats }