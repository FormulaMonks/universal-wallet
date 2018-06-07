const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');
const localtunnel = require('localtunnel');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow(url) {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    fullscreenable: false,
  });

  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });
  win.loadURL(startUrl + '/?url=' + url);

  // Emitted when the window is closed.
  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', () => {
  const { SUBDOMAIN } = process.env;
  const opts = SUBDOMAIN ? { subdomain: SUBDOMAIN } : {};
  localtunnel(8888, opts, (err, { url }) => {
    if (!err) {
      createWindow(url);
    }
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
