document.addEventListener('DOMContentLoaded', () => {

    // 在 DOMContentLoaded 的最開始執行
const savedData = localStorage.getItem('myWarehouseData');
if (savedData) {
    const parsed = JSON.parse(savedData);

}
    // 1. 基本設定

    const totalSlots = 120; // 總儲位

    let usedSlots = 0;      // 初始已用空間 (會根據點亮數自動計算)



    const shelf = document.getElementById('shelf');

    const skuInput = document.querySelector('input[placeholder="掃描或輸入編號"]');

    const storageForm = document.getElementById('storage-form');



    // 2. 更新儀表板

    function updateDashboard() {

        const currentOccupied = document.querySelectorAll('.slot.occupied').length;

        const available = totalSlots - currentOccupied;

        const usagePercent = Math.round((currentOccupied / totalSlots) * 100);



        document.getElementById('total-slots').innerText = totalSlots;

        document.getElementById('pending-orders').innerText = currentOccupied;

        document.getElementById('available-slots').innerText = `${available} (${usagePercent}%)`;

    }



// 3. 生成 120 個貨架格子

function generateShelf() {

    shelf.innerHTML = ''; 

    for (let i = 1; i <= totalSlots; i++) {

        const slot = document.createElement('div');

        slot.classList.add('slot');

        slot.setAttribute('data-id', i);

        

        // --- 加上下面這一行就可以了 ---

        slot.innerText = i; 

        

        slot.title = `貨位 ${i}: 空白`;

        shelf.appendChild(slot);

    }

}
    // 4. 精準點亮邏輯 (核心功能)

    function processInbound(slotNumber) {

        const targetIndex = parseInt(slotNumber);



        // 檢查數字是否有效

        if (isNaN(targetIndex) || targetIndex < 1 || targetIndex > totalSlots) {

            alert(`請輸入正確的貨位編號 (1-${totalSlots})`);

            return;

        }
        const slots = document.querySelectorAll('.slot');

        const targetSlot = slots[targetIndex - 1]; // 陣列從0開始，所以減1



        if (!targetSlot.classList.contains('occupied')) {

            targetSlot.classList.add('occupied');

            targetSlot.title = `貨位 ${targetIndex}: 已佔用`;

            

            updateDashboard(); // 重新計算數字

            console.log(`貨位 ${targetIndex} 點亮成功`);

        } else {

            alert(`警告：貨位 ${targetIndex} 已經有東西了！`);

        }

        

        skuInput.value = ''; // 執行完後清空輸入框

    }



    // 5. 處理表單提交 (手打或掃描觸發)

    storageForm.addEventListener('submit', (e) => {

        e.preventDefault();

        processInbound(skuInput.value);

    });



    // 6. 掃描成功處理

    function onScanSuccess(decodedText) {

        console.log("掃描成功內容: " + decodedText);

        

        // 將掃描內容填入並觸發入庫

        skuInput.value = decodedText;

        if (navigator.vibrate) navigator.vibrate(100); // 震動回饋



        // 直接執行入庫邏輯

        processInbound(decodedText);

    }



    // 7. 初始化掃描器

    let html5QrcodeScanner = new Html5QrcodeScanner(

        "reader", 

        { fps: 10, qrbox: { width: 250, height: 250 } },

        false

   );

    html5QrcodeScanner.render(onScanSuccess);



    // 啟動初始化

    generateShelf();

    updateDashboard();

});