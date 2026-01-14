import os
import subprocess
import shutil
import concurrent.futures
import time

def get_size(path):
    return os.path.getsize(path)

def compress_pdf(file_path):
    original_size = get_size(file_path)
    
    # Skip if file is already small (e.g. < 500KB)
    if original_size < 500 * 1024:
        return 0

    temp_output = file_path + ".temp.pdf"
    
    # Ghostscript command
    # /screen = 72 dpi (lowest quality, smallest size)
    cmd = [
        "gs",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        "-dPDFSETTINGS=/screen", 
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        f"-sOutputFile={temp_output}",
        file_path
    ]
    
    try:
        # Run ghostscript
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        if not os.path.exists(temp_output):
            return 0

        new_size = get_size(temp_output)
        
        if new_size < original_size:
            shutil.move(temp_output, file_path)
            saved = original_size - new_size
            print(f"✅ {os.path.basename(file_path)}: {original_size/1024/1024:.1f}MB -> {new_size/1024/1024:.1f}MB")
            return saved
        else:
            # print(f"⏭️  {os.path.basename(file_path)}: No reduction")
            os.remove(temp_output)
            return 0
            
    except Exception as e:
        print(f"❌ Error {os.path.basename(file_path)}: {e}")
        if os.path.exists(temp_output):
            os.remove(temp_output)
        return 0

def main():
    docs_dir = 'docs'
    pdf_files = []
    
    print("🔍 Scanning files...")
    for root, dirs, files in os.walk(docs_dir):
        for file in files:
            if file.lower().endswith('.pdf'):
                pdf_files.append(os.path.join(root, file))

    print(f"Found {len(pdf_files)} PDF files. Starting parallel compression...")
    
    start_time = time.time()
    total_saved = 0
    
    # Use CPU count for parallel workers
    max_workers = os.cpu_count() or 4
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = list(executor.map(compress_pdf, pdf_files))
    
    total_saved = sum(results)
    duration = time.time() - start_time
    
    print(f"\n🎉 Finished in {duration:.1f} seconds")
    print(f"💾 Total space saved: {total_saved/1024/1024/1024:.2f} GB")

if __name__ == "__main__":
    main()
