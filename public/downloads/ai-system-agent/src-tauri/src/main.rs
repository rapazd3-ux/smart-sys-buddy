#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod ai_client;
mod security;
mod config;

use commands::{execute_command, get_system_info, get_command_history};
use ai_client::{send_to_ai, get_ai_providers};
use security::{save_api_key, get_api_key, delete_api_key};
use config::{get_config, save_config};

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Command execution
            execute_command,
            get_system_info,
            get_command_history,
            // AI communication
            send_to_ai,
            get_ai_providers,
            // Security / API keys
            save_api_key,
            get_api_key,
            delete_api_key,
            // Configuration
            get_config,
            save_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
