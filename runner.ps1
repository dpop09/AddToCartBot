param (
    [string]$TagId = "M;020;O1;R",
    [int]$Instances = 1
)


# Starting number
$port = 9222
$basePath = [System.IO.Path]::GetTempPath()

for ($i = 1; $i -le $Instances; $i++) {
    #Create tmp folder
    $folderName = "Chrome_$i"
    $folderPath = Join-Path $basePath $folderName
    New-Item -Force -Path $folderPath -ItemType Directory

    Start-Process chrome -ArgumentList --remote-debugging-port=$port,--user-data-dir=$folderPath
    $node = "node"
    $arguments = "addToCart.js --port $port --tag_id $TagId"
    Start-Process $node $arguments
    $port++
    Start-Sleep -Seconds 2
}