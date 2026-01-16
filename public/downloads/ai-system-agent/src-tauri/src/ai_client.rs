use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AIProvider {
    pub id: String,
    pub name: String,
    pub models: Vec<String>,
    pub api_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRequest {
    pub provider: String,
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub system_info: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIResponse {
    pub content: String,
    pub suggested_commands: Vec<SuggestedCommand>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SuggestedCommand {
    pub command: String,
    pub args: Vec<String>,
    pub description: String,
    pub requires_sudo: bool,
    pub risk_level: String, // "low", "medium", "high"
    pub explanation: String,
}

const SYSTEM_PROMPT: &str = r#"Você é o AI System Agent, um assistente especializado em administração de sistemas Linux e Windows.

REGRAS IMPORTANTES:
1. Sempre sugira comandos seguros e explique o que cada um faz
2. Classifique o risco de cada comando (low, medium, high)
3. Nunca sugira comandos que possam danificar o sistema sem aviso claro
4. Sempre forneça alternativas quando possível
5. Explique os erros de forma clara e sugira correções

FORMATO DE RESPOSTA:
Quando sugerir comandos, use este formato JSON no final da sua resposta:

```json
{
  "commands": [
    {
      "command": "apt",
      "args": ["update"],
      "description": "Atualiza a lista de pacotes",
      "requires_sudo": true,
      "risk_level": "low",
      "explanation": "Este comando atualiza a lista de pacotes disponíveis. É seguro e recomendado executar regularmente."
    }
  ]
}
```

Lembre-se: O usuário terá que aprovar CADA comando antes da execução. Seja claro sobre o que cada comando faz."#;

#[tauri::command]
pub fn get_ai_providers() -> Vec<AIProvider> {
    vec![
        AIProvider {
            id: "openai".to_string(),
            name: "OpenAI".to_string(),
            models: vec![
                "gpt-4-turbo-preview".to_string(),
                "gpt-4".to_string(),
                "gpt-3.5-turbo".to_string(),
            ],
            api_url: "https://api.openai.com/v1/chat/completions".to_string(),
        },
        AIProvider {
            id: "google".to_string(),
            name: "Google Gemini".to_string(),
            models: vec![
                "gemini-pro".to_string(),
                "gemini-1.5-pro".to_string(),
            ],
            api_url: "https://generativelanguage.googleapis.com/v1beta/models".to_string(),
        },
        AIProvider {
            id: "anthropic".to_string(),
            name: "Anthropic Claude".to_string(),
            models: vec![
                "claude-3-opus-20240229".to_string(),
                "claude-3-sonnet-20240229".to_string(),
            ],
            api_url: "https://api.anthropic.com/v1/messages".to_string(),
        },
        AIProvider {
            id: "xai".to_string(),
            name: "xAI Grok".to_string(),
            models: vec![
                "grok-1".to_string(),
            ],
            api_url: "https://api.x.ai/v1/chat/completions".to_string(),
        },
    ]
}

#[tauri::command]
pub async fn send_to_ai(
    request: AIRequest,
    api_key: String,
) -> Result<AIResponse, String> {
    if api_key.is_empty() {
        return Err("API key não configurada. Vá em Configurações > API Keys.".to_string());
    }

    let client = Client::new();

    // Add system prompt and system info
    let mut messages = vec![ChatMessage {
        role: "system".to_string(),
        content: format!(
            "{}\n\nInformações do sistema:\n{}",
            SYSTEM_PROMPT,
            request.system_info.unwrap_or_default()
        ),
    }];
    messages.extend(request.messages);

    let response = match request.provider.as_str() {
        "openai" | "xai" => {
            send_openai_compatible(&client, &request, &messages, &api_key).await
        }
        "google" => {
            send_google(&client, &request, &messages, &api_key).await
        }
        "anthropic" => {
            send_anthropic(&client, &request, &messages, &api_key).await
        }
        _ => Err(format!("Provider '{}' não suportado", request.provider)),
    };

    response
}

async fn send_openai_compatible(
    client: &Client,
    request: &AIRequest,
    messages: &[ChatMessage],
    api_key: &str,
) -> Result<AIResponse, String> {
    let url = if request.provider == "xai" {
        "https://api.x.ai/v1/chat/completions"
    } else {
        "https://api.openai.com/v1/chat/completions"
    };

    let body = serde_json::json!({
        "model": request.model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 4096,
    });

    let response = client
        .post(url)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Erro de rede: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("Erro da API ({}): {}", status, text));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Erro ao parsear resposta: {}", e))?;

    let content = json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("")
        .to_string();

    let suggested_commands = extract_commands(&content);

    Ok(AIResponse {
        content,
        suggested_commands,
        error: None,
    })
}

async fn send_google(
    client: &Client,
    request: &AIRequest,
    messages: &[ChatMessage],
    api_key: &str,
) -> Result<AIResponse, String> {
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
        request.model, api_key
    );

    // Convert messages to Gemini format
    let contents: Vec<serde_json::Value> = messages
        .iter()
        .map(|m| {
            serde_json::json!({
                "role": if m.role == "assistant" { "model" } else { "user" },
                "parts": [{"text": m.content}]
            })
        })
        .collect();

    let body = serde_json::json!({
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 4096,
        }
    });

    let response = client
        .post(&url)
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Erro de rede: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("Erro da API Gemini ({}): {}", status, text));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Erro ao parsear resposta: {}", e))?;

    let content = json["candidates"][0]["content"]["parts"][0]["text"]
        .as_str()
        .unwrap_or("")
        .to_string();

    let suggested_commands = extract_commands(&content);

    Ok(AIResponse {
        content,
        suggested_commands,
        error: None,
    })
}

async fn send_anthropic(
    client: &Client,
    request: &AIRequest,
    messages: &[ChatMessage],
    api_key: &str,
) -> Result<AIResponse, String> {
    // Separate system message for Anthropic
    let system = messages
        .first()
        .filter(|m| m.role == "system")
        .map(|m| m.content.clone())
        .unwrap_or_default();

    let msgs: Vec<serde_json::Value> = messages
        .iter()
        .skip(1)
        .map(|m| {
            serde_json::json!({
                "role": m.role,
                "content": m.content
            })
        })
        .collect();

    let body = serde_json::json!({
        "model": request.model,
        "max_tokens": 4096,
        "system": system,
        "messages": msgs,
    });

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Erro de rede: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("Erro da API Claude ({}): {}", status, text));
    }

    let json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Erro ao parsear resposta: {}", e))?;

    let content = json["content"][0]["text"]
        .as_str()
        .unwrap_or("")
        .to_string();

    let suggested_commands = extract_commands(&content);

    Ok(AIResponse {
        content,
        suggested_commands,
        error: None,
    })
}

fn extract_commands(content: &str) -> Vec<SuggestedCommand> {
    // Try to find JSON block with commands
    if let Some(start) = content.find("```json") {
        if let Some(end) = content[start..].find("```\n").or_else(|| content[start..].rfind("```")) {
            let json_str = &content[start + 7..start + end];
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(json_str) {
                if let Some(commands) = parsed["commands"].as_array() {
                    return commands
                        .iter()
                        .filter_map(|cmd| {
                            Some(SuggestedCommand {
                                command: cmd["command"].as_str()?.to_string(),
                                args: cmd["args"]
                                    .as_array()?
                                    .iter()
                                    .filter_map(|a| a.as_str().map(String::from))
                                    .collect(),
                                description: cmd["description"].as_str()?.to_string(),
                                requires_sudo: cmd["requires_sudo"].as_bool().unwrap_or(false),
                                risk_level: cmd["risk_level"]
                                    .as_str()
                                    .unwrap_or("medium")
                                    .to_string(),
                                explanation: cmd["explanation"].as_str().unwrap_or("").to_string(),
                            })
                        })
                        .collect();
                }
            }
        }
    }
    vec![]
}
