use serde::{Deserialize, Serialize};
use directories::ProjectDirs;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub default_provider: String,
    pub default_model: String,
    pub theme: String,
    pub language: String,
    pub auto_scroll: bool,
    pub confirm_dangerous_commands: bool,
    pub max_history_items: usize,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            default_provider: "openai".to_string(),
            default_model: "gpt-4-turbo-preview".to_string(),
            theme: "dark".to_string(),
            language: "pt-BR".to_string(),
            auto_scroll: true,
            confirm_dangerous_commands: true,
            max_history_items: 100,
        }
    }
}

fn get_config_path() -> Result<PathBuf, String> {
    let proj_dirs = ProjectDirs::from("dev", "aisystemagent", "AI System Agent")
        .ok_or_else(|| "Não foi possível determinar diretório de configuração".to_string())?;

    let config_dir = proj_dirs.config_dir();
    fs::create_dir_all(config_dir)
        .map_err(|e| format!("Erro ao criar diretório de config: {}", e))?;

    Ok(config_dir.join("config.json"))
}

#[tauri::command]
pub fn get_config() -> Result<AppConfig, String> {
    let config_path = get_config_path()?;

    if config_path.exists() {
        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Erro ao ler config: {}", e))?;
        serde_json::from_str(&content)
            .map_err(|e| format!("Erro ao parsear config: {}", e))
    } else {
        Ok(AppConfig::default())
    }
}

#[tauri::command]
pub fn save_config(config: AppConfig) -> Result<String, String> {
    let config_path = get_config_path()?;

    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Erro ao serializar config: {}", e))?;

    fs::write(&config_path, content)
        .map_err(|e| format!("Erro ao salvar config: {}", e))?;

    Ok("Configurações salvas com sucesso!".to_string())
}
