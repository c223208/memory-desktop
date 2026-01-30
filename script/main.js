// 初期化、時計更新、ウィンドウドラッグ処理など

// Clock Update Logic
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
let isWindowDragging = false;
let dragTargetWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

document.addEventListener('mousedown', (e) => {
    const titleBar = e.target.closest('.title-bar');
    if (!titleBar) return;
    
    // タイトルバー内のボタン（閉じる等）をクリックした場合は無視
    if (e.target.tagName === 'BUTTON') return;

    const win = titleBar.closest('.window');
    if (!win) return;

    // 最大化されている場合はドラッグさせない
    if (win.classList.contains('maximized')) return;

    e.preventDefault();
    isWindowDragging = true;
    dragTargetWindow = win;
    
    const rect = win.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
});

document.addEventListener('mousemove', (e) => {
    if (!isWindowDragging || !dragTargetWindow) return;
    
    dragTargetWindow.style.left = (e.clientX - dragOffsetX) + 'px';
    dragTargetWindow.style.top = (e.clientY - dragOffsetY) + 'px';
});

document.addEventListener('mouseup', () => {
    isWindowDragging = false;
    dragTargetWindow = null;
});

// Touch Events for Mobile Dragging
document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const titleBar = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.title-bar');
    
    if (!titleBar) return;
    
    // Check if a button was touched
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (targetElement.tagName === 'BUTTON') return;

    const win = titleBar.closest('.window');
    if (!win) return;

    if (win.classList.contains('maximized')) return;

    // Prevent default scrolling behavior while dragging window
    // Note: We might want to be careful not to block scrolling of content if not dragging title bar
    // But since we checked for titleBar, it's safer to prevent default here to stop scrolling the body
    // However, passive listeners are default now, so e.preventDefault might fail if not set up correctly.
    // For now, we focus on the logic.
    
    isWindowDragging = true;
    dragTargetWindow = win;
    
    const rect = win.getBoundingClientRect();
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (!isWindowDragging || !dragTargetWindow) return;
    e.preventDefault(); // Stop scrolling
    
    const touch = e.touches[0];
    dragTargetWindow.style.left = (touch.clientX - dragOffsetX) + 'px';
    dragTargetWindow.style.top = (touch.clientY - dragOffsetY) + 'px';
}, { passive: false });

document.addEventListener('touchend', () => {
    isWindowDragging = false;
    dragTargetWindow = null;
});

// Page Load Initialization
window.addEventListener('load', () => {
    renderUI();
    bootSequence();
    initializeWindowEventDelegation();
    initializeTaskbar();
    initializeDesktopIcons();
});
