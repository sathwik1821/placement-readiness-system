$BaseUrl = "http://localhost:5000/api"

function Assert-Test($condition, $msg) {
    if ($condition) {
        Write-Host " [PASS] $msg" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $msg" -ForegroundColor Red
        exit 1
    }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ASCEND DEDICATED ROLE LOGIN & EMAIL VALIDATION TEST SUITE" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Test 1: Student Login with valid RGUKT Student Email
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "s210018@rguktsklm.ac.in"
        password = "Student@123"
        expectedRole = "STUDENT"
    } | ConvertTo-Json)
    Assert-Test ($res.token -ne $null -and $res.role -eq "STUDENT") "Student login with valid RGUKT email succeeds"
} catch {
    Assert-Test $false "Student login failed: $_"
}

# Test 2: Student Login rejected when attempting non-student email format
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "john.doe@gmail.com"
        password = "Student@123"
        expectedRole = "STUDENT"
    } | ConvertTo-Json)
    Assert-Test $false "Should have rejected non-RGUKT student email"
} catch {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Assert-Test ($errBody -match "RGUKT student institutional email") "Student portal properly rejects non-RGUKT email with expected message"
}

# Test 3: TPO Login with valid TPO email format
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "officer@college.edu"
        password = "Officer@123"
        expectedRole = "PLACEMENT_OFFICER"
    } | ConvertTo-Json)
    Assert-Test ($res.token -ne $null -and $res.role -eq "PLACEMENT_OFFICER") "TPO login with valid officer email succeeds"
} catch {
    Assert-Test $false "TPO login failed: $_"
}

# Test 4: TPO Login rejected when format does not match TPO requirement
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "regular.teacher@college.edu"
        password = "Officer@123"
        expectedRole = "PLACEMENT_OFFICER"
    } | ConvertTo-Json)
    Assert-Test $false "Should have rejected non-TPO email"
} catch {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Assert-Test ($errBody -match "TPO institutional email format") "TPO portal properly rejects non-TPO email format with expected message"
}

# Test 5: Corporate Recruiter Login (No institutional domain restriction)
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "hr@techcorp.com"
        password = "Company@123"
        expectedRole = "COMPANY"
    } | ConvertTo-Json)
    Assert-Test ($res.token -ne $null -and $res.role -eq "COMPANY") "Recruiter login without institutional restriction succeeds"
} catch {
    Assert-Test $false "Recruiter login failed: $_"
}

# Test 6: Admin Login with valid admin email
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "admin@system.com"
        password = "Admin@123"
        expectedRole = "ADMIN"
    } | ConvertTo-Json)
    Assert-Test ($res.token -ne $null -and $res.role -eq "ADMIN") "Administrator login with admin email succeeds"
} catch {
    Assert-Test $false "Admin login failed: $_"
}

# Test 7: Admin Login rejected when non-admin email is provided
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "teacher@college.edu"
        password = "Admin@123"
        expectedRole = "ADMIN"
    } | ConvertTo-Json)
    Assert-Test $false "Should have rejected non-admin email"
} catch {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Assert-Test ($errBody -match "authorized administrator email address") "Admin portal properly rejects non-admin email with expected message"
}

# Test 8: Cross-portal role mismatch rejection
try {
    $res = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body (@{
        email = "s210018@rguktsklm.ac.in"
        password = "Student@123"
        expectedRole = "ADMIN"
    } | ConvertTo-Json)
    Assert-Test $false "Should have rejected role mismatch"
} catch {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $errBody = $reader.ReadToEnd()
    Assert-Test ($errBody -match "authorized administrator email address|STUDENT|designated") "Portal properly rejects student attempting to log in on Admin portal"
}

Write-Host "`nALL 8 DEDICATED ROLE LOGIN & EMAIL VALIDATION TESTS PASSED (100% OK)" -ForegroundColor Green
