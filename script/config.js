// Configuration for Windows and Desktop Icons

const windowsConfig = [
    { id: 'photo1', type: 'photo-window', size: 'window-large', title: 'Picture 1', top: 10, left: 50 },
    { id: 'photo2', type: 'photo-window', size: 'window-medium', title: 'Picture 2', top: 10, left: 450 },
    { id: 'photo3', type: 'photo-window', size: 'window-medium', title: 'Picture 3', top: 210, left: 100 },
    { id: 'photo4', type: 'photo-window', size: 'window-large', title: 'Picture 4', top: 310, left: 400 },
    { id: 'photo5', type: 'photo-window', size: 'window-medium', title: 'Picture 5', top: 60, left: 750 },
    { id: 'msg1', type: 'message-window', title: 'ご指導への御礼（三和）', top: 360, left: 150, content: 'pages/miwa.html' },
    { id: 'msg2', type: 'message-window', title: '（木下）', top: 410, left: 600, content: 'pages/kinoshita.html' },
    { id: 'window1', type: 'message-window', title: '本をもとめて', top: 510, left: 700, content: 'pages/mice.html' },
    { id: 'window2', type: 'message-window', title: 'イタリア周辺（2c BC~15c AD）', top: 100, left: 300, content: 'pages/italy.html' },
    { id: 'human', type: 'message-window', title: 'Walking Human', top: 150, left: 150, content: 'pages/human.html' },
    { id: 'nyan_human', type: 'message-window', title: 'Nyan Human', top: 200, left: 200, content: 'pages/nyan_human.html' }
];

const iconsConfig = [
    { label: 'My Computer', img: 'img/icon/computer.png' },
    { label: 'Recycle Bin', img: 'img/icon/recycle.png' },
    { label: 'Message 1', target: 'msg1', img: 'img/icon/message.png' },
    { label: 'Message 2', target: 'msg2', img: 'img/icon/message.png' },
    { label: 'Walking Human', target: 'human', img: 'img/icon/folder.png' },
    { label: 'Nyan Human', target: 'nyan_human', img: 'img/icon/folder.png' },
    { label: '本をもとめて', target: 'window1', img: 'img/icon/folder.png' },
    { label: 'イタリア周辺', target: 'window2', img: 'img/icon/folder.png' },
    { label: 'photo', target: 'photo1,photo2,photo3,photo4,photo5', img: 'img/icon/folder.png' }
];
