use chrono::prelude::*;
use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::time::SystemTime;
use sysinfo::{DiskExt, DiskType, System, SystemExt};

use chrono::{DateTime, Utc};

#[derive(serde::Serialize)]
struct DirectoryData {
    num_files: usize,
    num_subdirectories: usize,
    total_size: u64,
    largest_files: Vec<FileData>,
    oldest_file: FileData,
    newest_file: FileData,
    file_type_breakdown: HashMap<String, usize>,
}

#[derive(Debug, Clone, serde::Serialize, Default)]
struct FileData {
    path: String,
    size: u64,
    last_modified: String,
}

#[derive(Serialize)]
struct DirectoryAnalysis {
    largest_files: Vec<FileData>,
    largest_file: FileData,
    smallest_file: FileData,
}

#[tauri::command]
fn analyze_directory(dir_path: String) -> Result<String, String> {
    println!("analyze_directory() was called!");
    let path = Path::new(&dir_path);

    let mut files_vec: Vec<FileData> = Vec::new();

    if !path.is_dir() {
        return Err("Provided path is not a directory.".to_string());
    }

    for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let last_modified: SystemTime = entry
            .metadata()
            .map_err(|e| e.to_string())?
            .modified()
            .map_err(|e| e.to_string())?;
        let datetime: chrono::DateTime<chrono::Utc> = last_modified.into();
        let size = get_directory_size(&entry.path());

        files_vec.push(FileData {
            path: entry.path().display().to_string(),
            size: size,
            last_modified: datetime.to_rfc3339(),
        });
    }

    files_vec.sort_by(|a, b| b.size.cmp(&a.size));

    // Get the largest 10 files
    let largest_files: Vec<FileData> = files_vec.iter().take(10).cloned().collect();

    let largest_file = files_vec.first().cloned().unwrap_or_default();
    let smallest_file = files_vec.last().cloned().unwrap_or_default();

    let analysis = DirectoryAnalysis {
        largest_files,
        largest_file,
        smallest_file,
    };

    match serde_json::to_string(&analysis) {
        Ok(json) => Ok(json),
        Err(e) => {
            println!("Failed to serialize directory analysis: {}", e);
            Err(format!("Failed to serialize directory analysis: {}", e))
        }
    }
}

fn get_directory_size(path: &Path) -> u64 {
    if path.is_file() {
        return path.metadata().unwrap().len();
    }
    let mut size = 0;
    match fs::read_dir(path) {
        Ok(entries) => {
            for entry in entries {
                match entry {
                    Ok(dir_entry) => {
                        let entry_path = dir_entry.path();
                        size += get_directory_size(&entry_path);
                    }
                    Err(e) => {
                        println!("Error accessing entry: {:?}", e);
                        // Handle the error as needed, such as logging or further error handling.
                    }
                }
            }
        }
        Err(e) => {
            println!("Error reading directory: {:?}", e);
            // Handle the error as needed, such as logging or further error handling.
        }
    }
    size
}

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

#[derive(Serialize)] // Add derive attribute for Serialize and Deserialize
struct DirectoryNode {
    name: String,
    #[serde(rename = "type")] // "type" is a reserved keyword in Rust, so renaming it
    node_type: String,
    children: Option<Vec<DirectoryNode>>,
}

fn traverse_directory(dir_path: &str) -> DirectoryNode {
    let mut node_children: Vec<DirectoryNode> = Vec::new();

    if let Ok(entries) = fs::read_dir(dir_path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let file_name = entry.file_name();
                let file_name_str = file_name.to_string_lossy().to_string();

                let path = entry.path();
                if path.is_dir() {
                    let path_str = path.to_string_lossy().to_string();
                    let child_node = traverse_directory(&path_str);
                    node_children.push(child_node);
                } else {
                    node_children.push(DirectoryNode {
                        name: file_name_str,
                        node_type: "file".to_string(),
                        children: None,
                    });
                }
            }
        }
    }

    DirectoryNode {
        name: dir_path.to_string(),
        node_type: "folder".to_string(),
        children: Some(node_children),
    }
}

#[tauri::command]
fn get_directory_data(dir_path: String) -> Result<String, String> {
    println!("get_directory_data() was called!");
    let directory_tree = traverse_directory(&dir_path);
    let json_data = serde_json::to_string(&directory_tree).map_err(|e| e.to_string())?;
    Ok(json_data)
}

fn main() {
    // Test analyze_disk function: <-- NOTE: This function is missing from your code!
    // let result_disk = analyze_disk().unwrap();
    // println!("Disk Result: {}", result_disk);

    // Test analyze_directory function:
    // let sample_directory_path = "/Users/yaseenahmed/Workspace/AUC/Academics/Fall 2023/OS";
    // match analyze_directory(sample_directory_path.to_string()) {
    //     Ok(result_dir) => println!("Directory Result: {}", result_dir),
    //     Err(e) => println!("Error analyzing directory: {}", e),
    // }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![analyze_directory, analyze_disk, get_directory_data]) // <-- NOTE: analyze_disk is removed as it's not provided in the code.
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
