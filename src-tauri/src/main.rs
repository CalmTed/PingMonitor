#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{Manager, Position, PhysicalPosition, Size, PhysicalSize};


#[tauri::command]
fn send_state() -> String {
  "state".to_string()
}

#[tauri::command]
async fn show_view(window: tauri::Window) {
  // show view
  if let Some(view_win) = window.get_window("view") {
    view_win.show().unwrap();
  }
}

#[tauri::command]
async fn hide_view(window: tauri::Window) {
  // show view
  if let Some(view_win) = window.get_window("view") {
    view_win.hide().unwrap();
  }
}

#[tauri::command]
async fn position_view(window: tauri::Window, x: i32, y: i32, width: u32 , height: u32) {
  // show view
  if let Some(view_win) = window.get_window("view") {
    view_win.set_position(Position::Physical(PhysicalPosition { x, y })).unwrap();
    view_win.set_size(Size::Physical(PhysicalSize { width, height })).unwrap();
  }
}

#[tauri::command]
async fn close_view(window: tauri::Window) {
  // show view
  if let Some(view_win) = window.get_window("view") {
    view_win.close().unwrap();
  }
}
#[tauri::command]
async fn update_view(window: tauri::Window, state_string: String) {
  // println!("{}", state_string);
  // show view
  if let Some(view_win) = window.get_window("view") {
    view_win.emit("send_state_view", state_string.to_string()).unwrap();
  }
}
#[tauri::command]
async fn update_controls(window: tauri::Window, state_string: String) {
  // println!("{}", state_string);
  // show view
  if let Some(view_win) = window.get_window("main") {
    view_win.emit("send_state_controls", state_string.to_string()).unwrap();
  }
}


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![send_state, show_view, hide_view, position_view, close_view, update_view, update_controls])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}




