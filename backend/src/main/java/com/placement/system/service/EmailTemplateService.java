package com.placement.system.service;

import com.placement.system.model.PlacementApplication;
import com.placement.system.model.PlacementDrive;
import com.placement.system.model.PlacementOfficer;
import com.placement.system.model.RecruiterOpportunity;
import com.placement.system.model.Student;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class EmailTemplateService {

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    /**
     * Reusable, mobile-responsive HTML email envelope with consistent Ascend branding.
     */
    private String wrapInAscendTemplate(String preheader, String headerBadge, String title, String subtitle, String contentHtml) {
        String safePreheader = escape(preheader);
        String safeBadge = escape(headerBadge);
        String safeTitle = escape(title);
        String safeSubtitle = escape(subtitle);

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s</title>
                <style>
                    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
                    .wrapper { width: 100%%; background-color: #f1f5f9; padding: 32px 16px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                    .header { background: linear-gradient(135deg, #0f172a 0%%, #1e293b 100%%); padding: 32px 32px 28px; text-align: left; }
                    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background-color: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(147, 197, 253, 0.3); margin-bottom: 12px; }
                    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; line-height: 1.3; }
                    .header p { margin: 6px 0 0; color: #94a3b8; font-size: 13px; font-weight: 500; }
                    .body { padding: 32px; color: #334155; font-size: 14px; line-height: 1.6; }
                    .cta-btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 700; font-size: 13px; margin: 20px 0 8px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
                    .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin: 20px 0; }
                    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
                    .info-row:last-child { border-bottom: none; }
                    .info-label { color: #64748b; font-weight: 600; }
                    .info-val { color: #0f172a; font-weight: 700; text-align: right; }
                    .footer { background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 11px; line-height: 1.5; }
                </style>
            </head>
            <body>
                <span style="display:none;font-size:0px;color:transparent;">%s</span>
                <div class="wrapper">
                    <div class="container">
                        <div class="header">
                            <span class="badge">%s</span>
                            <h1>%s</h1>
                            <p>%s</p>
                        </div>
                        <div class="body">
                            %s
                        </div>
                        <div class="footer">
                            <p style="margin: 0 0 6px 0; font-weight: 700; color: #475569;">Ascend Placement Preparation & Management Platform</p>
                            <p style="margin: 0 0 8px 0;">Rajiv Gandhi University of Knowledge Technologies (RGUKT) • Corporate Training & Placement Cell</p>
                            <p style="margin: 0; font-size: 10px; color: #94a3b8;">This is an automated institutional notification. Please do not reply directly to this email address.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        """.formatted(safeTitle, safePreheader, safeBadge, safeTitle, safeSubtitle, contentHtml);
    }

    // ==========================================
    // 1. RECRUITER NOTIFICATION TEMPLATES
    // ==========================================

    public String buildRecruiterSubmissionConfirmation(RecruiterOpportunity opp) {
        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p>Thank you for submitting a placement requisition for <strong>%s</strong> to Rajiv Gandhi University of Knowledge Technologies (RGUKT).</p>
            <p>Your submission has been received by our institutional training and placement cell and assigned a tracking reference identifier.</p>
            
            <div class="info-box">
                <div class="info-row"><span class="info-label">Submission Reference ID:</span><span class="info-val" style="color:#2563eb;font-family:monospace;">%s</span></div>
                <div class="info-row"><span class="info-label">Company Name:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Designated Job Role:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Offered Compensation (CTC):</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Work Arrangement:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Current Status:</span><span class="info-val" style="color:#eab308;">AWAITING_ADMIN_VERIFICATION</span></div>
            </div>

            <p style="font-size:13px;color:#475569;"><strong>Next Steps:</strong> The RGUKT Administration will verify the opportunity details against institutional campus drive guidelines. Once verified, it will be forwarded to the Head Placement Officer (TPO) for scheduling and publication to our eligible student cohort.</p>
            <p style="font-size:13px;color:#475569;">You will receive automated updates at this email address whenever the status changes.</p>
        """.formatted(
            escape(opp.getRecruiterName()),
            escape(opp.getCompanyName()),
            escape(opp.getReferenceId()),
            escape(opp.getCompanyName()),
            escape(opp.getJobRole()),
            escape(opp.getCtc()),
            escape(opp.getWorkMode())
        );

        return wrapInAscendTemplate(
            "Placement Requisition Received: " + opp.getReferenceId(),
            "Requisition Acknowledged",
            "Placement Opportunity Received",
            "RGUKT Institutional Placement Verification Pipeline",
            content
        );
    }

    public String buildAdminOpportunityReviewAlert(RecruiterOpportunity opp, String adminUrl) {
        String content = """
            <p>Hello <strong>Ascend Administrator</strong>,</p>
            <p>A new campus recruitment opportunity has been submitted by an external recruiter and is queued for verification.</p>

            <div class="info-box">
                <div class="info-row"><span class="info-label">Reference ID:</span><span class="info-val" style="color:#2563eb;font-family:monospace;">%s</span></div>
                <div class="info-row"><span class="info-label">Company:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Recruiter Contact:</span><span class="info-val">%s (%s)</span></div>
                <div class="info-row"><span class="info-label">Target Role:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Compensation:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Application Deadline:</span><span class="info-val">%s</span></div>
            </div>

            <p style="font-size:13px;color:#475569;">Please review the company credentials, compensation benchmark, and eligibility parameters in the Governance Console.</p>
            <div style="text-align:center;">
                <a href="%s" class="cta-btn">Review Opportunity in Admin Portal →</a>
            </div>
        """.formatted(
            escape(opp.getReferenceId()),
            escape(opp.getCompanyName()),
            escape(opp.getRecruiterName()),
            escape(opp.getRecruiterEmail()),
            escape(opp.getJobRole()),
            escape(opp.getCtc()),
            opp.getDeadline() != null ? opp.getDeadline().format(DATE_FORMATTER) : "Open / Unspecified",
            adminUrl
        );

        return wrapInAscendTemplate(
            "Action Required: New Placement Opportunity " + opp.getReferenceId(),
            "Admin Verification Queue",
            "New Opportunity Pending Review",
            "Recruiter Submission Awaiting Approval",
            content
        );
    }

    public String buildTpoOpportunityApprovalRequest(RecruiterOpportunity opp, String tpoUrl) {
        String content = """
            <p>Dear <strong>Training & Placement Officer</strong>,</p>
            <p>The Ascend Administrator has verified and forwarded a new corporate placement opportunity for your review and campus drive scheduling.</p>

            <div class="info-box">
                <div class="info-row"><span class="info-label">Reference ID:</span><span class="info-val" style="color:#2563eb;font-family:monospace;">%s</span></div>
                <div class="info-row"><span class="info-label">Company:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Designated Role:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Package (CTC):</span><span class="info-val" style="color:#16a34a;">%s</span></div>
                <div class="info-row"><span class="info-label">Location / Mode:</span><span class="info-val">%s (%s)</span></div>
                <div class="info-row"><span class="info-label">Recruiter Point of Contact:</span><span class="info-val">%s</span></div>
            </div>

            <p style="font-size:13px;color:#475569;">You can inspect the full job description, adjust branch and CGPA eligibility thresholds, and officially publish this drive to eligible RGUKT students.</p>
            <div style="text-align:center;">
                <a href="%s" class="cta-btn">Review & Publish Campus Drive →</a>
            </div>
        """.formatted(
            escape(opp.getReferenceId()),
            escape(opp.getCompanyName()),
            escape(opp.getJobRole()),
            escape(opp.getCtc()),
            escape(opp.getLocation()),
            escape(opp.getWorkMode()),
            escape(opp.getRecruiterEmail()),
            tpoUrl
        );

        return wrapInAscendTemplate(
            "TPO Review: New Opportunity from " + opp.getCompanyName(),
            "TPO Decision Required",
            "Opportunity Verified by Admin",
            "Action Required: Schedule or Publish Campus Drive",
            content
        );
    }

    public String buildRecruiterOpportunityDecision(RecruiterOpportunity opp, String decision, String explanation, String secureResponseUrl) {
        String title;
        String subtitle;
        String badge;
        String extraBlock = "";

        if ("APPROVED_FOR_TPO".equalsIgnoreCase(decision) || "PUBLISHED".equalsIgnoreCase(decision)) {
            badge = "Requisition Approved";
            title = "Placement Opportunity Approved & Published";
            subtitle = "Your campus drive is now officially live on Ascend";
            extraBlock = "<p style='color:#16a34a;font-weight:700;'>Your placement opportunity has been approved by the RGUKT Placement Cell and published to all eligible students.</p>";
        } else if ("INFO_REQUESTED".equalsIgnoreCase(decision)) {
            badge = "Clarification Requested";
            title = "Additional Information Needed";
            subtitle = "RGUKT Placement Cell requested clarification";
            extraBlock = """
                <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:16px 0;">
                    <p style="margin:0 0 8px 0;font-weight:700;color:#1e40af;">Admin Feedback / Clarification Request:</p>
                    <p style="margin:0;color:#1e3a8a;font-size:13px;">%s</p>
                </div>
                <p>Please click the secure response button below to submit the requested details without creating an account:</p>
                <div style="text-align:center;">
                    <a href="%s" class="cta-btn">Submit Clarification Securely →</a>
                </div>
                <p style="font-size:11px;color:#64748b;text-align:center;">This single-use response link remains valid for 7 days.</p>
            """.formatted(escape(explanation), secureResponseUrl);
        } else {
            badge = "Requisition Notice";
            title = "Update on Your Placement Requisition";
            subtitle = "Notice regarding submission " + opp.getReferenceId();
            extraBlock = """
                <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;">
                    <p style="margin:0 0 8px 0;font-weight:700;color:#991b1b;">Placement Cell Remarks:</p>
                    <p style="margin:0;color:#7f1d1d;font-size:13px;">%s</p>
                </div>
                <p style="font-size:13px;color:#475569;">At this time, we are unable to accept or publish this specific campus drive opportunity according to our current academic calendar and placement policies.</p>
            """.formatted(escape(explanation != null && !explanation.isBlank() ? explanation : "Does not align with current campus recruitment schedule."));
        }

        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p>We are writing to provide an update regarding your placement submission for <strong>%s</strong> (Ref: <code style="color:#2563eb;">%s</code>).</p>
            
            %s
        """.formatted(
            escape(opp.getRecruiterName()),
            escape(opp.getCompanyName()),
            escape(opp.getReferenceId()),
            extraBlock
        );

        return wrapInAscendTemplate(
            title + " – " + opp.getReferenceId(),
            badge,
            title,
            subtitle,
            content
        );
    }

    // ==========================================
    // 2. STUDENT NOTIFICATION TEMPLATES
    // ==========================================

    public String buildStudentDrivePublished(Student student, PlacementDrive drive, String driveUrl) {
        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p>A new campus placement drive matching your academic profile has been officially published by the RGUKT Training & Placement Cell.</p>

            <div class="info-box">
                <div class="info-row"><span class="info-label">Hiring Company:</span><span class="info-val" style="color:#2563eb;">%s</span></div>
                <div class="info-row"><span class="info-label">Designated Job Role:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Offered CTC:</span><span class="info-val" style="color:#16a34a;">%s</span></div>
                <div class="info-row"><span class="info-label">Location / Work Mode:</span><span class="info-val">%s (%s)</span></div>
                <div class="info-row"><span class="info-label">Application Deadline:</span><span class="info-val" style="color:#dc2626;">%s</span></div>
            </div>

            <p style="font-size:13px;color:#475569;">Review the detailed job requirements, upload your tailored resume, and submit your application on Ascend before the deadline expires.</p>
            <div style="text-align:center;">
                <a href="%s" class="cta-btn">View Drive & Apply on Ascend →</a>
            </div>
        """.formatted(
            escape(student.getName()),
            escape(drive.getTitle()),
            escape(drive.getJobRole()),
            escape(drive.getCtc()),
            escape(drive.getLocation()),
            escape(drive.getWorkMode()),
            drive.getDeadline() != null ? drive.getDeadline().format(DATE_FORMATTER) : "Open",
            driveUrl
        );

        return wrapInAscendTemplate(
            "New Campus Placement Drive: " + drive.getTitle() + " (" + drive.getJobRole() + ")",
            "Drive Published",
            "New Campus Placement Opportunity",
            drive.getTitle() + " • " + drive.getJobRole(),
            content
        );
    }

    public String buildStudentApplicationConfirmation(Student student, PlacementDrive drive, PlacementApplication app) {
        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p>Your application for <strong>%s</strong> has been successfully submitted and registered in the institutional placement database.</p>

            <div class="info-box">
                <div class="info-row"><span class="info-label">Application Reference ID:</span><span class="info-val" style="color:#2563eb;font-family:monospace;">%s</span></div>
                <div class="info-row"><span class="info-label">Company Name:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Applied Job Role:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Submission Timestamp:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Initial Status:</span><span class="info-val" style="color:#2563eb;">APPLIED</span></div>
            </div>

            <p style="font-size:13px;color:#475569;">The corporate recruitment team and TPO office will review candidate profiles. You will be alerted via email and your student portal as soon as shortlisting updates or assessment schedules are posted.</p>
        """.formatted(
            escape(student.getName()),
            escape(drive.getTitle()),
            escape(app.getId()),
            escape(drive.getTitle()),
            escape(drive.getJobRole()),
            app.getAppliedAt().format(DATE_FORMATTER)
        );

        return wrapInAscendTemplate(
            "Application Confirmation: " + drive.getTitle(),
            "Application Registered",
            "Placement Application Submitted",
            "Reference ID: " + app.getId(),
            content
        );
    }

    public String buildStudentShortlistNotification(Student student, PlacementDrive drive, PlacementApplication app, String nextRoundDetails, String portalUrl) {
        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p style="color:#16a34a;font-weight:700;font-size:15px;">Congratulations! You have been SHORTLISTED for %s (%s).</p>
            <p>The recruitment panel has evaluated student submissions and advanced your profile to the next round of selection.</p>

            <div class="info-box">
                <div class="info-row"><span class="info-label">Company:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Designated Role:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Current Application Status:</span><span class="info-val" style="color:#16a34a;font-weight:800;">SHORTLISTED</span></div>
            </div>

            <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0;">
                <p style="margin:0 0 6px 0;font-weight:700;color:#166534;">Next Selection Round Details:</p>
                <p style="margin:0;color:#14532d;font-size:13px;">%s</p>
            </div>

            <p style="font-size:13px;color:#475569;">Please review your placement dashboard on Ascend to track round schedules and access mock assessment tools.</p>
            <div style="text-align:center;">
                <a href="%s" class="cta-btn">View Status in Student Dashboard →</a>
            </div>
        """.formatted(
            escape(student.getName()),
            escape(drive.getTitle()),
            escape(drive.getJobRole()),
            escape(drive.getTitle()),
            escape(drive.getJobRole()),
            escape(nextRoundDetails != null && !nextRoundDetails.isBlank() ? nextRoundDetails : "Technical assessment & interview rounds to be scheduled shortly."),
            portalUrl
        );

        return wrapInAscendTemplate(
            "Congratulations! Shortlisted for " + drive.getTitle(),
            "Candidate Shortlisted",
            "Shortlisted for Next Selection Round",
            drive.getTitle() + " • " + drive.getJobRole(),
            content
        );
    }

    public String buildStudentRejectionNotification(Student student, PlacementDrive drive, String portalUrl) {
        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p>We are writing to provide you with an update regarding your placement application for <strong>%s</strong> (%s).</p>
            
            <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin:16px 0;">
                <p style="margin:0;color:#475569;font-size:13px;">
                    The recruiting panel has concluded this evaluation round. While your application was reviewed with careful consideration, your profile was not selected for advancement for this specific opening.
                </p>
            </div>

            <p style="font-size:13px;color:#475569;">Campus recruitment is a competitive, iterative journey. We encourage you to utilize Ascend's dynamic diagnostic test analysis and AI mock interview simulations to identify skill gap areas and continue preparing for upcoming corporate drives.</p>
            
            <div style="text-align:center;">
                <a href="%s" class="cta-btn">Explore Placement Readiness & Other Drives →</a>
            </div>
        """.formatted(
            escape(student.getName()),
            escape(drive.getTitle()),
            escape(drive.getJobRole()),
            portalUrl
        );

        return wrapInAscendTemplate(
            "Application Status Update: " + drive.getTitle(),
            "Application Update",
            "Application Status Update",
            drive.getTitle() + " • " + drive.getJobRole(),
            content
        );
    }

    public String buildStudentAssessmentScheduled(Student student, PlacementDrive drive, String dateStr, String duration, String instructions, String link) {
        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p>An official technical assessment has been scheduled for your application with <strong>%s</strong>.</p>

            <div class="info-box">
                <div class="info-row"><span class="info-label">Company & Role:</span><span class="info-val">%s (%s)</span></div>
                <div class="info-row"><span class="info-label">Assessment Schedule:</span><span class="info-val" style="color:#2563eb;">%s</span></div>
                <div class="info-row"><span class="info-label">Allotted Duration:</span><span class="info-val">%s</span></div>
            </div>

            <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;margin:16px 0;">
                <p style="margin:0 0 6px 0;font-weight:700;color:#1e40af;">Candidate Instructions:</p>
                <p style="margin:0;color:#1e3a8a;font-size:13px;">%s</p>
            </div>

            <div style="text-align:center;">
                <a href="%s" class="cta-btn">Launch Assessment Portal →</a>
            </div>
        """.formatted(
            escape(student.getName()),
            escape(drive.getTitle()),
            escape(drive.getTitle()),
            escape(drive.getJobRole()),
            escape(dateStr),
            escape(duration),
            escape(instructions != null && !instructions.isBlank() ? instructions : "Ensure a stable internet connection and webcam enabled during the assessment session."),
            link
        );

        return wrapInAscendTemplate(
            "Assessment Scheduled: " + drive.getTitle(),
            "Assessment Scheduled",
            "Official Assessment Scheduled",
            drive.getTitle() + " • " + drive.getJobRole(),
            content
        );
    }

    public String buildStudentDeadlineReminder(Student student, PlacementDrive drive, long hoursLeft, String driveUrl) {
        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p>This is a reminder that the application window for <strong>%s</strong> will close in approximately <strong>%d hours</strong>.</p>

            <div class="info-box">
                <div class="info-row"><span class="info-label">Company Name:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Role:</span><span class="info-val">%s</span></div>
                <div class="info-row"><span class="info-label">Package (CTC):</span><span class="info-val" style="color:#16a34a;">%s</span></div>
                <div class="info-row"><span class="info-label">Closing Deadline:</span><span class="info-val" style="color:#dc2626;font-weight:800;">%s</span></div>
            </div>

            <p style="font-size:13px;color:#475569;">You meet the eligibility criteria for this campus drive. If you intend to participate, please submit your application before the system deadline locks.</p>
            <div style="text-align:center;">
                <a href="%s" class="cta-btn">Apply Now Before Deadline →</a>
            </div>
        """.formatted(
            escape(student.getName()),
            escape(drive.getTitle()),
            hoursLeft,
            escape(drive.getTitle()),
            escape(drive.getJobRole()),
            escape(drive.getCtc()),
            drive.getDeadline() != null ? drive.getDeadline().format(DATE_FORMATTER) : "Closing Soon",
            driveUrl
        );

        return wrapInAscendTemplate(
            "Urgent: " + hoursLeft + " Hours Remaining to Apply for " + drive.getTitle(),
            "Deadline Approaching",
            "Application Deadline Reminder",
            "Window closing soon for " + drive.getTitle(),
            content
        );
    }

    // ==========================================
    // 3. TPO & ADMIN NOTIFICATION TEMPLATES
    // ==========================================

    public String buildTpoDailySummary(PlacementOfficer officer, List<Map<String, Object>> driveStats, String dashboardUrl) {
        StringBuilder tableRows = new StringBuilder();
        int totalAppsToday = 0;

        for (Map<String, Object> stat : driveStats) {
            int newToday = ((Number) stat.getOrDefault("newToday", 0)).intValue();
            totalAppsToday += newToday;

            tableRows.append("""
                <tr>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:#0f172a;">%s</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;color:#475569;">%s</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:700;">%s</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:800;color:#2563eb;">+%s</td>
                    <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#16a34a;font-weight:700;">%s</td>
                </tr>
            """.formatted(
                escape((String) stat.get("company")),
                escape((String) stat.get("role")),
                stat.get("totalApplications"),
                newToday,
                stat.get("shortlistedCount")
            ));
        }

        String content = """
            <p>Dear <strong>%s</strong>,</p>
            <p>Here is your consolidated daily placement activity digest across all active campus drives on Ascend.</p>
            <p>A total of <strong>%d new student applications</strong> were registered today.</p>

            <div style="overflow-x:auto;margin:20px 0;border-radius:12px;border:1px solid #e2e8f0;">
                <table style="width:100%%;border-collapse:collapse;font-size:12px;text-align:left;">
                    <thead style="background-color:#f8fafc;color:#64748b;text-transform:uppercase;font-size:10px;font-weight:700;">
                        <tr>
                            <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Company</th>
                            <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;">Role</th>
                            <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">Total Apps</th>
                            <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">New Today</th>
                            <th style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">Shortlisted</th>
                        </tr>
                    </thead>
                    <tbody>
                        %s
                    </tbody>
                </table>
            </div>

            <div style="text-align:center;">
                <a href="%s" class="cta-btn">Access TPO Command Center →</a>
            </div>
        """.formatted(
            escape(officer.getName()),
            totalAppsToday,
            tableRows.toString(),
            dashboardUrl
        );

        return wrapInAscendTemplate(
            "Daily Placement Activity Summary – Ascend",
            "Daily TPO Digest",
            "Daily Placement Activity Summary",
            "Consolidated campus drive activity digest",
            content
        );
    }

    public String buildAdminSystemAlert(String title, String details, String technicalError, String adminUrl) {
        String content = """
            <p>Hello <strong>System Administrator</strong>,</p>
            <p>An automated notification alert has been triggered by the Ascend placement telemetry system.</p>

            <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:16px 0;">
                <p style="margin:0 0 6px 0;font-weight:700;color:#991b1b;">Alert Notice:</p>
                <p style="margin:0;color:#7f1d1d;font-size:13px;">%s</p>
            </div>

            %s

            <div style="text-align:center;">
                <a href="%s" class="cta-btn">Open Governance Console →</a>
            </div>
        """.formatted(
            escape(details),
            technicalError != null && !technicalError.isBlank()
                ? "<div class='info-box'><pre style='margin:0;font-size:11px;color:#dc2626;overflow-x:auto;'>" + escape(technicalError) + "</pre></div>"
                : "",
            adminUrl
        );

        return wrapInAscendTemplate(
            "System Alert: " + title,
            "Platform Alert",
            title,
            "Ascend Monitoring Telemetry",
            content
        );
    }

    private String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;");
    }
}
