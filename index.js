let acitvoBot = false;

var contador = 0;

const fs = require('fs');

const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');

const SESSION_FILE_PATH = "./session.json";

const exceljs = require('exceljs');

const moment = require('moment');
/*

const express = require('express');

const app = express();
*/

//Probar borrar country_code y number
const country_code = "+54";

const number = "2615994531";

const msg = "Hola mundo!";

/*
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)){
    sessionData = require(SESSION_FILE_PATH);
    console.log("existe");
}else{
    console.log("no existe");
}
*/


const client = new Client({
    authStrategy: new LocalAuth(),
});

//inicializar cliente
client.initialize();


client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', session => {
    sessionData = session;
    console.log("autenticado");
    /*
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), err => {
        if(err){
            console.error(err);
        }
    })
    */
})//;

client.on('ready', () => {
    console.log('el cliente esta listo');
    /*

    let chatId = country_code+number+"@c.us";

    client.sendMessage(chatId, msg)
                    .then(response => {
                        if(response.id.fromMe){
                            console.log('el mensaje fue enviado');
                        }
                    })
                    */
});



client.on('auth_failure', msg => {
    console.error('hubo un fallo en la auteticacion', msg);
})

//opciones de mensaje
client.on('message', msg => {
    var mensaje = msg.body;

    const pathChat = `./chats/${msg.from}.xlsx`;
    if (fs.existsSync(pathChat)) {
        // console.log("existe");
        switch (mensaje.toLowerCase()) {
            case 'quiero info':
                sendMessage(msg.from, 'Cotizaciones');
                break;
            case 'adios':
            case 'adiós':
                sendMessage(msg.from, 'Nos vemos pronto');
                break;
            default:
                sendMessage(msg.from, 'No entendí tu mensaje');
                break;
        }

    } else {
        // console.log("NO existe");
        sendMessage(msg.from, 'Hola soy el bot de Elyon, manda "Quiero info" para recibir las cotizaciones');
    }

    /*
    Preguntas frecuentes
    */



    console.log(contador + " " + msg.from);
    saveHistorial(msg.from, msg.body);
});

//envia mensaje
const sendMessage = (to, message) => {
    client.sendMessage(to, message);
}

//excel
const saveHistorial = (number, message) => {
    const pathChat = `./chats/${number}.xlsx`;
    const workbook = new exceljs.Workbook();
    const today = moment().format('DD-MM-YYYY hh:mm');

    if (fs.existsSync(pathChat)) {
        workbook.xlsx.readFile(pathChat)
            .then(() => {
                const worksheet = workbook.getWorksheet(1);
                const lastRow = worksheet.lastRow;
                let getRowInsert = worksheet.getRow(++(lastRow.number))
                getRowInsert.getCell('A').value = today;
                getRowInsert.getCell('B').value = message;
                getRowInsert.commit();
                workbook.xlsx.writeFile(pathChat)
                    .then(() => {
                        console.log('Se agrego chat');

                    })
                    .catch(() => {
                        console.log('Algo fallo agregando')
                    })
            })
    } else {
        //CREAMOS
        const worksheet = workbook.addWorksheet('Chats');
        worksheet.columns = [
            { header: 'Fecha', key: 'date' },
            { header: 'Mensaje', key: 'message' },
        ]
        worksheet.addRow([today, message]);
        workbook.xlsx.writeFile(pathChat)
            .then(() => {
                console.log('Historial creado');

            })
            .catch(() => {
                console.log('Algo fallo')
            })
    }
}


