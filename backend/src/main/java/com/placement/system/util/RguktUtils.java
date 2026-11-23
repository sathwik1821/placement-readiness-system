package com.placement.system.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RguktUtils {

    // Matches RGUKT student institutional emails:
    // e.g. s210018@rguktsklm.ac.in, s220145@rguktsklm.ac.in, s210018@rguktrkv.ac.in, etc.
    public static final Pattern RGUKT_EMAIL_PATTERN = Pattern.compile(
        "^[sS](\\d{2})(\\d{4,6})@((?:[a-zA-Z0-9-]+\\.)?rgukt(?:[a-zA-Z0-9-]*)?\\.ac\\.in)$",
        Pattern.CASE_INSENSITIVE
    );

    public static boolean isRguktStudentEmail(String email) {
        if (email == null || email.isBlank()) return false;
        return RGUKT_EMAIL_PATTERN.matcher(email.trim()).matches();
    }

    public static class RguktStudentInfo {
        private final String rollNumber;
        private final int admissionYear;
        private final int graduationYear;
        private final String batch;
        private final String college;

        public RguktStudentInfo(String rollNumber, int admissionYear, int graduationYear, String batch, String college) {
            this.rollNumber = rollNumber;
            this.admissionYear = admissionYear;
            this.graduationYear = graduationYear;
            this.batch = batch;
            this.college = college;
        }

        public String getRollNumber() { return rollNumber; }
        public int getAdmissionYear() { return admissionYear; }
        public int getGraduationYear() { return graduationYear; }
        public String getBatch() { return batch; }
        public String getCollege() { return college; }
    }

    public static RguktStudentInfo parseStudentEmail(String email) {
        if (email == null || email.isBlank()) return null;
        Matcher m = RGUKT_EMAIL_PATTERN.matcher(email.trim());
        if (!m.matches()) return null;

        String yearDigits = m.group(1);
        String rollDigits = m.group(2);
        String domain = m.group(3).toLowerCase();

        int yearShort = Integer.parseInt(yearDigits);
        int admissionYear = 2000 + yearShort;
        // RGUKT 6-year integrated B.Tech: 2021 batch (s21) -> graduating in 2027; 2022 batch (s22) -> graduating in 2028
        int graduationYear = admissionYear + 6;

        String rollNumber = ("S" + yearDigits + rollDigits).toUpperCase();

        String yearPhase = switch (graduationYear) {
            case 2027 -> "B.Tech E4 (Final Year)";
            case 2028 -> "B.Tech E3 (Pre-Final Year)";
            case 2029 -> "B.Tech E2 (2nd Year)";
            case 2030 -> "B.Tech E1 (1st Year)";
            default -> "B.Tech Class of " + graduationYear;
        };

        String batch = graduationYear + " Graduating Batch • " + yearPhase;

        String college = "RGUKT Srikakulam";
        if (domain.contains("sklm")) college = "RGUKT Srikakulam";
        else if (domain.contains("rkv")) college = "RGUKT RK Valley";
        else if (domain.contains("nuz") || domain.contains("rguktn")) college = "RGUKT Nuzvid";
        else if (domain.contains("ong") || domain.contains("rgukto")) college = "RGUKT Ongole";
        else if (domain.contains("basar")) college = "RGUKT Basar";
        else college = "RGUKT";

        return new RguktStudentInfo(rollNumber, admissionYear, graduationYear, batch, college);
    }
}
