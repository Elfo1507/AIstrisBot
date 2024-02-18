import { create, Whatsapp } from '@wppconnect-team/wppconnect'
import { start } from './bot'

create({
    session: "AIstris"
}).then((client: Whatsapp) => start(client))
