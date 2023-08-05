

// this func encapsulates the logic of login (not request the info)
export const request_access = (username, password) => {
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

  debug(xmpp, true)

  xmpp.on('error', err => {
    console.error(
      `\n[ERR] Your username or password is incorrect, please try it again`,
    )
    console.error(`[ERR] ${err}\n`)
    return false
  })

  return xmpp
}

export const login = () => {
  console.log('\n:: SIGN UP ::\n')
  rl.question('-> Username: ', user => {
    rl.question('-> Password: ', password => {
      let xmpp_res = request_access(user, password)

      if (xmpp_res == false) {
        // TODO: se queda en bucle, la idea es que vuelva al menu principal
      } else {
        menu_chat(xmpp_res)
      }
    })
  })
}

export const add_user = () => {
  // let status = false
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  console.log('\n:: SIGN UP ::\n')
  rl.question('-> Username: ', user => {
    rl.question('-> Password: ', password => {
      CLIENT.on('data', data => {
        if (data.toString().includes('<stream:features>')) {
          const newUserXML = `
            <iq type="set" id="reg_1" mechanism='PLAIN'>
              <query xmlns="jabber:iq:register">
                <username>${user}</username>
                <password>${password}</password>
              </query>
            </iq>
            `
          CLIENT.write(newUserXML)
        } else if (data.toString().includes('<iq type="result"')) {
          console.log('\n[OK] USER REGISTER SUCCESFULLY')

          let xmpp_res = request_access(user, password)

          if (xmpp_res == false) {
            // TODO: se queda en bucle, la idea es que vuelva al menu principal
          } else {
            menu_chat(xmpp_res)
          }
          // status = true
        } else if (data.toString().includes('<iq type="error"')) {
          console.log('[!] Error while creating new user, plase try it again')
          // rl.close()
          // TODO: se queda en bucle, la idea es que vuelva al menu principal
        }
      })
    })
  })
}

export const logout = () => {}

export const remove_user = () => {}
