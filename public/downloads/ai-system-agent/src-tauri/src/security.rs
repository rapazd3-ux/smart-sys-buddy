use keyring::Entry;
use serde::{Deserialize, Serialize};

const SERVICE_NAME: &str = "ai-system-agent";

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKeyInfo {
    pub provider: String,
    pub is_set: bool,
    pub masked_key: String,
}

/// Save an API key securely using the system keychain
#[tauri::command]
pub fn save_api_key(provider: String, api_key: String) -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, &provider)
        .map_err(|e| format!("Erro ao acessar keychain: {}", e))?;

    entry
        .set_password(&api_key)
        .map_err(|e| format!("Erro ao salvar chave: {}", e))?;

    Ok(format!("Chave {} salva com sucesso!", provider))
}

/// Get an API key from the system keychain
#[tauri::command]
pub fn get_api_key(provider: String) -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, &provider)
        .map_err(|e| format!("Erro ao acessar keychain: {}", e))?;

    entry
        .get_password()
        .map_err(|e| format!("Chave não encontrada: {}", e))
}

/// Delete an API key from the system keychain
#[tauri::command]
pub fn delete_api_key(provider: String) -> Result<String, String> {
    let entry = Entry::new(SERVICE_NAME, &provider)
        .map_err(|e| format!("Erro ao acessar keychain: {}", e))?;

    entry
        .delete_password()
        .map_err(|e| format!("Erro ao deletar chave: {}", e))?;

    Ok(format!("Chave {} removida com sucesso!", provider))
}

/// Get info about all configured API keys (without revealing them)
#[tauri::command]
pub fn get_api_keys_info() -> Vec<ApiKeyInfo> {
    let providers = ["openai", "google", "anthropic", "xai"];

    providers
        .iter()
        .map(|&provider| {
            let entry = Entry::new(SERVICE_NAME, provider);
            let (is_set, masked_key) = match entry {
                Ok(e) => match e.get_password() {
                    Ok(key) => {
                        let masked = if key.len() > 8 {
                            format!("{}...{}", &key[..4], &key[key.len() - 4..])
                        } else {
                            "****".to_string()
                        };
                        (true, masked)
                    }
                    Err(_) => (false, "Não configurada".to_string()),
                },
                Err(_) => (false, "Não configurada".to_string()),
            };

            ApiKeyInfo {
                provider: provider.to_string(),
                is_set,
                masked_key,
            }
        })
        .collect()
}
