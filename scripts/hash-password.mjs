import {randomBytes,scryptSync} from 'node:crypto';
// Password enters via stdin, never command-line arguments or shell history.
let password='';for await(const part of process.stdin)password+=part;
password=password.replace(/\r?\n$/,'');
if(password.length<16)throw Error('Use a unique password of at least 16 characters');
const salt=randomBytes(16).toString('hex');
console.log(JSON.stringify({salt,passwordHash:scryptSync(password,salt,64).toString('hex')}));
