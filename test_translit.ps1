# test_translit.ps1
$utf8 = [System.Text.Encoding]::UTF8

# Sample test of names
$sampleNames = @(
    "Tommy Setford", "Kepa", "David Raya", "Ezri Konsa", "Gabriel Jesus",
    "Reiss Nelson", "Ben White", "Illan Meslier", "Martin Zubimendi",
    "Jurrien Timber", "Noni Madueke", "Piero Hincapie", "Christos Tzolis",
    "Fabio Vieira", "Riccardo Calafiori", "Cristhian Mosquera",
    "Ethan Nwaneri", "Myles Lewis-Skelly", "Kylian Mbappe", "Thibaut Courtois",
    "Luka Modric", "Jude Bellingham", "Rodrygo", "Vinicius Junior",
    "Jesse Lingard", "Stanislav Iljutcenko", "Ki Sung Yueng"
)

Write-Host "Sample size: $($sampleNames.Count)"

