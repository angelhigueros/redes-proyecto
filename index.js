
// Proyecto Redes 1
// Angel Higueros - 20460

// LIBS
const readline = require("readline");

// UTILS
const server = 'alumchat.xyz'
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


// MAIN FUNCTIONS
const main = () => {

    // See if the user have an account or if not, create a new one
    console.log("[1] Login")
    console.log("[2] Sign up")
    console.log("[3] Exit")
    
    rl.question('-> Seleccione una opcion', (input) => {

        switch(input) {
            case "1":
                login()
                break
            case "2":
                add_user()
                break
            case "3":
                console.log("[OK] Saliendo del programa\n")
                break
            default:
                console.log("[!] Opcion no valida\n")
                main()
                break
        }
    })
}   


const chat = () => {
    console.log("\n:: CHAT REDES ::\n")
    console.log("[1] Chat")
    console.log("[3] Salir (cerrar sesion)")

    rl.question('-> Seleccione una opcion', (input) => {

        switch(input) {
            case "1":
                chat()
                break
            case "2":
                console.log("[OK] Saliendo del programa\n")
                break
            default:
                console.log("[!] Opcion no valida\n")
                main()
                break
        }

        rl.close();
    })
}

const admin_accounts = () => {
    console.log("\n::ADMINISTRACION ::\n")
    console.log("[1] Registrar una nueva cuenta en el servidor")
    console.log("[2] Iniciar Sesion")
    console.log("[3] Salir")

    rl.question('-> Seleccione una opcion', (input) => {
        switch(input) {
            case "1":
                admin_accounts()
                break
            case "2":
                chat()
                break
            case "3":
                console.log("[OK] Saliendo del programa\n")
                break
            default:
                console.log("[!] Opcion no valida\n")
                main()
                break
        }

        rl.close();
    })
}


const comunication = () => {
    
}


// ADMIN FUNCTIONS
const login = () => {

}

const logout = () => {
    
}

const add_user = () => {
    
}

const remove_user = () => {
    
}


// COMUNICATION FUNCTIONS
const show_all_users = () => {

}

const add_user_list = () => {
    
}

const show_user_details = () => {
    
}

const start_one_one = () => {
    
}


const join_group = () => {
    
}

const set_main_message = () => {
    
}


const sent_notification = () => {
    
}


const sent_files = () => {
    
}

main()