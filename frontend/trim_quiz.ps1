$f = "c:\Users\MyBook Hype AMD\OneDrive\code\ya anu\WEB-EDUKASI\quizz.js"
$lines = [System.IO.File]::ReadAllLines($f)
$keep = $lines[0..515]
[System.IO.File]::WriteAllLines($f, $keep)
Write-Host "Saved $($keep.Count) lines"
