// src/popup.js

// ========== 工具函数 ==========
function showError(msg) {
  const box = document.getElementById("errorBox");
  box.textContent = msg;
  box.style.display = "block";
}

function clearError() {
  const box = document.getElementById("errorBox");
  box.textContent = "";
  box.style.display = "none";
}

// ========== 主功能入口 ==========
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
        const applyBtn = document.getElementById("applyChange");

        fieldTitle.textContent = label;

        if (res?.success) {
          clearError();
          asIsTextarea.value = res.value || "";
          toBeTextarea.value = res.value || "";
          applyBtn.dataset.key = key;

          // 🔒 HTTPS 校验（仅对链接类字段生效）
          if (key === "activeUrl" && res.value) {
            const isHttps = /^https:\/\//.test(res.value);
            if (!isHttps) {
              showError("⚠️ 当前链接不是 HTTPS，可能存在跳转风险");
            }
          }

          // 🔒 HTTPS 校验（仅对链接类字段生效）
          if (key === "activeH5Url" && res.value) {
            const isHttps = /^https:\/\//.test(res.value);
            if (!isHttps) {
              showError("⚠️ 当前链接不是 HTTPS，可能存在跳转风险");
            }
          }
        } else {
          showError(`❌ 字段加载失败：${res?.error || "未知错误"}`);
          asIsTextarea.value = "";
          toBeTextarea.value = "";
          applyBtn.dataset.key = "";
        }
      }
    );
  });
}

// ========== DOM 绑定 ==========
document.addEventListener("DOMContentLoaded", function () {
  const applyBtn = document.getElementById("applyChange");
  const toBeTextarea = document.getElementById("toBeValue");

  document.querySelectorAll(".check-item").forEach((item) => {
    const key = item.dataset.key;
    const label = item.dataset.label;

    item.addEventListener("click", () => {
      bindMessageButtonDynamic(key, label);
    });
  });

  applyBtn.addEventListener("click", function () {
    const key = applyBtn.dataset.key;
    const newVal = toBeTextarea.value;

    if (!key) {
      alert("请先选择字段再修改！");
      return;
    }

    // 🔒 可选：点击修改前检查 activeH5Url 的 TO-BE 是否为 https
    if (key === "activeH5Url" && newVal && !/^https:\/\//.test(newVal)) {
      showError("❌ TO-BE 链接必须为 HTTPS 协议！");
      return;
    }

    // 🛰️ 修改字段
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        { action: "check_field", key: key, value: newVal },
        function (res) {
          if (res?.success) {
            clearError();
            alert("✅ 修改成功！");
          } else {
            showError("❌ 修改失败：" + (res?.error || "未知原因"));
          }
        }
      );
    });
  });
});

document.getElementById("addRow").addEventListener("click", () => {
  const table = document.querySelector("#jsonTable tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" /></td>
    <td><input type="number" /></td>
    <td><input type="text" /></td>
  `;
  table.appendChild(row);
});

document.getElementById("generateJson").addEventListener("click", () => {
  const rows = document.querySelectorAll("#jsonTable tbody tr");
  const result = [];

  rows.forEach((row) => {
    const inputs = row.querySelectorAll("input");
    const gdName = inputs[0].value.trim();
    const gdPrice = parseFloat(inputs[1].value.trim()) || 0;
    const gdCount = inputs[2].value.trim();
    if (gdName) result.push({ gdName, gdPrice, gdCount });
  });

  document.getElementById("jsonOutput").value = JSON.stringify(result, null, 2);
});
