import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
from config import Config

class FileHandler:
    """Handle file uploads and compression"""
    
    @staticmethod
    def compress_image(file, output_path, file_extension):
        """Compress images while maintaining quality"""
        try:
            img = Image.open(file)
            
            if img.mode == 'RGBA' and file_extension in ['.jpg', '.jpeg']:
                img = img.convert('RGB')
            
            max_width = 1920
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.LANCZOS)
            
            if file_extension in ['.jpg', '.jpeg']:
                img.save(output_path, 'JPEG', quality=85, optimize=True)
            elif file_extension == '.png':
                img.save(output_path, 'PNG', optimize=True, compress_level=6)
            elif file_extension == '.webp':
                img.save(output_path, 'WEBP', quality=85, method=6)
            else:
                img.save(output_path)
            
            return output_path
        except Exception as e:
            print(f"Error compressing image: {str(e)}")
            file.save(output_path)
            return output_path
    
    @staticmethod
    def compress_pdf(file, output_path):
        """Compress PDF files"""
        try:
            from PyPDF2 import PdfReader, PdfWriter
            
            reader = PdfReader(file)
            writer = PdfWriter()
            
            for page in reader.pages:
                page.compress_content_streams()
                writer.add_page(page)
            
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            return output_path
        except Exception as e:
            print(f"Error compressing PDF: {str(e)}")
            file.save(output_path)
            return output_path
    
    @staticmethod
    def save_files(files, file_types):
        """Save uploaded files"""
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        saved_files = []
        
        for idx, file in enumerate(files):
            try:
                original_filename = secure_filename(file.filename)
                file_type = file_types[idx] if idx < len(file_types) else "unknown"
                file_extension = os.path.splitext(original_filename)[1].lower()
                unique_filename = f"{uuid.uuid4()}{file_extension}"
                file_path = os.path.join(Config.UPLOAD_FOLDER, unique_filename)
                
                if file_type == "image" and file_extension in ['.jpg', '.jpeg', '.png', '.webp']:
                    compressed_path = FileHandler.compress_image(file, file_path, file_extension)
                    file_size = os.path.getsize(compressed_path)
                elif file_extension == '.pdf':
                    compressed_path = FileHandler.compress_pdf(file, file_path)
                    file_size = os.path.getsize(compressed_path)
                else:
                    file.save(file_path)
                    file_size = os.path.getsize(file_path)
                
                saved_files.append({
                    "original_name": original_filename,
                    "saved_name": unique_filename,
                    "path": file_path,
                    "type": file_type,
                    "size": file_size,
                    "url": f"/uploads/{unique_filename}"
                })
                
            except Exception as e:
                print(f"Error saving file {file.filename}: {str(e)}")
                continue
        
        return saved_files