use std::sync::Mutex;
use tauri::{Emitter, Manager, RunEvent, State};
use tauri_plugin_fs::FsExt;

// Store the initial file path so the frontend can retrieve it after mounting
struct InitialFile(Mutex<Option<String>>);

#[tauri::command]
fn get_initial_file(state: State<'_, InitialFile>) -> Option<String> {
    state.0.lock().ok()?.take()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // Another instance tried to launch — focus the existing window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .manage(InitialFile(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![get_initial_file])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| match event {
            RunEvent::Opened { urls } => {
                if let Some(url) = urls.first() {
                    if let Ok(path) = url.to_file_path() {
                        let scope = app.fs_scope();
                        let _ = scope.allow_file(&path);

                        let path_str = path.to_string_lossy().to_string();
                        let _ = app.emit("file-opened", path_str.clone());
                        if let Some(state) = app.try_state::<InitialFile>() {
                            if let Ok(mut guard) = state.0.lock() {
                                *guard = Some(path_str);
                            }
                        }
                    }
                }
            }
            RunEvent::Reopen { .. } => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.unminimize();
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {}
        });
}
