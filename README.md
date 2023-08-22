# Chat Project - Networks
### Angel Higueros - 20460

This project is a chat application developed in Node.js that utilizes the XMPP (Extensible Messaging and Presence Protocol) protocol for communication. The application allows users to register, log in, add contacts, send and receive messages, and participate in individual and group conversations.

## Features

- **Login and Registration:** Users can log in or register in the application.
- **Contact Management:** Users can add other users as contacts and receive subscription requests.
- **Individual Conversations:** Users can chat individually with their contacts.
- **Group Invitations:** Users can receive invitations to join group conversations.
- **Notifications:** Users receive notifications for incoming messages, subscription requests, and group invitations.
- **Send and Receive Files:** Users can send and receive files through the application (implementation pending).

## Technologies Used

- **Node.js:** JavaScript runtime platform used for developing the application.
- **ECMAScript 6 (ES6):** The project uses ECMAScript 6 features for modern JavaScript syntax.
- **readline:** Node.js module used to read user input from the console.
- **net:** Node.js module that provides functions for working with TCP sockets.
- **@xmpp/client:** XMPP library used to communicate with the XMPP server and manage messaging and presence.

## How to Run the Project

1. Make sure you have Node.js installed on your system. (Recommended Node v18.16.0).
2. Clone the repository or download the project files.
3. Open a terminal and navigate to the project directory.
4. Execute the following command to install dependencies:

   ```bash
   npm install
   ```

5. Run the project with the following command:

   ```bash
   node index.js
   ```

6. Follow the instructions in the console to interact with the application.

