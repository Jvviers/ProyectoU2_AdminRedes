$certDir = "services/api-gateway/certs"
  New-Item -ItemType Directory -Force -Path $certDir | Out-Null
  $certPath = Join-Path $certDir "cert.pem"
  $keyPath  = Join-Path $certDir "key.pem"
  $crtPath  = Join-Path $certDir "dev.local.crt"

  # Requiere PowerShell 5.1+ y el módulo PKI (incluido en Windows)
  $cert = New-SelfSignedCertificate -DnsName "dev.local","localhost" -TextExtension @("2.5.29.17={text}ipaddress=127.0.0.1") -CertStoreLocation
  Cert:\CurrentUser\My -KeyExportPolicy Exportable -NotAfter (Get-Date).AddYears(1)
  Export-Certificate -Cert $cert -FilePath $crtPath | Out-Null
  Export-PfxCertificate -Cert $cert -FilePath "$certDir\dev.local.pfx" -Password (ConvertTo-SecureString -String "devlocal" -Force -AsPlainText) |
  Out-Null

  # Abreviamos: extrae PEMs con OpenSSL si lo tienes; si no, usa lo siguiente:
  $secret = ConvertTo-SecureString -String "devlocal" -Force -AsPlainText
  $bytes = [System.IO.File]::ReadAllBytes("$certDir\dev.local.pfx")
  $certObj = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2
  $certObj.Import($bytes, $secret, "Exportable,PersistKeySet")
  [System.IO.File]::WriteAllBytes($certPath, $certObj.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert))
  [System.IO.File]::WriteAllBytes($keyPath, $certObj.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Pkcs8PrivateKey))
  Write-Host "Certs listos en $certDir"