

const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');

const {app, BrowserWindow, Menu, ipcMain, dialog} = electron;

// Set Environment
//process.env.NODE_ENV ='production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on('ready', function(){
    // create new window
    mainWindow = new BrowserWindow({});
    // load the html file into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    // build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
function createAddWindow(){
// create new window
addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
});
// load the html file into window
addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
}));
// Garbage collection handle
    addWindow.on('close', function(){
      addWindow = null;
    });
}

// Catch item add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item); // send to mainWindow.html to deal with
    addWindow.close();
});

// Save File



function saveToFile(){
    mainWindow.webContents.send('item:save');

    ipcMain.on('item:save', function(e, item){
        let lyrics = item;
        console.log(lyrics)

// write to a new file
fs.writeFile('saves/shopping_list.txt', lyrics, (err) => {  
    // throws an error, you could also catch it here
    if (err) throw err;

    // success case, the file was saved
    console.log('Lyric saved!');
    dialog.showMessageBox({
        type: "info",
        title: "File Saved!",
        message: "Successfully saved to file!"
    });
});
    });
}
// create menu template
const mainMenuTemplate = [
    {
        label:'File', 
        submenu:[
            {
                label:'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label:'Clear Item',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Save File',
                click(){
                    saveToFile();
                }
            },
            /*{
                label: 'Load File',
                click(){
                    loadFromFile();
                }
            },*/
            {
                label:'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q':'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

// Add developer tools item if in dev
if(process.env.NODE_ENV != 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I':'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools(); 
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}