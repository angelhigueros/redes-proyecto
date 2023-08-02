import { menu_chat } from './chat.js'



export const login = () => {
}

export const add_user = (rl, CLIENT) => {
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
          menu_chat(rl)
        } else if (data.toString().includes('<iq type="error"')) {
          console.log('[!] Error while creating new user, plase try it again')
          add_user(rl, CLIENT)
        }
      })
    })
  })
}

export const logout = () => {}

export const remove_user = () => {}
