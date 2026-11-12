Add-Type -AssemblyName System.Drawing

function New-RoundRect([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $p.AddArc($x, $y, 2*$r, 2*$r, 180, 90)
  $p.AddArc($x + $w - 2*$r, $y, 2*$r, 2*$r, 270, 90)
  $p.AddArc($x + $w - 2*$r, $y + $h - 2*$r, 2*$r, 2*$r, 0, 90)
  $p.AddArc($x, $y + $h - 2*$r, 2*$r, 2*$r, 90, 90)
  $p.CloseFigure()
  return $p
}

$size = 1024
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = 'AntiAlias'
$g.TextRenderingHint = 'AntiAliasGridFit'

# fundo com gradiente azul escuro
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point 0, 0), (New-Object System.Drawing.Point $size, $size),
  [System.Drawing.Color]::FromArgb(27, 38, 50), [System.Drawing.Color]::FromArgb(42, 61, 84))
$g.FillRectangle($bg, 0, 0, $size, $size)

# moldura arredondada
$frame = New-RoundRect 0 0 $size $size 180
$g.FillPath($bg, $frame)

# grade 2x2 de tiles
$tile = 400
$gap = 48
$start = ([int](($size - (2*$tile + $gap)) / 2))
$values = @('2','2','4','8')
$colors = @(
  [System.Drawing.Color]::FromArgb(242,177,121),
  [System.Drawing.Color]::FromArgb(237,200,80),
  [System.Drawing.Color]::FromArgb(246,94,59),
  [System.Drawing.Color]::FromArgb(237,194,46)
)
$font = New-Object System.Drawing.Font('Segoe UI', 200, [System.Drawing.FontStyle]::Bold)
$white = [System.Drawing.Brushes]::White

for ($i = 0; $i -lt 4; $i++) {
  $x = $start + ($i % 2) * ($tile + $gap)
  $y = $start + ([int][Math]::Floor($i / 2)) * ($tile + $gap)
  $tilePath = New-RoundRect $x $y $tile $tile 72
  $c1 = $colors[$i]
  $c2 = [System.Drawing.Color]::FromArgb([Math]::Max(0,$c1.R-40), [Math]::Max(0,$c1.G-40), [Math]::Max(0,$c1.B-40))
  $tbg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point $x, $y), (New-Object System.Drawing.Point ($x+$tile), ($y+$tile)), $c1, $c2)
  $g.FillPath($tbg, $tilePath)
  $sz = $g.MeasureString($values[$i], $font)
  $tx = $x + ($tile - $sz.Width) / 2
  $ty = $y + ($tile - $sz.Height) / 2 - 14
  $g.DrawString($values[$i], $font, $white, $tx, $ty)
}

$bmp.Save('D:\Documentos\2248\build\icon.png', [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
'ok'
