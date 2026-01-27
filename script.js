// BIOS Boot Sequence Logic
const bootSequence = async () => {
    const output = document.getElementById('boot-content');
    const bootScreen = document.getElementById('boot-screen');
    const cursor = document.getElementById('boot-cursor');
    
    const printLine = (text) => {
        const p = document.createElement('div');
        p.innerHTML = text === "" ? "&nbsp;" : text;
        output.appendChild(p);
        // Scroll the boot screen container, not the window
        bootScreen.scrollTop = bootScreen.scrollHeight; 
    };

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const appendToLastLine = (text) => {
        const lastLine = output.lastElementChild;
        if (lastLine) {
            lastLine.innerHTML += text;
        }
    };

    // --- Boot Sequence Start ---
    printLine("Award Modular BIOS v4.51PG, An Energy Star Ally");
    printLine("Copyright (C) 1984-1998, Award Software, Inc.");
    printLine("");
    printLine("PENTIUM-MMX CPU at 233MHz");
    
    const memLine = document.createElement('div');
    output.appendChild(memLine);
    
    let memory = 0;
    const maxMemory = 65536; 
    const step = 2048; 
    
    while (memory <= maxMemory) {
        memLine.innerHTML = `Memory Test : ${memory}K OK`;
        memory += step;
        await wait(20); 
    }
    await wait(400);

    printLine("");
    printLine("Award Plug and Play BIOS Extension v1.0A");
    printLine("Initialize Plug and Play Cards...");
    await wait(600);
    printLine("PNP Init Completed");
    printLine("");

    printLine("Detecting HDD Primary Master ...");
    await wait(800); 
    appendToLastLine(" WDC AC36400L");
    
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
    
    printLine("Verifying DMI Pool Data ........");
    await wait(800);
    appendToLastLine(" Update Success");
    printLine("Boot from ATAPI CD-ROM : Failure"); 
    printLine("Starting Windows 98...");
    
    await wait(1500);
    cursor.style.display = 'none'; 
    bootScreen.style.transition = 'opacity 0.5s ease-out';
    bootScreen.style.opacity = '0';
    
    setTimeout(() => {
        bootScreen.style.display = 'none';
    }, 500);
};

window.addEventListener('load', () => {
    bootSequence();
    initializeTaskbar();
    initializeDesktopIcons();
});

function initializeDesktopIcons() {
    const icons = document.querySelectorAll('.desktop-icon');
    
    // Global deselect on background click
    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.desktop-icon')) {
            document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        }
    });

    icons.forEach(icon => {
        // Selection Logic
        icon.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Prevent global deselect
            
            // Deselect all others (Single select behavior)
            // Note: Use document.querySelectorAll to ensure we catch all, even if variable 'icons' is stale (though here it's fine)
            document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
            
            icon.classList.add('selected');
        });

        // Open Logic
        icon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            icon.classList.remove('selected'); // Auto deselect on open
            const targetId = icon.getAttribute('data-target');
            if (targetId) {
                // If it's a window ID
                if (document.getElementById(targetId)) {
                    restoreWindow(targetId);
                } else {
                    // Fallback for icons without windows (just purely decorative or logs)
                    console.log(`Open: ${targetId}`);
                }
            }
        });
    });
}


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

// Window Management
let maxZIndex = 100;
let activeWindowId = null;

// Initialize Taskbar and Windows
function initializeTaskbar() {
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        if (!win.id) return; // Skip if no ID
        
        // Ensure clicking window brings to front
        win.addEventListener('mousedown', () => {
            focusWindow(win.id);
        });

        // Add to taskbar if visible
        if (win.style.display !== 'none') {
            addTaskbarItem(win.id);
        }

        // Initial state: inactive
        const titleBar = win.querySelector('.title-bar');
        if (titleBar) titleBar.classList.add('inactive');

        // Bind Maximize Button Dynamically
        const maxBtn = win.querySelector('button[aria-label="Maximize"]');
        if (maxBtn) {
            maxBtn.onclick = () => maximizeWindow(win.id);
        }
    });
}

function addTaskbarItem(id) {
    const taskbarContainer = document.getElementById('taskbar-items');
    // Prevent duplicates
    if (document.getElementById(`task-btn-${id}`)) return;

    const win = document.getElementById(id);
    const titleText = win.querySelector('.title-bar-text').innerText;
    
    // Choose icon based on window type (simple heuristic)
    let iconSrc = 'img/icon/folder.png';
    if (id.includes('photo')) iconSrc = 'img/icon/computer.png';

    const btn = document.createElement('button');
    btn.className = 'task-button';
    btn.id = `task-btn-${id}`;
    btn.innerHTML = `<img src="${iconSrc}" style="width:20px; height:20px; margin-right:4px; flex-shrink:0;"><b>${titleText}</b>`;
    
    btn.onclick = () => {
        const targetWindow = document.getElementById(id);
        
        // Logic:
        // 1. If minimized (display:none) -> Show and Focus
        // 2. If visible but not focused -> Focus
        // 3. If visible and focused -> Minimize (optional, strictly speaking user asked "become front", but standard OS behavior toggles. I'll stick to focus only based on prompt "become front")
        
        if (targetWindow.style.display === 'none') {
            restoreWindow(id);
        } else {
             // Optional: If already top, minimize? No, user explicitly asked "Taskbar bar push -> tab becomes front layer"
             focusWindow(id);
        }
    };

    taskbarContainer.appendChild(btn);
}

function removeTaskbarItem(id) {
    const btn = document.getElementById(`task-btn-${id}`);
    if (btn) btn.remove();
}

function focusWindow(id) {
    const targetWindow = document.getElementById(id);
    const taskBtn = document.getElementById(`task-btn-${id}`);
    
    // Deactivate all windows first
    document.querySelectorAll('.window').forEach(w => {
        const tb = w.querySelector('.title-bar');
        if (tb) tb.classList.add('inactive');
    });

    if (targetWindow) {
        maxZIndex++;
        targetWindow.style.zIndex = maxZIndex;
        activeWindowId = id;
        
        // Activate current window
        const currentTitleBar = targetWindow.querySelector('.title-bar');
        if (currentTitleBar) currentTitleBar.classList.remove('inactive');
        
        // Update taskbar visual state
        document.querySelectorAll('.task-button').forEach(b => {
            b.classList.remove('active');
            b.style.background = '#c0c0c0';
            b.style.border = '2px outset #fff';
        });
        
        if (taskBtn) {
            taskBtn.classList.add('active');
            // Pressed state style
            taskBtn.style.background = '#e0e0e0'; // Slightly lighter or dithered pattern in win98
            taskBtn.style.border = '2px inset #fff';
        }
    }
}

// Window Controls
function closeWindow(id) {
    const targetWindow = document.getElementById(id);
    if (targetWindow) {
        targetWindow.style.display = 'none';
        removeTaskbarItem(id);
    }
}

function minimizeWindow(id) {
    const targetWindow = document.getElementById(id);
    if (targetWindow) {
        targetWindow.style.display = 'none';
        // Keep taskbar item, but remove active state
        const taskBtn = document.getElementById(`task-btn-${id}`);
        if (taskBtn) {
            taskBtn.classList.remove('active');
            taskBtn.style.background = '#c0c0c0';
            taskBtn.style.border = '2px outset #fff';
        }
    }
}

function maximizeWindow(id) {
    const targetWindow = document.getElementById(id);
    if (targetWindow) {
        targetWindow.classList.toggle('maximized');
        focusWindow(id);
    }
}

function restoreWindow(id) {
    const targetWindow = document.getElementById(id);
    if (targetWindow) {
        targetWindow.style.display = 'flex';
        // If it wasn't in taskbar (e.g. was closed), add it
        addTaskbarItem(id);
        focusWindow(id);
    }
}

function goToPage() {
    alert('ページ移動');
}

// Window Dragging Logic
const windows = document.querySelectorAll('.window');

windows.forEach(win => {
    const titleBar = win.querySelector('.title-bar');
    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener('mousedown', (e) => {
        if(e.target.tagName === 'BUTTON') return;
        if(win.classList.contains('maximized')) return; // Prevent drag if maximized

        e.preventDefault(); // Prevent text selection and default drag behaviors
        // focusWindow is handled by win.mousedown
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
});
