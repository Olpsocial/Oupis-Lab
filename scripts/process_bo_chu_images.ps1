
$sourceDir = "C:\Users\Admin\Documents\Bussines\Website\Images Product Nha Kim Huong\bộ chữ"
$destDir = "c:\Users\Admin\Documents\Bussines\Website\Nha-Kim-Huong\public\assets\products"
$files = Get-ChildItem -Path $sourceDir -Filter *.jpg

$imagePaths = @()
$i = 1

foreach ($file in $files) {
    $newName = "bo-chu-full-$i.jpg"
    $destPath = Join-Path -Path $destDir -ChildPath $newName
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    $imagePaths += "/assets/products/$newName"
    $i++
}

# Output the JSON array for usage in the next step
$jsonString = $imagePaths | ConvertTo-Json -Compress
Write-Output "IMAGES_JSON_START"
Write-Output $jsonString
Write-Output "IMAGES_JSON_END"
