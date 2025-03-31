// src/background.ts
console.log("Content script injected!");

function getNodeInfo(): Array<{
  text: string;
  class: string;
  id: string | null;
}> {
  const nodes = document.querySelectorAll("div");
  const nodeData = Array.from(nodes).map((node) => ({
    text: node.textContent!.trim(),
    class: node.className,
    id: node.id || null,
  }));
  console.log("Collected node data:", nodeData);
  return nodeData;
}

// 立即运行
console.log("Running immediately");
const nodeData = getNodeInfo();
console.log("Sending message:", nodeData);
chrome.runtime.sendMessage({ action: "fetchNodeInfo", data: nodeData });
