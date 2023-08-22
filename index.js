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

    // Helpers variables
    this.subscription = []
    this.groups = []
  }

  // HELPERS FUNCTIONS
  /**
   * Function that allows asking a question to the user in the console.
   * @param {string} question - The question to be displayed to the user.
   * @returns {Promise<string>} A promise that resolves with the user's answer.
   */
  askQuestion = question => {
    return new Promise(resolve => {
      this.rl.question(question, answer => {
        resolve(answer)
      })
    })
  }

  /**
   * Initiates a connection with a server using the specific protocol.
   * @description This function establishes a connection with a server using the defined
   *   port and server values. It then sends an initial message through the connection
   *   to initiate the communication process.
   */
  startConnection = () => {
    this.conn.connect(this.PORT, this.SERVER, () => {
      this.conn.write(
        `<stream:stream to='${this.SERVER}' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' version='1.0'>`,
      )
    })
  }

  toBase64 = path => {
    const fs = require('fs')
    const fileData = fs.readFileSync(path)
    const base64Data = fileData.toString('base64')
    return base64Data
  }

  /**
   * Displays the main menu options to the user and handles user input.
   * @description This function presents the user with options in the main menu, prompts for user input,
   *   and then proceeds based on the selected option. It provides options for login, sign up, and exiting
   *   the program. Depending on the user's choice, appropriate actions are taken.
   */
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

  /**
   * Requests access to the XMPP server using the provided username and password.
   * @param {string} username - The username for logging in to the XMPP server.
   * @param {string} password - The password for logging in to the XMPP server.
   * @description This function sets up an XMPP client connection to the server with the given credentials.
   *   It establishes a connection, handles errors, and starts the XMPP client. If the login is not successful,
   *   appropriate error messages are displayed, and the main menu is displayed again for user interaction.
   *   Upon successful login, the function proceeds to the "menuChat" phase for further interaction.
   */
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

    // TODO: cuando falla el login aun se dirije al menu
    this.menuChat()
  }

  // ADMIN FUNCTIONS
  /**
   * Handles the user login process.
   * @description This function guides the user through the login process by prompting for their
   *   username and password. It then calls the "requestAccess" function with the provided credentials
   *   to initiate the process of requesting access to the XMPP server.
   */
  login = async () => {
    console.log('\n:: LOGIN ::\n')
    const user = await this.askQuestion('-> Username: ')
    const password = await this.askQuestion('-> Password: ')

    this.requestAccess(user, password)
  }

  /**
   * Handles the user sign-up process.
   * @description This function guides the user through the sign-up process by prompting for a new username
   *   and password. It listens for data from the connection and based on the received data, it constructs
   *   and sends XML messages for user registration. Upon successful registration, it displays a success message
   *   and proceeds to the "requestAccess" phase. In case of errors, appropriate messages are displayed.
   */
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

  logout = async () => {
    await this.xmppClient.send(xml('presence', { type: 'unavailable' }))
    await this.xmppClient.stop()
    this.menuChat()
  }

  removeUser = () => {
    // Implement the logic for removing a user
    const request = xml(
      'iq',
      { type: 'set', id: 'unreg1' },
      xml('query', { xmlns: 'jabber:iq:register' }, xml('remove', {})),
    )
    this.xmppClient
      .send(request)
      .then(() => {
        console.log('[!] User has been deleted\n')
        this.xmppClient.stop()
      })
      .catch(err => {
        console.error(`[ERR] ${err}`)
      })
    this.displayMainMenu()
  }

  /**
   * Handles the user interaction in the chat menu.
   * @description This function displays the chat menu options to the user, prompts for their input,
   *   and takes appropriate actions based on the selected option. It provides options for various
   *   chat-related actions, such as viewing users, adding users to contacts, communicating one-on-one,
   *   and more. Depending on the user's choice, the function performs corresponding tasks or navigates
   *   back to the main chat menu.
   */
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
      console.log('[9] Delete user')
      console.log('[10] Back')

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
        // TODO: fix implementation
        // this.joinGroup()
        this.menuChat()
      } else if (input2 === '6') {
        this.setMainMessage()
      } else if (input2 === '7') {
        this.getNotification()
        this.menuChat()
      } else if (input2 === '8') {
        this.sendFiles()
      } else if (input2 === '9') {
        this.removeUser()
      } else if (input2 === '10') {
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

  /**
   * Displays information about all users/contacts.
   * @description This function sends a roster request to the XMPP server to retrieve information
   *   about the user's contacts. It then processes the received data and displays the contacts' JIDs,
   *   names, and subscription status. If an error occurs during the process, an error message is displayed.
   */
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

  /**
   * Handles the process of adding a contact to the user's contact list.
   * @description This function guides the user through the process of adding a new contact
   *   or handling contact requests. It prompts the user for their choice, sends subscription
   *   requests to the server, and processes the user's inputs. Depending on the selected option,
   *   it either sends a subscription request to add a new contact or accepts contact requests.
   */
  addUserToContacts = async () => {
    console.log('\n:: ADD CONTACT ::\n')

    console.log('[1] New contact')
    console.log('[2] Contacts requests')

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
          const user = await this.askQuestion('-> Write the name of the user: ')
          // XML request to add a user to contacts
          const subscriptionPresence = xml('presence', {
            type: 'subscribed',
            to: `${user}@${this.SERVER}`,
          })

          await this.xmpp.send(subscriptionPresence)
          console.log('[OK] Request accepted')

          // Remove request from the list
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

  /**
   * Displays information about a specific contact.
   * @description This function prompts the user to provide a username and sends requests to the server
   *   to retrieve contact information. It processes the received data and displays relevant contact details,
   *   such as JID, name, and subscription status. If the contact is not found, a message is displayed.
   */
  showContactDetails = async () => {
    try {
      console.log('\n:: SHOW CONTACT INFORMATION ::')
      const username = await this.askQuestion('-> Username: ')

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
            console.log(`[-] Name: ${user?.attrs?.name || username}`)
            console.log(`[-] Subscription: ${user?.attrs?.subscription || ''}`)
          } else {
            console.log('User not found')
          }

          this.menuChat()
        }
      })

      // Send XML request to server to get user info
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

  /**
   * Initiates a one-on-one conversation with another user.
   * @description This function handles the process of initiating a one-on-one conversation
   *   with another user. It prompts the user to provide the username of the recipient and then
   *   sets up a monitoring mechanism to listen for incoming messages. The user can then send messages
   *   or choose to go back to the chat menu.
   */
  startOneToOne = async () => {
    console.log('\n:: CONVERSATION ::\n')

    const username = await this.askQuestion('-> Send message to (username): ')

    console.log(`\n[OK] Chatting with ${username}\n`)

    // Monitor the server for incoming messages
    this.xmppClient.on('stanza', async stanza => {
      if (stanza.is('message') && stanza.attrs.type === 'chat') {
        const from = stanza.attrs.from
        const msg = stanza.getChildText('body')

        console.log('Stanza: ', stanza)
        console.log(`[${from}] ${msg}`)
      }
    })

    // Handle chat interaction
    console.log('\n [] To go back, write -> back')
    const message = await this.askQuestion('-> Message: ')

    if (message === 'back') {
      // Go back
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

  /**
   * Changes the main status message in the chat context.
   * @description This function allows the user to update their main status and associated status message
   *   in a chat environment. It prompts the user to input a new status and a new status message. The function
   *   then sends a request to the XMPP server to update the user's presence with the provided status and message.
   *   Once the update is successful, a confirmation message is displayed, and the chat menu is displayed to continue
   *   the interaction.
   */
  setMainMessage = async () => {
    console.log('\n:: SET MAIN STATUS MESSAGE ::\n')
    const status = await this.askQuestion('-> new status: ')
    const message = await this.askQuestion('-> new message: ')

    // Sent request to the server
    await this.xmppClient.send(
      xml('presence', {}, xml('show', {}, status), xml('status', {}, message)),
    )

    console.log('[OK] Main status message has been changed')
    this.menuChat()
  }

  /**
   * Handles the reception of various types of notifications from the XMPP server.
   * @description This function listens for incoming stanzas from the XMPP server and processes
   *   them based on their type. It handles incoming chat messages, subscription requests, and
   *   group chat invitations. For chat messages, it extracts the sender's information and displays
   *   the received message. For subscription requests, it adds the sender to the subscription list
   *   and displays the received request along with its message. For group chat invitations, it adds
   *   the invitation to the list of received group chat invites and displays the invitation if the
   *   'to' attribute does not contain a slash ('/').
   */
  getNotification = () => {
    this.xmppClient.on('stanza', stanza => {
      if (stanza.is('message') && stanza.attrs.type === 'chat') {
        const from = stanza.attrs.from
        const body = stanza.getChildText('body')
        const message = { from, body }

        if (body) {
          console.log(`[NOTIFY] You have recevied this messages`)
          console.log(`[${from.split('@')[0]}] ${body}\n`)
        }
      } else if (stanza.is('presence') && stanza.attrs.type === 'subscribe') {
        const from = stanza.attrs.from
        this.subscription.push(from)
        console.log(`[NOTIFY] You have recevied this requests`)
        console.log(`[${from.split('@')[0]}] ${stanza.getChildText('status')}`)
      } else if (
        stanza.is('message') &&
        stanza.attrs.from.includes('@conference.alumchat.xyz')
      ) {
        // See if the user is in groups and add those groups to a list
        const groupchat = stanza.attrs.from
        const to = stanza.attrs.to

        if (!to.includes('/')) {
          console.log(`[NOTIFY] You have been invited to these groups`)
          console.log(`[-] ${groupchat}`)
        }

        this.groups.push(groupchat)
      }
    })
  }

  sendFiles = async () => {
    console.log(`\n::  SEND FILES::\n`)

    try {
      const user = await this.askQuestion('-> Username: ')
      const file = await this.askQuestion('-> File path: ')

      // Get file
      const base64 = fileToBase64(file)
      const fileName = filePath.split('/').pop()

      // XML request to send a file
      const request = xml(
        'message',
        { to: `${user}@${this.SERVER}`, type: 'chat' },
        xml('body', {}, `file://${base64}`),
        xml('subject', {}, `Archivo: ${fileName}`),

        await this.xmppClient.send(request),
        console.log('\n[OK] file has been sent'),
      )
    } catch (error) {
      console.log(`\n[ERR] file cannot be sent: ${error}`)
    }
    this.menuChat()
  }
}

// INIT
const main = new Chat()
main.startConnection()
main.displayMainMenu()
