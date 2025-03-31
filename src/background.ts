console.log("Background script loaded!");

interface FetchMessage {
  action: "fetchNodeInfo";
  data: Array<{ text: string; class: string; id: string | null }>;
}

interface MessageResponse {
  success: boolean;
  result?: any;
  error?: string;
}

chrome.runtime.onMessage.addListener(
  (
    message: FetchMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    console.log("Message received:", message);
    if (message.action === "fetchNodeInfo") {
      const nodeData = message.data;
      console.log("Processing node data:", nodeData);
      fetch("https://api.example.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nodeData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("API Response:", data);
          sendResponse({ success: true, result: data });
        })
        .catch((error) => {
          console.error("API Error:", error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    }
  }
);
