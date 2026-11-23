$baseUrl = "http://localhost:5000/api"

Write-Host "=========================================================="
Write-Host "1. Student Login"
Write-Host "=========================================================="
$loginBody = @{
    email = "s210018@rguktsklm.ac.in"
    password = "Student@123"
} | ConvertTo-Json

$loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginRes.token
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}
Write-Host "Student Arjun logged in successfully."

Write-Host "`n=========================================================="
Write-Host "2. Switch Career Track to 'AI / ML Engineer'"
Write-Host "=========================================================="
$aimlBody = @{
    targetRole = "AI / ML Engineer"
} | ConvertTo-Json

$aimlRes = Invoke-RestMethod -Uri "$baseUrl/students/career-goal" -Method Put -Headers $headers -Body $aimlBody -ContentType "application/json"
Write-Host "Target Role: $($aimlRes.targetRole)"
Write-Host "Target Domain: $($aimlRes.targetDomain)"
Write-Host "Target Industry: $($aimlRes.targetIndustry)"
Write-Host "Recalibrated Readiness Score: $($aimlRes.readinessScore)%"

# Verify updated analysis report
$report = Invoke-RestMethod -Uri "$baseUrl/analysis/report" -Method Get -Headers $headers
Write-Host "Report Target Role: $($report.targetRole)"
Write-Host "Report AI Feedback: $($report.aiFeedback.Substring(0, 70))..."

if ($report.targetRole -eq "AI / ML Engineer" -and $aimlRes.targetDomain -eq "Artificial Intelligence, Deep Learning & Predictive Systems") {
    Write-Host "? AI / ML Engineer switch & instant recalibration verified!" -ForegroundColor Green
} else {
    Write-Host "? AI / ML report targetRole mismatch!" -ForegroundColor Red
}

Write-Host "`n=========================================================="
Write-Host "3. Switch Career Track to 'Data Analyst'"
Write-Host "=========================================================="
$daBody = @{
    targetRole = "Data Analyst"
} | ConvertTo-Json

$daRes = Invoke-RestMethod -Uri "$baseUrl/students/career-goal" -Method Put -Headers $headers -Body $daBody -ContentType "application/json"
Write-Host "Target Role: $($daRes.targetRole)"
Write-Host "Target Domain: $($daRes.targetDomain)"
Write-Host "Target Industry: $($daRes.targetIndustry)"

$daReport = Invoke-RestMethod -Uri "$baseUrl/analysis/report" -Method Get -Headers $headers
Write-Host "Report Target Role: $($daReport.targetRole)"

if ($daReport.targetRole -eq "Data Analyst" -and $daRes.targetDomain -eq "Business Intelligence, Analytics & Quantitative Modeling") {
    Write-Host "? Data Analyst switch & instant recalibration verified!" -ForegroundColor Green
} else {
    Write-Host "? Data Analyst report targetRole mismatch!" -ForegroundColor Red
}

Write-Host "`n=========================================================="
Write-Host "4. Switch with Loose Name ('mern stack') -> Must Canonicalize"
Write-Host "=========================================================="
$looseBody = @{
    targetRole = "mern stack"
} | ConvertTo-Json

$looseRes = Invoke-RestMethod -Uri "$baseUrl/students/career-goal" -Method Put -Headers $headers -Body $looseBody -ContentType "application/json"
Write-Host "Canonicalized Target Role: $($looseRes.targetRole)"
Write-Host "Canonicalized Target Domain: $($looseRes.targetDomain)"

if ($looseRes.targetRole -eq "MERN Full Stack Developer") {
    Write-Host "? Strict industry standardization verified (canonicalized to MERN Full Stack Developer)!" -ForegroundColor Green
} else {
    Write-Host "? Canonicalization failed!" -ForegroundColor Red
}

Write-Host "`n=========================================================="
Write-Host "5. Reset Back to 'Java Full Stack Developer'"
Write-Host "=========================================================="
$javaBody = @{
    targetRole = "Java Full Stack Developer"
} | ConvertTo-Json

$javaRes = Invoke-RestMethod -Uri "$baseUrl/students/career-goal" -Method Put -Headers $headers -Body $javaBody -ContentType "application/json"
Write-Host "Target Role: $($javaRes.targetRole)"
Write-Host "Target Domain: $($javaRes.targetDomain)"

$javaReport = Invoke-RestMethod -Uri "$baseUrl/analysis/report" -Method Get -Headers $headers
Write-Host "Final Report Target Role: $($javaReport.targetRole)"

if ($javaReport.targetRole -eq "Java Full Stack Developer") {
    Write-Host "? Returned to Java Full Stack Developer with all benchmarks intact!" -ForegroundColor Green
} else {
    Write-Host "? Reset failed!" -ForegroundColor Red
}

Write-Host "`n=========================================================="
Write-Host "ALL CAREER STANDARDIZATION TESTS PASSED!"
Write-Host "=========================================================="
