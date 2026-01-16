use serde::{Deserialize, Serialize};
use std::process::Command;
use chrono::Utc;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CommandResult {
    pub id: String,
    pub command: String,
    pub args: Vec<String>,
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
    pub executed_at: String,
    pub duration_ms: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub os_version: String,
    pub arch: String,
    pub hostname: String,
    pub username: String,
}

// Command whitelist for security
const ALLOWED_COMMANDS: &[&str] = &[
    // Package managers
    "apt", "apt-get", "dpkg", "dnf", "yum", "pacman", "zypper",
    // Container tools
    "docker", "docker-compose", "podman",
    // Service management
    "systemctl", "service", "journalctl",
    // File operations (read-only)
    "cat", "ls", "head", "tail", "grep", "find", "which", "whereis",
    // Network diagnostics
    "ping", "curl", "wget", "netstat", "ss", "ip",
    // System info
    "uname", "hostname", "whoami", "id", "df", "free", "top", "ps",
    // PHP/Web
    "php", "composer", "npm", "node",
    // Database
    "mysql", "mariadb", "psql",
    // Web servers
    "nginx", "apache2", "httpd",
    // Text editors (for config check)
    "nano", "vim", "vi",
    // Windows equivalents
    "dir", "type", "ipconfig", "netsh", "wmic", "powershell",
];

fn is_command_allowed(cmd: &str) -> bool {
    let base_cmd = cmd.split_whitespace().next().unwrap_or("");
    let base_cmd = base_cmd.split('/').last().unwrap_or(base_cmd);
    ALLOWED_COMMANDS.iter().any(|&allowed| base_cmd == allowed)
}

#[tauri::command]
pub async fn execute_command(
    command: String,
    args: Vec<String>,
    requires_sudo: bool,
    user_confirmed: bool,
) -> Result<CommandResult, String> {
    // CRITICAL SECURITY: Never execute without user confirmation
    if !user_confirmed {
        return Err("⚠️ SEGURANÇA: Comando requer confirmação explícita do usuário".into());
    }

    // Validate command against whitelist
    if !is_command_allowed(&command) {
        return Err(format!(
            "⚠️ SEGURANÇA: Comando '{}' não está na lista de comandos permitidos.\n\
            Comandos permitidos: {:?}",
            command, ALLOWED_COMMANDS
        ));
    }

    let start = std::time::Instant::now();
    let id = Uuid::new_v4().to_string();

    // Build the command
    let output = if cfg!(target_os = "windows") {
        if requires_sudo {
            // On Windows, use runas for elevation (will prompt UAC)
            Command::new("powershell")
                .args([
                    "-Command",
                    &format!(
                        "Start-Process -FilePath '{}' -ArgumentList '{}' -Verb RunAs -Wait",
                        command,
                        args.join(" ")
                    ),
                ])
                .output()
        } else {
            Command::new("cmd")
                .args(["/C", &command])
                .args(&args)
                .output()
        }
    } else {
        // Unix-like systems
        if requires_sudo {
            // Use pkexec for graphical sudo prompt
            Command::new("pkexec")
                .arg(&command)
                .args(&args)
                .output()
        } else {
            Command::new(&command)
                .args(&args)
                .output()
        }
    };

    let duration = start.elapsed().as_millis() as u64;

    match output {
        Ok(out) => {
            let result = CommandResult {
                id,
                command: command.clone(),
                args: args.clone(),
                success: out.status.success(),
                stdout: String::from_utf8_lossy(&out.stdout).to_string(),
                stderr: String::from_utf8_lossy(&out.stderr).to_string(),
                exit_code: out.status.code().unwrap_or(-1),
                executed_at: Utc::now().to_rfc3339(),
                duration_ms: duration,
            };

            // Log the execution (in production, save to file)
            println!(
                "[EXEC] {} {} | exit={} | duration={}ms",
                command,
                args.join(" "),
                result.exit_code,
                duration
            );

            Ok(result)
        }
        Err(e) => Err(format!("Erro ao executar comando: {}", e)),
    }
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    let os = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();

    let os_version = if cfg!(target_os = "linux") {
        std::fs::read_to_string("/etc/os-release")
            .ok()
            .and_then(|content| {
                content
                    .lines()
                    .find(|line| line.starts_with("PRETTY_NAME="))
                    .map(|line| line.replace("PRETTY_NAME=", "").replace('"', ""))
            })
            .unwrap_or_else(|| "Linux".to_string())
    } else if cfg!(target_os = "windows") {
        "Windows".to_string()
    } else if cfg!(target_os = "macos") {
        "macOS".to_string()
    } else {
        "Unknown".to_string()
    };

    let hostname = hostname::get()
        .ok()
        .and_then(|h| h.into_string().ok())
        .unwrap_or_else(|| "unknown".to_string());

    let username = std::env::var("USER")
        .or_else(|_| std::env::var("USERNAME"))
        .unwrap_or_else(|_| "unknown".to_string());

    Ok(SystemInfo {
        os,
        os_version,
        arch,
        hostname,
        username,
    })
}

#[tauri::command]
pub fn get_command_history() -> Result<Vec<CommandResult>, String> {
    // In a real implementation, this would read from a local database/file
    Ok(vec![])
}
