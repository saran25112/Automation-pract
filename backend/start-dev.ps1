$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Set-Location $BackendDir

$env:FLASK_APP = "app.py"
$env:FLASK_DEBUG = "1"

flask run --host 127.0.0.1 --port 8000
