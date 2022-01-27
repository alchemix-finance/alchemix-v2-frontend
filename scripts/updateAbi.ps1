
Write-Host $($PWD.Path)

Remove-Item ".\src\abi" -Recurse -Force -ErrorAction SilentlyContinue
Start-Process Powershell -ArgumentList "git clone git@github.com:alchemix-finance/v2-testnet-artifacts.git" -WorkingDirectory ".\" -NoNewWindow -Wait;
New-Item -Type dir -Path ".\src\abi\"
Get-ChildItem -Path ".\v2-testnet-artifacts\localhost\*" -Include "*.json" | Select-Object -ExpandProperty FullName | Copy-Item  -Destination ".\src\abi\" -Recurse
Remove-Item ".\v2-testnet-artifacts" -Recurse -Force -ErrorAction SilentlyContinue 