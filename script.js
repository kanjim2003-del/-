document.addEventListener('DOMContentLoaded', () => {
    // 1. 基本設定
    const totalSlots = 120;
    const shelf = document.getElementById('shelf');
    const areaSelect = document.getElementById('area-select');
    const materialInput = document.getElementById('material-id'); 
    const slotInput = document.getElementById('slot-input');     
    const storageForm = document.getElementById('storage-form');

    let isAdminMode = false;
    let warehouseSystems = { "A": {}, "B": {}, "C": {} };
    
    // 2. 讀取存檔
    function loadData() {
        const savedData = localStorage.getItem('warehouseData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.A && parsed.B && parsed.C) {
                    warehouseSystems = parsed;
                }
            } catch (e) {
                console.error("存檔損毀，重新初始化", e);
            }
        }
    }
    loadData();

    // 3. 更新儀表板 (嚴格計數：過濾掉空資料與超出範圍的 Key)
    function updateDashboard() {
        const area = areaSelect.value;
        const occupiedKeys = Object.keys(warehouseSystems[area]).filter(key => {
            const num = parseInt(key);
            const content = warehouseSystems[area][key];
            return num >= 1 && num <= totalSlots && content && content.trim() !== ""; 
        });

        const occupied = occupiedKeys.length;
        const available = Math.max(0, totalSlots - occupied);
        
        document.getElementById('total-slots').innerText = totalSlots;
        document.getElementById('pending-orders').innerText = occupied;
        document.getElementById('available-slots').innerText = available;
    }

    // 4. 生成貨架
    function generateShelf() {
        const area = areaSelect.value;
        shelf.innerHTML = ''; 
        document.body.className = `area-${area}${isAdminMode ? ' admin-mode' : ''}`; 

        for (let i = 1; i <= totalSlots; i++) {
            const slot = document.createElement('div');
            slot.classList.add('slot');
            slot.setAttribute('data-id', `${area}-${i}`);
            
            const materialCode = warehouseSystems[area][i.toString()]; 
            
            if (materialCode && materialCode.trim() !== "") {
                slot.classList.add('occupied');
                slot.innerHTML = `
                    <strong style="font-size: 10px; word-break: break-all; line-height: 1;">${materialCode}</strong>
                    <span style="font-size: 8px; opacity: 0.8; margin-top: 2px;">${i}</span>
                    <div class="delete-icon">×</div>
                `;

                // 只針對 X 按鈕設定點擊事件，並阻止冒泡
                const xBtn = slot.querySelector('.delete-icon');
                xBtn.onclick = (e) => {
                    e.stopPropagation(); 
                    if (isAdminMode) {
                        executeDelete(area, i.toString(), materialCode);
                    } else {
                        alert("請先開啟管理模式才能執行刪除！");
                    }
                };
            } else {
                slot.innerText = i;
            }
            shelf.appendChild(slot);
        }
        updateDashboard();
    }

    // 5. 刪除執行
    function executeDelete(area, slotNum, code) {
        if (confirm(`【管理員】確定要清空 ${area}區-${slotNum} 的物料 [${code}] 嗎？`)) {
            delete warehouseSystems[area][slotNum];
            localStorage.setItem('warehouseData', JSON.stringify(warehouseSystems));
            generateShelf();
        }
    }

    // 6. 入庫邏輯
    function processInbound() {
        const area = areaSelect.value;
        const material = materialInput.value.trim();
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

        // 檢查儲位是否真的沒人佔用
        if (!warehouseSystems[area][slotNum] || warehouseSystems[area][slotNum].trim() === "") {
            warehouseSystems[area][slotNum] = material;
            localStorage.setItem('warehouseData', JSON.stringify(warehouseSystems));
            generateShelf();
            
            // 清空輸入並讓焦點回到掃描器（如果需要連續操作）
            materialInput.value = '';
            slotInput.value = '';
        } else {
            alert(`警告：儲位 ${area}-${slotNum} 已有物料！`);
        }
    }

    // 7. 掃描成功處理
    function onScanSuccess(decodedText) {
        if (navigator.vibrate) navigator.vibrate(100); // 震動回饋
        materialInput.value = decodedText;
        slotInput.focus(); // 掃描完自動跳到儲位輸入，提升效率
    }

    // 8. 初始化掃描器
    let html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false
    );
    html5QrcodeScanner.render(onScanSuccess);

    // 9. 按鈕與下拉選單事件
    const toggleBtn = document.getElementById('toggle-admin');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            isAdminMode = !isAdminMode;
            document.body.classList.toggle('admin-mode');
            this.innerText = isAdminMode ? "關閉管理模式" : "開啟管理模式";
            generateShelf(); 
        });
    }

    storageForm.addEventListener('submit', (e) => { 
        e.preventDefault(); 
        processInbound(); 
    });

    areaSelect.addEventListener('change', generateShelf);

    // 初始執行
    generateShelf();
});