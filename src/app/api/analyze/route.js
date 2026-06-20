export async function POST(req) {
  try {
    const body = await req.json();

    const { title, situation, decision, outcome, reasoning } = body;

    if (!title || !situation || !decision || !outcome) {
      return Response.json({
        success: false,
        error: {
          type: "INPUT_ERROR",
          message: "Missing required fields"
        }
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return Response.json({
        success: false,
        error: {
          type: "CONFIG_ERROR",
          message: "Missing API key"
        }
      });
    }

    const MODELS = [
      "qwen/qwen3-14b",
      "meta-llama/llama-3.1-8b-instruct",
      "north-mini-code"
    ];

    const prompt = `
Return ONLY valid JSON.

Rules:
- Must be complete JSON
- No truncation
- No markdown
- No extra text

Format:
{
  "lesson": "string",
  "risk": "Low | Medium | High",
  "tags": ["string"]
}

Input:
Title: ${title}
Situation: ${situation}
Decision: ${decision}
Outcome: ${outcome}
Reasoning: ${reasoning || "Not provided"}
`;

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    function safeParse(text) {
      try {
        return JSON.parse(text);
      } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) return null;
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
    }

    let lastError = null;

    for (const model of MODELS) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: "Return ONLY valid JSON. No extra text."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.2,
              max_tokens: 500
            })
          });

          const data = await res.json();

          if (!res.ok) {
            lastError = { model, attempt, error: data };
            continue;
          }

          const content = data?.choices?.[0]?.message?.content;

          const parsed = safeParse(content);

          if (!parsed) {
            lastError = {
              model,
              attempt,
              error: "JSON_PARSE_FAILED",
              raw: content
            };
            continue;
          }

          // SUCCESS
          return Response.json({
            success: true,
            data: {
              lesson: parsed.lesson || "No lesson",
              risk: parsed.risk || "Low",
              tags: Array.isArray(parsed.tags) ? parsed.tags : ["analysis"]
            },
            meta: {
              model_used: model,
              attempts: attempt
            }
          });

        } catch (err) {
          lastError = {
            model,
            attempt,
            error: String(err)
          };

          await sleep(300);
        }
      }
    }

    // FINAL FAILURE (NO FAKE DATA)
    return Response.json({
      success: false,
      error: {
        type: "ALL_MODELS_FAILED",
        details: lastError
      }
    });

  } catch (err) {
    return Response.json({
      success: false,
      error: {
        type: "SYSTEM_ERROR",
        message: String(err)
      }
    });
  }
}