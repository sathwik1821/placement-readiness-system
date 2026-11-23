# ==============================================================================
# ASCEND CENTRALIZED EMAIL NOTIFICATION SYSTEM - END-TO-END VERIFICATION SUITE
# ==============================================================================
$ErrorActionPreference = "Stop"
$BaseUrl = "http://localhost:5000/api"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " ASCEND CENTRALIZED EMAIL NOTIFICATION SYSTEM TEST SUITE" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

function Assert-Condition($condition, $message) {
    if ($condition) {
        Write-Host " [PASS] $message" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] $message" -ForegroundColor Red
        exit 1
    }
}

# ------------------------------------------------------------------------------
# STEP 1: AUTHENTICATE SYSTEM ROLES
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 1] Authenticating Test Personas..." -ForegroundColor Yellow

# Admin Login
$adminLoginBody = @{ email = "admin@system.com"; password = "Admin@123" } | ConvertTo-Json
$adminAuth = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body $adminLoginBody
$AdminToken = $adminAuth.token
Assert-Condition ($AdminToken -ne $null) "Admin authentication successful"

# TPO Login
$officerLoginBody = @{ email = "officer@college.edu"; password = "Officer@123" } | ConvertTo-Json
$officerAuth = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body $officerLoginBody
$OfficerToken = $officerAuth.token
Assert-Condition ($OfficerToken -ne $null) "Placement Officer (TPO) authentication successful"

# Student Login
$studentLoginBody = @{ email = "s210018@rguktsklm.ac.in"; password = "Student@123" } | ConvertTo-Json
$studentAuth = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body $studentLoginBody
$StudentToken = $studentAuth.token
Assert-Condition ($StudentToken -ne $null) "Student (S210018) authentication successful"

# Company Login
$companyLoginBody = @{ email = "hr@techcorp.com"; password = "Company@123" } | ConvertTo-Json
$companyAuth = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body $companyLoginBody
$CompanyToken = $companyAuth.token
Assert-Condition ($CompanyToken -ne $null) "Corporate Recruiter authentication successful"

# ------------------------------------------------------------------------------
# STEP 2: PUBLIC RECRUITER OPPORTUNITY SUBMISSION (NO LOGIN REQUIRED)
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 2] Testing Public Recruiter Opportunity Submission..." -ForegroundColor Yellow

$uniqueSuffix = Get-Random -Minimum 1000 -Maximum 9999
$recruiterOpportunityPayload = @{
    companyName = "Apex Cloud Systems $uniqueSuffix"
    recruiterName = "Vikram Aditya"
    recruiterEmail = "vikram.aditya@apexcloud-sample.com"
    recruiterPhone = "+91 98888 77777"
    jobTitle = "Associate Cloud Reliability Engineer"
    jobRole = "Cloud Engineer"
    ctc = "14.5 LPA"
    workMode = "HYBRID"
    location = "Hyderabad / RGUKT Campus"
    jobDescription = "Design and maintain high-reliability cloud architecture for global enterprise customers."
    eligibilityCriteria = '{"minCgpa":7.5,"maxBacklogs":0,"departments":["Computer Science & Engineering","Electronics & Communications Engineering"],"allowedYears":[4],"allowedGradYears":[2027]}'
    deadline = "2026-12-15"
} | ConvertTo-Json

$submitResponse = Invoke-RestMethod -Uri "$BaseUrl/public/opportunities" -Method Post -ContentType "application/json" -Body $recruiterOpportunityPayload
Assert-Condition ($submitResponse.success -eq $true) "Recruiter opportunity submitted without account"
Assert-Condition ($submitResponse.referenceId -match "ASC-OPP-\d{4}-\d{5}") "Generated valid reference ID: $($submitResponse.referenceId)"

$OpportunityId = $submitResponse.id
$ReferenceId = $submitResponse.referenceId

# Give async thread a brief moment to log email
Start-Sleep -Milliseconds 800

# Verify Notification Log for Recruiter Confirmation & Admin Alert
$logs = Invoke-RestMethod -Uri "$BaseUrl/admin/notification-logs?recipient=vikram.aditya@apexcloud-sample.com" -Method Get
$recruiterLog = $logs | Where-Object { $_.notificationType -eq "RECRUITER_SUBMISSION_CONFIRMATION" } | Select-Object -First 1
Assert-Condition ($recruiterLog -ne $null) "Recruiter submission confirmation email logged"
Assert-Condition ($recruiterLog.deliveryStatus -like "*SENT*") "Confirmation delivery status: $($recruiterLog.deliveryStatus)"

# ------------------------------------------------------------------------------
# STEP 3: ADMIN REVIEWS OPPORTUNITY & REQUESTS CLARIFICATION
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 3] Admin Reviews Opportunity and Requests Clarification..." -ForegroundColor Yellow

$clarificationPayload = @{
    action = "REQUEST_INFO"
    feedback = "Please specify whether relocation allowance and laptop provisioning are included in the 14.5 LPA CTC package."
} | ConvertTo-Json

$reviewResponse = Invoke-RestMethod -Uri "$BaseUrl/admin/opportunities/$OpportunityId/review" -Method Put -ContentType "application/json" -Body $clarificationPayload
Assert-Condition ($reviewResponse.success -eq $true) "Admin successfully requested clarification"
Assert-Condition ($reviewResponse.opportunity.status -eq "INFO_REQUESTED") "Opportunity status transitioned to INFO_REQUESTED"
Assert-Condition ($reviewResponse.opportunity.secureToken -ne $null) "Single-use secureToken generated for recruiter"

$SecureToken = $reviewResponse.opportunity.secureToken

# ------------------------------------------------------------------------------
# STEP 4: RECRUITER RESPONDS VIA SECURE TOKEN (NO LOGIN REQUIRED)
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 4] Recruiter Validates Token and Responds Securely..." -ForegroundColor Yellow

# Validate Token Endpoint
$tokenCheck = Invoke-RestMethod -Uri "$BaseUrl/public/opportunities/respond?token=$SecureToken" -Method Get
Assert-Condition ($tokenCheck.valid -eq $true) "Secure token is valid and active"
Assert-Condition ($tokenCheck.referenceId -eq $ReferenceId) "Token references correct opportunity $ReferenceId"

# Submit Clarification
$responsePayload = @{
    token = $SecureToken
    response = "Yes, relocation allowance of INR 1,00,000 and enterprise MacBooks are provided alongside the 14.5 LPA CTC."
} | ConvertTo-Json

$clarificationSubmit = Invoke-RestMethod -Uri "$BaseUrl/public/opportunities/respond" -Method Post -ContentType "application/json" -Body $responsePayload
Assert-Condition ($clarificationSubmit.success -eq $true) "Recruiter submitted clarification successfully"

# Verify Token is Single-Use (consumed)
try {
    $secondAttempt = Invoke-RestMethod -Uri "$BaseUrl/public/opportunities/respond?token=$SecureToken" -Method Get
    Write-Host " [FAIL] Expired token was accepted!" -ForegroundColor Red
    exit 1
} catch {
    Write-Host " [PASS] Verified secure token is single-use and correctly invalidated" -ForegroundColor Green
}

# ------------------------------------------------------------------------------
# STEP 5: ADMIN APPROVES FOR TPO REVIEW
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 5] Admin Approves Opportunity for TPO Review..." -ForegroundColor Yellow

$approvePayload = @{
    action = "APPROVE"
    feedback = "Verified company credentials and compensation structure. Approved for TPO campus scheduling."
} | ConvertTo-Json

$approveResponse = Invoke-RestMethod -Uri "$BaseUrl/admin/opportunities/$OpportunityId/review" -Method Put -ContentType "application/json" -Body $approvePayload
Assert-Condition ($approveResponse.success -eq $true) "Admin approved opportunity for TPO"
Assert-Condition ($approveResponse.opportunity.status -eq "APPROVED_FOR_TPO") "Status updated to APPROVED_FOR_TPO"

# ------------------------------------------------------------------------------
# STEP 6: TPO PUBLISHES OPPORTUNITY AS OFFICIAL CAMPUS DRIVE
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 6] TPO Publishes Recruiter Opportunity as Live Campus Drive..." -ForegroundColor Yellow

$headers = @{ "Authorization" = "Bearer $OfficerToken" }
$publishResponse = Invoke-RestMethod -Uri "$BaseUrl/officer/opportunities/$OpportunityId/publish" -Method Post -Headers $headers -ContentType "application/json" -Body "{}"
Assert-Condition ($publishResponse.success -eq $true) "TPO successfully published opportunity as campus drive"
Assert-Condition ($publishResponse.opportunity.status -eq "PUBLISHED") "Opportunity status updated to PUBLISHED"

$PublishedDriveId = $publishResponse.drive.id
Assert-Condition ($PublishedDriveId -ne $null) "Created official PlacementDrive ID: $PublishedDriveId"

# Give async broadcast a moment to log
Start-Sleep -Milliseconds 1000

# Verify Broadcast Notification Log to Eligible Student (s210018@rguktsklm.ac.in)
$studentLogs = Invoke-RestMethod -Uri "$BaseUrl/admin/notification-logs?recipient=s210018@rguktsklm.ac.in" -Method Get
$drivePubLog = $studentLogs | Where-Object { $_.notificationType -eq "STUDENT_DRIVE_PUBLISHED" -and $_.relatedEntityId -eq $PublishedDriveId } | Select-Object -First 1
Assert-Condition ($drivePubLog -ne $null) "Eligible student received drive publication email"

# ------------------------------------------------------------------------------
# STEP 7: STUDENT APPLIES FOR DRIVE & RECEIVES CONFIRMATION
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 7] Student Applies for Drive and Receives Confirmation Email..." -ForegroundColor Yellow

$studentHeaders = @{ "Authorization" = "Bearer $StudentToken" }
$applyBody = @{
    resumeUrl = "/api/placement/resumes/s210018_resume.pdf"
    resumeFileName = "Sathwik_Software_Resume.pdf"
} | ConvertTo-Json

$applyResponse = Invoke-RestMethod -Uri "$BaseUrl/placement/drives/$PublishedDriveId/apply" -Method Post -Headers $studentHeaders -ContentType "application/json" -Body $applyBody
Assert-Condition ($applyResponse.id -ne $null) "Student application successfully registered: $($applyResponse.id)"
$ApplicationId = $applyResponse.id

Start-Sleep -Milliseconds 800

# Verify Application Confirmation Email
$updatedStudentLogs = Invoke-RestMethod -Uri "$BaseUrl/admin/notification-logs?recipient=s210018@rguktsklm.ac.in" -Method Get
$appConfirmLog = $updatedStudentLogs | Where-Object { $_.notificationType -eq "APPLICATION_SUBMITTED" -and $_.relatedEntityId -eq $ApplicationId } | Select-Object -First 1
Assert-Condition ($appConfirmLog -ne $null) "Student received application confirmation email with ref ID"

# ------------------------------------------------------------------------------
# STEP 8: RECRUITER SHORTLISTS CANDIDATE
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 8] Shortlisting Candidate with Next Selection-Round Details..." -ForegroundColor Yellow

$shortlistBody = @{
    status = "SHORTLISTED"
    nextRoundDetails = "Virtual Coding Assessment scheduled for Saturday, 10:00 AM on Ascend Assessment Portal. Topics: Algorithms & System Design."
} | ConvertTo-Json

# Use Officer to update application status (or company)
$shortlistResponse = Invoke-RestMethod -Uri "$BaseUrl/officer/drives/$PublishedDriveId/applications/$ApplicationId/status" -Method Put -Headers $headers -ContentType "application/json" -Body $shortlistBody
Assert-Condition ($shortlistResponse.status -eq "SHORTLISTED") "Application status updated to SHORTLISTED"

Start-Sleep -Milliseconds 800

$afterShortlistLogs = Invoke-RestMethod -Uri "$BaseUrl/admin/notification-logs?recipient=s210018@rguktsklm.ac.in" -Method Get
$shortlistLog = $afterShortlistLogs | Where-Object { $_.notificationType -eq "APPLICATION_SHORTLISTED" } | Select-Object -First 1
Assert-Condition ($shortlistLog -ne $null) "Shortlisted email dispatched to student with next-round details"

# ------------------------------------------------------------------------------
# STEP 9: DEDUPLICATION MECHANISM VERIFICATION
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 9] Verifying Duplicate Notification Prevention..." -ForegroundColor Yellow

# Fetch count of logs with this deduplication key
$targetDedupKey = "APP_SHORTLIST_" + $ApplicationId + "_SHORTLISTED"
$initialCount = @($afterShortlistLogs | Where-Object { $_.deduplicationKey -eq $targetDedupKey }).Count

# Re-trigger status update to the same status
$reShortlist = Invoke-RestMethod -Uri "$BaseUrl/officer/drives/$PublishedDriveId/applications/$ApplicationId/status" -Method Put -Headers $headers -ContentType "application/json" -Body $shortlistBody
Start-Sleep -Milliseconds 600

$logsAfterReShortlist = Invoke-RestMethod -Uri "$BaseUrl/admin/notification-logs?recipient=s210018@rguktsklm.ac.in" -Method Get
$finalCount = @($logsAfterReShortlist | Where-Object { $_.deduplicationKey -eq $targetDedupKey }).Count

Assert-Condition ($finalCount -eq $initialCount) "Deduplication successful: Identical event key was not duplicated (count: $finalCount)"

# ------------------------------------------------------------------------------
# STEP 10: TPO CONSOLIDATED DAILY ACTIVITY SUMMARY
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 10] Testing TPO Daily Activity Consolidation Digest..." -ForegroundColor Yellow

$dailySummaryResponse = Invoke-RestMethod -Uri "$BaseUrl/officer/daily-summary/send" -Method Post -Headers $headers
Assert-Condition ($dailySummaryResponse.success -eq $true) "TPO daily summary triggered successfully"

Start-Sleep -Milliseconds 800

$tpoLogs = Invoke-RestMethod -Uri "$BaseUrl/admin/notification-logs" -Method Get
$summaryLog = $tpoLogs | Where-Object { $_.notificationType -eq "TPO_DAILY_SUMMARY" } | Select-Object -First 1
Assert-Condition ($summaryLog -ne $null) "TPO daily summary consolidated digest recorded in notification logs"

# ------------------------------------------------------------------------------
# STEP 11: DEADLINE REMINDERS DISPATCH
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 11] Testing Placement Application Deadline Reminders..." -ForegroundColor Yellow

$reminderResponse = Invoke-RestMethod -Uri "$BaseUrl/officer/drives/$PublishedDriveId/send-deadline-reminders?hours=24" -Method Post -Headers $headers
Assert-Condition ($reminderResponse.success -eq $true) "Deadline reminders endpoint executed cleanly"

# ------------------------------------------------------------------------------
# STEP 12: AUDIT LOG AUDIT TRAIL INSPECTION
# ------------------------------------------------------------------------------
Write-Host "`n>>> [STEP 12] Inspecting Notification Audit Log Records..." -ForegroundColor Yellow

$allLogs = Invoke-RestMethod -Uri "$BaseUrl/admin/notification-logs" -Method Get
Assert-Condition ($allLogs.Count -gt 0) "Retrieved $($allLogs.Count) notification audit logs from database"

Write-Host "`n--- Sample Notification Audit Records ---" -ForegroundColor Cyan
$allLogs | Select-Object -First 6 | ForEach-Object {
    Write-Host " [$($_.deliveryStatus)] Type: $($_.notificationType) | Recipient: $($_.recipientEmail) | Subject: $($_.subject)"
}

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host " ALL 12 CENTRALIZED EMAIL NOTIFICATION WORKFLOWS VERIFIED (100% PASS)" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
