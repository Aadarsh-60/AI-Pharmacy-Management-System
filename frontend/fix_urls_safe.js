const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Do not replace in utils/axios.js and context/SocketContext.js as they handle it correctly already
            if (fullPath.includes('utils/axios.js') || fullPath.includes('SocketContext.js')) {
                continue;
            }

            const regex = /(['"`])http:\/\/localhost:5000([^'"`\n]*)\1/g;
            if (regex.test(content)) {
                content = content.replace(regex, '`${process.env.REACT_APP_API_URL}$2`');
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory('./src');
