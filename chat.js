export const menu_chat = xmpp => {
  console.log('\n:: CHAT REDES ::\n')

  xmpp.on('online', async address => {
    // Online.
    const presence = xml('presence', { type: 'available' })
    xmpp.send(presence)

    console.log('Inició sesión con este address: ', address)
  })

  // console.log("[1] Chat")
  // console.log("[3] Salir (cerrar sesion)")

  // rl.question('-> Seleccione una opcion', (input) => {

  //     switch (input) {
  //         case "1":
  //             chat()
  //             break
  //         case "2":
  //             console.log("[OK] Saliendo del programa\n")
  //             break
  //         default:
  //             console.log("[!] Opcion no valida\n")
  //             main()
  //             break
  //     }

  //     rl.close();
  // })
}

export const show_all_users = () => {}

export const add_user_list = () => {}

export const show_user_details = () => {}

export const start_one_one = () => {}

export const join_group = () => {}

export const set_main_message = () => {}

export const sent_notification = () => {}

export const sent_files = () => {}
