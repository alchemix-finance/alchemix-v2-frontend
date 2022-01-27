
Remove-Item "$($PWD.Path)\..\src\abi" -Recurse -Force -ErrorAction SilentlyContinue
git clone git@github.com:alchemix-finance/v2-testnet-artifacts.git;
New-Item -Type dir -Path "$($PWD.Path)\..\src\abi\"
Get-ChildItem -Path "$($PWD.Path)\v2-testnet-artifacts\localhost\*" -Include "*.json" | Select-Object -ExpandProperty FullName | Copy-Item  -Destination "$($PWD.Path)\..\src\abi\" -Recurse
Remove-Item "$($PWD.Path)\v2-testnet-artifacts" -Recurse -Force -ErrorAction SilentlyContinue 