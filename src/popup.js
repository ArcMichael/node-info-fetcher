// src/popup.js
function bindMessageButtonDynamic(key, label) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    if (!tab?.id) return;

    chrome.tabs.sendMessage(
      tab.id,
      { action: "check_field", key, label },
      function (res) {
        console.log("chrome.tabs.sendMessage", res);

        const fieldTitle = document.getElementById("fieldTitle");
        const asIsTextarea = document.getElementById("asIsValue");
        const toBeTextarea = document.getElementById("toBeValue");
        const applyBtn = document.getElementById("applyChange"); // ✅ 获取按钮

        fieldTitle.textContent = label;

        if (res?.success) {
          console.log("🌟 popup 收到有效值：", res.value);
          asIsTextarea.value = res.value || "";
          toBeTextarea.value = res.value || "";
          applyBtn.dataset.key = key; // ✅ 关键：把 key 存起来供“修改”按钮用
        } else {
          asIsTextarea.value = "";
          toBeTextarea.value = "";
          applyBtn.dataset.key = ""; // ✅ 清空防误触
          console.warn("❌ popup 失败信息：", res?.error);
        }
      }
    );
  });
}

// ✅ DOM 绑定逻辑
document.addEventListener("DOMContentLoaded", function () {
  const applyBtn = document.getElementById("applyChange");

  document.querySelectorAll(".check-item").forEach((item) => {
    const key = item.dataset.key;
    const label = item.dataset.label;

    item.addEventListener("click", () => {
      bindMessageButtonDynamic(key, label);
    });
  });

  applyBtn.addEventListener("click", function () {
    const key = applyBtn.dataset.key;
    const newVal = document.getElementById("toBeValue").value;

    if (!key) {
      alert("请先选择字段再修改！");
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        { action: "check_field", key: key, value: newVal },
        function (res) {
          if (res?.success) {
            alert("✅ 修改成功！");
          } else {
            alert("❌ 修改失败：" + (res?.error || "未知原因"));
          }
        }
      );
    });
  });
});
