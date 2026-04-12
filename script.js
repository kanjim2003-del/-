document.addEventListener('DOMContentLoaded', () => {
    // 1. 基本設定
    const totalSlots = 120;
    const shelf = document.getElementById('shelf');
    const areaSelect = document.getElementById('area-select');
    
    // 取得新的兩個欄位與按鈕
    const materialInput = document.getElementById('material-id'); // 物料欄 (唯讀)
    const slotInput = document.getElementById('slot-input');     // 儲位欄 (手打)
    const storageForm = document.getElementById('storage-form');

    // 2. 獨立系統記憶體 (使用 localStorage 實現本地存檔，重新整理也不會消失)
    let warehouseSystems = { "A": new Set(), "B": new Set(), "C": new Set() };
    
    // 讀取舊有存檔
    const savedData = localStorage.getItem('warehouseData');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        // 將陣列轉回 Set 結構
        Object.keys(parsed).forEach(k => warehouseSystems[k] = new Set(parsed[k]));
    }

    // 3. 更新儀表板
    function updateDashboard() {
        const area = areaSelect.value;
        const occupied = warehouseSystems[area].size;
        const available = totalSlots - occupied;
        
        document.getElementById('total-slots').innerText = totalSlots;
        document.getElementById('pending-orders').innerText = occupied;
        document.getElementById('available-slots').innerText = `${available} (${Math.round(occupied/totalSlots*100)}%)`;
    }

    // 4. 生成獨立貨架並根據區域變色
    function generateShelf() {
        const area = areaSelect.value;
        shelf.innerHTML = ''; 
        document.body.className = `area-${area}`; // 切換背景 Class

        for (let i = 1; i <= totalSlots; i++) {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.setAttribute('data-id', `${area}-${i}`); // ID 格式為 A-1, B-1...
            slot.innerText = i; 
            
            // 檢查該區域此位置是否已被佔用
            if (warehouseSystems[area].has(i)) {
                slot.classList.add('occupied');
            }
            shelf.appendChild(slot);
        }
        updateDashboard();
    }

    // 5. 兩階段入庫執行邏輯
    function processInbound() {
        const area = areaSelect.value;
        const material = materialInput.value;
        const slotNum = parseInt(slotInput.value);

        // 檢查物料是否已掃描
        if (!material) {
            alert("請先掃描物料條碼！");
            return;
        }

        // 檢查位置是否有效
        if (isNaN(slotNum) || slotNum < 1 || slotNum > totalSlots) {
            alert("請輸入正確的儲位數字 (1-120)！");
            return;
        }

        // 檢查該區域位置是否重複
        if (!warehouseSystems[area].has(slotNum)) {
            // 存入 Set
            warehouseSystems[area].add(slotNum);
            
            // 永久存檔到瀏覽器
            const exportData = {};
            Object.keys(warehouseSystems).forEach(k => exportData[k] = Array.from(warehouseSystems[k]));
            localStorage.setItem('warehouseData', JSON.stringify(exportData));

            // 更新畫面顯示
            const targetSlot = document.querySelector(`.slot[data-id="${area}-${slotNum}"]`);
            if (targetSlot) targetSlot.classList.add('occupied');
            
            updateDashboard();
            alert(`成功！物料 ${material} 已存放至 ${area}區-${slotNum}號`);
            
            // 清空欄位供下次使用
            materialInput.value = '';
            slotInput.value = '';
        } else {
            alert(`警告：${area}區-${slotNum} 已經有東西了！`);
        }
    }

    // 6. 掃描成功處理：只填入物料欄
    function onScanSuccess(decodedText) {
        console.log("掃描成功內容: " + decodedText);
        materialInput.value = decodedText;
        if (navigator.vibrate) navigator.vibrate(100);

        // 掃描完自動聚焦到儲位輸入框，讓你直接打字
        slotInput.focus();
    }

    // 7. 事件監聽
    // 監聽表單提交 (或是按下確認按鈕)
    storageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        processInbound();
    });

    // 監聽區域選單切換
    areaSelect.addEventListener('change', generateShelf);

    // 8. 初始化掃描器
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
    );
    html5QrcodeScanner.render(onScanSuccess);

    // 啟動初始化
    generateShelf();
});