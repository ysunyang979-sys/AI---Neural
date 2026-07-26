import os, subprocess, shutil

sdk_dir = os.path.abspath('sdk')
android_dir = os.path.abspath('android')
gradlew = os.path.join(android_dir, 'gradlew.bat')

# Detect JAVA_HOME
java_candidates = [
    r"C:\Program Files\Java\jdk-24",
    r"C:\Program Files\Java\jdk-17",
    r"E:\Tools\java"
]

java_home = None
for j in java_candidates:
    if os.path.exists(j):
        java_home = j
        break

env = os.environ.copy()
env['ANDROID_HOME'] = sdk_dir
env['ANDROID_SDK_ROOT'] = sdk_dir
if java_home:
    env['JAVA_HOME'] = java_home
    env['PATH'] = os.path.join(java_home, 'bin') + ';' + env['PATH']

print("Using JAVA_HOME:", java_home)
print("Using ANDROID_HOME:", sdk_dir)

# Local properties
with open(os.path.join(android_dir, 'local.properties'), 'w') as f:
    f.write(f"sdk.dir={sdk_dir.replace('\\', '/')}\n")

print("Starting Gradle build in", android_dir)
res = subprocess.run([gradlew, "assembleDebug"], cwd=android_dir, env=env)

print("Build return code:", res.returncode)

built_apk = os.path.join(android_dir, "app", "build", "outputs", "apk", "debug", "app-debug.apk")
target_apk = os.path.abspath("NeuralCoreAI_Pure_Clean.apk")

if os.path.exists(built_apk):
    shutil.copyfile(built_apk, target_apk)
    print("SUCCESS! Pure APK created at:", target_apk)
    print("File size:", os.path.getsize(target_apk), "bytes")
else:
    print("APK build output check:", os.path.exists(built_apk))
