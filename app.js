const readline = require('readline');
const fs = require('fs');
const http = require('http');

const html = fs.readFileSync('./index.html', 'utf-8');
const openHtmlTemplate = fs.readFileSync('./open.html', 'utf-8');
const port = 2000;

const server = http.createServer((request, response) => {
    let path = request.url;

    if (request.method === 'POST' && path.toLowerCase() === '/submit') {
        let body = '';

        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', () => {
            const formData = JSON.parse(body);
            storeFormData(formData);

            response.writeHead(302, { 'Location': '/open' });
            response.end();
        });
    } else if (request.method === 'POST' && path.toLowerCase() === '/edit-json-data') {
        let body = '';

        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', () => {
            try {
                const editData = JSON.parse(body);
                editDataInJson(editData);
                response.writeHead(200);
                response.end('Data edited successfully.');
            } catch (error) {
                console.error('Error parsing edit data:', error);
                response.writeHead(400);
                response.end('Bad Request');
            }
        });
    } else if (path === '/' || path.toLowerCase() === '/home') {
        response.writeHead(200);
        response.end(html.replace('{{%CONTENT%}}', 'You are in homepage'));
    } else if (path.toLowerCase() === '/submit') {
        response.writeHead(200);
        response.end(openHtmlTemplate.replace('{{%CONTENT%}}', 'You are in submit page'));
    } else if (path.toLowerCase() === '/open') {
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.end(openHtmlTemplate);
    } else if (path.toLowerCase() === '/get-json-data') {
        const dataFilePath = './pk.json';

        try {
            const jsonData = fs.readFileSync(dataFilePath, 'utf-8');
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(jsonData);
        } catch (error) {
            console.error('Error reading data file:', error);
            response.writeHead(500);
            response.end('Internal Server Error');
        }
    } else if (path.toLowerCase() === '/delete-json-data') {
        if (request.method === 'POST') {
            let body = '';

            request.on('data', chunk => {
                body += chunk.toString();
            });

            request.on('end', () => {
                try {
                    const deleteData = JSON.parse(body);
                    deleteDataFromJson(deleteData);
                    response.writeHead(200);
                    response.end('Data deleted successfully.');
                } catch (error) {
                    console.error('Error parsing delete data:', error);
                    response.writeHead(400);
                    response.end('Bad Request');
                }
            });
        } else {
            response.writeHead(400);
            response.end('Bad Request');
        }
    } else {
        response.writeHead(404);
        response.end(html.replace('{{%CONTENT%}}', 'Error: 404 Page not found'));
    }
});

server.listen(port, () => {
    console.log('Server has started');
});

function storeFormData(formData) {
    const dataFilePath = './pk.json';

    try {
        let data = [];
        if (fs.existsSync(dataFilePath)) {
            data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
        }

        data.push(formData);

        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing data file:', error);
    }
}

function deleteDataFromJson(deleteData) {
    const dataFilePath = './pk.json';

    try {
        let data = [];
        if (fs.existsSync(dataFilePath)) {
            data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
        }

        // Find and remove the data to be deleted
        data = data.filter(item => item.id !== deleteData.id);

        // Update the JSON file
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error deleting data:', error);
    }
}

function editDataInJson(editData) {
    const dataFilePath = './pk.json';

    try {
        let data = [];
        if (fs.existsSync(dataFilePath)) {
            data = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
        }

        // Find and update the data
        const dataIndex = data.findIndex(item => item.id === editData.id);
        if (dataIndex !== -1) {
            data[dataIndex] = editData.newItem;
        }

        // Update the JSON file
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error editing data:', error);
    }
}