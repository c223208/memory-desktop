// UI関連。ウィンドウ管理、タスクバー、デスクトップアイコン処理など

// Window Management - Global State
let maxZIndex = 100;
let activeWindowId = null;

// UI Rendering from Config
function renderUI() {
    renderDesktopIcons();
    renderWindows();
}

// Render Desktop Icons
function renderDesktopIcons() {
    const container = document.getElementById('desktop-icons-container');
    if (!container) return;

    iconsConfig.forEach(icon => {
        const div = document.createElement('div');
        div.className = 'desktop-icon';
        if (icon.target) {
            div.setAttribute('data-target', icon.target);
        }
        div.innerHTML = `
            <img src="${icon.img}" alt="${icon.label}" class="icon-img">
            <div class="icon-label">${icon.label}</div>
        `;
        container.appendChild(div);
    });
}

// Render Windows
function renderWindows() {
    const container = document.getElementById('windows-container');
    if (!container) return;

    windowsConfig.forEach(win => {
        const windowDiv = document.createElement('div');
        windowDiv.id = win.id;
        windowDiv.className = `window ${win.type}${win.size ? ' ' + win.size : ''}`;
        windowDiv.style.top = win.top + 'px';
        windowDiv.style.left = win.left + 'px';

        // Create title bar with buttons
        const titleBar = document.createElement('div');
        titleBar.className = 'title-bar';

        const titleText = document.createElement('div');
        titleText.className = 'title-bar-text';
        titleText.textContent = win.title;

        const controls = document.createElement('div');
        controls.className = 'title-bar-controls';

        // Help button (only for message windows)
        if (win.type === 'message-window') {
            const helpBtn = document.createElement('button');
            helpBtn.setAttribute('aria-label', 'Help');
            helpBtn.setAttribute('data-action', 'help');
            helpBtn.setAttribute('data-target', win.id);
            controls.appendChild(helpBtn);
        }

        // Minimize button
        const minBtn = document.createElement('button');
        minBtn.setAttribute('aria-label', 'Minimize');
        minBtn.setAttribute('data-action', 'minimize');
        minBtn.setAttribute('data-target', win.id);
        controls.appendChild(minBtn);

        // Maximize button (only for photo windows)
        if (win.type === 'photo-window') {
            const maxBtn = document.createElement('button');
            maxBtn.setAttribute('aria-label', 'Maximize');
            maxBtn.setAttribute('data-action', 'maximize');
            maxBtn.setAttribute('data-target', win.id);
            controls.appendChild(maxBtn);
        }

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.setAttribute('data-action', 'close');
        closeBtn.setAttribute('data-target', win.id);
        controls.appendChild(closeBtn);

        titleBar.appendChild(titleText);
        titleBar.appendChild(controls);

        windowDiv.appendChild(titleBar);

        // Create window body
        const body = document.createElement('div');
        body.className = `window-body${win.type === 'message-window' ? ' content' : ''}`;
        if (win.content) {
            fetch(win.content)
                .then(res => res.text())
                .then(html => {
                    body.innerHTML = html;
        });
        }
        windowDiv.appendChild(body);

        container.appendChild(windowDiv);
    });
}

// Window Control Event Delegation
function initializeWindowEventDelegation() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const target = btn.dataset.target;

        switch (action) {
            case 'minimize':
                minimizeWindow(target);
                break;
            case 'maximize':
                maximizeWindow(target);
                break;            case 'close':
                closeWindow(target);
                break;
            case 'help':
                goToPage();
                break;
        }
    });
}

// Desktop Icons Initialization
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

// Taskbar Management
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
        // 3. If visible and focused -> Minimize (optional, strictly speaking user asked "become front", but standard OS behavior toggles. I'll stick to focus only based on prompt "Taskbar bar push -> tab becomes front layer")
        
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

// Window Focus Management
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
