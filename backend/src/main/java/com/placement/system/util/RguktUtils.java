package com.placement.system.util;

import java.util.List;
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
        private final int year; // 4 for E4, 3 for E3, etc.
        private final String yearOfStudy; // "4th Year (E4)", "3rd Year (E3)", etc.
        private final String batch;
        private final String college;

        public RguktStudentInfo(String rollNumber, int admissionYear, int graduationYear, int year, String yearOfStudy, String batch, String college) {
            this.rollNumber = rollNumber;
            this.admissionYear = admissionYear;
            this.graduationYear = graduationYear;
            this.year = year;
            this.yearOfStudy = yearOfStudy;
            this.batch = batch;
            this.college = college;
        }

        public String getRollNumber() { return rollNumber; }
        public int getAdmissionYear() { return admissionYear; }
        public int getGraduationYear() { return graduationYear; }
        public int getYear() { return year; }
        public String getYearOfStudy() { return yearOfStudy; }
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

        int year = switch (graduationYear) {
            case 2027 -> 4;
            case 2028 -> 3;
            case 2029 -> 2;
            case 2030 -> 1;
            default -> Math.max(1, Math.min(4, 2027 - graduationYear + 4));
        };

        String yearOfStudy = switch (year) {
            case 4 -> "4th Year (E4)";
            case 3 -> "3rd Year (E3)";
            case 2 -> "2nd Year (E2)";
            default -> "1st Year (E1)";
        };

        String rollNumber = ("S" + yearDigits + rollDigits).toUpperCase();
        String batch = graduationYear + " Graduating Batch • " + yearOfStudy;

        String college = "RGUKT Srikakulam";
        if (domain.contains("sklm")) college = "RGUKT Srikakulam";
        else if (domain.contains("rkv")) college = "RGUKT RK Valley";
        else if (domain.contains("nuz") || domain.contains("rguktn")) college = "RGUKT Nuzvid";
        else if (domain.contains("ong") || domain.contains("rgukto")) college = "RGUKT Ongole";
        else if (domain.contains("basar")) college = "RGUKT Basar";
        else college = "RGUKT";

        return new RguktStudentInfo(rollNumber, admissionYear, graduationYear, year, yearOfStudy, batch, college);
    }

    public static String getStandardDepartmentCode(String dept) {
        if (dept == null) return "";
        String upper = dept.toUpperCase().trim();
        if (upper.contains("CSE") || upper.contains("COMPUTER")) return "CSE";
        if (upper.contains("ECE") || upper.contains("ELECTRONIC")) return "ECE";
        if (upper.contains("ME") || upper.contains("MECHANICAL")) return "ME";
        if (upper.contains("CE") || upper.contains("CIVIL")) return "CE";
        if (upper.contains("CHE") || upper.contains("CHEMICAL")) return "CHE";
        if (upper.contains("MME") || upper.contains("METALLURG")) return "MME";
        if (upper.contains("IT") || upper.contains("INFORMATION")) return "IT";
        return upper;
    }

    public static boolean isDepartmentEligible(List<String> allowedDepts, String studentDept) {
        if (allowedDepts == null || allowedDepts.isEmpty()) return true;
        if (studentDept == null || studentDept.isBlank()) return false;

        for (String allowed : allowedDepts) {
            if (allowed == null) continue;
            String a = allowed.trim().toUpperCase();
            if (a.equals("ALL") || a.equals("ANY") || a.equals("ALL DEPARTMENTS") || a.equals("ALL BRANCHES")) {
                return true;
            }
        }

        String sCode = getStandardDepartmentCode(studentDept);
        String sRaw = studentDept.trim().toUpperCase();

        for (String allowed : allowedDepts) {
            if (allowed == null) continue;
            String aRaw = allowed.trim().toUpperCase();
            String aCode = getStandardDepartmentCode(aRaw);

            if (sRaw.equals(aRaw) || sRaw.contains(aRaw) || aRaw.contains(sRaw)) return true;
            if (!sCode.isEmpty() && !aCode.isEmpty() && sCode.equalsIgnoreCase(aCode)) return true;
        }

        return false;
    }

    public static boolean isYearEligible(List<Integer> allowedYears, List<Integer> allowedGradYears, Integer studentYear, Integer studentGradYear) {
        boolean hasYearFilter = allowedYears != null && !allowedYears.isEmpty();
        boolean hasGradFilter = allowedGradYears != null && !allowedGradYears.isEmpty();

        if (!hasYearFilter && !hasGradFilter) return true;

        if (hasYearFilter && studentYear != null && allowedYears.contains(studentYear)) {
            return true;
        }

        if (hasGradFilter && studentGradYear != null && allowedGradYears.contains(studentGradYear)) {
            return true;
        }

        return false;
    }
}
