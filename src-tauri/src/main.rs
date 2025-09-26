#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, Runtime,
};

#[tauri::command]
async fn read_profiles(app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    fs::create_dir_all(&app_dir).map_err(|e| format!("failed to create app dir: {}", e))?;

    let profiles_path = app_dir.join("profiles.json");

    if !profiles_path.exists() {
        let default_profiles = include_str!("default_profiles.json");
        fs::write(&profiles_path, default_profiles)
            .map_err(|e| format!("failed to write default profiles: {}", e))?;
        return Ok(default_profiles.to_string());
    }

    fs::read_to_string(&profiles_path).map_err(|e| format!("failed to read profiles: {}", e))
}

#[tauri::command]
async fn write_profiles(app_handle: tauri::AppHandle, data: String) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    fs::create_dir_all(&app_dir).map_err(|e| format!("failed to create app dir: {}", e))?;

    let profiles_path = app_dir.join("profiles.json");

    fs::write(&profiles_path, data).map_err(|e| format!("failed to write profiles: {}", e))
}

#[tauri::command]
async fn read_activities(app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app_handle
        .path()
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
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let activities_path = app_dir.join("activities.json");

    fs::write(&activities_path, data).map_err(|e| format!("failed to write activities: {}", e))
}

#[tauri::command]
async fn read_settings(app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let settings_path = app_dir.join("settings.json");

    if !settings_path.exists() {
        let default_settings = include_str!("default_settings.json");
        fs::write(&settings_path, default_settings)
            .map_err(|e| format!("failed to write default settings: {}", e))?;
        return Ok(default_settings.to_string());
    }

    fs::read_to_string(&settings_path).map_err(|e| format!("failed to read settings: {}", e))
}

#[tauri::command]
async fn write_settings(app_handle: tauri::AppHandle, data: String) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let settings_path = app_dir.join("settings.json");

    fs::write(&settings_path, data).map_err(|e| format!("failed to write settings: {}", e))
}

#[tauri::command]
async fn show_notification(
    app_handle: tauri::AppHandle,
    title: String,
    body: String,
) -> Result<(), String> {
    use tauri_plugin_notification::NotificationExt;

    app_handle
        .notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| format!("Failed to show notification: {}", e))
}

#[tauri::command]
async fn request_notification_permission() -> Result<bool, String> {
    // On desktop, notifications are typically enabled by default
    // You might want to implement platform-specific permission checks here
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
        .path()
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

    fs::copy(&source_path, &file_path)
        .map_err(|e| format!("Failed to export {}: {}", data_type, e))?;
    Ok(())
}

#[tauri::command]
async fn import_data(
    app_handle: tauri::AppHandle,
    data_type: String,
    file_path: String,
) -> Result<(), String> {
    let app_dir = app_handle
        .path()
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

    // Validate JSON before importing
    let content =
        fs::read_to_string(&file_path).map_err(|e| format!("Failed to read import file: {}", e))?;

    serde_json::from_str::<Value>(&content).map_err(|e| format!("Invalid JSON format: {}", e))?;

    fs::write(&target_path, content).map_err(|e| format!("Failed to import {}: {}", data_type, e))
}

#[tauri::command]
async fn get_app_data_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    Ok(app_dir.to_string_lossy().to_string())
}

#[tauri::command]
async fn reset_all_data(app_handle: tauri::AppHandle) -> Result<(), String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    // Remove all data files
    let files = ["profiles.json", "activities.json", "settings.json"];

    for file in &files {
        let file_path = app_dir.join(file);
        if file_path.exists() {
            fs::remove_file(&file_path).map_err(|e| format!("Failed to remove {}: {}", file, e))?;
        }
    }

    Ok(())
}

#[tauri::command]
async fn backup_data(app_handle: tauri::AppHandle, backup_name: String) -> Result<String, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    let backup_dir = app_dir.join("backups");
    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Failed to create backup directory: {}", e))?;

    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_folder = backup_dir.join(format!("{}_{}", backup_name, timestamp));
    fs::create_dir_all(&backup_folder)
        .map_err(|e| format!("Failed to create backup folder: {}", e))?;

    // Copy all data files
    let files = ["profiles.json", "activities.json", "settings.json"];

    for file in &files {
        let source = app_dir.join(file);
        let destination = backup_folder.join(file);

        if source.exists() {
            fs::copy(&source, &destination)
                .map_err(|e| format!("Failed to backup {}: {}", file, e))?;
        }
    }

    Ok(backup_folder.to_string_lossy().to_string())
}

#[tauri::command]
async fn read_todos(app_handle: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app_handle.path()
        .app_data_dir()
        .expect("failed to resolve app data dir");
    
    let todos_path = app_dir.join("todos.json");
    
    if !todos_path.exists() {
        let default_todos = r#"{"lists": []}"#;
        fs::write(&todos_path, default_todos)
            .map_err(|e| format!("failed to write default todos: {}", e))?;
        return Ok(default_todos.to_string());
    }
    
    fs::read_to_string(&todos_path)
        .map_err(|e| format!("failed to read todos: {}", e))
}

#[tauri::command]
async fn write_todos(app_handle: tauri::AppHandle, data: String) -> Result<(), String> {
    let app_dir = app_handle.path()
        .app_data_dir()
        .expect("failed to resolve app data dir");
    
    let todos_path = app_dir.join("todos.json");
    
    fs::write(&todos_path, data)
        .map_err(|e| format!("failed to write todos: {}", e))
}

fn create_tray_menu<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<Menu<R>> {
    let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
    let start_focus = MenuItem::with_id(app, "start_focus", "Start Focus", true, None::<&str>)?;
    let start_break = MenuItem::with_id(app, "start_break", "Start Break", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &show,
            &PredefinedMenuItem::separator(app)?,
            &start_focus,
            &start_break,
            &PredefinedMenuItem::separator(app)?,
            &quit,
        ],
    )?;

    Ok(menu)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let handle = app.handle().clone();

            // Create tray menu
            let menu = create_tray_menu(&handle)?;

            // Build tray icon
            let _tray = TrayIconBuilder::with_id("main-tray")
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(move |_app, event| match event.id().as_ref() {
                    "show" => {
                        if let Some(window) = _app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "start_focus" => {
                        if let Some(window) = _app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("start-focus", {});
                        }
                    }
                    "start_break" => {
                        if let Some(window) = _app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("start-break", {});
                        }
                    }
                    "quit" => {
                        _app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|_tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        if let Some(app) = _tray.app_handle().get_webview_window("main") {
                            let _ = app.show();
                            let _ = app.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            Ok(())
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
            get_app_data_dir,
            reset_all_data,
            backup_data,
            read_todos,
            write_todos
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}
