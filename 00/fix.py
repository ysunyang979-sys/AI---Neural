import codecs

try:
    with open('app.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if content.startswith('\ufeff'):
        content = content[1:]
        
    try:
        original_bytes = content.encode('cp936')
        restored_content = original_bytes.decode('utf-8')
        with open('app_restored.js', 'w', encoding='utf-8') as f:
            f.write(restored_content)
        print("Success: Restored using cp936->utf-8")
    except Exception as e:
        print(f"Error with cp936: {e}")
        try:
            original_bytes = content.encode('windows-1252')
            restored_content = original_bytes.decode('utf-8')
            with open('app_restored.js', 'w', encoding='utf-8') as f:
                f.write(restored_content)
            print("Success: Restored using windows-1252->utf-8")
        except Exception as e2:
            print(f"Error with windows-1252: {e2}")
except Exception as e:
    print(e)
