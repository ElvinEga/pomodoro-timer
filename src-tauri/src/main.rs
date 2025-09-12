#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use tauri::api::notification::Notification;
use tauri::{Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

#[tauri::command]
async fn read_profiles(app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    fs::create_dir_all(&app_dir).map_err(|e| format!("failed to create app dir: {}", e))?;

    let profiles_path = app_dir.join("profiles.json");

    if !profiles_path.exists() {
        let default_profiles = include_str!("../default_profiles.json");
        fs::write(&profiles_path, default_profiles)
            .map_err(|e| format!("failed to write default profiles: {}", e))?;
        return Ok(default_profiles.to_string());
    }

    fs::read_to_string(&profiles_path).map_err(|e| format!("failed to read profiles: {}", e))
}

#[tauri::command]
async fn write_profiles(app_handle: tauri::AppHandle, data: String) -> Result<(), String> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    fs::create_dir_all(&app_dir).map_err(|e| format!("failed to create app dir: {}", e))?;

    let profiles_path = app_dir.join("profiles.json");

    fs::write(&profiles_path, data).map_err(|e| format!("failed to write profiles: {}", e))
}

#[tauri::command]
async fn read_activities(app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let activities_path = app_dir.join("activities.json");

    if !activities_path.exists() {
        return Ok("[]".to_string());
    }

    fs::read_to_string(&activities_path).map_err(|e| format!("failed to read activities: {}", e))
}

#[tauri::command]
async fn write_activities(app_handle: tauri::AppHandle, data: String) -> Result<(), String> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let activities_path = app_dir.join("activities.json");

    fs::write(&activities_path, data).map_err(|e| format!("failed to write activities: {}", e))
}

#[tauri::command]
async fn read_settings(app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let settings_path = app_dir.join("settings.json");

    if !settings_path.exists() {
        let default_settings = include_str!("../default_settings.json");
        fs::write(&settings_path, default_settings)
            .map_err(|e| format!("failed to write default settings: {}", e))?;
        return Ok(default_settings.to_string());
    }

    fs::read_to_string(&settings_path).map_err(|e| format!("failed to read settings: {}", e))
}

#[tauri::command]
async fn write_settings(app_handle: tauri::AppHandle, data: String) -> Result<(), String> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let settings_path = app_dir.join("settings.json");

    fs::write(&settings_path, data).map_err(|e| format!("failed to write settings: {}", e))
}

fn main() {
    let tray_menu = SystemTrayMenu::new()
        .add_item(SystemTrayMenuItem::new("Show", "show"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(SystemTrayMenuItem::new("Quit", "quit"));

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            read_profiles,
            write_profiles,
            read_activities,
            write_activities,
            read_settings,
            write_settings,
            show_notification,
            request_notification_permission,
            set_always_on_top,
            minimize_to_tray,
            export_data,
            import_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn show_notification(title: String, body: String) -> Result<(), String> {
    Notification::new(&title)
        .body(&body)
        .icon("icon.png")
        .show()
        .map_err(|e| format!("Failed to show notification: {}", e))
}

#[tauri::command]
async fn request_notification_permission() -> Result<bool, String> {
    // On desktop, notifications are typically enabled by default
    Ok(true)
}

#[tauri::command]
async fn set_always_on_top(window: tauri::Window, always_on_top: bool) -> Result<(), String> {
    window
        .set_always_on_top(always_on_top)
        .map_err(|e| format!("Failed to set always on top: {}", e))
}

#[tauri::command]
async fn minimize_to_tray(window: tauri::Window) -> Result<(), String> {
    window
        .hide()
        .map_err(|e| format!("Failed to minimize to tray: {}", e))
}

#[tauri::command]
async fn export_data(
    app_handle: tauri::AppHandle,
    data_type: String,
    file_path: String,
) -> Result<(), String> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let source_path = match data_type.as_str() {
        "activities" => app_dir.join("activities.json"),
        "profiles" => app_dir.join("profiles.json"),
        "settings" => app_dir.join("settings.json"),
        _ => return Err("Invalid data type".to_string()),
    };

    if !source_path.exists() {
        return Err(format!("No {} data found", data_type));
    }

    fs::copy(&source_path, &file_path).map_err(|e| format!("Failed to export {}: {}", data_type, e))
}

#[tauri::command]
async fn import_data(
    app_handle: tauri::AppHandle,
    data_type: String,
    file_path: String,
) -> Result<(), String> {
    let app_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let target_path = match data_type.as_str() {
        "activities" => app_dir.join("activities.json"),
        "profiles" => app_dir.join("profiles.json"),
        "settings" => app_dir.join("settings.json"),
        _ => return Err("Invalid data type".to_string()),
    };

    if !PathBuf::from(&file_path).exists() {
        return Err("Source file not found".to_string());
    }

    fs::copy(&file_path, &target_path).map_err(|e| format!("Failed to import {}: {}", data_type, e))
}
