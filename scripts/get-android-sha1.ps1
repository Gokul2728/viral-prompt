# Get Android Debug Keystore SHA1 Fingerprint
# For use with Google OAuth Android credentials

$keystorePath = "$env:USERPROFILE\.android\debug.keystore"

if (-Not (Test-Path $keystorePath)) {
    Write-Host "Android debug keystore not found" -ForegroundColor Red
    exit 1
}

Write-Host "Getting SHA1 fingerprint..." -ForegroundColor Cyan

# Try common keytool locations
$keytoolPath = $null
$candidates = @(
    "C:\Program Files\Java\jdk-*\bin\keytool.exe",
    "C:\Program Files\Android\Android Studio\jre\bin\keytool.exe"
)

foreach ($pattern in $candidates) {
    $found = @(Get-Item $pattern -ErrorAction SilentlyContinue)
    if ($found.Count -gt 0) {
        $keytoolPath = $found[0].FullName
        break
    }
}

if (-Not $keytoolPath) {
    Write-Host "keytool not found. Install Java JDK first." -ForegroundColor Red
    exit 1
}

& $keytoolPath -list -v -keystore $keystorePath -alias androiddebugkey -storepass android -keypass android 2>$null | Select-String "SHA1"
