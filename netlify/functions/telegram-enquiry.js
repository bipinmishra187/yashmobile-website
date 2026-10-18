
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error("Telegram environment variables are missing");
    }

    const data = JSON.parse(event.body || "{}");

    const message = [
      "🔔 YASH MOBILE - NEW ENQUIRY",
      "",
      "📌 Category: " + String(data.category || "General"),
      "📝 Details: " + String(data.details || data.message || "Not provided"),
      "👤 Name: " + String(data.name || "Not provided"),
      "📞 Phone: " + String(data.phone || "Not provided")
    ].join("\n");

    const response = await fetch(
      "https://api.telegram.org/bot" + token + "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Telegram delivery failed" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unable to send enquiry" })
    };
  }
};
