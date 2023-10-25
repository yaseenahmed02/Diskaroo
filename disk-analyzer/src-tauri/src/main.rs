// #[derive(serde::Serialize)]
// struct DiskData {
//     total_space: u64, // in bytes
//     used_space: u64,  // in bytes
//     free_space: u64,  // in bytes
//     disk_name: String,
//     file_system: String,
// }

// #[tauri::command]
// fn analyze_disk() -> Result<String, String> {
//     println!("analyze_disk() was called!");

//     let data = DiskData {
//         total_space: 500_000_000_000, // 500 GB
//         used_space: 300_000_000_000,  // 300 GB
//         free_space: 200_000_000_000,  // 200 GB
//         disk_name: "C:".to_string(),
//         file_system: "NTFS".to_string(),
//     };

//     // Serialize the data to JSON
//     match serde_json::to_string(&data) {
//         Ok(json) => {
//             // Log the serialized JSON string and its type
//             // println!("Serialized JSON: {}", &json);
//             // println!("Type of serialized JSON: {:?}", &json);
//             Ok(json)
//         }
//         Err(e) => {
//             println!("Failed to serialize disk data: {}", e);
//             Err(format!("Failed to serialize disk data: {}", e))
//         }
//     }
// }

// #[tauri::command]
// fn analyze_disk(invoke_message: String) {
//     println!(
//         "I was invoked from JS, with this message: {}",
//         invoke_message
//     );
// }

// #[tauri::command]
// fn analyze_disk(invoke_message: String) -> Result<i32, String> {
//     println!(
//         "I was invoked from JS, with this message: {}",
//         invoke_message
//     );

//     // You can return an integer here, for example:
//     Ok(42) // This returns the integer 42
// }

#[derive(serde::Serialize)]
struct DiskData {
    total_space: u64, // in bytes
    used_space: u64,  // in bytes
    free_space: u64,  // in bytes
    disk_name: String,
    file_system: String,
}

#[tauri::command]
fn analyze_disk() -> Result<String, String> {
    println!("analyze_disk() was called!");

    let data = DiskData {
        total_space: 500_000_000_000, // 500 GB
        used_space: 300_000_000_000,  // 300 GB
        free_space: 200_000_000_000,  // 200 GB
        disk_name: "C:".to_string(),
        file_system: "NTFS".to_string(),
    };

    // Serialize the data to JSON and return it as a string
    match serde_json::to_string(&data) {
        Ok(json) => Ok(json),
        Err(e) => {
            println!("Failed to serialize disk data: {}", e);
            Err(format!("Failed to serialize disk data: {}", e))
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![analyze_disk])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
