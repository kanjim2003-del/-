document.addEventListener('DOMContentLoaded', () => {
    // 1. 基本設定
    const totalSlots = 120;
    const shelf = document.getElementById('shelf');
    const areaSelect = document.getElementById('area-select');
    
    const materialInput = document.getElementById('material-id'); 
    const slotInput = document.getElementById('slot-input');     
    const storageForm = document.getElementById('storage-form');

    // 【修改點 1】改為物件結構，以便存放「位置:料號」
    let warehouseSystems = { "A": {}, "B": {}, "C": {} };
    
    // 讀取舊有存檔
    const savedData = localStorage.getItem('warehouseData');
    if (savedData) {
        warehouseSystems = JSON.parse(savedData);
    }

    // 3. 更新儀表板
    function updateDashboard() {
        const area = areaSelect.value;
        // 【修改點 2】計算物件的 Key 數量
        const occupied = Object.keys(warehouseSystems[area]).length;
        const available = totalSlots - occupied;
        
        document.getElementById('total-slots').innerText = totalSlots;
        document.getElementById('pending-orders').innerText = occupied;
        document.getElementById('available-slots').innerText = `${available}`;
    }

    // 4. 生成獨立貨架
    function generateShelf() {
        const area = areaSelect.value;
        shelf.innerHTML = ''; 
        document.body.className = `area-${area}`; 

        for (let i = 1; i <= totalSlots; i++) {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.setAttribute('data-id', `${area}-${i}`);
            
            // 【修改點 3】從資料中抓取該位置的料號
            const materialCode = warehouseSystems[area][i]; 
            
            if (materialCode) {
                slot.classList.add('occupied');
                // 將料號顯示在格子裡，編號放上面，料號放下面
                slot.innerHTML = `
                    <strong style="font-size: 10px; word-break: break-all; line-height: 1;">${materialCode}</strong>
        <span style="font-size: 8px; opacity: 0.8; margin-top: 2px;">${i}</span>
    `;
    
    // 為了確保上下排列，我們可以用 JS 直接給這一格加 flex 樣式（或寫在 CSS 裡）
    slot.style.display = "flex";
    slot.style.flexDirection = "column";
    slot.style.justifyContent = "center";
    slot.style.alignItems = "center";
            } else {
                slot.innerText = i; 
            }
            shelf.appendChild(slot);
        }
        updateDashboard();
    }

    // 5. 兩階段入庫執行邏輯
    function processInbound() {
        const area = areaSelect.value;
        const material = materialInput.value;
        const slotNum = slotInput.value.trim(); // 保持字串格式作為物件 Key

        if (!material) {
            alert("請先掃描物料條碼！");
            return;
        }

        const num = parseInt(slotNum);
        if (isNaN(num) || num < 1 || num > totalSlots) {
            alert("請輸入正確的儲位數字 (1-120)！");
            return;
        }

        // 【修改點 4】檢查該位置是否已存有料號
        if (!warehouseSystems[area][slotNum]) {
            // 存入料號
            warehouseSystems[area][slotNum] = material;
            
            // 存檔
            localStorage.setItem('warehouseData', JSON.stringify(warehouseSystems));

            // 【修改點 5】重要：存完後立刻重新生成貨架，料號才會跳出來
            generateShelf();
            
            alert(`成功！物料 ${material} 已存放至 ${area}區-${slotNum}號`);
            
            materialInput.value = '';
            slotInput.value = '';
        } else {
            alert(`警告：${area}區-${slotNum} 已經有東西了！\n內容物：${warehouseSystems[area][slotNum]}`);
        }
    }

    // 6. 掃描成功處理
    function onScanSuccess(decodedText) {
        materialInput.value = decodedText;
        if (navigator.vibrate) navigator.vibrate(100);
        slotInput.focus();
    }

    // 7. 事件監聽
    storageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        processInbound();
    });

    areaSelect.addEventListener('change', generateShelf);

    // 8. 初始化掃描器
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
    );
    html5QrcodeScanner.render(onScanSuccess);

    generateShelf();
    
    // 處理入庫的 API
app.post('/api/inbound', verifyToken, (req, res) => {
    // 從 Token 中取出使用者的角色
    const userRole = req.user.role;

    // 權限檢查邏輯
    if (userRole === 'Admin' || userRole === 'Operator') {
        // 執行入庫程序...
        res.status(200).send("入庫成功");
    } else {
        // 權限不足
        res.status(403).send("錯誤：您沒有權限執行此操作");
    }
});

// 假設登入後取得 userRole
if (userRole !== 'Admin') {
    // 隱藏某些敏感按鈕
    document.getElementById('delete-all-btn').style.display = 'none';
    document.getElementById('admin-panel').innerHTML = "權限不足，無法存取管理面板";
}
});