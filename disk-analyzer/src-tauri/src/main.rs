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

use sysinfo::{DiskExt, DiskType, System, SystemExt};

#[derive(serde::Serialize)]
struct DiskData {
    total_space: u64,
    used_space: u64,
    free_space: u64,
    disk_name: String,
    file_system: String,
    disk_type: String,
    mount_point: String,
    percentage_used: f64,
}

#[tauri::command]
fn analyze_disk() -> Result<String, String> {
    println!("analyze_disk() was called!");

    let mut system = System::new_all();
    system.refresh_all();

    let disks = system.disks();
    let disk = disks.get(0).ok_or_else(|| "No disks found!".to_string())?;

    let data = DiskData {
        total_space: disk.total_space(),
        used_space: disk.total_space() - disk.available_space(),
        free_space: disk.available_space(),
        disk_name: disk.name().to_string_lossy().into_owned(),
        file_system: String::from_utf8_lossy(disk.file_system()).into_owned(),
        disk_type: match disk.type_() {
            DiskType::HDD => "HDD",
            DiskType::SSD => "SSD",
            DiskType::Unknown(_) => "Unknown",
        }
        .to_string(),
        mount_point: disk.mount_point().to_string_lossy().into_owned(),
        percentage_used: (disk.total_space() as f64 - disk.available_space() as f64)
            / disk.total_space() as f64
            * 100.0,
    };

    match serde_json::to_string(&data) {
        Ok(json) => Ok(json),
        Err(e) => {
            println!("Failed to serialize disk data: {}", e);
            Err(format!("Failed to serialize disk data: {}", e))
        }
    }
}

fn main() {
    // For testing:
    let result = analyze_disk().unwrap();
    println!("Result: {}", result);

    // let s = System::new_all();
    // println!("{} kB", s.get_available_memory());

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![analyze_disk])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
