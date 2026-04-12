document.addEventListener('DOMContentLoaded', () => {
    const shelf = document.getElementById('shelf');
    
    // 模擬生成 100 個貨位
    for (let i = 1; i <= 100; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        
        // 隨機模擬已佔用的位置
        if (Math.random() > 0.8) {
            slot.classList.add('occupied');
            slot.title = `貨位 ${i}: 已佔用`;
        } else {
            slot.title = `貨位 ${i}: 空白`;
        }
        
        shelf.appendChild(slot);
    }

    // 表單提交處理
    document.getElementById('storage-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('入庫指令已發送至 AGV 無人搬運車！');
    });
});