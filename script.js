// BIOS Boot Sequence Logic
const bootSequence = async () => {
    const output = document.getElementById('boot-content');
    const bootScreen = document.getElementById('boot-screen');
    const cursor = document.getElementById('boot-cursor');
    
    // ヘルパー: テキストを追加して改行
    const printLine = (text) => {
        const p = document.createElement('div');
        // 空行の場合は &nbsp; を入れて高さを確保
        p.innerHTML = text === "" ? "&nbsp;" : text;
        output.appendChild(p);
        window.scrollTo(0, document.body.scrollHeight);
    };

    // ヘルパー: 指定ミリ秒待機
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // ヘルパー: 直前の行にテキストを追記
    const appendToLastLine = (text) => {
        const lastLine = output.lastElementChild;
        if (lastLine) {
            lastLine.innerHTML += text;
        }
    };

    // --- Boot Sequence Start ---

    // 1. Initial Header
    printLine("Award Modular BIOS v4.51PG, An Energy Star Ally");
    printLine("Copyright (C) 1984-1998, Award Software, Inc.");
    printLine("");
    printLine("PENTIUM-MMX CPU at 233MHz");
    
    // 2. Memory Test Animation
    const memLine = document.createElement('div');
    output.appendChild(memLine);
    
    let memory = 0;
    const maxMemory = 65536; // 64MB
    const step = 2048; // Count speed
    
    while (memory <= maxMemory) {
        memLine.innerHTML = `Memory Test : ${memory}K OK`;
        memory += step;
        await wait(20); // Speed of counting
    }
    await wait(400);

    printLine("");
    printLine("Award Plug and Play BIOS Extension v1.0A");
    printLine("Initialize Plug and Play Cards...");
    await wait(600);
    printLine("PNP Init Completed");
    printLine("");

    // 3. Drive Detection
    printLine("Detecting HDD Primary Master ...");
    await wait(800); // Wait for HDD spin up
    appendToLastLine(" WDC AC36400L"); // Found logic
    
    printLine("Detecting HDD Primary Slave  ...");
    await wait(300);
    appendToLastLine(" None");

    printLine("Detecting HDD Secondary Master ...");
    await wait(300);
    appendToLastLine(" TSSTcorp CDDVDW");

    printLine("Detecting HDD Secondary Slave  ...");
    await wait(200);
    appendToLastLine(" None");

    printLine("");
    await wait(1000);
    
    // 4. Finalizing
    printLine("Verifying DMI Pool Data ........");
    await wait(800);
    appendToLastLine(" Update Success");
    printLine("Boot from ATAPI CD-ROM : Failure"); 
    printLine("Starting Windows 98...");
    
    // 5. Fade out
    await wait(1500);
    cursor.style.display = 'none'; // Stop cursor
    bootScreen.style.transition = 'opacity 0.5s ease-out';
    bootScreen.style.opacity = '0';
    
    setTimeout(() => {
        bootScreen.style.display = 'none';
    }, 500);
};

// Start boot sequence on load
window.addEventListener('load', bootSequence);


// Clock Logic
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; 
    
    const timeString = `${hours}:${minutes} ${ampm}`;
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.innerText = timeString;
    }
}
setInterval(updateClock, 1000);
updateClock(); 

// Window Dragging Logic
const windows = document.querySelectorAll('.window');
let maxZIndex = 100;

windows.forEach(win => {
    const titleBar = win.querySelector('.title-bar');
    let isDragging = false;
    let offsetX, offsetY;

    const bringToFront = () => {
        maxZIndex++;
        win.style.zIndex = maxZIndex;
    };

    titleBar.addEventListener('mousedown', (e) => {
        if(e.target.tagName === 'BUTTON') return;
        bringToFront();
        isDragging = true;
        const rect = win.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        win.style.left = (e.clientX - offsetX) + 'px';
        win.style.top = (e.clientY - offsetY) + 'px';
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    win.addEventListener('mousedown', bringToFront);
});

// Window Controls
function closeWindow(id) {
    const targetWindow = document.getElementById(id);
    if (targetWindow) targetWindow.style.display = 'none';
}

function restoreWindow(id) {
    const targetWindow = document.getElementById(id);
    if (targetWindow) {
        targetWindow.style.display = 'flex';
        maxZIndex++;
        targetWindow.style.zIndex = maxZIndex;
    }
}

function goToPage() {
    alert('ページ移動');
}