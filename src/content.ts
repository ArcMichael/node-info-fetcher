// src/content.ts
console.log("[content] 注入位置：", window.location.href);
console.log("[content] 是否顶层？", window.top === window);
console.log("[content] 内容脚本已注入！");
console.log("[content] HREF", window.location.href);

interface FieldConfig {
  label: string;
  iframePath: string[]; // 按层顺序穿透 iframe
  selector: string; // 最终目标元素选择器
}

const fieldMapping: Record<string, FieldConfig> = {
  activeName: {
    label: "优惠名称",
    iframePath: ["/msh/active/draft/list/", "/msh/active/draft/modify/"],
    selector: "#activeName",
  },
  price: {
    label: "现价/原价",
    iframePath: ["/msh/active/draft/list/", "/msh/active/draft/modify/"],
    selector: "#priceInput",
  },
  // 你可以继续加更多字段
};

/**
 * 穿透 iframe 层级，按 src 关键词路径依次获取内部 document
 */
async function getIframeDocumentBySrcPath(
  srcKeywords: string[]
): Promise<Document | null> {
  let currentWindow: Window = window;

  for (const [index, keyword] of srcKeywords.entries()) {
    const allIframes = Array.from(
      currentWindow.document.querySelectorAll("iframe")
    );

    console.log(`🧩 第 ${index + 1} 层 iframe 查找关键词: "${keyword}"`);
    console.log(
      "🔍 当前层 iframe src 列表:",
      allIframes.map((f) => f.getAttribute("src") || "无")
    );

    const iframe = allIframes.find((f) =>
      f.getAttribute("src")?.includes(keyword)
    ) as HTMLIFrameElement | undefined;

    if (!iframe) {
      console.warn(`❌ 第 ${index + 1} 层 iframe 未找到，关键词: "${keyword}"`);
      return null;
    }

    if (!iframe.contentWindow) {
      console.warn(`⚠️ 第 ${index + 1} 层 iframe 无 contentWindow`);
      return null;
    }

    if (!iframe.contentWindow.document) {
      console.warn(
        `🚫 第 ${index + 1} 层 iframe 无法访问 document（可能跨域）`
      );
      return null;
    }

    console.log(
      `✅ 第 ${index + 1} 层 iframe 匹配成功: ${iframe.getAttribute("src")}`
    );
    currentWindow = iframe.contentWindow;
  }

  console.log("✅ 所有 iframe 层级穿透完成！");
  return currentWindow.document;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("chrome.runtime.onMessage.addListener", {
    msg,
    sender,
  });

  if (msg.action === "check_field" && typeof msg.key === "string") {
    const config = fieldMapping[msg.key];
    if (!config) {
      sendResponse({
        success: false,
        error: `未配置字段: ${msg.key}`,
        key: msg.key,
      });
      return true;
    }

    // ✅ 用立即执行函数包裹 async 逻辑
    (async () => {
      const response = { key: msg.key, label: config.label };

      try {
        const doc = await getIframeDocumentBySrcPath(config.iframePath);

        if (!doc) {
          console.warn("⛔ 没拿到 iframe doc，打断点看 currentWindow 是啥");
          // 不立即 sendResponse，让你有时间在 DevTools 中观察
          return; // 也可以写成 `debugger;`
        }

        const el = doc.querySelector(config.selector);
        if (!el) {
          console.warn("⚠️ 没拿到目标元素", config.selector);
          return;
        }

        // ✅ 如果 msg.value 有值 → 执行覆盖
        if (msg.value !== undefined && msg.value !== null) {
          if (msg.value !== undefined && msg.value !== null) {
            console.log("✏️ 修改字段：", config.selector, "→", msg.value);

            if ("value" in el) {
              (el as HTMLInputElement).value = msg.value;
              el.dispatchEvent(new Event("input", { bubbles: true })); // ✅ 很关键
              console.log("✅ 通过 el.value 修改，并触发 input");
            } else {
              el.textContent = msg.value;
              console.log("✅ 设置了 textContent");
            }

            sendResponse({ ...response, success: true, updated: true });
          }
        } else {
          // 🧾 否则 → 返回当前值
          const currentVal =
            "value" in el ? el.value : el.textContent?.trim() || "";

          console.log("📖 当前值为：", currentVal);
          sendResponse({ ...response, success: true, value: currentVal });
        }
      } catch (err) {
        console.error("❌ 设置失败：", err);
        sendResponse({ ...response, success: false, error: "内部错误" });
      }
    })();
    return true;
  }
});
