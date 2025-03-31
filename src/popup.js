// src/popup.js
document.getElementById("fetchInfo").addEventListener("click", () => {
  // 向当前活动的标签页发送消息，触发内容脚本中的操作
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: fetchNodeInfo,
    });
  });
});

// 定义在页面上下文中执行的函数
function fetchNodeInfo() {
  // 获取页面中所有的段落元素
  const paragraphs = document.getElementsByTagName("p");
  alert(`此页面包含 ${paragraphs.length} 个段落。`);
}
