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

// Page Load Initialization
window.addEventListener('load', () => {
    renderUI();
    bootSequence();
    initializeWindowEventDelegation();
    initializeTaskbar();
    initializeDesktopIcons();
});
