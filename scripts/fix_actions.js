const fs = require('fs');
const path = require('path');

const actionsPath = path.join(__dirname, '../src/app/actions.ts');
let code = fs.readFileSync(actionsPath, 'utf8');

// Fix getSettings
code = code.replace(/export async function getSettings\(\) \{/, `export async function getSettings(forceEventId?: string) {`);
code = code.replace(/const eventId = await getActiveEventId\(\);/, `const eventId = forceEventId || await getActiveEventId();`);

// Fix getGifts
code = code.replace(/export async function getGifts\(\) \{/, `export async function getGifts(forceEventId?: string) {`);
code = code.replace(/const eventId = await getActiveEventId\(\);/g, `const eventId = forceEventId || await getActiveEventId();`);

// Fix getRecentMessages
code = code.replace(/export async function getRecentMessages\(forAdmin = false\) \{/, `export async function getRecentMessages(forAdmin = false, forceEventId?: string) {`);

fs.writeFileSync(actionsPath, code, 'utf8');
console.log('actions.ts signatures fixed.');
