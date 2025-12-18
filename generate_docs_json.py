#!/usr/bin/env python3
"""
Скрипт для генерации JSON структуры документов детского сада "Құлыншақ 2019".
Создает файл docs/js/documents.json с информацией о папках и файлах.
"""

import os
import json
import sys
from pathlib import Path

# Игнорируемые папки (не включаем в список документов)
IGNORE_FOLDERS = {'docs', '.git', '__pycache__', 'scripts', 'node_modules', 'venv'}

# Расширения файлов и их типы
FILE_TYPES = {
    '.pdf': 'pdf',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.doc': 'document',
    '.docx': 'document',
    '.xls': 'document',
    '.xlsx': 'document',
    '.txt': 'text',
    '.zip': 'archive',
    '.rar': 'archive',
}

def get_file_type(filename):
    """Определяем тип файла по расширению"""
    ext = os.path.splitext(filename)[1].lower()
    return FILE_TYPES.get(ext, 'unknown')

def scan_directory(root_dir):
    """Рекурсивно сканируем директорию и возвращаем структуру папок и файлов"""
    folders = []
    
    # Получаем список всех элементов в корневой директории
    for item in os.listdir(root_dir):
        item_path = os.path.join(root_dir, item)
        
        # Пропускаем игнорируемые папки
        if item in IGNORE_FOLDERS:
            continue
            
        # Если это папка (и не является скрытой)
        if os.path.isdir(item_path) and not item.startswith('.'):
            folder_data = {
                'name': item,
                'path': item,
                'files': []
            }
            
            # Сканируем файлы в папке
            try:
                for file_item in os.listdir(item_path):
                    file_path = os.path.join(item_path, file_item)
                    
                    # Если это файл (не папка и не скрытый)
                    if os.path.isfile(file_path) and not file_item.startswith('.'):
                        file_type = get_file_type(file_item)
                        
                        file_data = {
                            'name': file_item,
                            'path': f"docs/docs/{item}/{file_item}",
                            'type': file_type,
                            'size': os.path.getsize(file_path)
                        }
                        folder_data['files'].append(file_data)
                    
                # Сортируем файлы по имени
                folder_data['files'].sort(key=lambda x: x['name'])
                
            except (PermissionError, OSError) as e:
                print(f"Ошибка при сканировании папки {item}: {e}")
                continue
                
            # Добавляем папку только если в ней есть файлы
            if folder_data['files']:
                folders.append(folder_data)
    
    # Сортируем папки по имени
    folders.sort(key=lambda x: x['name'])
    
    return folders

def main():
    """Основная функция"""
    # Текущая рабочая директория
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    print(f"Сканируем директорию: {current_dir}")
    
    # Сканируем структуру документов
    folders = scan_directory(current_dir)
    
    # Создаем итоговую структуру
    data = {
        'folders': folders,
        'total_folders': len(folders),
        'total_files': sum(len(folder['files']) for folder in folders),
        'generated_at': json.dumps(str(os.path.getmtime(__file__))),  # временная метка
    }
    
    # Путь для сохранения JSON
    output_dir = os.path.join(current_dir, 'docs', 'js')
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'documents.json')
    
    # Сохраняем JSON
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"JSON файл создан: {output_path}")
    print(f"Найдено папок: {len(folders)}")
    print(f"Найдено файлов: {data['total_files']}")
    
    # Выводим список папок для проверки
    print("\nСписок папок:")
    for folder in folders:
        print(f"  - {folder['name']} ({len(folder['files'])} файлов)")

if __name__ == '__main__':
    main()
