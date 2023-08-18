import readline from 'readline'
import net from 'net'
import { client, xml } from '@xmpp/client'

class Chat {
  constructor() {
    // UTILS
    this.xmppClient = null
    this.SERVER = 'alumchat.xyz'
    this.PORT = 5222
    this.conn = new net.Socket()
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    // Notifications
    this.subscription = []
    this.groupChatInvites = []
  }

  // HELPERS
  askQuestion = question => {
    return new Promise(resolve => {
      this.rl.question(question, answer => {
        resolve(answer)
      })
    })
  }

  startConnection = () => {
    this.conn.connect(this.PORT, this.SERVER, () => {
      this.conn.write(
        `<stream:stream to='${this.SERVER}' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' version='1.0'>`,
      )
    })
  }

  displayMainMenu = async () => {
    console.log('\n:: Main Menu ::\n')
    console.log('[1] Login')
    console.log('[2] Sign up')
    console.log('[3] Exit')

    const input = await this.askQuestion('-> Select an option: ')

    if (input === '1') {
      this.login()
    } else if (input === '2') {
      this.signup()
    } else if (input === '3') {
      console.log('[OK] Exiting the program\n')
      this.conn.on('close', () => {
        console.log('[!] Connection closed')
      })
    } else {
      console.log('[!] Invalid option\n')
      this.displayMainMenu()
    }
  }

  requestAccess = async (username, password) => {
    // Setting up XMPP client
    this.xmppClient = client({
      service: `xmpp://${this.SERVER}:${this.PORT}`,
      domain: this.SERVER,
      username: username,
      password: password,
      terminal: true,
      tls: {
        rejectUnauthorized: false,
      },
    })
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    this.xmppClient.on('error', err => {
      if (err.condition === 'not-authorized') {
        console.error('[ERR] Error while logging in')
      }
    })

    await this.xmppClient.start().catch(err => {
      if (err.condition === 'not-authorized') {
        console.error(
          '[ERR] This user may not exist on the server. Please try again.',
        )
        this.displayMainMenu()
      }
    })

    this.menuChat()
  }

  // ADMIN FUNCTIONS
  login = async () => {
    console.log('\n[OK] LOGIN\n')
    const user = await this.askQuestion('-> Username: ')
    const password = await this.askQuestion('-> Password: ')

    this.requestAccess(user, password)
  }

  signup = async () => {
    console.log('\n[OK] SIGN UP\n')
    const user = await this.askQuestion('-> Username: ')
    const password = await this.askQuestion('-> Password: ')

    this.conn.on('data', data => {
      if (data.toString().includes('<stream:features>')) {
        const newUserXML = `
              <iq type="set" id="reg_1" mechanism='PLAIN'>
                <query xmlns="jabber:iq:register">
                  <username>${user}</username>
                  <password>${password}</password>
                </query>
              </iq>
              `
        this.conn.write(newUserXML)
      } else if (data.toString().includes('<iq type="result"')) {
        console.log('\n[OK] USER REGISTERED SUCCESSFULLY')
        this.requestAccess(user, password)
      } else if (data.toString().includes('<iq type="error"')) {
        console.log('[ERR] Error while creating a new user, please try again')
        // TODO: Looping issue, should return to the main menu
      }
    })
  }

  logout = () => {
    // Implement the logic for logging out
  }

  removeUser = () => {
    // Implement the logic for removing a user
  }

  menuChat = async () => {
    // Get the last updates
    this.getNotification()

    console.log('\n:: PROYECTO REDES ::\n')
    console.log('[1] Chat')
    console.log('[2] Exit (Log out)')

    const input = await this.askQuestion('-> Select an option: ')

    if (input === '1') {
      console.log('\n:: CHAT ::\n')
      console.log('[1] Show all users/contacts and their status')
      console.log('[2] Add a user to contacts')
      console.log('[3] Show contact details')
      console.log('[4] One-on-one communication')
      console.log('[5] Join group conversations')
      console.log('[6] Set main status message')
      console.log('[7] Send/receive notifications')
      console.log('[8] Send/receive files')
      console.log('[9] Back')

      const input2 = await this.askQuestion('-> Select an option: ')

      if (input2 === '1') {
        this.showAllUsers()
      } else if (input2 === '2') {
        this.addUserToContacts()
      } else if (input2 === '3') {
        this.showContactDetails()
      } else if (input2 === '4') {
        this.startOneToOne()
      } else if (input2 === '5') {
        this.joinGroup()
      } else if (input2 === '6') {
        this.setMainMessage()
      } else if (input2 === '7') {
        this.getNotification()
      } else if (input2 === '8') {
        this.sendFiles()
      } else if (input2 === '9') {
        console.log('[OK] Going back\n')
        this.menuChat()
      } else {
        console.log('[!] Invalid option\n')
        this.menuChat()
      }
    } else if (input === '2') {
      console.log('[OK] Exiting the program\n')
      this.logout()
    } else {
      console.log('[!] Invalid option\n')
      this.menuChat()
    }
  }

  // CHAT FUNCTIONS
  showAllUsers = async () => {
    console.log('\n:: USERS ::\n')

    try {
      const rosterRequest = xml(
        'iq',
        { type: 'get', id: 'roster' },
        xml('query', { xmlns: 'jabber:iq:roster' }),
      )

      await this.xmppClient.send(rosterRequest)

      this.xmppClient.on('stanza', stanza => {
        if (stanza.is('iq') && stanza.attrs.type === 'result') {
          const contacts = stanza
            .getChild('query', 'jabber:iq:roster')
            .getChildren('item')

          console.log('[] Contacts\n')

          contacts.forEach(contact => {
            const jid = contact?.attrs?.jid
            const name = contact?.attrs?.name
            const subscription = contact?.attrs?.subscription

            console.log('JID:', jid)
            console.log('Name:', name || jid)
            console.log('Subscription:', subscription)
          })
        }
      })
      this.menuChat()
    } catch (err) {
      console.error(`[ERR] While getting contacts: ${err}`)
    }

    this.menuChat()
  }

  addUserToContacts = async () => {
    console.log('\n:: ADD CONTACT ::\n')

    console.log('[1] New contact')
    console.log('[2] contancts requests')

    try {
      const answer = await this.askQuestion('-> Choose an option: ')

      if (answer === '1') {
        console.log('\n:: NEW CONTACT ::')
        const user = await this.askQuestion('-> User: ')

        const subscriptionPresence = xml('presence', {
          type: 'subscribe',
          to: `${user}@alumchat.xyz`,
        })

        await this.xmppClient.send(subscriptionPresence)
        console.log('[OK] Request sent')
        this.menuChat()
      } else if (answer === '2') {
        console.log('\n:: CONTACTS REQUESTS ::')

        this.subscription.length === 0
          ? console.log('[...] No contact requests')
          : this.subscription.forEach((request, index) => {
              console.log(`[${index + 1}] ${request.split('@')[0]}`)
            })

        if (this.subscription.length > 0) {
          const user = await this.askQuestion('-> write the name of the user: ')
          // Peticion xml para agregar a un usuario a contactos
          const subscriptionPresence = xml('presence', {
            type: 'subscribed',
            to: `${user}@${this.SERVER}`,
          })

          await this.xmpp.send(subscriptionPresence)
          console.log('[OK] Request accepted')

          // Remover solicitud de la lista
          const indexToRemove = this.subscription.indexOf(user)
          if (indexToRemove !== -1) {
            this.subscription.splice(indexToRemove, 1)
          }
        }

        this.menuChat()
      } else {
        console.log('[!] Invalid option')
        this.menuChat()
      }
    } catch (error) {
      console.error(`[ERR] ${error}`)
      this.menuChat()
    }
  }

  showContactDetails = async () => {
    try {
      console.log('\n:: SHOW CONTACT INFORMATION ::')
      const username = await this.askQuestion('-> username: ')

      const requestUsername = `${username}@alumchat.xyz`
      const presenceRequest = xml('presence', { to: username })
      this.xmppClient.send(presenceRequest)

      this.xmppClient.on('stanza', stanza => {
        if (stanza.is('iq') && stanza.attrs.type === 'result') {
          const query = stanza.getChild('query', 'jabber:iq:roster')
          const users = query.getChildren('item')
          const user = users.find(user => user.attrs.jid === requestUsername)

          if (user) {
            console.log(`[-] JID: ${user?.attrs?.jid || ''}`)
            console.log(`[-]  Name: ${user?.attrs?.name || username}`)
            console.log(`[-] Subscription: ${user?.attrs?.subscription || ''}`)
          } else {
            console.log('User not found')
          }

          this.menuChat()
        }
      })

      // Send xml request to server to get user info
      const rosterRequest = xml(
        'iq',
        { type: 'get', id: 'roster' },
        xml('query', { xmlns: 'jabber:iq:roster' }),
      )

      await this.xmppClient.send(rosterRequest)
    } catch (error) {
      console.error('[ERR] showContactDetails:', error)
    }
  }

  startOneToOne = async () => {
    console.log('\n:: CONVERSATION ::\n')

    const username = await this.askQuestion('-> sent message to (username): ')

    console.log(`\n[OK]  chatting with ${username}\n`)

    // monitor the server
    this.xmppClient.on('stanza', async stanza => {
      if (stanza.is('message') && stanza.attrs.type === 'chat') {
        const from = stanza.attrs.from
        const msg = stanza.getChildText('body')

        console.log('Stanza: ', stanza)
        console.log(`[${from}] ${msg}`)
      }
    })

    // Handle chat
    console.log('\n [] To go back write -> back')
    const message = await this.askQuestion('-> message: ')

    if (message == 'back') {
      // Salir
      this.menuChat()
    } else {
      // Send message
      const request = xml(
        'message',
        { type: 'chat', to: username },
        xml('body', {}, message),
      )
      await this.xmppClient.send(request)
    }
  }

  joinGroup = () => {
    // Implement the logic for joining a group chat
  }

  setMainMessage = () => {
    // Implement the logic for setting the main message
  }

  getNotification = () => {
    // Implement the logic for sending notifications
    // Handles the different notifications and messages
    this.xmppClient.on('stanza', stanza => {
      if (stanza.is('message') && stanza.attrs.type == 'chat') {
        const from = stanza.attrs.from
        const body = stanza.getChildText('body')
        const message = { from, body }

        if (body) {
          console.log(`Received message from ${from.split('@')[0]}:`, body)
        }
      } else if (stanza.is('presence') && stanza.attrs.type === 'subscribe') {
        const from = stanza.attrs.from
        this.subscription.push(from)
        console.log('Received subscription request from:', from.split('@')[0])
        console.log('Request message:', stanza.getChildText('status'))
      } else if (
        stanza.is('message') &&
        stanza.attrs.from.includes('@conference.alumchat.xyz')
      ) {
        const groupchat = stanza.attrs.from
        const to = stanza.attrs.to

        this.receivedGroupChatInvites.push(groupchat)

        // Si el to no tiene una diagonal, entonces se imprime la invitación.
        if (!to.includes('/')) {
          console.log('Group chat invitation from: ', groupchat)
        }
      }
    })
  }

  sendFiles = () => {
    // Implement the logic for sending and receiving files
  }
}

// INIT
const main = new Chat()
main.startConnection()
main.displayMainMenu()
