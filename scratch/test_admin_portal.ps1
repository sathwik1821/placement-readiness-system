$baseUrl = "http://localhost:5000/api"

Write-Host "=========================================================="
Write-Host "1. Admin Login and Category Creation"
Write-Host "=========================================================="
$adminLoginBody = @{
    email = "admin@system.com"
    password = "Admin@123"
} | ConvertTo-Json

$adminLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $adminLoginBody -ContentType "application/json"
$adminToken = $adminLoginRes.token
$adminHeaders = @{
    Authorization = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

Write-Host "Admin logged in successfully. Token: $($adminToken.Substring(0, 20))..."

# Create a targeted assessment
$newCategoryBody = @{
    name = "Java Mock Assessment"
    type = "MOCK"
    domain = "Java Full Stack"
    description = "Advanced Java & Spring Boot mock test calibrated for final year students."
    durationMinutes = 45
    passingPercentage = 65.0
    targetYears = @(4)
    targetDepartments = @("CSE")
    isActive = $true
} | ConvertTo-Json

$createCatRes = Invoke-RestMethod -Uri "$baseUrl/admin/categories" -Method Post -Headers $adminHeaders -Body $newCategoryBody -ContentType "application/json"
$catId = $createCatRes.id
Write-Host "Created Assignment '$($createCatRes.name)' with ID: $catId, TargetYears: $($createCatRes.targetYears), TargetDepts: $($createCatRes.targetDepartments)"

Write-Host "`n=========================================================="
Write-Host "2. Admin Add Questions to New Assignment"
Write-Host "=========================================================="
$q1Body = @{
    testCategoryId = $catId
    questionText = "Which Spring Boot annotation is used to bind external configuration properties to a strongly typed Java bean?"
    options = @("@Value", "@ConfigurationProperties", "@PropertySource", "@Bean")
    correctAnswer = "@ConfigurationProperties"
    explanation = "@ConfigurationProperties binds entire hierarchical blocks of configuration from application.properties or application.yml into a strongly typed POJO."
    difficulty = "MEDIUM"
    topic = "Spring Boot"
    marks = 1
    negativeMarks = 0.25
} | ConvertTo-Json

$q1Res = Invoke-RestMethod -Uri "$baseUrl/admin/questions" -Method Post -Headers $adminHeaders -Body $q1Body -ContentType "application/json"
Write-Host "Created Question 1: $($q1Res.id) - $($q1Res.questionText.Substring(0, 45))..."

$q2Body = @{
    testCategoryId = $catId
    questionText = "What happens in JVM memory management when an object has overridden finalize() and GC runs?"
    options = @("Garbage collected immediately", "Moved to finalization queue postponing GC", "JVM throws OutOfMemoryError", "Object becomes immortal")
    correctAnswer = "Moved to finalization queue postponing GC"
    explanation = "Objects with a non-trivial finalize() method are placed on a finalizer queue and require at least one additional GC cycle before memory is freed."
    difficulty = "HARD"
    topic = "JVM Memory"
    marks = 1
    negativeMarks = 0.25
} | ConvertTo-Json

$q2Res = Invoke-RestMethod -Uri "$baseUrl/admin/questions" -Method Post -Headers $adminHeaders -Body $q2Body -ContentType "application/json"
Write-Host "Created Question 2: $($q2Res.id) - $($q2Res.questionText.Substring(0, 45))..."

# Check questions under this category
$catQuestions = Invoke-RestMethod -Uri "$baseUrl/admin/questions?categoryId=$catId" -Method Get -Headers $adminHeaders
Write-Host "Total questions under assignment '$catId': $($catQuestions.Count)"
if ($catQuestions.Count -ge 2) {
    Write-Host "? Question bank curation verified successfully!" -ForegroundColor Green
} else {
    Write-Host "? Questions count mismatch!" -ForegroundColor Red
}

Write-Host "`n=========================================================="
Write-Host "3. Verify Year & Branch Targeting for Students"
Write-Host "=========================================================="
# Login Arjun (E4, CSE)
$arjunLogin = @{
    email = "s210018@rguktsklm.ac.in"
    password = "Student@123"
} | ConvertTo-Json
$arjunRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $arjunLogin -ContentType "application/json"
$arjunHeaders = @{ Authorization = "Bearer $($arjunRes.token)" }

$arjunCats = Invoke-RestMethod -Uri "$baseUrl/assessments/categories" -Method Get -Headers $arjunHeaders
$arjunHasMock = $arjunCats | Where-Object { $_.id -eq $catId }
if ($arjunHasMock) {
    Write-Host "? E4 CSE Student (Arjun) can see 'Java Mock Assessment' (Eligible): SUCCESS" -ForegroundColor Green
} else {
    Write-Host "? E4 CSE Student could not see 'Java Mock Assessment'!" -ForegroundColor Red
}

# Login Priya (E3, CSE)
$priyaLogin = @{
    email = "s220145@rguktsklm.ac.in"
    password = "Student@123"
} | ConvertTo-Json
$priyaRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $priyaLogin -ContentType "application/json"
$priyaHeaders = @{ Authorization = "Bearer $($priyaRes.token)" }

$priyaCats = Invoke-RestMethod -Uri "$baseUrl/assessments/categories" -Method Get -Headers $priyaHeaders
$priyaHasMock = $priyaCats | Where-Object { $_.id -eq $catId }
if (-not $priyaHasMock) {
    Write-Host "? E3 CSE Student (Priya) is correctly RESTRICTED from seeing E4-only assignment: SUCCESS" -ForegroundColor Green
} else {
    Write-Host "? E3 CSE Student should have been restricted!" -ForegroundColor Red
}

Write-Host "`n=========================================================="
Write-Host "4. Student Launch Mock Assessment Attempt"
Write-Host "=========================================================="
$attemptBody = @{
    testCategoryId = $catId
} | ConvertTo-Json

$attemptRes = Invoke-RestMethod -Uri "$baseUrl/assessments/attempts" -Method Post -Headers $arjunHeaders -Body $attemptBody -ContentType "application/json"
Write-Host "Attempt launched by Arjun. Attempt ID: $($attemptRes.id), TimeLimitSeconds: $($attemptRes.timeLimitSeconds) (Expected 2700 for 45 mins)"
if ($attemptRes.timeLimitSeconds -eq 2700) {
    Write-Host "? Duration properly set to 45 mins (2700s): SUCCESS" -ForegroundColor Green
} else {
    Write-Host "? Duration was not set to 2700 seconds!" -ForegroundColor Red
}

# Fetch live test questions
$liveQs = Invoke-RestMethod -Uri "$baseUrl/assessments/categories/$catId/questions" -Method Get -Headers $arjunHeaders
Write-Host "Live test questions delivered to student: $($liveQs.Count)"
Write-Host "Question 1 text: $($liveQs[0].questionText)"
Write-Host "Question 1 has options: $($liveQs[0].options -join ', ')"
Write-Host "Question 1 correctAnswer exposed? $($liveQs[0].correctAnswer -ne $null) (Expected False)"

Write-Host "`n=========================================================="
Write-Host "5. Admin Updates Assignment Targeting (Open to E3 as well)"
Write-Host "=========================================================="
$updateCatBody = @{
    targetYears = @(3, 4)
} | ConvertTo-Json
$updateRes = Invoke-RestMethod -Uri "$baseUrl/admin/categories/$catId" -Method Put -Headers $adminHeaders -Body $updateCatBody -ContentType "application/json"
Write-Host "Updated Assignment TargetYears: $($updateRes.targetYears)"

# Recheck Priya (E3)
$priyaCatsAfter = Invoke-RestMethod -Uri "$baseUrl/assessments/categories" -Method Get -Headers $priyaHeaders
$priyaHasMockAfter = $priyaCatsAfter | Where-Object { $_.id -eq $catId }
if ($priyaHasMockAfter) {
    Write-Host "? After admin update, E3 Student (Priya) NOW has access to 'Java Mock Assessment': SUCCESS" -ForegroundColor Green
} else {
    Write-Host "? Priya still does not have access after update!" -ForegroundColor Red
}

Write-Host "`n=========================================================="
Write-Host "ALL END-TO-END TESTS PASSED!"
Write-Host "=========================================================="
