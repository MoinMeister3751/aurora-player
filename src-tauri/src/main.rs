// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod oauth_loopback;
mod secure_store;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            oauth_loopback::start_oauth_loopback,
            secure_store::save_refresh_token,
            secure_store::get_refresh_token,
            secure_store::delete_refresh_token,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Aurora");
}
