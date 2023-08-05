// Proyecto Redes 1
// Angel Higueros - 20460

// LIBS
import readline from 'readline'
import net from 'net'
import { client, xml, jid } from '@xmpp/client'
import debug from '@xmpp/debug'

// UTILS
const SERVER = 'alumchat.xyz'
const PORT = '5222'
const conn = new net.Socket()
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const main = () => {
  // Connect with the XMPP server
  conn.connect(5222, SERVER, () => {
    conn.write(
      `<stream:stream to='${SERVER}' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' version='1.0'>`,
    )
  })

  // let state = true
  // while (state) {
  console.log('[1] Login')
  console.log('[2] Sign up')
  console.log('[3] Exit')

  rl.question('-> select one option: ', input => {
    if (input == '1') {
      login()
    } else if (input == '2') {
      add_user()
    } else if (input == '3') {
      console.log('[OK] Saliendo del programa\n')
      conn.on('close', () => {
        console.log('[!] Connection closed')
      })
      // state = false
    } else {
      console.log('[!] Opcion no valida\n')
      main()
    }
  })
}

// ADMIN FUNCTIONS

// this func encapsulates the logic of login (not request the info)
const request_access = (username, password) => {
  const xmpp = client({
    service: `xmpp://${SERVER}:${PORT}`,
    domain: SERVER,
    username: username,
    password: password,
    terminal: true,
    tls: {
      rejectUnauthorized: false,
    },
  })
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  // debug(xmpp, true)

  xmpp.on('error', err => {
    console.error(
      `\n[ERR] Your username or password is incorrect, please try it again`,
    )
    console.error(`[ERR] ${err}\n`)
    // TODO: Arreglar el error "SASLError: not-authorized" que da cuando se ingresan datos incorrectos
    main()
  })

  menu_chat(xmpp)
}

const login = () => {
  console.log('\n:: SIGN UP ::\n')
  rl.question('-> Username: ', user => {
    rl.question('-> Password: ', password => {
      request_access(user, password)

      // TODO: A veces se tarda en hacer login y se optione "TimeoutError", no afecta pero ver si se logra eliminar esta alerta
    })
  })
}

const add_user = () => {
  // let status = false

  console.log('\n:: SIGN UP ::\n')
  rl.question('-> Username: ', user => {
    rl.question('-> Password: ', password => {
      conn.on('data', data => {
        if (data.toString().includes('<stream:features>')) {
          const newUserXML = `
            <iq type="set" id="reg_1" mechanism='PLAIN'>
              <query xmlns="jabber:iq:register">
                <username>${user}</username>
                <password>${password}</password>
              </query>
            </iq>
            `
          conn.write(newUserXML)
        } else if (data.toString().includes('<iq type="result"')) {
          console.log('\n[OK] USER REGISTER SUCCESFULLY')
          request_access(user, password)
        } else if (data.toString().includes('<iq type="error"')) {
          console.log('[!] Error while creating new user, plase try it again')
          // rl.close()
          // TODO: se queda en bucle, la idea es que vuelva al menu principal
        }
      })
    })
  })
}

const logout = () => {}

const remove_user = () => {}

// CHAT FUNCTIONS
const menu_chat = xmpp => {
  xmpp.on('online', async address => {
    // Change the status of the user on server
    const presence = xml('presence', { type: 'available' })
    xmpp.send(presence)

    console.log('\n:: CHAT REDES ::\n')

    console.log('\n[>] Welcome: ', address?._local)
    console.log('[>] Server: ', address?._domain)

    console.log('\n[1] Chat')
    console.log('[2] Salir (cerrar sesion)')

    rl.question('-> Seleccione una opcion: ', input => {
      if (input == '1') {
        // chat()
        console.log('\n:: CHAT ::\n')

        console.log('\n[1] Mostrar todos los usuarios/contactos y su estado')
        console.log('[2] Agregar un usuario a los contactos')
        console.log('[3] Mostrar detalles de contacto de un usuario')
        console.log('[4] Comunicación 1 a 1 con cualquier usuario/contacto')
        console.log('[5] Participar en conversaciones grupales')
        console.log('[6] Definir mensaje de presencia')
        console.log('[7] Enviar/recibir notificaciones')
        console.log('[8] Enviar/recibir archivos')
        console.log('[9] Volver')

        rl.question('-> Seleccione una opcion: ', input2 => {
          if (input2 == '1') {
            show_all_users()
          } else if (input2 == '2') {
            add_user_list()
          } else if (input2 == '3') {
            show_user_details()
          } else if (input2 == '4') {
            start_one_one()
          } else if (input2 == '5') {
            join_group()
          } else if (input2 == '6') {
            set_main_message()
          } else if (input2 == '7') {
            sent_notification()
          } else if (input2 == '8') {
            sent_files()
          } else if (input2 == '9') {
            console.log('[OK] Saliendo \n')
            menu_chat()
          } else {
            console.log('[!] Opcion no valida\n')

            menu_chat()
          }
        })
      } else if (input == '2') {
        console.log('[OK] Saliendo del programa\n')
        main()
      } else {
        console.log('[!] Opcion no valida\n')
        main()
      }

      rl.close()
    })
  })

  xmpp.start().catch(console.error)
}

const show_all_users = () => {}

const add_user_list = () => {}

const show_user_details = () => {}

const start_one_one = () => {}

const join_group = () => {}

const set_main_message = () => {}

const sent_notification = () => {}

const sent_files = () => {}

// INIT
main()
