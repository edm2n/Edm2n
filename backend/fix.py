# fix.py
file_path = "server.py"  # ضع اسم ملف السيرفر الخاص بك هنا إذا كان مختلفاً

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# استبدال المسافات غير المرئية (\xa0) بمسافات عادية
cleaned_content = content.replace("\xa0", " ")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(cleaned_content)

print("تم تنظيف الملف وإزالة المسافات المخفية بنجاح!")  
