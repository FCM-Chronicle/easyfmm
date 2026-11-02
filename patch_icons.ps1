# patch_icons.ps1
$utf8 = [System.Text.Encoding]::UTF8
$path = "easyfmm\icons.js"
$content = [System.IO.File]::ReadAllText($path, $utf8)

$target = "        def.forEach(([tag, ...vals]) => {
            const el = document.createElementNS(SVG_NS, tag);
            ATTRS[tag].forEach((attr, i) => {
                if (vals[i] !== undefined) el.setAttribute(attr, vals[i]);
            });
            svg.appendChild(el);
        });"

$replace = "        def.forEach(([tag, ...vals]) => {
            const el = document.createElementNS(SVG_NS, tag);
            const attrs = ATTRS[tag];
            if (attrs) {
                attrs.forEach((attr, i) => {
                    if (vals[i] !== undefined) el.setAttribute(attr, vals[i]);
                });
            }
            svg.appendChild(el);
        });"

$content = $content.Replace($target.Replace("`r`n", "`n"), $replace.Replace("`r`n", "`n"))
$content = $content.Replace($target.Replace("`n", "`r`n"), $replace.Replace("`n", "`r`n"))

[System.IO.File]::WriteAllText($path, $content, $utf8)
Write-Host "icons.js patched."

