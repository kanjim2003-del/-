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
    function onScanSuccess(decodedText, decodedResult) {
        // 1. 將掃描到的文字填入輸入框
        document.querySelector('input[placeholder="掃描或輸入編號"]').value = decodedText;
        
        // 2. 提示掃描成功
        alert("掃描成功！貨號：" + decodedText);
        
        // 3. (選用) 掃描成功後停止鏡頭以節省電力
        html5QrcodeScanner.clear();
    }
    
    // 初始化掃描器
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: {width: 250, height: 250} },
        /* verbose= */ false
    );
    
    // 啟動掃描
    html5QrcodeScanner.render(onScanSuccess);

    // 表單提交處理
    document.getElementById('storage-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('入庫指令已發送！');
    });
});