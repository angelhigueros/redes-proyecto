// Proyecto Redes 1
// Angel Higueros - 20460

// LIBS
import readline from 'readline'
import net from 'net'
import { login, add_user } from './admin.js'

// UTILS
const SERVER = 'alumchat.xyz'
const PORT = '522'
const CLIENT = new net.Socket()
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Connect with the XMPP server
CLIENT.connect(5222, 'alumchat.xyz', function() {
    CLIENT.write(`<stream:stream to='${SERVER}' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' version='1.0'>`);
})


const main = () => {
  console.log('[1] Login')
  console.log('[2] Sign up')
  console.log('[3] Exit')

  rl.question('-> select one option: ', input => {
    switch (input) {
      case '1':
        login()
        break
      case '2':
        add_user(rl, CLIENT)
        break
      case '3':
        console.log('[OK] Saliendo del programa\n')
        CLIENT.on('close', () => {
            console.log('[!] Connection closed');
        });
        break
      default:
        console.log('[!] Opcion no valida\n')
        main()
        break
    }
  })
}

main()
