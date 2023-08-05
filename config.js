import readline from 'readline'
import net from 'net'

export const SERVER = 'alumchat.xyz'
export const PORT = '522'
export const CLIENT = new net.Socket()
export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})