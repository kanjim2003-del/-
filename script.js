document.addEventListener('DOMContentLoaded', () => {
    // 1. 基本設定
    const totalSlots = 120;
    const shelf = document.getElementById('shelf');
    const areaSelect = document.getElementById('area-select');
    
    const materialInput = document.getElementById('material-id'); 
    const slotInput = document.getElementById('slot-input');     
    const storageForm = document.getElementById('storage-form');

    // A. 新增管理員狀態變數
    let isAdminMode = false;

    // 2. 獨立系統記憶體
    let warehouseSystems = { "A": {}, "B": {}, "C": {} };
    
    // 讀取舊有存檔
    const savedData = localStorage.getItem('warehouseData');
    if (savedData) {
        warehouseSystems = JSON.parse(savedData);
    }

    // B. 綁定「管理模式」按鈕點擊事件
    const toggleBtn = document.getElementById('toggle-admin');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            isAdminMode = !isAdminMode;
            document.body.classList.toggle('admin-mode'); // 切換 CSS 顯示
            this.innerText = isAdminMode ? "關閉管理模式" : "開啟管理模式";
            this.style.backgroundColor = isAdminMode ? "#555" : "#3498db";
            generateShelf(); // 切換模式時重新渲染，才會出現或隱藏 x 按鈕
        });
    }

    // 3. 更新儀表板
    function updateDashboard() {
        const area = areaSelect.value;
        const occupied = Object.keys(warehouseSystems[area]).length;
        const available = totalSlots - occupied;
        
        document.getElementById('total-slots').innerText = totalSlots;
        document.getElementById('pending-orders').innerText = occupied;
        document.getElementById('available-slots').innerText = `${available}`;
    }

    // 4. 修改後的生成貨架函式 (整合刪除按鈕與點擊邏輯)
    function generateShelf() {
        const area = areaSelect.value;
        shelf.innerHTML = ''; 
        // 根據區域與模式設定背景
        document.body.className = `area-${area}${isAdminMode ? ' admin-mode' : ''}`; 

        for (let i = 1; i <= totalSlots; i++) {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.setAttribute('data-id', `${area}-${i}`);
            
            const materialCode = warehouseSystems[area][i]; 
            
            if (materialCode) {
                slot.classList.add('occupied');
                
                // 插入 HTML，包含刪除按鈕 ×
                slot.innerHTML = `
                    <strong style="font-size: 10px; word-break: break-all; line-height: 1;">${materialCode}</strong>
                    <span style="font-size: 8px; opacity: 0.8; margin-top: 2px;">${i}</span>
                    <div class="delete-icon">×</div>
                `;

                // 排版樣式
                slot.style.display = "flex";
                slot.style.flexDirection = "column";
                slot.style.justifyContent = "center";
                slot.style.alignItems = "center";

                // 點擊格子執行刪除 (僅在管理模式下)
                slot.onclick = () => {
                    if (isAdminMode) {
                        executeDelete(area, i, materialCode);
                    }
                };

                // 右上角 x 按鈕點擊邏輯
                const xBtn = slot.querySelector('.delete-icon');
                xBtn.onclick = (e) => {
                    e.stopPropagation(); // 停止冒泡，避免點到 x 又點到格子
                    executeDelete(area, i, materialCode);
                };

            } else {
                slot.innerText = i;
                slot.onclick = null;
                slot.style.display = "flex"; // 保持空位也是置中排列
            }
            shelf.appendChild(slot);
        }
        updateDashboard();
    }

    // D. 新增刪除執行函式
    function executeDelete(area, slotNum, code) {
        const confirmMsg = `【管理員操作】\n確定要清空 ${area}區-${slotNum} 的物料 [${code}] 嗎？`;
        if (confirm(confirmMsg)) {
            // 1. 從記憶體中移除
            delete warehouseSystems[area][slotNum];

            // 2. 更新 LocalStorage
            localStorage.setItem('warehouseData', JSON.stringify(warehouseSystems));

            // 3. 重新整理貨架與儀表板
            generateShelf();
            console.log(`位置 ${area}-${slotNum} 已釋放`);
        }
    }

    // 5. 兩階段入庫執行邏輯
    function processInbound() {
        const area = areaSelect.value;
        const material = materialInput.value;
        const slotNum = slotInput.value.trim();

        if (!material) {
            alert("請先掃描物料條碼！");
            return;
        }

        const num = parseInt(slotNum);
        if (isNaN(num) || num < 1 || num > totalSlots) {
            alert("請輸入正確的儲位數字 (1-120)！");
            return;
        }

        if (!warehouseSystems[area][slotNum]) {
            warehouseSystems[area][slotNum] = material;
            localStorage.setItem('warehouseData', JSON.stringify(warehouseSystems));
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
});